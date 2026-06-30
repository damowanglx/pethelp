#!/bin/bash
# Database backup script — run via cron daily
# Usage: 0 2 * * * /home/ubuntu/pethelp/pethelp-server/scripts/backup-db.sh
set -e

BACKUP_DIR="/home/ubuntu/backups/mysql"
RETENTION_DAYS=7
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
mkdir -p "$BACKUP_DIR"

docker exec pethelp-mysql mysqldump \
  -upethelp -ppethelp_dev \
  --single-transaction \
  --routines \
  --triggers \
  pethelp \
  | gzip > "$BACKUP_DIR/pethelp_$TIMESTAMP.sql.gz"

# Cleanup old backups
find "$BACKUP_DIR" -name "pethelp_*.sql.gz" -mtime +$RETENTION_DAYS -delete

echo "Backup complete: pethelp_$TIMESTAMP.sql.gz ($(du -h "$BACKUP_DIR/pethelp_$TIMESTAMP.sql.gz" | cut -f1))"
