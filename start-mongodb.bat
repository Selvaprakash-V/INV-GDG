@echo off
REM Starts a local single-node MongoDB *replica set* (required for transactions).
REM Use MONGODB_URI=mongodb://127.0.0.1:27017/trackit?replicaSet=rs0

where mongod >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
  echo MongoDB is not installed or not in PATH.
  echo Install MongoDB Community Edition: https://www.mongodb.com/try/download/community
  exit /b 1
)

if not exist "%CD%\data\db" mkdir "%CD%\data\db"
echo Starting mongod (replica set rs0) with data in %CD%\data\db ...
start "mongod" mongod --dbpath "%CD%\data\db" --replSet rs0 --bind_ip 127.0.0.1 --port 27017

echo Waiting for mongod, then initiating the replica set (safe to re-run)...
timeout /t 5 /nobreak >nul
mongosh --quiet --eval "try { rs.status().ok } catch (e) { rs.initiate({_id:'rs0',members:[{_id:0,host:'127.0.0.1:27017'}]}).ok }"
