@echo off
title Cendric AI Finance Assistant
cd /d "%~dp0backend"

echo ===================================================
echo Checking port 5050...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":5050" ^| findstr "LISTENING"') do (
    echo Port 5050 was in use by PID %%a. Closing previous instance...
    taskkill /F /PID %%a >nul 2>&1
)

echo Starting Cendric AI Finance Assistant...
echo Local App URL: http://localhost:5050
echo ===================================================
node server.js
pause
