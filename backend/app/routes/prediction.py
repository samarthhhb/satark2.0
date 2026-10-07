from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, Prediction
from app.schemas import PredictionRequest, PredictionResponse, PredictionHistoryItem
from app.auth import get_current_user
from app.ml.inference import get_ml_engine

router = APIRouter(prefix="/api", tags=["Predictions & Districts"])

@router.get("/states", response_model=List[str])
def get_states():
    engine = get_ml_engine()
    return engine.get_states()

@router.get("/districts", response_model=List[str])
def get_districts(state: Optional[str] = Query(None, description="Filter districts by state name")):
    engine = get_ml_engine()
    districts = engine.get_districts(state)
    if state and not districts:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No districts found for state '{state}'."
        )
    return districts

@router.get("/years", response_model=List[int])
def get_years(
    state: Optional[str] = Query(None),
    district: Optional[str] = Query(None)
):
    engine = get_ml_engine()
    return engine.get_years(state, district)

@router.post("/predict", response_model=PredictionResponse)
def create_prediction(
    req: PredictionRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    engine = get_ml_engine()
    try:
        pred_data = engine.predict(
            state=req.state,
            district=req.district,
            year=req.year
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating prediction: {str(e)}"
        )

    # Save to PostgreSQL / Database
    new_prediction = Prediction(
        user_id=current_user.id,
        state=pred_data["state"],
        district=pred_data["district"],
        input_year=pred_data["input_year"],
        forecast_year=pred_data["forecast_year"],
        predicted_total=pred_data["predicted_total"],
        risk_level=pred_data["risk_level"]
    )
    db.add(new_prediction)
    db.commit()
    db.refresh(new_prediction)

    pred_data["id"] = new_prediction.id
    pred_data["created_at"] = new_prediction.created_at

    return PredictionResponse(**pred_data)

@router.get("/predictions", response_model=List[PredictionHistoryItem])
def get_predictions_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Fetch user's and pre-populated predictions ordered by most recent first
    records = db.query(Prediction).filter(
        (Prediction.user_id == current_user.id) | (Prediction.user_id.is_(None))
    ).order_by(Prediction.created_at.desc(), Prediction.id.desc()).all()

    return [PredictionHistoryItem.model_validate(r) for r in records]

@router.delete("/predictions/{prediction_id}", status_code=status.HTTP_200_OK)
def delete_prediction(
    prediction_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    record = db.query(Prediction).filter(
        Prediction.id == prediction_id,
        Prediction.user_id == current_user.id
    ).first()
    if not record:
        raise HTTPException(status_code=404, detail="Prediction record not found")
    
    db.delete(record)
    db.commit()
    return {"message": "Prediction deleted successfully"}
