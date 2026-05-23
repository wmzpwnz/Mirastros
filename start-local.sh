#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$ROOT_DIR/apps/backend"
LOG_DIR="$ROOT_DIR/.local-logs"
WEB_LOG_FILE="$LOG_DIR/web.log"
BACKEND_LOG_FILE="$LOG_DIR/backend.log"

WEB_SESSION="mirastros_web"
BACKEND_SESSION="mirastros_backend"

mkdir -p "$LOG_DIR"

# Load nvm if available (Cursor/IDE terminals may not have it in PATH)
if [ -s "${NVM_DIR:-$HOME/.nvm}/nvm.sh" ]; then
  # shellcheck source=/dev/null
  . "${NVM_DIR:-$HOME/.nvm}/nvm.sh"
  if [ -f "$ROOT_DIR/.nvmrc" ]; then
    nvm use 2>/dev/null || true
  else
    nvm use 20 2>/dev/null || nvm use 18 2>/dev/null || nvm use node 2>/dev/null || true
  fi
fi

version_ge() {
  [ "$1" = "$2" ] && return 0
  [ "$(printf '%s\n%s\n' "$1" "$2" | sort -V | head -n1)" = "$2" ]
}

detect_node_prefix() {
  local current_node current_version
  current_node="$(command -v node || true)"
  if [ -n "$current_node" ]; then
    current_version="$("$current_node" -v | sed 's/^v//')"
    if version_ge "$current_version" "18.17.0"; then
      dirname "$current_node"
      return 0
    fi
  fi

  local nvm_node
  for nvm_node in "$HOME/.nvm/versions/node/"*/bin/node; do
    if [ -x "$nvm_node" ]; then
      version="$("$nvm_node" -v | sed 's/^v//')"
      if version_ge "$version" "18.17.0"; then
        dirname "$nvm_node"
        return 0
      fi
    fi
  done 2>/dev/null

  local candidates=(
    "/opt/homebrew/opt/node@20/bin/node"
    "/usr/local/opt/node@20/bin/node"
    "/opt/homebrew/bin/node"
    "/usr/local/bin/node"
  )

  local candidate version
  for candidate in "${candidates[@]}"; do
    if [ -x "$candidate" ]; then
      version="$("$candidate" -v | sed 's/^v//')"
      if version_ge "$version" "18.17.0"; then
        dirname "$candidate"
        return 0
      fi
    fi
  done
  return 1
}

kill_port_listeners() {
  local port="$1"
  local pids
  pids="$(lsof -tiTCP:"$port" -sTCP:LISTEN -n -P 2>/dev/null || true)"
  if [ -n "$pids" ]; then
    echo "Freeing port $port (PID: $pids)..."
    # shellcheck disable=SC2086
    kill $pids 2>/dev/null || true
    sleep 1
    pids="$(lsof -tiTCP:"$port" -sTCP:LISTEN -n -P 2>/dev/null || true)"
    if [ -n "$pids" ]; then
      # shellcheck disable=SC2086
      kill -9 $pids 2>/dev/null || true
    fi
  fi
}

wait_for_http() {
  local name="$1"
  local url="$2"
  local max_attempts="${3:-60}"
  local i
  for ((i=1; i<=max_attempts; i++)); do
    if curl -fsS "$url" >/dev/null 2>&1; then
      echo "OK: $name is available at $url"
      return 0
    fi
    sleep 1
  done
  echo "ERROR: $name did not become available at $url"
  return 1
}

NODE_PREFIX="$(detect_node_prefix || true)"
if [ -z "${NODE_PREFIX:-}" ]; then
  echo "ERROR: Node.js >= 18.17.0 is required."
  echo "Install Node 20, for example: brew install node@20"
  exit 1
fi

if ! command -v screen >/dev/null 2>&1; then
  echo "ERROR: screen is required for stable local daemon mode."
  exit 1
fi

if [ ! -d "$ROOT_DIR/node_modules" ]; then
  echo "Installing root dependencies..."
  (cd "$ROOT_DIR" && npm install)
