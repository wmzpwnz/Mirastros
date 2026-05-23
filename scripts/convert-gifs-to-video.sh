#!/bin/bash

# Script to convert all GIF files to optimized video formats (WebM + MP4)
# This reduces file size by ~90% while maintaining visual quality

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

PUBLIC_DIR="../apps/web/public"
TOTAL_SIZE_BEFORE=0
TOTAL_SIZE_AFTER=0

echo -e "${GREEN}🎬 Starting GIF to Video Conversion${NC}"
echo "================================================"

# Check if ffmpeg is installed
if ! command -v ffmpeg &> /dev/null; then
    echo -e "${RED}❌ Error: ffmpeg is not installed${NC}"
    echo "Install with: brew install ffmpeg (macOS) or apt-get install ffmpeg (Linux)"
    exit 1
fi

# Navigate to public directory
cd "$PUBLIC_DIR" || exit 1

# Find all GIF files
GIF_FILES=(*.gif)

if [ ${#GIF_FILES[@]} -eq 0 ]; then
    echo -e "${YELLOW}⚠️  No GIF files found in $PUBLIC_DIR${NC}"
    exit 0
fi

echo -e "${GREEN}Found ${#GIF_FILES[@]} GIF files to convert${NC}\n"

# Convert each GIF
for gif in "${GIF_FILES[@]}"; do
    if [ ! -f "$gif" ]; then
        continue
    fi
    
    echo -e "${YELLOW}Processing: $gif${NC}"
    
    # Get original file size
    ORIGINAL_SIZE=$(du -h "$gif" | cut -f1)
    ORIGINAL_SIZE_KB=$(du -k "$gif" | cut -f1)
    TOTAL_SIZE_BEFORE=$((TOTAL_SIZE_BEFORE + ORIGINAL_SIZE_KB))
    
    BASENAME="${gif%.gif}"
    
    # Convert to WebM (VP9 codec, best compression for web)
    echo "  → Creating ${BASENAME}.webm..."
    ffmpeg -i "$gif" \
        -c:v libvpx-vp9 \
        -crf 35 \
        -b:v 0 \
        -an \
        -loop 0 \
        -auto-alt-ref 0 \
        "${BASENAME}.webm" \
        -y -loglevel error
    
    # Convert to MP4 (H.264 codec, fallback for Safari)
    echo "  → Creating ${BASENAME}.mp4..."
    ffmpeg -i "$gif" \
        -c:v libx264 \
        -crf 28 \
        -preset slow \
        -pix_fmt yuv420p \
        -movflags +faststart \
        -an \
        "${BASENAME}.mp4" \
        -y -loglevel error
    
    # Get new file sizes
    if [ -f "${BASENAME}.webm" ]; then
        WEBM_SIZE=$(du -h "${BASENAME}.webm" | cut -f1)
        WEBM_SIZE_KB=$(du -k "${BASENAME}.webm" | cut -f1)
        TOTAL_SIZE_AFTER=$((TOTAL_SIZE_AFTER + WEBM_SIZE_KB))
        echo -e "  ${GREEN}✓ WebM: $WEBM_SIZE (was $ORIGINAL_SIZE)${NC}"
    fi
    
    if [ -f "${BASENAME}.mp4" ]; then
        MP4_SIZE=$(du -h "${BASENAME}.mp4" | cut -f1)
        echo -e "  ${GREEN}✓ MP4:  $MP4_SIZE${NC}"
    fi
    
    echo ""
done

# Calculate savings
SAVINGS_KB=$((TOTAL_SIZE_BEFORE - TOTAL_SIZE_AFTER))
SAVINGS_PERCENT=$((SAVINGS_KB * 100 / TOTAL_SIZE_BEFORE))

echo "================================================"
echo -e "${GREEN}🎉 Conversion Complete!${NC}"
echo ""
echo "📊 Statistics:"
echo "  Original size:  $((TOTAL_SIZE_BEFORE / 1024)) MB"
echo "  New size:       $((TOTAL_SIZE_AFTER / 1024)) MB"
echo "  Saved:          $((SAVINGS_KB / 1024)) MB (${SAVINGS_PERCENT}%)"
echo ""
echo -e "${YELLOW}⚠️  Note: Original GIF files are kept. Delete them manually after testing.${NC}"
echo ""
echo "Next steps:"
echo "  1. Test video playback in browser"
echo "  2. Update DynamicBackground.tsx to use video"
echo "  3. Delete original GIF files if everything works"
