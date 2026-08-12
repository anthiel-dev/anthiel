#!/usr/bin/env bash
# Copy Anthiel Cursor rules from this skill's assets/ into a consumer .cursor/rules/
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SOURCE="$(cd "${SCRIPT_DIR}/../assets" && pwd)"

if [[ $# -lt 1 ]]; then
  echo "Usage: $0 <path-to-consumer-app>"
  echo "Example: $0 ."
  echo "Example: $0 /Users/berli/Developer/mira"
  exit 1
fi

TARGET_ROOT="$(cd "$1" && pwd)"
DEST="${TARGET_ROOT}/.cursor/rules"

if [[ ! -d "${SOURCE}" ]]; then
  echo "error: assets directory not found at ${SOURCE}" >&2
  exit 1
fi

mkdir -p "${DEST}"
copied=0
for f in "${SOURCE}"/*.mdc; do
  [[ -e "$f" ]] || continue
  base="$(basename "$f")"
  cp "$f" "${DEST}/${base}"
  echo "copied ${base} → ${DEST}/${base}"
  copied=$((copied + 1))
done

if [[ "${copied}" -eq 0 ]]; then
  echo "error: no .mdc files in ${SOURCE}" >&2
  exit 1
fi

echo "done: ${copied} rule(s) synced to ${DEST}"
