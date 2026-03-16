#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
ENV_FILE="${ENV_FILE:-${PROJECT_ROOT}/.env}"
BACKUP_SCRIPT="${PROJECT_ROOT}/scripts/backup-postgres.sh"

fail() {
  echo "Error: $*" >&2
  exit 1
}

require_command() {
  local command_name="$1"
  if ! command -v "${command_name}" >/dev/null 2>&1; then
    fail "Required command not found: ${command_name}"
  fi
}

extract_env_value() {
  local key="$1"
  local file_path="$2"

  if [[ ! -f "${file_path}" ]]; then
    return 1
  fi

  awk -F= -v key="${key}" '
    $0 ~ "^[[:space:]]*" key "=" {
      sub(/^[[:space:]]*[^=]+=/, "", $0)
      print
      exit
    }
  ' "${file_path}"
}

VERIFY_CHECKSUM=1
CREATE_SAFETY_BACKUP=1
YES=0
BACKUP_FILE=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --yes)
      YES=1
      shift
      ;;
    --skip-checksum)
      VERIFY_CHECKSUM=0
      shift
      ;;
    --skip-safety-backup)
      CREATE_SAFETY_BACKUP=0
      shift
      ;;
    --env-file)
      ENV_FILE="$2"
      shift 2
      ;;
    -*)
      fail "Unknown flag: $1"
      ;;
    *)
      BACKUP_FILE="$1"
      shift
      ;;
  esac
done

if [[ -z "${BACKUP_FILE}" ]]; then
  fail "Usage: scripts/restore-postgres.sh [--yes] [--skip-checksum] [--skip-safety-backup] <backup.dump>"
fi

if [[ ! -f "${BACKUP_FILE}" ]]; then
  fail "Backup file not found: ${BACKUP_FILE}"
fi

if [[ -z "${DATABASE_URL:-}" ]]; then
  DATABASE_URL="$(extract_env_value "DATABASE_URL" "${ENV_FILE}" || true)"
fi

if [[ -z "${DATABASE_URL:-}" ]]; then
  fail "DATABASE_URL is required. Export it or set it in ${ENV_FILE}."
fi

require_command pg_restore
require_command psql

if [[ "${VERIFY_CHECKSUM}" -eq 1 ]]; then
  CHECKSUM_FILE="${BACKUP_FILE}.sha256"
  if [[ ! -f "${CHECKSUM_FILE}" ]]; then
    fail "Checksum file not found: ${CHECKSUM_FILE}"
  fi

  if command -v sha256sum >/dev/null 2>&1; then
    sha256sum --check "${CHECKSUM_FILE}"
  elif command -v shasum >/dev/null 2>&1; then
    expected="$(awk '{ print $1 }' "${CHECKSUM_FILE}")"
    actual="$(shasum -a 256 "${BACKUP_FILE}" | awk '{ print $1 }')"
    if [[ "${expected}" != "${actual}" ]]; then
      fail "Checksum verification failed for ${BACKUP_FILE}"
    fi
  else
    fail "Neither sha256sum nor shasum is available."
  fi
fi

if [[ "${YES}" -ne 1 ]]; then
  fail "Restore is destructive. Re-run with --yes after verifying the target database."
fi

if [[ "${CREATE_SAFETY_BACKUP}" -eq 1 ]]; then
  if [[ ! -x "${BACKUP_SCRIPT}" ]]; then
    fail "Safety backup script is not executable: ${BACKUP_SCRIPT}"
  fi

  echo "Creating a safety backup before restore."
  "${BACKUP_SCRIPT}"
fi

echo "Terminating active sessions on target database."
psql "${DATABASE_URL}" -v ON_ERROR_STOP=1 <<'SQL'
SELECT pg_terminate_backend(pid)
FROM pg_stat_activity
WHERE datname = current_database()
  AND pid <> pg_backend_pid();
SQL

echo "Dropping and recreating public schema."
psql "${DATABASE_URL}" -v ON_ERROR_STOP=1 <<'SQL'
DROP SCHEMA IF EXISTS public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO CURRENT_USER;
GRANT ALL ON SCHEMA public TO public;
SQL

echo "Restoring ${BACKUP_FILE}"
pg_restore \
  --dbname="${DATABASE_URL}" \
  --clean \
  --if-exists \
  --no-owner \
  --no-privileges \
  "${BACKUP_FILE}"

echo "Restore complete."
