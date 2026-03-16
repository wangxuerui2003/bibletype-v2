#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
ENV_FILE="${ENV_FILE:-${PROJECT_ROOT}/.env}"
BACKUP_DIR="${BACKUP_DIR:-${PROJECT_ROOT}/backups/postgres}"
RETENTION_DAYS="${RETENTION_DAYS:-14}"
APP_NAME="${APP_NAME:-bibletype}"
TIMESTAMP="$(date -u +"%Y%m%dT%H%M%SZ")"
BACKUP_BASENAME="${APP_NAME}_${TIMESTAMP}"
BACKUP_FILE="${BACKUP_DIR}/${BACKUP_BASENAME}.dump"
METADATA_FILE="${BACKUP_DIR}/${BACKUP_BASENAME}.meta.txt"
CHECKSUM_FILE="${BACKUP_FILE}.sha256"

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

if [[ -z "${DATABASE_URL:-}" ]]; then
  DATABASE_URL="$(extract_env_value "DATABASE_URL" "${ENV_FILE}" || true)"
fi

if [[ -z "${DATABASE_URL:-}" ]]; then
  fail "DATABASE_URL is required. Export it or set it in ${ENV_FILE}."
fi

require_command pg_dump
mkdir -p "${BACKUP_DIR}"
chmod 700 "${BACKUP_DIR}"

CHECKSUM_COMMAND=""
if command -v sha256sum >/dev/null 2>&1; then
  CHECKSUM_COMMAND="sha256sum"
elif command -v shasum >/dev/null 2>&1; then
  CHECKSUM_COMMAND="shasum -a 256"
else
  fail "Neither sha256sum nor shasum is available."
fi

echo "Creating PostgreSQL backup at ${BACKUP_FILE}"

pg_dump \
  --dbname="${DATABASE_URL}" \
  --format=custom \
  --compress=9 \
  --no-owner \
  --no-privileges \
  --file="${BACKUP_FILE}"

printf "timestamp_utc=%s\n" "${TIMESTAMP}" > "${METADATA_FILE}"
printf "backup_file=%s\n" "${BACKUP_FILE}" >> "${METADATA_FILE}"
printf "env_file=%s\n" "${ENV_FILE}" >> "${METADATA_FILE}"
printf "retention_days=%s\n" "${RETENTION_DAYS}" >> "${METADATA_FILE}"
printf "database_url_redacted=%s\n" "$(node -e 'const input = process.argv[1]; const url = new URL(input); if (url.password) url.password = "***"; console.log(url.toString())' "${DATABASE_URL}")" >> "${METADATA_FILE}"

${CHECKSUM_COMMAND} "${BACKUP_FILE}" > "${CHECKSUM_FILE}"

find "${BACKUP_DIR}" -type f \( -name "${APP_NAME}_*.dump" -o -name "${APP_NAME}_*.dump.sha256" -o -name "${APP_NAME}_*.meta.txt" \) -mtime +"${RETENTION_DAYS}" -delete

echo "Backup complete."
echo "Dump: ${BACKUP_FILE}"
echo "Checksum: ${CHECKSUM_FILE}"
echo "Metadata: ${METADATA_FILE}"
