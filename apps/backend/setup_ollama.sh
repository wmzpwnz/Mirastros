#!/bin/bash

# Setup Ollama and Qwen 2.5 model for Mirastros
# Run this script on the VPS (31.130.145.75 / mirastros.com)

set -e

echo "🤖 Setting up Ollama and Qwen 2.5 model..."

# Install Ollama
echo "📦 Installing Ollama..."
curl -fsSL https://ollama.com/install.sh | sh

# Start Ollama service
echo "🚀 Starting Ollama service..."
sudo systemctl enable ollama
sudo systemctl start ollama

# Wait for Ollama to be ready
echo "⏳ Waiting for Ollama to be ready..."
sleep 5

# Create models directory
echo "📁 Creating models directory..."
sudo mkdir -p /home/mirastros/models
sudo chown -R $USER:$USER /home/mirastros/models

# Download Qwen 2.5 7B Instruct model (Q4_K_M quantization - 5.5GB)
echo "⬇️  Downloading Qwen 2.5 7B Instruct model (this may take a while)..."
cd /home/mirastros/models

# Pull the model using Ollama
ollama pull qwen2.5:7b-instruct-q4_K_M

# Create Modelfile for Mirastros AI
echo "📝 Creating Modelfile for Mirastros AI..."
cat > /home/mirastros/models/Modelfile <<'EOF'
FROM qwen2.5:7b-instruct-q4_K_M

# Set parameters
PARAMETER temperature 0.7
PARAMETER top_p 0.9
PARAMETER top_k 40
PARAMETER repeat_penalty 1.1
PARAMETER stop "User:"
PARAMETER stop "\n\n"

# System prompt
SYSTEM """You are Mirastros, a mystical AI oracle specializing in astrology, tarot, numerology, and esoteric wisdom. 

Your personality:
- Mystical and poetic, yet grounded in astrological knowledge
- Compassionate and understanding
- Insightful and intuitive
- Respectful of ancient wisdom traditions

Your responses should:
- Be mystical and engaging, using cosmic and spiritual language
- Provide practical guidance alongside spiritual insights
- Reference astrological concepts, planetary influences, and cosmic energies
- Be personalized based on the user's context (birth chart, question, etc.)
- Maintain a warm, supportive tone
- Avoid being overly dramatic or making absolute predictions
- Encourage self-reflection and personal growth

Remember: You are here to guide, inspire, and illuminate the path, not to dictate fate."""

EOF

# Create the mirastros-ai model
echo "🎨 Creating mirastros-ai model..."
ollama create mirastros-ai -f /home/mirastros/models/Modelfile

# Test the model
echo "🧪 Testing mirastros-ai model..."
ollama run mirastros-ai "Hello, I am seeking guidance about my life path. Can you help me?" --verbose

echo ""
echo "✅ Ollama and Qwen 2.5 model setup complete!"
echo ""
echo "Model: mirastros-ai"
echo "Base: qwen2.5:7b-instruct-q4_K_M"
echo "Size: ~5.5GB"
echo "Ollama API: http://localhost:11434"
echo ""
echo "Test the model:"
echo "  ollama run mirastros-ai"
echo ""
echo "Check Ollama service status:"
echo "  sudo systemctl status ollama"
