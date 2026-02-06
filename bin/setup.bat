@echo off
title EGAR.io Setup
echo Initializing NPM...
call npm init -y
echo.
echo Installing Express and Socket.io...
call npm install express socket.io
echo.
echo Setup finished! You can now run start_server.bat
pause