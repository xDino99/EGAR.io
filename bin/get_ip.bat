@echo off
title Obtener IPv4 para EGAR.io
color 0a
echo ======================================================
echo           DIRECCION IP PARA TU LAN PARTY
echo ======================================================
echo.
echo Tu direccion IPv4 local es:
echo.
ipconfig | findstr /i "IPv4"
echo.
echo ======================================================
echo Comparte esa IP con tus amigos: http://[TU_IP]:3000
echo ======================================================
echo.
pause