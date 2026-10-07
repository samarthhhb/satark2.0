import os
import json
import warnings
import numpy as np
import pandas as pd
from catboost import CatBoostRegressor, CatBoostClassifier

warnings.filterwarnings("ignore")

# List of all 31 crime features
crime_cols = [
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

state_map = {
    'jaammu and kashmir': 'jammu and kashmir',
    'himaachal pradesh': 'himachal pradesh',
    'punjaab': 'punjab',
    'uttaarakhand': 'uttarakhand',
    'haaryana': 'haryana',
    'chaandigarh': 'chandigarh',
    'bihaar': 'bihar',
    'assaam': 'assam',
    'odishaa': 'odisha',
    'jhaarkhand': 'jharkhand',
    'chhaattisgarh': 'chhattisgarh',
    'maadhya pradesh': 'madhya pradesh',
    'gujaarat': 'gujarat',
    'maaharashtra': 'maharashtra',
    'kaarnataka': 'karnataka',
    'keraala': 'kerala',
    'taamil nadu': 'tamil nadu',
    'telaangana': 'telangana',
    'west bengaal': 'west bengal',
    'laadakh': 'ladakh',
    'uttaar pradesh': 'uttar pradesh',
    'mizoraam': 'mizoram',
    'maanipur': 'manipur',
    'naagaland': 'nagaland',
    'arunaachal pradesh': 'arunachal pradesh',
}

def clean_text(series):
    s = series.astype('string').str.lower().str.strip()
    s = s.str.replace(r'\s+', ' ', regex=True)
    return s.replace({'': pd.NA, '?': pd.NA, 'nan': pd.NA, 'none': pd.NA})

def train_from_dataset():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    root_dir = os.path.dirname(base_dir)
    
    # Locate dataset
    data_path = os.path.join(root_dir, "data", "cybercrime_dataset_17-22.xlsx")
    if not os.path.exists(data_path):
        data_path = "/Users/samarth/Downloads/cybercrime_dataset_17-22.xlsx"
        
    print(f"Loading raw dataset from {data_path}...")
    raw = pd.read_excel(data_path)
    print("Raw shape:", raw.shape)
    
    data = raw.copy()
    
    # 1. Normalise year
    data['year'] = data['year'].astype(str).str.extract(r'(\d{4})', expand=False)
    data['year'] = pd.to_numeric(data['year'], errors='coerce')
    data.loc[data['year'].between(2100, 2199), 'year'] -= 100
    
    # 2. Clean state and district text
    data['state_nm'] = clean_text(data['state_nm'])
    data['district_name'] = clean_text(data['district_name'])
    data['state_nm'] = data['state_nm'].replace(state_map)
    
    # 3. Numeric crime columns
    for col in crime_cols:
        data[col] = pd.to_numeric(data[col], errors='coerce')
        data.loc[data[col] < 0, col] = np.nan
        
    # 4. Filter valid district observations
    data = data.dropna(subset=['year', 'state_nm', 'district_name']).copy()
    data['year'] = data['year'].astype(int)
    data = data[data['year'].between(2017, 2022)].copy()
    
    # 5. Aggregate regional circles to district-year level
    group_cols = ['state_nm', 'district_name', 'year']
    district = (
        data.groupby(group_cols, as_index=False)[crime_cols]
        .sum(min_count=1)
    )
    print("District-year aggregated records:", district.shape)
    
    # Save cleaned district profiles for the app
    # Format state_nm and district_name nicely for UI
    ui_df = district.copy()
    ui_df['state'] = ui_df['state_nm'].str.title()
    ui_df['district'] = ui_df['district_name'].str.title()
    # Save CSV
    csv_path = os.path.join(root_dir, "data", "district_profiles.csv")
    ui_df.to_csv(csv_path, index=False)
    print(f"Saved cleaned district profiles to {csv_path}")
    
    # 6. Create next-year forecasting target
    next_year_target = district[group_cols + ['total_offences_ip']].copy()
    next_year_target['year'] = next_year_target['year'] - 1
    next_year_target = next_year_target.rename(
        columns={'total_offences_ip': 'target_next_year_total'}
    )
    
    forecast = district.merge(
        next_year_target,
        on=group_cols,
        how='inner'
    )
    forecast = forecast[forecast['year'].between(2017, 2021)].copy()
    forecast = forecast.dropna(subset=['target_next_year_total']).copy()
    forecast['log_target'] = np.log1p(forecast['target_next_year_total'])
    
    # 7. Split Train / Validation / Test
    train = forecast[forecast['year'].isin([2017, 2018, 2019])].copy()
    val = forecast[forecast['year'].isin([2020])].copy()
    test = forecast[forecast['year'].isin([2021])].copy()
    
    model_features = ['year', 'state_nm', 'district_name'] + crime_cols
    cat_features = ['state_nm', 'district_name']
    cat_indices = [model_features.index(c) for c in cat_features]
    
    X_train, y_train = train[model_features].copy(), train['log_target'].copy()
    X_val, y_val = val[model_features].copy(), val['log_target'].copy()
    X_test, y_test = test[model_features].copy(), test['log_target'].copy()
    
    # 8. Train CatBoost Regressor
    print("Training CatBoost Regressor (Forecaster)...")
    forecaster = CatBoostRegressor(
        loss_function='RMSE',
        eval_metric='RMSE',
        iterations=800,
        depth=7,
        learning_rate=0.04,
        l2_leaf_reg=5,
        random_seed=42,
        verbose=False
    )
    forecaster.fit(
        X_train,
        y_train,
        cat_features=cat_indices,
        eval_set=(X_val, y_val),
        use_best_model=True,
        verbose=False
    )
    print("Forecaster best iteration:", forecaster.get_best_iteration())
    
    # 9. Train CatBoost Classifier
    print("Training CatBoost Classifier (Risk Model)...")
    positive_train = train.loc[train['target_next_year_total'] > 0, 'target_next_year_total']
    high_threshold = float(positive_train.quantile(0.75))
    
    def make_risk_label(value):
        if value <= 0:
            return 'Low'
        elif value <= high_threshold:
            return 'Medium'
        return 'High'
        
    train['risk_label'] = train['target_next_year_total'].apply(make_risk_label)
    val['risk_label'] = val['target_next_year_total'].apply(make_risk_label)
    test['risk_label'] = test['target_next_year_total'].apply(make_risk_label)
    
    risk_model = CatBoostClassifier(
        loss_function='MultiClass',
        iterations=600,
        depth=7,
        learning_rate=0.04,
        l2_leaf_reg=5,
        random_seed=42,
        verbose=False
    )
    risk_model.fit(
        X_train,
        train['risk_label'],
        cat_features=cat_indices,
        eval_set=(X_val, val['risk_label']),
        verbose=False
    )
    
    # 10. Save models
    ml_dir = os.path.join(base_dir, "app", "ml")
    os.makedirs(ml_dir, exist_ok=True)
    
    forecaster.save_model(os.path.join(ml_dir, "forecaster.cbm"))
    forecaster.save_model(os.path.join(ml_dir, "satark_cybercrime_forecaster.cbm"))
    
    risk_model.save_model(os.path.join(ml_dir, "risk_classifier.cbm"))
    risk_model.save_model(os.path.join(ml_dir, "satark_cybercrime_risk_classifier.cbm"))
    
    # Save metadata
    metadata = {
        'model_features': model_features,
        'categorical_features': cat_features,
        'crime_cols': crime_cols,
        'target': 'next_year_total_offences_ip',
        'risk_target': 'Low / Medium / High',
        'high_risk_threshold': high_threshold,
        'forecaster_best_iteration': forecaster.get_best_iteration()
    }
    with open(os.path.join(ml_dir, "satark_model_metadata.json"), "w") as f:
        json.dump(metadata, f, indent=2)
        
    print(f"High risk threshold: {high_threshold:.2f} offences")
    print("Models and metadata successfully saved in backend/app/ml/!")

if __name__ == "__main__":
    train_from_dataset()
