@echo off
echo Starting OkeanChat Application...
echo.

echo Restoring NuGet packages...
dotnet restore

echo.
echo Building application...
dotnet build

echo.
echo Starting application...
echo Application will be available at:
echo - HTTPS: https://localhost:5001
echo - HTTP:  http://localhost:5000
echo.
echo Press Ctrl+C to stop the application
echo.

dotnet run