fi

if [ ! -d "$BACKEND_DIR/venv" ]; then
  echo "Creating backend virtualenv..."
  (cd "$BACKEND_DIR" && python3 -m venv venv)
  (cd "$BACKEND_DIR" && source venv/bin/activate && pip install -r requirements.txt)
fi

# Pre-check: PostgreSQL (backend needs it)
# Prefer PostgreSQL 17 (has user data); fallback to 14
if ! pg_isready -h localhost -p 5432 -q 2>/dev/null; then
  echo "PostgreSQL is not running. Attempting to start..."
  PG17_DATA="/usr/local/var/postgresql@17"
  PG14_SERVICE="postgresql@14"
  if [ -d "$PG17_DATA" ] && [ -x "/usr/local/opt/postgresql@17/bin/pg_ctl" ]; then
    echo "Starting PostgreSQL 17 (with your data)..."
    rm -f "$PG17_DATA/postmaster.pid" 2>/dev/null
    /usr/local/opt/postgresql@17/bin/pg_ctl -D "$PG17_DATA" -l /tmp/pg17.log start 2>/dev/null || true
    sleep 3
  fi
  if ! pg_isready -h localhost -p 5432 -q 2>/dev/null && command -v brew >/dev/null 2>&1; then
    brew services start postgresql@14 2>/dev/null || brew services start postgresql 2>/dev/null || true
    sleep 3
  fi
  if ! pg_isready -h localhost -p 5432 -q 2>/dev/null; then
    echo "ERROR: PostgreSQL is not running on localhost:5432"
    echo "  Try: brew services start postgresql@14"
    echo "  Or: /usr/local/opt/postgresql@17/bin/pg_ctl -D /usr/local/var/postgresql@17 start"
    exit 1
  fi
fi

# Pre-check: Redis (optional but recommended)
if ! redis-cli ping >/dev/null 2>&1; then
  echo "WARNING: Redis is not running. Start: brew services start redis"
fi

screen -S "$WEB_SESSION" -X quit >/dev/null 2>&1 || true
screen -S "$BACKEND_SESSION" -X quit >/dev/null 2>&1 || true
kill_port_listeners 4200
kill_port_listeners 8000

echo "Starting backend on http://localhost:8000 ..."
screen -dmS "$BACKEND_SESSION" bash -lc \
  "cd '$BACKEND_DIR' && source venv/bin/activate && exec uvicorn app.main:app --reload --host 0.0.0.0 --port 8000 >> '$BACKEND_LOG_FILE' 2>&1"

echo "Starting web on http://localhost:4200 ..."
screen -dmS "$WEB_SESSION" bash -lc \
  "cd '$ROOT_DIR' && export PATH=\"$NODE_PREFIX:\$PATH\" && exec npx nx serve web --port 4200 >> '$WEB_LOG_FILE' 2>&1"

wait_for_http "Backend" "http://localhost:8000/docs" 90
wait_for_http "Web" "http://localhost:4200" 120

echo "Prewarming main pages (first load can take 30-60s)..."
curl -fsS -m 120 -o /dev/null "http://localhost:4200/" 2>/dev/null && echo "  / OK" || true
curl -fsS -m 90 -o /dev/null "http://localhost:4200/auth/login" 2>/dev/null && echo "  /auth/login OK" || true

# Open browser
if command -v open >/dev/null 2>&1; then
  open "http://localhost:4200" 2>/dev/null && echo "  Browser opened" || true
fi

echo
echo "Local environment is up:"
echo "  Web:     http://localhost:4200"
echo "  Backend: http://localhost:8000/docs"
echo
echo "Sessions:"
echo "  screen -ls | rg 'mirastros_(web|backend)'"
echo
echo "Logs:"
echo "  tail -f '$WEB_LOG_FILE'"
echo "  tail -f '$BACKEND_LOG_FILE'"
echo
echo "Stop:"
echo "  bash stop-local.sh"
