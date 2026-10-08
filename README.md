# SATARK 2.0 — Cybercrime Forecasting and Risk Intelligence System

SATARK 2.0 is a web-based cybercrime forecasting and risk intelligence system designed to help analyze regional cybercrime patterns across India. Rather than only looking retrospectively at what has already occurred, the system uses historical district-level crime data to forecast the expected cybercrime burden in the upcoming year and classify regions into standardized risk categories (Low, Medium, or High).

---

## Overview

Traditional crime reporting systems collect incidents and summarize historical statistics. SATARK 2.0 builds on this data by introducing a predictive layer:

1. **District-Level Forecasting**: Uses historical State–District–Year crime profiles across 31 official categories (such as banking fraud, identity theft, OTP frauds, and ransomware) to forecast expected next-year incident volumes using a trained CatBoost regression model.
2. **Risk Classification**: Automatically categorizes regions into **Low**, **Medium**, or **High** risk levels based on predicted burden and feature interactions.
3. **Decision Support Dashboard**: An interactive web interface with visualizations, an authentic India choropleth map chart, historical audit tables, and a specialized analytics assistant for cyber law and crime prevention guidance.

---

## Key Features

- **Automated Profile Retrieval**: Users select a State, District, and Baseline Year; the system automatically loads the corresponding 31-feature crime profile without manual data entry.
- **Interactive Map of India**: Color-coded geographic visualization (Red for High Risk, Yellow for Medium Risk, Green for Low Risk) representing district evaluations across all 36 States and Union Territories.
- **Data Persistence & Audit History**: Stores all generated forecasts in a database with CSV export and search filtering.
- **Analytics Assistant**: An integrated natural language assistant specialized in Indian cyber laws (IT Act 2000), NCRB statistics, and general cybersecurity standards.
- **Simple, Clean Interface**: Built with a minimal white design system focused on clarity and readability.

---

## System Architecture

The project follows a simple, robust web architecture:

```
React.js (Frontend) ──▶ FastAPI (Backend) ──▶ CatBoost Models (ML) ──▶ PostgreSQL / SQLite (Database)
```

- **Frontend**: React 18, Vite, Tailwind CSS, Recharts.
- **Backend**: FastAPI, Uvicorn, SQLAlchemy.
- **Machine Learning**: CatBoost Regressor (log1p/expm1 scaling) & CatBoost Classifier.
- **Database**: PostgreSQL (for production / AWS RDS) or local SQLite.
- **Assistant Service**: Groq API integration with multi-model fallback.

---

## Project Structure

```
satark-2.0/
├── backend/
│   ├── app/
│   │   ├── main.py               # FastAPI application & lifespan events
│   │   ├── database.py           # Database connection & session management
│   │   ├── models.py             # Database models (users, predictions)
│   │   ├── schemas.py            # Pydantic request/response schemas
│   │   ├── prepopulate_data.py   # Baseline nationwide prediction loader
│   │   ├── routes/               # API routes (prediction, dashboard, assistant)
│   │   ├── services/             # Analytics assistant service
│   │   └── ml/
│   │       ├── forecaster.cbm            # Trained CatBoost regression model
│   │       ├── risk_classifier.cbm       # Trained CatBoost classifier
│   │       └── inference.py              # Model loading and inference engine
│   ├── requirements.txt          # Python dependencies
│   └── .env                      # Environment configuration
│
├── frontend/
│   ├── src/
│   │   ├── components/           # Navbar, IndiaMap, Assistant drawer
│   │   ├── pages/                # Login, Dashboard, Forecasting, History
│   │   ├── data/                 # India map SVG boundary data
│   │   └── api/                  # API client
│   ├── package.json
│   └── vite.config.js
│
├── data/
│   └── district_profiles.csv     # 4,208 Clean district-level profile records
│
├── docs/
│   ├── outcomes.md               # Project overview, scope, and relevance
│   └── tech_specs.md             # Detailed technical specifications
│
├── start.sh                      # Unified startup script for backend & frontend
└── README.md
```

---

## API Summary

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/` | API status and health check |
| `GET` | `/api/states` | List of 36 Indian States and Union Territories |
| `GET` | `/api/districts?state={name}` | Districts for the selected state |
| `GET` | `/api/years?state={name}&district={name}` | Available baseline years |
| `POST` | `/api/predict` | Generate next-year forecast and risk classification |
| `GET` | `/api/predictions` | Retrieve prediction audit history |
| `DELETE` | `/api/predictions/{id}` | Delete a prediction record |
| `GET` | `/api/dashboard` | Aggregated statistics, risk distributions, and state breakdown |
| `POST` | `/api/assistant/chat` | Query the cybercrime analytics assistant |

---

## Getting Started

### Prerequisites
- Python 3.10+
- Node.js 18+ and npm

### Quick Start (One Command)
When cloned, all core forecasting, machine learning models, nationwide database profiles, and the web portal run **directly out of the box** without requiring any external cloud setup:

```bash
chmod +x start.sh
./start.sh
```

- **Frontend Application**: `http://localhost:5173`
- **Backend API**: `http://localhost:8000`
- **Interactive API Documentation**: `http://localhost:8000/docs`

> [!TIP]
> **CyberGuard AI Assistant**: The ML forecasting engine and database work immediately with zero configuration. To also enable the natural language **CyberGuard AI Assistant**, add your free Groq API key in `backend/.env`:
> ```env
> GROQ_API_KEY=gsk_your_actual_groq_api_key_here
> ```

### Manual Startup

**1. Start Backend:**
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

**2. Start Frontend:**
```bash
cd frontend
npm install
npm run dev
```

---

## Cloud Deployment (AWS EC2 & RDS)

SATARK 2.0 is fully optimized for cloud hosting on **Amazon Web Services (AWS)** using **Ubuntu 22.04 LTS**, **Nginx reverse proxy**, and **Systemd service supervision**.

### 1-Click Cloud Deployment
Run the automated cloud controller script on your EC2 instance:
```bash
chmod +x cloud.sh
./cloud.sh
```
This script automatically configures **2GB Swap Memory Protection**, installs dependencies, compiles the production React build, and activates background services.

> For full AWS infrastructure architecture, security group setup, Let's Encrypt SSL/HTTPS certificates, and AWS RDS PostgreSQL integration, see **[docs/cloud_deployment.md](docs/cloud_deployment.md)**.

---

## About Us & Development Team

Developed under the **Department of AI and Machine Learning, Symbiosis Institute of Technology (SIT), Pune**.

### Team Members
1. **Samarth Buchake**
2. **Rehaan Kasad**
3. **Rashi Singh**
4. **Shaikh Aakef**

---

## Documentation Index

Comprehensive project documentation is organized in the `docs/` directory:
- 📖 **[docs/outcomes.md](docs/outcomes.md)** — Project motivation, domain relevance, cybersecurity applications, and executive summary.
- ⚙️ **[docs/tech_specs.md](docs/tech_specs.md)** — Detailed technical specifications, 31-feature ML vectors, database schemas, and REST API contracts.
- ☁️ **[docs/cloud_deployment.md](docs/cloud_deployment.md)** — AWS EC2 & RDS deployment architecture, Nginx configurations, Systemd services, and SSL/HTTPS guide.

