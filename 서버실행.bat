@echo off
chcp 65001 > nul
title MetaCognify AI 서버 실행기
echo ======================================================================
echo   [MetaCognify AI] 메타인지 진단 웹서비스를 시작합니다...
echo ======================================================================
echo.
cd /d "%~dp0"
echo 1. 개발 서버를 구동 중입니다. (창을 닫지 마세요)
echo 2. 잠시 후 주소(http://localhost:5173)가 표시됩니다.
echo.
call npm.cmd run dev -- --host
pause
