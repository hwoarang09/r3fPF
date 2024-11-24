@echo off

:: 1. Mosquitto 실행
cd "C:\Program Files\mosquitto"
start mosquitto -c "mosquitto.conf"

:: 2. 현재 배치 파일 경로에서 npm run dev 실행
cd /d "%~dp0r3fApp"
echo Starting npm run dev in the r3fApp directory...
start npm run dev

:: 3. testPub 폴더로 이동 후 npm run dev 실행
cd /d "%~dp0testCodeApp"
if exist "package.json" (
    echo Starting npm run dev in testCodeApp directory...
    start npm run dev
) else (
    echo testCodeApp folder or package.json not found. Skipping...
)

pause
