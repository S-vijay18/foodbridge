@echo off
title FoodBridge - Push to GitHub
echo ========================================================
echo   Pushing FoodBridge to:
echo   https://github.com/S-vijay18/foodbridge.git
echo ========================================================
echo.
echo Executing git push -u origin main ...
git push -u origin main
echo.
if %errorlevel% equ 0 (
    echo ========================================================
    echo   [SUCCESS] All files pushed successfully to GitHub!
    echo   Repo: https://github.com/S-vijay18/foodbridge
    echo ========================================================
) else (
    echo ========================================================
    echo   [NOTICE] If GitHub asked you to sign in, please complete
    echo   the browser sign-in and run this script again.
    echo ========================================================
)
echo.
pause
