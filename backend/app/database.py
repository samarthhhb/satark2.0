import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

load_dotenv()

# Find stable backend directory
base_dir = os.path.dirname(os.path.abspath(__file__)) # app/
backend_dir = os.path.dirname(base_dir) # backend/
default_sqlite_path = os.path.join(backend_dir, "satark.db")

raw_db_url = os.getenv("DATABASE_URL")
if not raw_db_url or raw_db_url.strip() == "":
    DATABASE_URL = f"sqlite:///{default_sqlite_path}"
else:
    DATABASE_URL = raw_db_url.strip()

# If using PostgreSQL with heroku/render or old style postgres:// urls, normalize to postgresql://
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

# If relative sqlite URL was passed, make it absolute
if DATABASE_URL.startswith("sqlite:///./"):
    db_rel = DATABASE_URL.replace("sqlite:///./", "")
    DATABASE_URL = f"sqlite:///{os.path.join(backend_dir, db_rel)}"

connect_args = {}
if DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

try:
    engine = create_engine(
        DATABASE_URL,
        connect_args=connect_args,
        pool_pre_ping=True if not DATABASE_URL.startswith("sqlite") else False
    )
    # Test connection
    with engine.connect() as conn:
        pass
except Exception as e:
    print(f"Warning: Primary database connection ({DATABASE_URL}) failed: {e}. Falling back to SQLite at {default_sqlite_path}")
    DATABASE_URL = f"sqlite:///{default_sqlite_path}"
    engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
