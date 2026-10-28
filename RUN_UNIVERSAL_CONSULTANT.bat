@echo off
chcp 65001 >nul
title 🌐 Universal Sales Consultant AI (PR #24 Lab)
cd /d "d:\codee\vismart-ai-closer\experiments\universal_sales_consultant"

echo ================================================================
echo    UNIVERSAL SALES CONSULTANT AI - MULTI-BUSINESS RAG LAB
echo    (Based on GitHub PR #24: Mohit12836/vismart-ai-closer)
echo ================================================================
echo.

if not defined GEMINI_API_KEY (
    if exist "C:\Users\hp\.gemini\antigravity\free_ai_gateway\.env" (
        for /f "usebackq tokens=1,* delims==" %%i in ("C:\Users\hp\.gemini\antigravity\free_ai_gateway\.env") do (
            if "%%i"=="GEMINI_API_KEY" set GEMINI_API_KEY=%%j
        )
    )
)

echo [1/2] Seeding Tenant Knowledge Documents...
python -m sales_consultant seed-demo

echo.
echo [2/2] Launching Local Visual Simulator at http://127.0.0.1:8765 ...
echo.
echo 👉 Open http://127.0.0.1:8765 in your browser to chat with the AI!
echo 👉 You can switch businesses (Vismart, Cafe, or add new business) seamlessly!
echo.
python -m sales_consultant serve
pause
