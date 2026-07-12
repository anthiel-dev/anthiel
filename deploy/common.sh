#!/usr/bin/env bash
# Shared helpers for Anthiel VPS deploy scripts (PM2 + Caddy).
set -euo pipefail

DEPLOY_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${DEPLOY_DIR}/.." && pwd)"

APP_ROOT="${APP_ROOT:-$REPO_ROOT}"
BRANCH="${BRANCH:-main}"
REMOTE="${REMOTE:-origin}"
ECOSYSTEM="${ECOSYSTEM:-${APP_ROOT}/deploy/ecosystem.config.cjs}"

log() {
  printf '[%s] %s\n' "$(date '+%Y-%m-%d %H:%M:%S')" "$*"
}

die() {
  printf '[%s] ERROR: %s\n' "$(date '+%Y-%m-%d %H:%M:%S')" "$*" >&2
  exit 1
}

require_cmd() {
  command -v "$1" >/dev/null 2>&1 || die "Missing required command: $1"
}

require_file() {
  [[ -f "$1" ]] || die "Missing required file: $1"
}

git_pull() {
  require_cmd git
  cd "$APP_ROOT"
  log "Pulling ${REMOTE}/${BRANCH} in ${APP_ROOT}"
  git fetch "$REMOTE" "$BRANCH"
  git checkout "$BRANCH"
  git pull --ff-only "$REMOTE" "$BRANCH"
}

bun_install() {
  require_cmd bun
  cd "$APP_ROOT"
  log "Installing dependencies with bun"
  bun install --frozen-lockfile
}

# Reload (or start) a single app from the ecosystem file.
pm2_reload_app() {
  local app_name="$1"
  if [[ "${SKIP_RESTART:-0}" == "1" ]]; then
    log "SKIP_RESTART=1 — not reloading ${app_name}"
    return
  fi
  require_cmd pm2
  require_file "$ECOSYSTEM"
  log "PM2 startOrReload ${app_name}"
  # APP_ROOT is read by ecosystem.config.cjs for cwd paths
  APP_ROOT="$APP_ROOT" pm2 startOrReload "$ECOSYSTEM" --only "$app_name" --update-env
  pm2 save
  pm2 show "$app_name" || true
}
