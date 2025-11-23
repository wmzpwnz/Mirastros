#!/bin/bash

# Streaming Test Suite Runner
# Runs all streaming tests and generates comprehensive reports

set -e

echo "=================================="
echo "🚀 STREAMING TEST SUITE"
echo "=================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if backend is running
echo "🔍 Checking if backend is running..."
if curl -s http://localhost:8000/api/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Backend is running${NC}"
else
    echo -e "${RED}❌ Backend is not running${NC}"
    echo "Please start the backend first:"
    echo "  cd apps/backend"
    echo "  uvicorn app.main:app --reload"
    exit 1
fi

# Check if Ollama is running
echo "🔍 Checking if Ollama is running..."
if curl -s http://localhost:11434/api/tags > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Ollama is running${NC}"
else
    echo -e "${RED}❌ Ollama is not running${NC}"
    echo "Please start Ollama first:"
    echo "  sudo systemctl start ollama"
    exit 1
fi

echo ""
echo "=================================="
echo "📋 Test Suite Menu"
echo "=================================="
echo "1. Comprehensive Service Tests"
echo "2. Load Testing"
echo "3. Nginx Configuration Verification"
echo "4. Latency Optimization"
echo "5. Run All Tests"
echo "=================================="
echo ""

read -p "Select test to run (1-5): " choice

case $choice in
    1)
        echo ""
        echo "🧪 Running Comprehensive Service Tests..."
        python3 test_streaming_comprehensive.py
        ;;
    2)
        echo ""
        echo "🔥 Running Load Tests..."
        python3 test_streaming_load.py
        ;;
    3)
        echo ""
        echo "🔍 Verifying Nginx Configuration..."
        python3 verify_nginx_streaming.py
        ;;
    4)
        echo ""
        echo "⚡ Running Latency Optimization..."
        python3 optimize_streaming_latency.py
        ;;
    5)
        echo ""
        echo "🚀 Running All Tests..."
        echo ""
        
        echo "1/4: Comprehensive Service Tests"
        python3 test_streaming_comprehensive.py
        echo ""
        
        echo "2/4: Load Tests"
        python3 test_streaming_load.py
        echo ""
        
        echo "3/4: Nginx Configuration Verification"
        python3 verify_nginx_streaming.py
        echo ""
        
        echo "4/4: Latency Optimization"
        python3 optimize_streaming_latency.py
        echo ""
        
        echo -e "${GREEN}✅ All tests complete!${NC}"
        echo ""
        echo "📊 Reports generated:"
        ls -lh streaming_test_report_*.json load_test_report_*.json 2>/dev/null || echo "No reports found"
        ;;
    *)
        echo -e "${RED}Invalid choice${NC}"
        exit 1
        ;;
esac

echo ""
echo "=================================="
echo "✅ Test Suite Complete"
echo "=================================="
