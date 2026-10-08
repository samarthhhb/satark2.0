#!/usr/bin/env bash

# ==============================================================================
# SATARK 2.0 — AWS Cloud Automated Deployment & Recovery Script (cloud.sh)
# Optimized for AWS EC2 (Ubuntu 22.04 / 24.04 LTS on t2.micro / t3.micro / t3.medium)
# ==============================================================================

set -e

echo "======================================================================"
echo "          SATARK 2.0 — AWS CLOUD 1-CLICK DEPLOYMENT CONTROLLER        "
echo "======================================================================"

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$PROJECT_ROOT/backend"
FRONTEND_DIR="$PROJECT_ROOT/frontend"

# 1. Add 2GB Swap Memory (Prevents RAM Exhaustion / Freezing on Micro instances)
echo "[1/7] Configuring Swap Memory Protection..."
if [ ! -f /swapfile ]; then
    echo "  -> Creating 2GB swapfile..."
    sudo fallocate -l 2G /swapfile || sudo dd if=/dev/zero of=/swapfile bs=1M count=2048
    sudo chmod 600 /swapfile
    sudo mkswap /swapfile
    sudo swapon /swapfile
    if ! grep -q "/swapfile" /etc/fstab; then
        echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
    fi
    echo "  [+] Swap memory activated (2GB)."
else
    echo "  [+] Swap memory already configured."
fi

# 2. System Packages & Node.js
echo "[2/7] Checking system dependencies and Nginx..."
sudo apt-get update -y
sudo apt-get install -y python3 python3-pip python3-venv nginx git curl

if ! command -v node &> /dev/null; then
    echo "  -> Installing Node.js 20.x..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

# 3. Backend Environment & Python Dependencies
echo "[3/7] Setting up Python backend virtual environment..."
cd "$BACKEND_DIR"

if [ ! -f "$BACKEND_DIR/.env" ]; then
    if [ -f "$BACKEND_DIR/.env.example" ]; then
        cp "$BACKEND_DIR/.env.example" "$BACKEND_DIR/.env"
    else
        cat << 'EOF' > "$BACKEND_DIR/.env"
DATABASE_URL=sqlite:///./satark.db
JWT_SECRET=satark_super_secure_jwt_secret_key_2026_x89a_prod_ready
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
MODEL_PATH=app/ml/forecaster.cbm
RISK_MODEL_PATH=app/ml/risk_classifier.cbm
DATA_PATH=../data/district_profiles.csv
GROQ_API_KEY=your_groq_api_key_here
EOF
    fi
fi

if [ ! -d "$BACKEND_DIR/venv" ]; then
    python3 -m venv "$BACKEND_DIR/venv"
fi
"$BACKEND_DIR/venv/bin/pip" install --upgrade pip
"$BACKEND_DIR/venv/bin/pip" install -r "$BACKEND_DIR/requirements.txt"

# 4. Build React Frontend
echo "[4/7] Compiling production frontend build..."
cd "$FRONTEND_DIR"
npm install
npm run build

# 5. Configure Systemd Service (Lightweight 1-Worker for stability)
echo "[5/7] Configuring Systemd background service (satark.service)..."
sudo tee /etc/systemd/system/satark.service > /dev/null << EOF
[Unit]
Description=SATARK 2.0 FastAPI Application Service
After=network.target

[Service]
User=ubuntu
Group=ubuntu
WorkingDirectory=$BACKEND_DIR
Environment="PATH=$BACKEND_DIR/venv/bin"
ExecStart=$BACKEND_DIR/venv/bin/uvicorn app.main:app --host 127.0.0.1 --port 8000 --workers 1

Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
EOF

# 6. Configure Nginx Reverse Proxy
echo "[6/7] Configuring Nginx web server and reverse proxy..."
sudo tee /etc/nginx/sites-available/satark > /dev/null << EOF
server {
    listen 80;
    server_name _;

    # React Frontend Static Serving
    location / {
        root $FRONTEND_DIR/dist;
        index index.html index.htm;
        try_files \$uri \$uri/ /index.html;
    }

    # API Proxy to FastAPI Backend
    location /api {
        proxy_pass http://127.0.0.1:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # API Documentation
    location /docs {
        proxy_pass http://127.0.0.1:8000/docs;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
    }

    location /openapi.json {
        proxy_pass http://127.0.0.1:8000/openapi.json;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
    }
}
EOF

sudo ln -sf /etc/nginx/sites-available/satark /etc/nginx/sites-enabled/default
sudo nginx -t

# 7. Set Permissions and Start Services
echo "[7/7] Applying permissions and starting services..."
chmod 755 /home/ubuntu 2>/dev/null || true
chmod -R 755 "$FRONTEND_DIR/dist"

sudo systemctl daemon-reload
sudo systemctl enable satark
sudo systemctl restart satark
sudo systemctl restart nginx

PUBLIC_IP=$(curl -s http://checkip.amazonaws.com || curl -s https://ifconfig.me || echo "13.63.19.104")

echo ""
echo "======================================================================"
echo "          SATARK 2.0 AWS CLOUD DEPLOYMENT COMPLETED!                  "
echo "======================================================================"
echo "  • Web Portal URL   : http://${PUBLIC_IP}"
echo "  • API Swagger Docs : http://${PUBLIC_IP}/docs"
echo "  • Backend Service  : Active & Running (systemd)"
echo "  • Nginx Proxy      : Active & Running (port 80)"
echo "======================================================================"
echo ""

sudo systemctl status satark --no-pager
