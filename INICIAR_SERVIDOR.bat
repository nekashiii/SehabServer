@echo off
title SEHAB - Servidor Unificado
color 0A
echo ============================================================
echo   SEHAB - Servidor Unificado
echo   Dashboard Fiscalizacao + Dashboard PROG
echo ============================================================
echo.

cd /d "%~dp0"

python --version >nul 2>&1
if errorlevel 1 (
    echo [ERRO] Python nao encontrado. Instale o Python 3.8+
    pause
    exit /b 1
)

pip show flask >nul 2>&1
if errorlevel 1 (
    echo Instalando dependencias...
    pip install -r requirements.txt
)

echo Iniciando servidor...
echo Acesse: http://localhost:5000
echo.
python app.py
pause
