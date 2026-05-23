#!/bin/bash
cd /Users/macbook/Desktop/mrstrs/mirastros-universal/apps/backend
source venv/bin/activate
exec uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
