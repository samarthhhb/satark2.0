import os
import bcrypt
from datetime import datetime, timedelta, timezone
from typing import Optional
from jose import JWTError, jwt
from fastapi import Depends, HTTPException, Header, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.models import User

# JWT configuration
SECRET_KEY = os.getenv("JWT_SECRET", "satark_super_secure_jwt_secret_key_2026_x89a")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))

security_bearer = HTTPBearer(auto_error=False)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        pwd_bytes = plain_password.encode('utf-8')[:72]
        hash_bytes = hashed_password.encode('utf-8')
        return bcrypt.checkpw(pwd_bytes, hash_bytes)
    except Exception:
        return False

def get_password_hash(password: str) -> str:
    pwd_bytes = password.encode('utf-8')[:72]
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(pwd_bytes, salt).decode('utf-8')

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def get_current_user(
    x_user_name: Optional[str] = Header(None, alias="X-User-Name"),
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security_bearer),
    db: Session = Depends(get_db)
) -> User:
    # 1. If JWT token is provided, attempt decoding
    if credentials and credentials.credentials:
        try:
            payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
            user_id = payload.get("sub")
            if user_id:
                user = db.query(User).filter(User.id == int(user_id)).first()
                if user:
                    return user
        except Exception:
            pass

    # 2. If name header is provided, get or create user by name
    name_to_use = (x_user_name or "").strip()
    if not name_to_use:
        name_to_use = "Analyst"

    user = db.query(User).filter(func.lower(User.name) == name_to_use.lower()).first()
    if not user:
        clean_slug = name_to_use.lower().replace(" ", "_")
        safe_email = f"{clean_slug}@satark.local"
        
        # Ensure email uniqueness
        existing_email = db.query(User).filter(User.email == safe_email).first()
        if existing_email:
            safe_email = f"{clean_slug}_{int(datetime.now().timestamp())}@satark.local"

        user = User(
            name=name_to_use,
            email=safe_email,
            password_hash="no_password_required"
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    return user
