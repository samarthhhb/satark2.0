from datetime import datetime
from typing import List, Optional, Any, Dict
from pydantic import BaseModel, EmailStr, Field

# Authentication Schemas
class UserRegister(BaseModel):
    name: Optional[str] = None
    email: EmailStr
    password: str = Field(..., min_length=4, description="User password")

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: int
    name: Optional[str] = None
    email: str
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

# Prediction Schemas
class PredictionRequest(BaseModel):
    state: str
    district: str
    year: int

class CrimeBreakdownItem(BaseModel):
    category: str
    count: float

class PredictionResponse(BaseModel):
    id: Optional[int] = None
    state: str
    district: str
    input_year: int
    forecast_year: int
    predicted_total: float
    risk_level: str
    created_at: Optional[datetime] = None
    current_total: Optional[float] = None
    top_crime_breakdown: Optional[List[CrimeBreakdownItem]] = None

    class Config:
        from_attributes = True

class PredictionHistoryItem(BaseModel):
    id: int
    state: str
    district: str
    input_year: int
    forecast_year: int
    predicted_total: float
    risk_level: str
    created_at: datetime

    class Config:
        from_attributes = True

# Dashboard Stats Schemas
class DashboardStats(BaseModel):
    total_predictions: int
    high_risk: int
    medium_risk: int
    low_risk: int
    recent_predictions: List[PredictionHistoryItem] = []
    risk_distribution: List[Dict[str, Any]] = []
    state_breakdown: List[Dict[str, Any]] = []
