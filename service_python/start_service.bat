@echo off
echo Starting Python service...
set PYTHONPATH=%CD%
python -m uvicorn app.src.main:app --reload --host 0.0.0.0 --port 8000

