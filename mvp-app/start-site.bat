@echo off
cd /d "%~dp0"
echo Starting local site at http://localhost:8787
echo Keep this window open while using the site.
node server.js
pause
