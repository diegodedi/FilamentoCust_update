@echo off
title Filamento Cust - Instalar Bridge
echo ===================================================
echo Instalando dependencias do Printer Bridge...
echo ===================================================

where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERRO] Node.js nao encontrado! Instale de https://nodejs.org/
    pause
    exit /b
)

cd %~dp0
call npm install

echo ===================================================
echo Instalacao concluida!
echo Agora voce pode executar o "start-bridge.bat".
echo ===================================================
pause
