#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
NODE_PREFIX="/opt/homebrew/opt/node@20/bin"
if [ ! -x "$NODE_PREFIX/node" ]; then
  NODE_PREFIX="/usr/local/opt/node@20/bin"
fi

export PATH="$NODE_PREFIX:$PATH"
cd "$ROOT_DIR"
exec npx nx serve web --port 4200
