@echo off
echo ========================================
echo    GStep Recruiter Module - Startup
echo ========================================
echo.

echo Starting GStep project...
echo.

echo 1. Starting Backend Server...
cd backend
start "GStep Backend" cmd /k "npm run dev"
echo Backend starting in new window...
echo.

timeout /t 3 /nobreak >nul

echo 2. Starting Frontend Server...
cd ..\web
start "GStep Frontend" cmd /k "npm run dev"
echo Frontend starting in new window...
echo.

timeout /t 3 /nobreak >nul

echo 3. Opening Application...
start http://localhost:3000
echo.

echo ========================================
echo    GStep Project Started Successfully!
echo ========================================
echo.
echo Backend:  http://localhost:5000
echo Frontend: http://localhost:3000
echo Login:    test@company.com / password123
echo.
echo Press any key to close this window...
pause >nul
