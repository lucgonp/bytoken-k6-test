@echo off
echo ========================================
echo    BYTOKEN K6 PERFORMANCE TESTS
echo ========================================
echo.
echo [1/1] 🔍 SMOKE TEST - Verificando login...
k6 run tests/smoke-test.js
echo.
echo ========================================
echo   Testes finalizados!
echo ========================================
pause
