import os
import json
import numpy as np
import pandas as pd
from catboost import CatBoostRegressor, CatBoostClassifier
from typing import Dict, Any, List, Optional

# List of the 31 crime features
CRIME_FEATURES = [
    'tampering_computer_source_documents',
    'ransom_ware',
    'offences_other_than_ransom_ware',
    'dishonestly_recv_stolen_cmp_resrc_or_comm_device',
    'identity_theft',
    'cheating_by_personation_by_using_computer_resource',
    'violation_of_privacy',
    'cyber_terrorism',
    'other_sections_it_act',
    'interception_or_monitoring_or_decryption_of_info',
    'un_athryz_access_atmpt_access_prct_comp_sys',
    'abetment_to_commit_offences',
    'attempt_to_commit_offences',
    'other_sections_of_it_act',
    'cyber_stalking_bullying_of_women_children',
    'data_theft',
    'credit_card_debit_card_fraud',
    'atms_fraud',
    'online_banking_fraud',
    'otp_frauds',
    'other_frauds',
    'cheating',
    'forgery',
    'defamation_morphing',
    'fake_profile',
    'currency_counterfeiting',
    'stamps_counterfeiting',
    'cyber_blackmailing_threatening',
    'fake_news_on_social_media',
    'other_offences',
    'total_offences_ip'
]

def find_file(relative_paths: List[str]) -> str:
    for p in relative_paths:
        if p and os.path.exists(p):
            return os.path.abspath(p)
    return relative_paths[0]

