@echo off
cd "C:\Program Files\mosquitto"
start mosquitto -c "mosquitto.conf"

:: 배치 파일이 있는 위치를 기준으로 상대 경로로 이동
cd /d "%~dp0react-mqtt-pub"
start npm run start

pause