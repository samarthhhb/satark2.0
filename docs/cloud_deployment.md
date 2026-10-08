# SATARK 2.0 — AWS Cloud Deployment & Production Guide

This guide provides step-by-step instructions for deploying and running **SATARK 2.0** in production on **Amazon Web Services (AWS)** using **EC2**, **Nginx**, **Systemd**, and optional **AWS RDS PostgreSQL**.

---

## 1. System Architecture Overview

```
                                 PUBLIC INTERNET
                                       │
                         HTTPS (443) / HTTP (80)
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           AWS EC2 VIRTUAL SERVER                            │
│                                                                             │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │                        NGINX WEB SERVER                             │   │
│   │   ├── /          ──▶ React 18 SPA (Compiled Static dist/)           │   │
│   │   ├── /api/*     ──▶ Reverse Proxy (http://127.0.0.1:8000/api/)     │   │
│   │   └── /docs      ──▶ Swagger API Documentation                      │   │
│   └──────────────────────────────────┬──────────────────────────────────┘   │
│                                      │                                      │
│                                      ▼                                      │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │                 FASTAPI APPLICATION SERVICE                         │   │
│   │                 (Managed by Systemd: satark.service)                │   │
│   │                                                                     │   │
│   │   ├── Uvicorn ASGI Server (127.0.0.1:8000, 1 Worker)                │   │
│   │   ├── CatBoost Regressor & Classifier Inference (.cbm)              │   │
│   │   ├── 4,208 District Baseline Crime Profiles Lookup                 │   │
│   │   └── CyberGuard AI Threat Intel (Groq API Client)                  │   │
│   └──────────────────────────────────┬──────────────────────────────────┘   │
│                                      │                                      │
│   ┌──────────────────────────────────▼──────────────────────────────────┐   │
│   │                     LOCAL PERSISTENCE / SWAP                        │   │
│   │   ├── SQLite Database (/home/ubuntu/satark-2.0/backend/satark.db)   │   │
│   │   └── 2GB Swap Memory Protection (/swapfile)                        │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                   (Optional Managed Cloud Database)
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           AWS RDS POSTGRESQL                                │
│   Production Managed Database (Automated Backups, Multi-AZ Replication)     │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Infrastructure Requirements & Prerequisites

### A. AWS EC2 Instance Specs
- **OS**: Ubuntu 22.04 LTS or 24.04 LTS
- **Instance Type**: 
  - `t3.medium` / `t2.medium` (Recommended for production, 2 vCPUs, 4GB RAM)
  - `t3.micro` / `t2.micro` (Supported with the built-in 2GB swap memory protection)
- **Storage**: 15–20 GB General Purpose SSD (gp3)

### B. AWS Security Group Rules (Inbound)
| Type | Port | Protocol | Source | Purpose |
| :--- | :--- | :--- | :--- | :--- |
| **SSH** | `22` | TCP | `My IP` or `0.0.0.0/0` | Remote server administration |
| **HTTP** | `80` | TCP | `0.0.0.0/0` (Anywhere) | Public web traffic & Certbot verification |
| **HTTPS** | `443` | TCP | `0.0.0.0/0` (Anywhere) | Secure encrypted SSL web traffic |

### C. Local Prerequisites
- SSH Key Pair (`.pem` file, e.g., `/Users/<username>/Documents/satark.pem`)
- Public IPv4 Address of your EC2 instance (e.g., `16.16.170.179`)

---

## 3. Quick Automated Deployment (1-Click)

The repository includes a battle-tested automated setup script ([`cloud.sh`](file:///Users/samarth/Documents/Satark%20Model/cloud.sh)).

### Step 1: Upload Project to EC2 (From your Local Terminal)
```bash
rsync -avz --exclude 'node_modules' --exclude 'backend/venv' --exclude '.git' \
  -e "ssh -i /path/to/satark.pem" \
  "/path/to/Satark Model/" ubuntu@<YOUR_EC2_PUBLIC_IP>:/home/ubuntu/satark-2.0/
