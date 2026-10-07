import os
import sys
import pandas as pd
from sqlalchemy.orm import Session

# Ensure backend root is on sys.path
backend_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if backend_root not in sys.path:
    sys.path.insert(0, backend_root)

from app.database import SessionLocal, engine, Base
from app.models import Prediction, User
from app.ml.inference import get_ml_engine

def prepopulate_all_districts(db: Session):
    # Ensure tables exist
    Base.metadata.create_all(bind=engine)

    existing_count = db.query(Prediction).count()
    if existing_count > 50:
        print(f"Database already has {existing_count} prediction records. Skipping full pre-population.")
        return

    print("Pre-populating predictions across all districts and states in India...")
    engine_ml = get_ml_engine()
    df = pd.read_csv(engine_ml.data_path)

    # Filter out invalid or unnamed states
    valid_df = df[~df['state'].isin(['Unknown', '‚Äî', ''])]
    
    # Group by state and district to get the latest baseline profile
    latest_profiles = valid_df.sort_values('year').groupby(['state', 'district']).last().reset_index()
    print(f"Found {len(latest_profiles)} unique district profiles across {latest_profiles['state'].nunique()} states.")

    predictions_to_add = []
    for _, row in latest_profiles.iterrows():
        st = row['state']
        dist = row['district']
        yr = int(row['year'])
        try:
            res = engine_ml.predict(st, dist, yr)
            predictions_to_add.append(
                Prediction(
                    user_id=None,
                    state=res['state'],
                    district=res['district'],
                    input_year=res['input_year'],
                    forecast_year=res['forecast_year'],
                    predicted_total=res['predicted_total'],
                    risk_level=res['risk_level']
                )
            )
        except Exception as e:
            continue

    if predictions_to_add:
        db.bulk_save_objects(predictions_to_add)
        db.commit()
        print(f"Successfully pre-populated {len(predictions_to_add)} district predictions into database.")

if __name__ == "__main__":
    db = SessionLocal()
    try:
        prepopulate_all_districts(db)
    finally:
        db.close()
