# SATARK 2.0 — Technical Specifications & System Architecture

## 1. System Overview

SATARK 2.0 is a web-based decision support system designed to evaluate district-level cybercrime data across India, forecast next-year incident volumes, and classify administrative regions into standardized risk categories (Low, Medium, High).

The platform combines machine learning models trained on official multi-year National Crime Records Bureau (NCRB) datasets with a modern web interface to provide actionable regional risk assessments.

---

## 2. Architecture Diagram

```
+-----------------------------------------------------------------------+
|                              CLIENT TIER                              |
|   React.js 18 + Vite (SPA)                                            |
|   - Clean Minimal Design System (Slate/Neutral palette)               |
|   - Recharts (Area & Pie charts)                                      |
|   - Authentic SVG India Map Cartography (36 States & UTs)             |
+-----------------------------------+-----------------------------------+
                                    | HTTP / JSON (REST API)
                                    v
+-----------------------------------------------------------------------+
|                            APPLICATION TIER                           |
|   FastAPI (Python 3.10+)                                              |
|   - Uvicorn ASGI Server                                               |
|   - Request Validation (Pydantic schemas)                             |
|   - Session & User Name Header Resolution                             |
|   - Dynamic Query & Analytics Engine                                  |
+-------------------+-------------------------------+-------------------+
                    |                               |
                    v                               v
+-----------------------------------+   +-------------------------------+
|         ML INFERENCE ENGINE       |   |       DATA PERSISTENCE        |
| - CatBoost Regressor (.cbm)       |   | - PostgreSQL (AWS RDS)        |
|   (log1p target transformation)   |   | - SQLite Fallback (Local)     |
| - CatBoost Risk Classifier (.cbm) |   | - SQLAlchemy ORM              |
| - 31 NCRB Crime Feature Vector    |   | - 4,208 Clean District Profile|
| - District Profile Lookup Service |   |   Records across 36 States/UTs|
+-----------------------------------+   +-------------------------------+
                    |
                    v
+-----------------------------------------------------------------------+
|                        ASSISTANT SERVICE TIER                         |
|   Groq API Client                                                     |
|   - Multi-Model Fallback Chain (120B -> 27B -> 7B -> 20B)              |
|   - Scoped strictly to Cybercrime, IT Act, & General Cybersecurity    |
|   - Structured Formatting (Max 300 words, no tables, bullet points)   |
+-----------------------------------------------------------------------+
```

---

## 3. Technology Stack

| Component | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend UI** | React.js 18, Vite | Single-page application user interface |
| **Styling** | Tailwind CSS | Clean, minimal, utility-first design system |
| **Visualizations** | Recharts, SVG Cartography | Distribution charts, forecast trends, India choropleth map |
| **Backend Framework** | FastAPI (Python) | High-performance asynchronous REST API |
| **ASGI Server** | Uvicorn | Web server for FastAPI application |
| **Machine Learning** | CatBoost (Regression + Classifier) | Multi-feature forecasting and risk tier classification |
| **Data Processing** | Pandas, NumPy | Feature vector extraction and data normalization |
| **ORM & Database** | SQLAlchemy, PostgreSQL / SQLite | Data persistence for users, evaluations, and district profiles |
| **Assistant API** | Groq Python SDK | Natural language domain advisory with model fallback |

---

## 4. Machine Learning & Inference Pipeline

### 4.1. Feature Engineering
The model operates on 31 official NCRB crime categories:
1. `tampering_computer_source_documents`
2. `ransom_ware`
3. `offences_other_than_ransom_ware`
4. `dishonestly_recv_stolen_cmp_resrc_or_comm_device`
5. `identity_theft`
6. `cheating_by_personation_by_using_computer_resource`
7. `violation_of_privacy`
8. `cyber_terrorism`
9. `other_sections_it_act`
10. `interception_or_monitoring_or_decryption_of_info`
11. `un_athryz_access_atmpt_access_prct_comp_sys`
12. `abetment_to_commit_offences`
13. `attempt_to_commit_offences`
14. `other_sections_of_it_act`
15. `cyber_stalking_bullying_of_women_children`
16. `data_theft`
17. `credit_card_debit_card_fraud`
18. `atms_fraud`
19. `online_banking_fraud`
20. `otp_frauds`
21. `other_frauds`
22. `cheating`
23. `forgery`
24. `defamation_morphing`
25. `fake_profile`
26. `currency_counterfeiting`
27. `stamps_counterfeiting`
28. `cyber_blackmailing_threatening`
29. `fake_news_on_social_media`
30. `other_offences`
31. `total_offences_ip`

