@echo off
echo Starting Bookzwang local server...
echo Open your browser at: http://localhost:8080
echo Press Ctrl+C to stop.
echo.
python -m http.server 8080
pause
