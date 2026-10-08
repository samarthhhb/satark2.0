#!/usr/bin/env bash

# ==============================================================================
# SATARK 2.0 — Quick Start Script
# Runs FastAPI Backend (Port 8000) and React Frontend (Port 5173) simultaneously.
# ==============================================================================

set -e

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$PROJECT_ROOT/backend"
FRONTEND_DIR="$PROJECT_ROOT/frontend"

echo "======================================================================"
echo "                   SATARK 2.0 STARTUP CONTROLLER                      "
echo "======================================================================"

# 1. Ensure backend .env exists
if [ ! -f "$BACKEND_DIR/.env" ]; then
    if [ -f "$BACKEND_DIR/.env.example" ]; then
        echo "[*] Creating backend/.env from template (.env.example)..."
        cp "$BACKEND_DIR/.env.example" "$BACKEND_DIR/.env"
    fi
fi

# 2. Check Python virtual environment
if [ ! -d "$BACKEND_DIR/venv" ]; then
    echo "[*] Initializing Python virtual environment in backend/venv..."
    python3 -m venv "$BACKEND_DIR/venv"
    "$BACKEND_DIR/venv/bin/pip" install --upgrade pip
    "$BACKEND_DIR/venv/bin/pip" install -r "$BACKEND_DIR/requirements.txt"
fi

# 3. Check Node modules in frontend
if [ ! -d "$FRONTEND_DIR/node_modules" ]; then
    echo "[*] Installing frontend dependencies with npm..."
    (cd "$FRONTEND_DIR" && npm install)
fi

# 3. Cleanup existing processes on ports 8000 and 5173 if any
echo "[*] Checking port availability..."
if lsof -ti :8000 >/dev/null 2>&1; then
    echo "[!] Clearing existing process on port 8000..."
    kill -9 $(lsof -ti :8000) 2>/dev/null || true
fi
if lsof -ti :5173 >/dev/null 2>&1; then
    echo "[!] Clearing existing process on port 5173..."
    kill -9 $(lsof -ti :5173) 2>/dev/null || true
fi

# 4. Start Backend Server
echo "[*] Starting FastAPI Backend on http://127.0.0.1:8000 ..."
(cd "$BACKEND_DIR" && "$BACKEND_DIR/venv/bin/uvicorn" app.main:app --host 127.0.0.1 --port 8000 --reload) &
BACKEND_PID=$!

# 5. Start Frontend Server
echo "[*] Starting React Frontend on http://localhost:5173 ..."
(cd "$FRONTEND_DIR" && npm run dev -- --host 127.0.0.1 --port 5173) &
FRONTEND_PID=$!

# 6. Graceful shutdown handler
cleanup() {
    echo ""
    echo "======================================================================"
    echo "                    SHUTTING DOWN SATARK 2.0...                       "
    echo "======================================================================"
    kill $BACKEND_PID 2>/dev/null || true
    kill $FRONTEND_PID 2>/dev/null || true
    echo "[+] Backend and Frontend services stopped successfully."
    exit 0
}

trap cleanup SIGINT SIGTERM EXIT

# 7. Information Display
sleep 2
echo ""
echo "======================================================================"
echo "                  SATARK 2.0 SERVICES ARE LIVE!                       "
echo "======================================================================"
echo "  • Frontend Web Portal : http://localhost:5173"
echo "  • Backend REST API    : http://127.0.0.1:8000"
echo "  • Swagger API Docs    : http://127.0.0.1:8000/docs"
echo "======================================================================"
echo "  Press [Ctrl + C] anytime to stop all services."
echo "======================================================================"
echo ""

# Keep script running and wait for background tasks
wait
