#!/usr/bin/env bash
# Copy one user-selected transcript without overwriting an existing export.
# Usage: export-session.sh <transcript-file> <output-file>

set -euo pipefail
set -o noclobber
umask 077

if [[ $# -ne 2 ]]; then
  printf 'Usage: %s <transcript-file> <output-file>\n' "$0" >&2
  exit 2
fi

transcript_path="$1"
export_path="$2"

if [[ ! -f "$transcript_path" || ! -r "$transcript_path" ]]; then
  printf 'Transcript must be a readable file: %s\n' "$transcript_path" >&2
  exit 1
fi

if [[ -e "$export_path" || -L "$export_path" ]]; then
  printf 'Output already exists: %s\n' "$export_path" >&2
  exit 1
fi

cat < "$transcript_path" > "$export_path"
printf 'Exported selected transcript: %s\n' "$export_path"
