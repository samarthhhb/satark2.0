from typing import Dict, Any, List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.models import User, Prediction
from app.schemas import DashboardStats, PredictionHistoryItem
from app.auth import get_current_user

router = APIRouter(prefix="/api", tags=["Dashboard"])

@router.get("/dashboard", response_model=DashboardStats)
def get_dashboard_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # User's prediction stats + pre-populated baseline evaluations
    base_query = db.query(Prediction).filter(
        (Prediction.user_id == current_user.id) | (Prediction.user_id.is_(None))
    )
    total_predictions = base_query.count()

    high_risk = base_query.filter(func.lower(Prediction.risk_level) == "high").count()
    medium_risk = base_query.filter(func.lower(Prediction.risk_level) == "medium").count()
    low_risk = base_query.filter(func.lower(Prediction.risk_level) == "low").count()

    # Recent 10 predictions
    recent = base_query.order_by(Prediction.created_at.desc(), Prediction.id.desc()).limit(10).all()
    recent_items = [PredictionHistoryItem.model_validate(r) for r in recent]

    # Risk Distribution formatted for Recharts
    risk_distribution = [
        {"name": "Low Risk", "value": low_risk, "color": "#10b981"},
        {"name": "Medium Risk", "value": medium_risk, "color": "#f59e0b"},
        {"name": "High Risk", "value": high_risk, "color": "#ef4444"},
    ]

    # State level breakdown
    state_counts = (
        db.query(Prediction.state, func.count(Prediction.id).label("count"), func.avg(Prediction.predicted_total).label("avg_burden"))
        .filter((Prediction.user_id == current_user.id) | (Prediction.user_id.is_(None)))
        .group_by(Prediction.state)
        .all()
    )
    state_breakdown = [
        {"state": row[0], "predictions_count": row[1], "avg_burden": round(float(row[2] or 0), 1)}
        for row in state_counts
    ]

    return DashboardStats(
        total_predictions=total_predictions,
        high_risk=high_risk,
        medium_risk=medium_risk,
        low_risk=low_risk,
        recent_predictions=recent_items,
        risk_distribution=risk_distribution,
        state_breakdown=state_breakdown
    )
