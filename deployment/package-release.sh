#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
test -f dist/apps/web/.next/standalone/apps/web/server.js
release_dir="$(mktemp -d)"
trap 'rm -rf "$release_dir"' EXIT
mkdir -p "$release_dir/web/apps/web/.next" "$release_dir/backend" "$release_dir/bin"
cp -a dist/apps/web/.next/standalone/. "$release_dir/web/"
cp -a dist/apps/web/.next/static "$release_dir/web/apps/web/.next/static"
cp -a apps/web/public "$release_dir/web/apps/web/public"
# Include the official Node runtime used for the successful build.
cp "$(command -v node)" "$release_dir/bin/node"
cp -a apps/backend/app apps/backend/alembic "$release_dir/backend/"
cp apps/backend/requirements-server.txt apps/backend/alembic.ini apps/backend/initialize_database.py "$release_dir/backend/"
find "$release_dir" -type d -name __pycache__ -prune -exec rm -rf {} +
tar -czf mirastros-release.tar.gz -C "$release_dir" .
sha256sum mirastros-release.tar.gz > mirastros-release.tar.gz.sha256
