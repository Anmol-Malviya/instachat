@echo off
echo =========================================
echo       Starting InstaChat Services
echo =========================================
echo.

echo [1/2] Starting Backend Server...
start "InstaChat Backend" cmd /k "cd server && title InstaChat Backend && color 0A && npm run dev"

echo [2/2] Starting Frontend Next.js Server...
start "InstaChat Frontend" cmd /k "cd instachat && title InstaChat Frontend && color 0B && npm run dev"

echo.
echo Both services have been launched in separate windows!
echo =========================================
pause
