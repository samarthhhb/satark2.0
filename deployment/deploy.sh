#!/usr/bin/env bash
set -e

echo "=== SATARK 2.0 EC2 Automated Deployment Script ==="

# 1. Update system packages
echo "[1/6] Updating system packages and installing prerequisites..."
sudo apt update -y
sudo apt install -y python3 python3-pip python3-venv nginx git

# 2. Setup Python Virtual Environment in backend
echo "[2/6] Setting up Python backend virtual environment..."
cd /home/ubuntu/satark-2.0/backend
if [ ! -d "venv" ]; then
    python3 -m venv venv
fi
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt

# 3. Build React Frontend
echo "[3/6] Building React Frontend..."
cd /home/ubuntu/satark-2.0/frontend
# Ensure Node is installed
if ! command -v npm &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt install -y nodejs
fi
npm install
npm run build

# 4. Configure systemd service
echo "[4/6] Installing systemd service..."
sudo cp /home/ubuntu/satark-2.0/deployment/satark.service /etc/systemd/system/satark.service
sudo systemctl daemon-reload
sudo systemctl enable satark
sudo systemctl restart satark

# 5. Configure Nginx
echo "[5/6] Configuring Nginx reverse proxy..."
sudo cp /home/ubuntu/satark-2.0/deployment/nginx.conf /etc/nginx/sites-available/satark
sudo ln -sf /etc/nginx/sites-available/satark /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx

# 6. Status check
echo "[6/6] Checking service status..."
sudo systemctl status satark --no-pager

echo ""
echo "=== SATARK 2.0 DEPLOYMENT COMPLETE! ==="
echo "Application is now publicly accessible via your EC2 Public IP address on HTTP Port 80."
