@echo off
cd /d "%~dp0"
echo Starting Bookzwang local server...
echo Open your browser at: http://localhost:8080
echo Press Ctrl+C to stop.
echo.
"%LOCALAPPDATA%\Programs\Python\Python313\python.exe" -m http.server 8080
pause
