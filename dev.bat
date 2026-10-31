@echo off
title Intelligence Attendance Launcher
echo ====================================================
echo Starting Intelligence Attendance System
echo ====================================================
echo.
echo [1/2] Starting Backend Server on port 5000...
start "Intelligence Attendance - Backend" cmd /k "cd backend && npm start"
echo.
echo [2/2] Starting Frontend Vite Server on port 5173...
start "Intelligence Attendance - Frontend" cmd /k "cd frontend && npm run dev"
echo.
echo Both servers have been launched in separate windows!
echo Frontend: http://localhost:5173
echo Backend:  http://localhost:5000
echo ====================================================
