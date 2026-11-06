@echo off
rem Instala el panel Ortotipografia para Illustrator y Photoshop en Windows.
chcp 65001 >nul
set "ORIGEN=%~dp0com.fmanuel.ortotipografia"
set "DESTINO=%APPDATA%\Adobe\CEP\extensions\com.fmanuel.ortotipografia"

if not exist "%ORIGEN%" (
  echo No encuentro la carpeta com.fmanuel.ortotipografia junto a este instalador.
  pause
  exit /b 1
)

if exist "%DESTINO%" rmdir /s /q "%DESTINO%"
xcopy "%ORIGEN%" "%DESTINO%\" /e /i /q /y >nul

rem Permite cargar paneles no firmados (CEP de Illustrator/Photoshop 2020 en adelante).
for %%v in (9 10 11 12 13) do reg add "HKCU\Software\Adobe\CSXS.%%v" /v PlayerDebugMode /t REG_SZ /d 1 /f >nul

echo.
echo Listo. Cierra y vuelve a abrir Illustrator o Photoshop.
echo Luego abre el panel en: Ventana ^> Extensiones ^> Ortotipografia
echo.
pause
