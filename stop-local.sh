#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WEB_SESSION="mirastros_web"
BACKEND_SESSION="mirastros_backend"

kill_port_listeners() {
  local port="$1"
  local pids
  pids="$(lsof -tiTCP:"$port" -sTCP:LISTEN -n -P 2>/dev/null || true)"
  if [ -n "$pids" ]; then
    echo "Force stopping listeners on port $port (PID: $pids)..."
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

screen -S "$WEB_SESSION" -X quit >/dev/null 2>&1 || true
screen -S "$BACKEND_SESSION" -X quit >/dev/null 2>&1 || true
kill_port_listeners 4200
kill_port_listeners 8000

echo "Done."
