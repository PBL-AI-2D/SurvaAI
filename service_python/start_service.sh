#!/bin/bash

echo "Starting Python service..."
cd app/src
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000