```

### Step 2: SSH into EC2 Server
```bash
ssh -i /path/to/satark.pem ubuntu@<YOUR_EC2_PUBLIC_IP>
```

### Step 3: Run `cloud.sh`
```bash
cd /home/ubuntu/satark-2.0
chmod +x cloud.sh
./cloud.sh
```

**What `cloud.sh` performs automatically:**
1. **Configures 2GB Swap Memory**: Guarantees the server never exhausts RAM or locks up during ML model inference.
2. **Installs System Dependencies**: Python 3, venv, pip, Node.js 20.x, Nginx, and Git.
3. **Installs Backend & Frontend**: Builds the Python virtual environment with all ML dependencies (`catboost`, `groq`, `fastapi`) and builds the production React assets (`frontend/dist`).
4. **Installs Systemd Service**: Configures `satark.service` for automatic crash recovery and startup on boot.
5. **Configures Nginx**: Routes web traffic on port `80` to React and proxies `/api/*` requests to FastAPI.
6. **Applies Proper Permissions**: Adjusts Linux file permissions so `www-data` can serve the static frontend.

---

## 4. Configuring Free SSL / HTTPS (Let's Encrypt)

### Method 1: Instant SSL using `sslip.io` (No Domain Required)
If you don't own a custom domain, you can get a trusted SSL certificate using the wildcard domain pointing to your IP:

```bash
# 1. Install Certbot
sudo apt-get update -y
sudo apt-get install -y certbot python3-certbot-nginx

# 2. Configure Nginx Server Name
sudo sed -i "s/server_name _;/server_name <YOUR_IP>.sslip.io <YOUR_IP>;/g" /etc/nginx/sites-available/satark
sudo systemctl reload nginx

# 3. Request SSL Certificate
sudo certbot --nginx -d <YOUR_IP>.sslip.io --non-interactive --agree-tos -m your_email@example.com --redirect
```

### Method 2: Custom Domain (e.g., `satark.yourdomain.com`)
1. In your DNS provider (Cloudflare, Route 53, GoDaddy), add an **A Record**:
   - **Host**: `satark` (or `@`)
   - **Points to**: `<YOUR_EC2_PUBLIC_IP>`
2. Run Certbot on EC2:
   ```bash
   sudo certbot --nginx -d satark.yourdomain.com
   ```

---

## 5. Production AWS RDS PostgreSQL Integration (Optional)

To scale beyond local SQLite:

1. **Launch RDS Instance**: Create a PostgreSQL instance on AWS RDS in the same VPC as your EC2 server.
2. **Configure Security Group**: Allow inbound Port `5432` on the RDS Security Group from your EC2 Security Group.
3. **Update Backend `.env`**:
   ```ini
   DATABASE_URL=postgresql://satark_admin:YourSecurePassword@satark-db.xxxxxx.rds.amazonaws.com:5432/satark
   ```
4. **Restart Backend Service**:
   ```bash
   sudo systemctl restart satark
   ```

FastAPI will automatically create all tables and pre-populate nationwide baseline data into PostgreSQL upon startup.

---

## 6. Service Management & Troubleshooting

### Common Commands

| Operational Task | Command |
| :--- | :--- |
| **Check Backend Status** | `sudo systemctl status satark --no-pager` |
| **View Live Backend Logs** | `sudo journalctl -u satark -f` |
| **Restart Backend Service** | `sudo systemctl restart satark` |
| **Restart Nginx** | `sudo systemctl restart nginx` |
| **Test Nginx Configuration** | `sudo nginx -t` |
| **View Nginx Error Logs** | `sudo tail -n 50 /var/log/nginx/error.log` |

### Deploying Future Code Updates
Whenever you make updates locally, push your changes to EC2 and rebuild:

```bash
# 1. From Mac, upload changes:
rsync -avz --exclude 'node_modules' --exclude 'backend/venv' --exclude '.git' \
  -e "ssh -i /path/to/satark.pem" \
  "/path/to/Satark Model/" ubuntu@<YOUR_EC2_PUBLIC_IP>:/home/ubuntu/satark-2.0/

# 2. Inside EC2, rebuild & restart:
cd /home/ubuntu/satark-2.0
npm --prefix frontend run build
sudo systemctl restart satark
```
