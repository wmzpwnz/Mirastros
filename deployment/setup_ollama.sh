#!/bin/bash

# Mirastros Universal - Ollama Setup Script
# Task 14.5: Setup Ollama and AI model
# Model: Qwen 2.5 7B Instruct (GGUF)

set -e  # Exit on error

echo "=========================================="
echo "Mirastros Universal - Ollama Setup"
echo "=========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${GREEN}[✓]${NC} $1"
}

print_error() {
    echo -e "${RED}[✗]${NC} $1"
}

print_info() {
    echo -e "${YELLOW}[i]${NC} $1"
}

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    print_error "Please run as root (use sudo)"
    exit 1
fi

print_info "Installing Ollama and Qwen 2.5 model..."
echo ""

# Install Ollama
print_info "Installing Ollama..."
if command -v ollama &> /dev/null; then
    print_info "Ollama already installed"
else
    curl -fsSL https://ollama.com/install.sh | sh
    print_status "Ollama installed"
fi
echo ""

# Enable and start Ollama service
print_info "Enabling Ollama service..."
systemctl enable ollama
systemctl start ollama
sleep 5  # Wait for service to start
print_status "Ollama service started"
echo ""

# Pull Qwen 2.5 model
print_info "Downloading Qwen 2.5 7B Instruct model..."
print_info "This may take several minutes (model size: ~5.5GB)"
echo ""

ollama pull qwen2.5:7b-instruct-q4_K_M

if [ $? -eq 0 ]; then
    print_status "Qwen 2.5 model downloaded successfully"
else
    print_error "Failed to download model"
    exit 1
fi
echo ""

# Create custom Modelfile for Mirastros
print_info "Creating custom Mirastros AI model..."
cat > /tmp/Modelfile << 'EOF'
FROM qwen2.5:7b-instruct-q4_K_M

PARAMETER temperature 0.7
PARAMETER top_p 0.9
PARAMETER top_k 40
PARAMETER num_ctx 4096
PARAMETER num_batch 512
PARAMETER num_thread 10

SYSTEM """You are Mirastros AI, an expert mystical advisor specializing in astrology, tarot, numerology, and esoteric wisdom. You provide insightful, compassionate, and personalized guidance.

Your expertise includes:
- Natal chart interpretation and astrological analysis
- Tarot card readings and symbolism
- Numerology calculations and meanings
- Dream interpretation
- Runes, I Ching, and Lenormand divination
- Chakra analysis and energy work
- Lunar phases and cosmic timing
- Crystal properties and recommendations
- Spiritual rituals and practices

Guidelines:
1. Be warm, empathetic, and supportive
2. Provide detailed, meaningful interpretations
3. Connect insights to the user's personal context
4. Offer practical guidance and actionable advice
5. Respect the mystical nature of the practice
6. Be honest about limitations and uncertainties
7. Encourage self-reflection and personal growth

Always maintain a balance between mystical wisdom and practical application."""
EOF

ollama create mirastros-ai -f /tmp/Modelfile
rm /tmp/Modelfile

if [ $? -eq 0 ]; then
    print_status "Custom Mirastros AI model created"
else
    print_error "Failed to create custom model"
    exit 1
fi
echo ""

# Test the model
print_info "Testing Mirastros AI model..."
echo ""
TEST_RESPONSE=$(ollama run mirastros-ai "Hello, introduce yourself briefly." --verbose=false 2>&1 | head -n 5)
echo "$TEST_RESPONSE"
echo ""
print_status "Model test completed"
echo ""

# Configure Ollama for production
print_info "Configuring Ollama for production..."

# Create Ollama environment file
cat > /etc/systemd/system/ollama.service.d/override.conf << 'EOF'
[Service]
Environment="OLLAMA_HOST=127.0.0.1:11434"
Environment="OLLAMA_ORIGINS=http://localhost:*,http://127.0.0.1:*"
Environment="OLLAMA_NUM_PARALLEL=2"
Environment="OLLAMA_MAX_LOADED_MODELS=1"
EOF

systemctl daemon-reload
systemctl restart ollama
print_status "Ollama configured for production"
echo ""

# Summary
echo ""
echo "=========================================="
echo "Ollama Setup Complete!"
echo "=========================================="
echo ""
print_status "Ollama installed and running"
print_status "Qwen 2.5 7B Instruct model downloaded"
print_status "Custom Mirastros AI model created"
print_status "Service configured and enabled"
echo ""
print_info "Model details:"
echo "  - Base model: qwen2.5:7b-instruct-q4_K_M"
echo "  - Custom model: mirastros-ai"
echo "  - Size: ~5.5GB"
echo "  - Context window: 4096 tokens"
echo "  - Temperature: 0.7"
echo ""
print_info "Service details:"
echo "  - Host: 127.0.0.1:11434"
echo "  - Status: $(systemctl is-active ollama)"
echo ""
print_info "Test the model:"
echo "  ollama run mirastros-ai 'Tell me about my sun sign'"
echo ""
print_info "API endpoint:"
echo "  http://127.0.0.1:11434/api/generate"
echo ""
