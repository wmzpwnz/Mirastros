#!/bin/bash
# Mirastros Database Backup Script
# Создает резервные копии PostgreSQL базы данных

BACKUP_DIR="/var/backups/mirastros"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="mirastros"
DB_USER="mirastros"
RETENTION_DAYS=7

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "========================================="
echo "Mirastros Database Backup"
echo "Date: $(date '+%Y-%m-%d %H:%M:%S')"
echo "========================================="

# Create backup directory if it doesn't exist
mkdir -p $BACKUP_DIR

# Backup filename
BACKUP_FILE="$BACKUP_DIR/${DB_NAME}_${DATE}.sql.gz"

echo -n "Creating backup: "
# Perform backup
if pg_dump -U $DB_USER $DB_NAME | gzip > $BACKUP_FILE 2>/dev/null; then
    BACKUP_SIZE=$(du -h $BACKUP_FILE | cut -f1)
    echo -e "${GREEN}✅ SUCCESS${NC}"
    echo "File: $BACKUP_FILE"
    echo "Size: $BACKUP_SIZE"
else
    echo -e "${RED}❌ FAILED${NC}"
    exit 1
fi

# Remove old backups
echo -n "Cleaning old backups (older than $RETENTION_DAYS days): "
DELETED_COUNT=$(find $BACKUP_DIR -name "${DB_NAME}_*.sql.gz" -mtime +$RETENTION_DAYS -delete -print | wc -l)
echo -e "${GREEN}✅ Removed $DELETED_COUNT old backups${NC}"

# List current backups
echo ""
echo "Current backups:"
ls -lh $BACKUP_DIR/${DB_NAME}_*.sql.gz 2>/dev/null | awk '{print "  " $9 " (" $5 ")"}'

# Total backup size
TOTAL_SIZE=$(du -sh $BACKUP_DIR | cut -f1)
echo ""
echo "Total backup size: $TOTAL_SIZE"

echo "========================================="
echo "Backup Complete"
echo "========================================="
