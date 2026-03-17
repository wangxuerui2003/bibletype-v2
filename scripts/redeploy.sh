#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BRANCH="${BRANCH:-$(git -C "$ROOT_DIR" branch --show-current)}"
REMOTE="${REMOTE:-origin}"
SERVICE_NAME="${SERVICE_NAME:-bibletype.service}"
APP_PORT="${APP_PORT:-4010}"
HEALTHCHECK_URL="${HEALTHCHECK_URL:-http://127.0.0.1:${APP_PORT}}"
RUN_UNIT_TESTS="${RUN_UNIT_TESTS:-0}"

log() {
  printf '\n[%s] %s\n' "$(date -u +'%Y-%m-%dT%H:%M:%SZ')" "$*"
}

require_cmd() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "Missing required command: $1" >&2
    exit 1
  fi
}

use_node_22() {
  if [[ -s "${NVM_DIR:-$HOME/.nvm}/nvm.sh" ]]; then
    export NVM_DIR="${NVM_DIR:-$HOME/.nvm}"
    # shellcheck disable=SC1090
    . "$NVM_DIR/nvm.sh"
    nvm use 22 >/dev/null
  fi
}

run_pnpm() {
  corepack pnpm "$@"
}

require_cmd git
require_cmd curl
require_cmd corepack
require_cmd systemctl

use_node_22

if [[ -n "$(git -C "$ROOT_DIR" status --short)" ]]; then
  echo "Working tree is dirty. Commit or stash changes before redeploying." >&2
  exit 1
fi

log "Pulling latest code from ${REMOTE}/${BRANCH}"
git -C "$ROOT_DIR" pull --ff-only "$REMOTE" "$BRANCH"

log "Installing dependencies"
run_pnpm --dir "$ROOT_DIR" install --frozen-lockfile

log "Running database migrations"
run_pnpm --dir "$ROOT_DIR" db:migrate

if [[ "$RUN_UNIT_TESTS" == "1" ]]; then
  log "Running unit tests"
  run_pnpm --dir "$ROOT_DIR" test:unit
fi

log "Building production bundle"
run_pnpm --dir "$ROOT_DIR" build

log "Restarting ${SERVICE_NAME}"
systemctl restart "$SERVICE_NAME"
systemctl --no-pager --lines=20 status "$SERVICE_NAME"

log "Running smoke test against ${HEALTHCHECK_URL}"
curl --fail --silent --show-error --location --max-time 20 "$HEALTHCHECK_URL" >/dev/null

log "Redeploy finished successfully"
