@echo off
setlocal
set "PROJECT_ROOT=%~1"
if "%PROJECT_ROOT%"=="" set "PROJECT_ROOT=%CD%"
set "HOST_NAME=%~2"
if "%HOST_NAME%"=="" set "HOST_NAME=generic"
node "%~dp0..\packages\cli\index.mjs" install --root "%PROJECT_ROOT%" --host "%HOST_NAME%"
exit /b %errorlevel%
