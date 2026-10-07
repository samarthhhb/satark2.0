import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.models import User, Prediction
from app.routes import auth, prediction, dashboard, assistant
from app.ml.inference import get_ml_engine

# Ensure tables exist at startup
Base.metadata.create_all(bind=engine)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    print("SATARK 2.0: Database initialized.")
    # Eager load ML models
    try:
        get_ml_engine()
        print("SATARK 2.0: ML models loaded successfully.")
    except Exception as e:
        print(f"SATARK 2.0: Warning during ML loading: {e}")
    
    # Eagerly pre-populate district baseline predictions
    try:
        from app.database import SessionLocal
        from app.prepopulate_data import prepopulate_all_districts
        db = SessionLocal()
        try:
            prepopulate_all_districts(db)
        finally:
            db.close()
    except Exception as e:
        print(f"SATARK 2.0: Pre-population note: {e}")

    yield
    # Shutdown
    print("SATARK 2.0: Shutting down.")

app = FastAPI(
    title="SATARK 2.0 API",
    description="Cybercrime Forecasting and Risk Classification REST API",
    version="2.0",
    lifespan=lifespan
)

# CORS configuration to allow React frontend (local dev and EC2)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth.router)
app.include_router(prediction.router)
app.include_router(dashboard.router)
app.include_router(assistant.router)

@app.get("/")
def home():
    return {
        "message": "SATARK 2.0 API running",
        "status": "healthy",
        "version": "2.0",
        "system": "Cybercrime Forecasting & Risk Classification Engine"
    }

@app.get("/health")
def health_check():
    return {"status": "ok"}
