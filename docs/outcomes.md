# SATARK 2.0: Cloud-Based Cybercrime Intelligence & Risk Assessment

## Executive Summary

**SATARK 2.0** (*System for Advanced Threat Analytics & Regional Cybercrime Knowledge*) is a cloud-hosted predictive intelligence platform designed to transform historical cybercrime records into proactive regional risk assessments across India.

Rather than merely summarizing past offenses retrospectively, SATARK 2.0 evaluates multi-dimensional district profiles to forecast next-year crime burdens and categorize administrative districts into standardized risk tiers (**Low**, **Medium**, and **High**).

---

## 1. Motivation & Real-World Relevance

Cybercrime incidents in India have expanded dramatically in volume and geographic dispersion, encompassing financial fraud (UPI/OTP scams, banking unauthorized transfers), identity theft, cyber harassment, and ransomware attacks. 

Traditional police records and retrospective reports (such as annual NCRB summaries) tell law enforcement and policymakers what happened in previous years, but offer limited forward-looking visibility.

### How SATARK 2.0 Bridges the Gap:
- **Proactive Threat Forecasting**: Shifts policing and cybersecurity strategy from reactive incident investigation to proactive resource pre-allocation.
- **Micro-Targeted Awareness**: Identifies specific vulnerability patterns (e.g., identity theft clusters vs. digital banking fraud spikes) at the district level.
- **Standardized Risk Classification**: Supplies administrative leaders with a straightforward 3-tier risk score (Low, Medium, High) for quick operational triage.

---

## 2. Core Technological Pillars

```
┌────────────────────────────────────────────────────────────────────────┐
│                        SATARK 2.0 ARCHITECTURE                         │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
       ┌───────────────────────────┼───────────────────────────┐
       ▼                           ▼                           ▼
┌──────────────┐          ┌────────────────┐          ┌─────────────────┐
│ CLOUD INFRA  │          │ MACHINE LEARN. │          │ CYBERSECURITY   │
│ AWS EC2 / RDS│          │ CatBoost Model │          │ Threat Intel    │
│ FastAPI REST │          │ 31-Feature Reg │          │ CyberGuard LLM  │
│ Scalable DB  │          │ Risk Classifier│          │ Legal Advisory  │
└──────────────┘          └────────────────┘          └─────────────────┘
```

### A. Cloud Architecture & Infrastructure
Modern cyber threat analytics requires elastic compute, centralized data persistence, and high-availability REST APIs.
- **Application Tier**: FastAPI (Python 3.10+) running on asynchronous ASGI Uvicorn workers.
- **Persistence Tier**: Relational storage (AWS RDS PostgreSQL in production / local SQLite for development) managed via SQLAlchemy ORM.
- **Client Tier**: Single-Page Application (SPA) built with React 18, Vite, and Tailwind CSS.

### B. Machine Learning Engine
- **CatBoost Regression**: Ingests 31 official crime indicators from district profiles and estimates expected next-year cybercrime incident volumes. Uses a `log1p`/`expm1` target transformation to preserve numerical stability on skewed count distributions.
- **CatBoost Risk Classifier**: Categorizes the district into **Low**, **Medium**, or **High** risk tiers based on predictive multi-feature interactions.

### C. CyberGuard Threat Intelligence Assistant
- An integrated natural language AI assistant powered by Groq's high-speed inference engine.
- Specifically guardrailed to answer queries on Indian cyber laws (**Information Technology Act, 2000**), district risk mitigation strategies, and cybersecurity defensive standards.

---

## 3. Practical Applications

| Stakeholder | Key Benefit & Application |
| :--- | :--- |
| **Law Enforcement & Cyber Cells** | Strategic allocation of specialized forensic tools, personnel deployment, and targeted cyber patrol scheduling based on forecasted risk tiers. |
| **State Cyber Crime Coordination Centers (I4C)** | Prioritizing regional public awareness campaigns (e.g., intensive OTP/banking fraud awareness in vulnerable districts). |
| **Banking & Financial Institutions** | Regional risk assessments for financial fraud monitoring and fraud-prevention advisory campaigns. |
| **Academic & Policy Researchers** | Open, reproducible testbed demonstrating end-to-end integration of cloud infrastructure, data pipelines, and machine learning models. |

---

## 4. Scalability & Future Roadmap

1. **Automated Data Ingestion Pipelines**: Continuous ingestion of live cybercrime portal reports (NCRP) via scheduled AWS Lambda / EventBridge tasks.
2. **Containerization & CI/CD**: Dockerized microservice architecture orchestrated via Amazon ECS / Fargate with GitHub Actions continuous deployment.
3. **Choropleth Heatmap Animation**: Temporal playback showing predicted risk drift across Indian districts over multiple forecasting horizons.
4. **Role-Based Access Control (RBAC)**: Fine-grained permissions separating law enforcement analysts, state administrators, and public viewers.
