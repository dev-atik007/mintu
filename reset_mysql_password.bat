@echo off
echo ===================================================
echo Resetting MySQL root password to: admin
echo ===================================================
echo.

:: 1. Stop MySQL80 service
echo Stopping MySQL80 service...
net stop MySQL80
if %errorlevel% neq 0 (
    echo.
    echo ERROR: Could not stop MySQL80 service.
    echo Make sure you ran this batch file by right-clicking it and selecting "Run as administrator".
    echo.
    pause
    exit /b
)

:: 2. Create the init SQL file
echo Creating temporary init file...
set INIT_FILE=%TEMP%\mysql-init.txt
echo ALTER USER 'root'@'localhost' IDENTIFIED BY 'admin'; > "%INIT_FILE%"

:: 3. Start mysqld with init-file in a separate background process
echo Resetting password (this will take about 10 seconds)...
start "MySQLReset" /B "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysqld.exe" --defaults-file="C:\ProgramData\MySQL\MySQL Server 8.0\my.ini" --init-file="%INIT_FILE%" --console

:: 4. Wait for 10 seconds
timeout /t 10 /nobreak > nul

:: 5. Kill the mysqld process
echo Stopping temporary MySQL server...
taskkill /F /IM mysqld.exe > nul

:: 6. Clean up the init file
del "%INIT_FILE%"

:: 7. Start MySQL80 service back up
echo Starting MySQL80 service back up...
net start MySQL80

echo.
echo ===================================================
echo SUCCESS: MySQL root password has been reset to: admin
echo You can now login to phpMyAdmin with:
echo Username: root
echo Password: admin
echo ===================================================
echo.
pause
