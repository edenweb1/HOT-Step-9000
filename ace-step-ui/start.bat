@echo off
REM ACE-Step UI Startup Script for Windows
setlocal

REM Read frontend port from .env
set "VITE_PORT=3000"
if exist ".env" (
    for /f "tokens=2 delims==" %%a in ('findstr /b "VITE_PORT" ".env"') do set "VITE_PORT=%%a"
)

echo ==================================
echo   ACE-Step UI (Windows)
echo ==================================
echo.

REM Check if node_modules exists
if not exist "node_modules" (
    echo Error: Dependencies not installed!
    echo Please run setup.bat first.
    pause
    exit /b 1
)

if not exist "server\node_modules" (
    echo Error: Server dependencies not installed!
    echo Please run setup.bat first.
    pause
    exit /b 1
)

REM Get local IP for LAN access
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4"') do (
    for /f "tokens=1" %%b in ("%%a") do (
        set LOCAL_IP=%%b
    )
)

REM ============= ACE-Step Configuration | ACE-Step 配置 =============
REM Set ACE-Step installation path (parent directory)
set ACESTEP_PATH=%~dp0..
REM Set Python executable path (virtual environment)
set PYTHON_PATH=%~dp0..\.venv\Scripts\python.exe

echo ACE-Step Path: %ACESTEP_PATH%
echo Python Path: %PYTHON_PATH%
echo.

echo Starting ACE-Step UI...
echo.
echo Make sure ACE-Step API is running:
echo   cd path\to\ACE-Step
echo   uv run acestep-api --port 8001
echo.
echo ==================================
echo.

REM Start backend in new window
echo Starting backend server...
start /min "ACE-Step UI Backend" cmd /c "cd server && npm run dev"

REM Wait for backend to start
echo Waiting for backend to start...
timeout /t 3 /nobreak >nul

REM Start frontend in new window
echo Starting frontend...
start /min "ACE-Step UI Frontend" cmd /c "npm run dev"

REM Wait a moment
timeout /t 2 /nobreak >nul

echo.
echo ==================================
echo   ACE-Step UI Running!
echo ==================================
echo.
echo   Frontend: http://localhost:%VITE_PORT%
echo   Backend:  http://localhost:3001
echo.
if defined LOCAL_IP (
    echo   LAN Access: http://%LOCAL_IP%:%VITE_PORT%
    echo.
)
echo   Close the terminal windows to stop.
echo.
echo ==================================
echo.
echo Opening browser...
timeout /t 2 /nobreak >nul
if not defined ACESTEP_NO_BROWSER (
    start http://localhost:%VITE_PORT%
) else (
    echo   Skipped — using loading screen instead.
)


