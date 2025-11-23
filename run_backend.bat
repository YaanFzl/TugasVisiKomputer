 @echo off
echo Starting Backend...
uvicorn backend.main:app --reload --port 8000
pause
