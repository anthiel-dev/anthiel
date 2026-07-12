#!/usr/bin/env bash
# Deploy Anthiel backend on a VPS (PM2).
#
# Prerequisites:
#   - Repo cloned on the server (APP_ROOT)
#   - Bun + PM2 installed (npm i -g pm2)
#   - apps/backend/.env present (use http://api.anthiel.local — see Caddyfile)
#   - Caddy routing api.anthiel.local → 127.0.0.1:3002
#   - Cloudflare proxies public API hostname → this VPS
#
# Usage:
#   ./deploy/backend.sh
#
# Optional env:
#   APP_ROOT=/home/batamtoday/apps/anthiel   # default: repo root of this script
#   BRANCH=main
#   REMOTE=origin
#   BACKEND_APP=anthiel-backend
#   SKIP_MIGRATE=1
#   SKIP_RESTART=1
#   SKIP_PULL=1

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=./common.sh
source "${SCRIPT_DIR}/common.sh"

BACKEND_APP="${BACKEND_APP:-anthiel-backend}"
BACKEND_DIR="${APP_ROOT}/apps/backend"

log "=== Anthiel backend deploy ==="
log "APP_ROOT=${APP_ROOT}"
log "BRANCH=${BRANCH}"

[[ -d "$BACKEND_DIR" ]] || die "Backend directory not found: ${BACKEND_DIR}"
require_file "${BACKEND_DIR}/.env"

if [[ "${SKIP_PULL:-0}" != "1" ]]; then
  git_pull
else
  log "SKIP_PULL=1 — skipping git pull"
fi

bun_install

cd "$BACKEND_DIR"

if [[ "${SKIP_MIGRATE:-0}" != "1" ]]; then
  log "Running database migrations"
  bun run db:migrate
else
  log "SKIP_MIGRATE=1 — skipping migrations"
fi

pm2_reload_app "$BACKEND_APP"

log "Backend deploy finished"
