@echo off
CLS
echo ======================================================
echo   ATUALIZADOR AUTOMATICO - SITE EDNEY (ACOES)
echo ======================================================
echo.

:: 1. Entrar na pasta do código fonte
echo [1/4] Entrando no diretorio das acoes...
cd /d "%~dp0acoes_src"

:: 2. Atualizar dados das acoes via Yahoo Finance
echo [2/4] Buscando precos e indicadores atualizados...
call npm run update-stocks
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ERROR: Falha ao atualizar dados das acoes.
    pause
    exit /b %ERRORLEVEL%
)

:: 3. Gerar o Build de Producao
echo.
echo [3/4] Gerando build de producao...
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ERROR: Falha ao gerar o build.
    pause
    exit /b %ERRORLEVEL%
)

:: 4. Enviar para o GitHub
echo.
echo [4/4] Enviando alteracoes para o GitHub...
cd /d "%~dp0"
git add .
git commit -m "atualizacao automatica de mercado - %date% %time%"
git push origin master

echo.
echo ======================================================
echo   SUCESSO! Seu site foi atualizado e enviado.
echo ======================================================
echo.
pause