class MLInferenceEngine:
    _instance = None

    def __init__(self):
        ml_dir = os.path.dirname(os.path.abspath(__file__))
        app_dir = os.path.dirname(ml_dir)
        backend_dir = os.path.dirname(app_dir)
        root_dir = os.path.dirname(backend_dir)
        
        env_model = os.getenv("MODEL_PATH")
        env_risk = os.getenv("RISK_MODEL_PATH")
        env_data = os.getenv("DATA_PATH")

        # Forecaster model path
        self.forecaster_path = find_file([
            env_model,
            os.path.join(ml_dir, "forecaster.cbm"),
            os.path.join(ml_dir, "satark_cybercrime_forecaster.cbm"),
            os.path.join(backend_dir, "app", "ml", "forecaster.cbm"),
        ])

        # Risk classifier path
        self.risk_model_path = find_file([
            env_risk,
            os.path.join(ml_dir, "risk_classifier.cbm"),
            os.path.join(ml_dir, "satark_cybercrime_risk_classifier.cbm"),
            os.path.join(backend_dir, "app", "ml", "risk_classifier.cbm"),
        ])

        # District profiles data path
        self.data_path = find_file([
            env_data,
            os.path.join(root_dir, "data", "district_profiles.csv"),
            os.path.join(backend_dir, "..", "data", "district_profiles.csv"),
            os.path.join(backend_dir, "data", "district_profiles.csv"),
            "data/district_profiles.csv",
        ])

        print(f"Loading CatBoost Forecaster from {self.forecaster_path}...")
        self.forecaster = CatBoostRegressor()
        self.forecaster.load_model(self.forecaster_path)

        print(f"Loading CatBoost Risk Classifier from {self.risk_model_path}...")
        self.risk_classifier = CatBoostClassifier()
        self.risk_classifier.load_model(self.risk_model_path)

        print(f"Loading district profiles from {self.data_path}...")
        raw_df = pd.read_csv(self.data_path)
        raw_df['state'] = raw_df['state'].astype(str).str.strip()
        raw_df['district'] = raw_df['district'].astype(str).str.strip()
        self.profiles_df = raw_df[
            (~raw_df['state'].str.lower().isin(['unknown', '‚äî', '—', '–', '-', 'nan', 'null', ''])) &
            (~raw_df['district'].str.lower().isin(['unknown', '‚äî', '—', '–', '-', 'nan', 'null', ''])) &
            (~raw_df['state'].str.contains('‚Äî|—', na=False)) &
            (~raw_df['district'].str.contains('‚Äî|—', na=False))
        ]
        print(f"Loaded {len(self.profiles_df)} clean district profiles across India.")

    @classmethod
    def get_instance(cls):
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    def get_states(self) -> List[str]:
        col = "state" if "state" in self.profiles_df.columns else "state_nm"
        return sorted(self.profiles_df[col].dropna().unique().tolist())

    def get_districts(self, state: Optional[str] = None) -> List[str]:
        df = self.profiles_df
        st_col = "state" if "state" in df.columns else "state_nm"
        dist_col = "district" if "district" in df.columns else "district_name"
        
        if state:
            df = df[df[st_col].astype(str).str.lower() == state.strip().lower()]
        return sorted(df[dist_col].dropna().unique().tolist())

    def get_years(self, state: Optional[str] = None, district: Optional[str] = None) -> List[int]:
        df = self.profiles_df
        st_col = "state" if "state" in df.columns else "state_nm"
        dist_col = "district" if "district" in df.columns else "district_name"
        
        if state:
            df = df[df[st_col].astype(str).str.lower() == state.strip().lower()]
        if district:
            df = df[df[dist_col].astype(str).str.lower() == district.strip().lower()]
        return sorted([int(y) for y in df["year"].dropna().unique().tolist()])

    def get_profile(self, state: str, district: str, year: int) -> Optional[pd.Series]:
        st_col = "state" if "state" in self.profiles_df.columns else "state_nm"
        dist_col = "district" if "district" in self.profiles_df.columns else "district_name"

        matched = self.profiles_df[
            (self.profiles_df[st_col].astype(str).str.lower() == state.strip().lower()) &
            (self.profiles_df[dist_col].astype(str).str.lower() == district.strip().lower()) &
            (self.profiles_df["year"] == int(year))
        ]
        if not matched.empty:
            return matched.iloc[0]

        # Fallback closest year for district
        dist_matched = self.profiles_df[
            (self.profiles_df[st_col].astype(str).str.lower() == state.strip().lower()) &
            (self.profiles_df[dist_col].astype(str).str.lower() == district.strip().lower())
        ]
        if not dist_matched.empty:
            return dist_matched.iloc[-1]

        return None

    def predict(self, state: str, district: str, year: int) -> Dict[str, Any]:
        profile = self.get_profile(state, district, year)
        if profile is None:
            raise ValueError(f"No crime profile found for State: '{state}', District: '{district}'")

        canon_state_ui = str(profile.get("state", state)).title()
        canon_district_ui = str(profile.get("district", district)).title()
        
        state_nm_raw = str(profile.get("state_nm", state)).lower().strip()
        district_name_raw = str(profile.get("district_name", district)).lower().strip()
        actual_input_year = int(profile["year"])
        forecast_year = actual_input_year + 1

        # Build feature dataframe according to notebook:
        # model_features = ['year', 'state_nm', 'district_name'] + crime_cols
        feature_cols = ['year', 'state_nm', 'district_name'] + CRIME_FEATURES

        row_dict = {
            'year': [actual_input_year],
            'state_nm': [state_nm_raw],
            'district_name': [district_name_raw]
        }
        for col in CRIME_FEATURES:
            row_dict[col] = [float(profile.get(col, 0.0)) if pd.notna(profile.get(col)) else 0.0]

        input_df = pd.DataFrame(row_dict)[feature_cols]

        # CatBoost Inference (trained on log1p)
        raw_log_pred = float(self.forecaster.predict(input_df)[0])
        predicted_burden = max(0.0, float(np.expm1(raw_log_pred)))
        predicted_burden = round(predicted_burden, 1)

        # Risk Classifier Inference
        risk_pred = self.risk_classifier.predict(input_df).ravel()[0]
        risk_level = str(risk_pred)

        # Current total
        current_total = float(profile.get("total_offences_ip", 0.0))
        if pd.isna(current_total):
            current_total = 0.0

        # Top contributing crimes
        top_crimes = []
        for feat in CRIME_FEATURES:
            if feat == "total_offences_ip":
                continue
            val = float(profile.get(feat, 0.0))
            if pd.notna(val) and val > 0:
                top_crimes.append({
                    "category": feat.replace("_", " ").title(),
                    "count": round(val, 1)
                })
        top_crimes.sort(key=lambda x: x["count"], reverse=True)

        return {
            "state": canon_state_ui,
            "district": canon_district_ui,
            "input_year": actual_input_year,
            "forecast_year": forecast_year,
            "predicted_total": predicted_burden,
            "risk_level": risk_level,
            "current_total": round(current_total, 1),
            "top_crime_breakdown": top_crimes[:5]
        }

def get_ml_engine() -> MLInferenceEngine:
    return MLInferenceEngine.get_instance()
