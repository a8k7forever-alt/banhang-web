@echo off
echo ================================
echo    BAN HANG WEB - START SERVER
echo ================================
echo.
echo Starting Next.js development server...
echo Opening browser in 3 seconds...
timeout /t 3 /nobreak >nul
start http://localhost:3000
echo.
echo Server will start at: http://localhost:3000
echo Press Ctrl+C to stop the server
echo.
npm run dev
pause
