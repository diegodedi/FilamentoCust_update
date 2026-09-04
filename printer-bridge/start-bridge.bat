@echo off
title Filamento Cust - Printer Bridge
echo ===================================================
echo Verificando dependencias do sistema...
echo ===================================================

where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERRO] Node.js nao encontrado!
    echo O Printer Bridge precisa do Node.js instalado no seu computador.
    echo Baixe e instale em: https://nodejs.org/
    echo.
    pause
    exit /b
)

where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERRO] NPM nao encontrado!
    echo Certifique-se de que o Node.js foi instalado corretamente com o NPM.
    echo.
    pause
    exit /b
)

cd %~dp0

if not exist "node_modules\" (
    echo [AVISO] Dependencias nao encontradas.
    echo Por favor, execute o "install-bridge.bat" primeiro.
    echo.
    pause
    exit /b
)

echo ===================================================
echo Iniciando Filamento Cust Printer Bridge...
echo Servidor Node.js escutando na porta 3001
echo Painel de saude (Health): http://localhost:3001/health
echo ===================================================

node server.js

echo.
echo O Printer Bridge foi encerrado.
pause
