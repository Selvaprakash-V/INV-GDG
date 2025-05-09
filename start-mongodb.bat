@echo off
echo Starting MongoDB server...
echo Data directory: %CD%\data\db

REM Check if MongoDB is installed
where mongod >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo MongoDB is not installed or not in PATH.
    echo Please install MongoDB Community Edition from https://www.mongodb.com/try/download/community
    exit /b 1
)

REM Start MongoDB server
mongod --dbpath %CD%\data\db

echo MongoDB server started.
