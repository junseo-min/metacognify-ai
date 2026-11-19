@echo off
chcp 65001 > nul
title MetaCognify 외부 접속 링크 생성기
echo ======================================================================
echo   [MetaCognify] 다른 사람이 접속할 수 있는 무료 공유 링크 생성기
echo ======================================================================
echo.
echo * 주의: 먼저 '서버실행.bat' 창이 켜져 있는 상태여야 합니다!
echo.
echo 잠시 기다리시면 전 세계 어디서든 접속 가능한 링크가 생성됩니다...
echo.
cd /d "%~dp0"
call npx.cmd localtunnel --port 5173
pause
