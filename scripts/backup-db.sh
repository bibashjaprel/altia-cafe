#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

STAMP=$(date +%F-%H%M)
BACKUP_DIR="$ROOT/backups"
FILE="altia-${STAMP}.dump"

mkdir -p "$BACKUP_DIR"

docker-compose exec -T postgres pg_dump \
  -U postgres \
  -d altia_cafe \
  -F c \
  -f "/backups/${FILE}"

echo "Created backup: $BACKUP_DIR/$FILE"

# Keep last 7 days of dumps
find "$BACKUP_DIR" -type f -name "*.dump" -mtime +7 -delete