### 4.2. Forecasting & Transformation Logic
- **Regression Model**: Trained with a `log1p(target)` transformation to stabilize variance across heavily skewed crime distributions.
- **Inference Inversion**: Predictions generated by the regressor are converted back to real-world volume using `expm1(raw_prediction)`:
  $$\text{predicted\_total} = \max\left(0, \exp(\hat{y}) - 1\right)$$
- **Classification Model**: Assigns discrete risk labels based on predicted volume and feature interactions:
  - **Low Risk**: Estimated burden $< 10.0$ offences.
  - **Medium Risk**: Estimated burden between $10.0$ and $33.0$ offences.
  - **High Risk**: Estimated burden $\ge 33.0$ offences.

---

## 5. Database Schema & Data Models

### 5.1. `users` Table
Stores basic analyst identification.
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 5.2. `predictions` Table
Stores historical and newly generated district evaluations.
```sql
CREATE TABLE predictions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    state VARCHAR(100) NOT NULL,
    district VARCHAR(100) NOT NULL,
    input_year INTEGER NOT NULL,
    forecast_year INTEGER NOT NULL,
    predicted_total FLOAT NOT NULL,
    risk_level VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 6. REST API Endpoints

### 6.1. System Health & Metadata
- `GET /` — API status and version metadata.
- `GET /health` — Health check status probe.

### 6.2. Geographic Lookups
- `GET /api/states` — Returns sorted list of 36 valid Indian States & Union Territories.
- `GET /api/districts?state={state}` — Returns valid districts for the selected state.
- `GET /api/years?state={state}&district={district}` — Returns available baseline years for the district.

### 6.3. Forecasting & Evaluation
- `POST /api/predict`
  - **Request Body**:
    ```json
    {
      "state": "Maharashtra",
      "district": "Pune",
      "year": 2021
    }
    ```
  - **Response Body**:
    ```json
    {
      "id": 895,
      "state": "Maharashtra",
      "district": "Pune",
      "input_year": 2021,
      "forecast_year": 2022,
      "predicted_total": 116.7,
      "risk_level": "High",
      "created_at": "2026-10-08T02:00:00",
      "current_total": 189.0,
      "top_crime_breakdown": [
        {"category": "Identity Theft", "count": 65.0},
        {"category": "Cheating By Personation", "count": 36.0},
        {"category": "Online Banking Fraud", "count": 35.0}
      ]
    }
    ```

### 6.4. Dashboard & Analytics
- `GET /api/dashboard` — Aggregates nationwide totals, risk breakdown counts, recent forecasts, and state-level averages for map rendering.
- `GET /api/predictions` — Returns paginated / searchable evaluation records.
- `DELETE /api/predictions/{id}` — Deletes an evaluation record by ID.

### 6.5. Assistant Service
- `POST /api/assistant/chat`
  - **Request Body**:
    ```json
    {
      "messages": [{"role": "user", "content": "What is the penalty under Section 66C IT Act?"}],
      "context": {
        "state": "Maharashtra",
        "district": "Pune",
        "predicted_total": 116.7,
        "risk_level": "High"
      }
    }
    ```
  - **Output Constraints**: Max 300 words, no tables, structured markdown format.

---

## 7. Frontend User Interface Specifications

1. **Design System**: Strict white and neutral minimal aesthetic (`#FFFFFF` cards, `#F8FAFC` page canvas, `#E2E8F0` borders, `#0F172A` text).
2. **Interactive India Map**: Accurate SVG choropleth mapping covering all 36 States & UTs with standardized Red (High Risk), Yellow (Medium Risk), and Green (Low Risk) color coding.
3. **Responsive Layout**: Designed for desktops, tablets, and mobile screens with responsive data tables and charts.
4. **Session Management**: Lightweight name-based session handling stored in browser `localStorage`.

---

## 8. Deployment & Execution Instructions

### 8.1. Unified Launcher
The application can be started using the root startup script:
```bash
./start.sh
```
This script initializes the Python virtual environment, starts the FastAPI backend on port `8000`, and launches the Vite frontend development server on port `5173`.

### 8.2. Environment Configuration (`backend/.env`)
```ini
DATABASE_URL=sqlite:///satark.db
GROQ_API_KEY=your_groq_api_key_here
MODEL_PATH=backend/app/ml/forecaster.cbm
RISK_MODEL_PATH=backend/app/ml/risk_classifier.cbm
DATA_PATH=data/district_profiles.csv
```

### 8.3. Production Build
```bash
cd frontend
npm run build
```
Build outputs are generated in `frontend/dist/` ready for static serving via Nginx or standard reverse proxy configurations.
