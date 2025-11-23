#!/bin/bash

# Download Qwen 2.5 7B Instruct GGUF model
# Run as: sudo -u mirastros bash download_model.sh

set -e

MODEL_DIR="/home/mirastros/models"
MODEL_URL="https://huggingface.co/Qwen/Qwen2.5-7B-Instruct-GGUF/resolve/main/qwen2.5-7b-instruct-q4_k_m.gguf"
MODEL_FILE="qwen2.5-7b-instruct.gguf"

echo "📥 Downloading Qwen 2.5 7B Instruct model..."
echo "This may take a while (model is ~4.4GB)..."

cd $MODEL_DIR
wget -O $MODEL_FILE $MODEL_URL

echo "✅ Model downloaded to $MODEL_DIR/$MODEL_FILE"
echo "Update your .env file with: MODEL_PATH=$MODEL_DIR/$MODEL_FILE"
