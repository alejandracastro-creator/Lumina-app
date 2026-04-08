@echo off
echo.
echo  ========================================
echo       INICIANDO LUMINA - SDK 54
echo  ========================================
echo.
echo 1. Limpiando cache de Metro y Expo...
rmdir /s /q .expo
rmdir /s /q node_modules\.cache
echo 2. Verificando dependencias...
call npm.cmd install --legacy-peer-deps
echo 3. Iniciando Expo con limpieza TOTAL de cache...
npx.cmd expo start --clear
pause
