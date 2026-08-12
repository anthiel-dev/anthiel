#!/usr/bin/env bash
# Build and deploy Anthiel blog (Cloudflare Workers static assets via Wrangler).
#
# Usage:
#   ./deploy/blog.sh
#
# Optional env:
#   APP_ROOT=…   # default: repo root of this script
#   SKIP_PULL=1

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=./common.sh
source "${SCRIPT_DIR}/common.sh"

BLOG_DIR="${APP_ROOT}/apps/blog"

log "=== Anthiel blog deploy ==="
log "APP_ROOT=${APP_ROOT}"
log "BRANCH=${BRANCH}"

[[ -d "$BLOG_DIR" ]] || die "Blog directory not found: ${BLOG_DIR}"

if [[ "${SKIP_PULL:-0}" != "1" ]]; then
  git_pull
else
  log "SKIP_PULL=1 — skipping git pull"
fi

bun_install

cd "$BLOG_DIR"

log "Building blog (Vite + TanStack Start prerender)"
bun run build

[[ -d "${BLOG_DIR}/dist/client" ]] || die "Build output missing: ${BLOG_DIR}/dist/client"

log "Deploying with Wrangler"
bun run deploy

log "Blog deploy finished"
