#!/usr/bin/env bash
# Deploy Anthiel dashboard on a VPS (PM2).
#
# Prerequisites:
#   - Repo cloned on the server (APP_ROOT)
#   - Bun + PM2 installed
#   - apps/dashboard/.env with VITE_* values used at build time
#     Browser-facing: use your Cloudflare public API URL (not .local)
#     On-box curls can use http://api.anthiel.local via Caddy + /etc/hosts
#   - Caddy routing dashboard.anthiel.local → 127.0.0.1:3001
#
# Usage:
#   ./deploy/dashboard.sh
#
# Optional env:
#   APP_ROOT=/home/batamtoday/apps/anthiel   # default: repo root of this script
#   BRANCH=main
#   REMOTE=origin
#   DASHBOARD_APP=anthiel-dashboard
#   SKIP_RESTART=1
#   SKIP_PULL=1

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=./common.sh
source "${SCRIPT_DIR}/common.sh"

DASHBOARD_APP="${DASHBOARD_APP:-anthiel-dashboard}"
DASHBOARD_DIR="${APP_ROOT}/apps/dashboard"

log "=== Anthiel dashboard deploy ==="
log "APP_ROOT=${APP_ROOT}"
log "BRANCH=${BRANCH}"

[[ -d "$DASHBOARD_DIR" ]] || die "Dashboard directory not found: ${DASHBOARD_DIR}"
require_file "${DASHBOARD_DIR}/.env"

if [[ "${SKIP_PULL:-0}" != "1" ]]; then
  git_pull
else
  log "SKIP_PULL=1 — skipping git pull"
fi

bun_install

cd "$DASHBOARD_DIR"

log "Building dashboard (Vite + Nitro bun preset)"
bun run build

[[ -f "${DASHBOARD_DIR}/.output/server/index.mjs" ]] \
  || die "Build output missing: ${DASHBOARD_DIR}/.output/server/index.mjs"

pm2_reload_app "$DASHBOARD_APP"

log "Dashboard deploy finished"
