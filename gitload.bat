@echo off
:: GITLOAD - A Simple Git Utility
:: Author: RedSnicker
:: GitHub: github.com/RedSnicker

:: Check if Git is installed
where git >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo Git is not installed. Please install Git to continue.
    pause
    exit /b
)

:menu
cls
echo Welcome to GITLOAD by RedSnicker
echo Select an option:
echo 1^) Commit
echo 2^) Status
echo 3^) Diff
echo 4^) Clone
echo 5^) Log
echo 6^) Exit
set /p choice="Enter your choice: "

if "%choice%"=="1" goto commit
if "%choice%"=="2" goto status
if "%choice%"=="3" goto diff
if "%choice%"=="4" goto clone
if "%choice%"=="5" goto log
if "%choice%"=="6" goto exit
echo Invalid choice. Please try again.
pause
goto menu

:commit
call :check_git_folder || goto menu
set /p "commit_message=Enter your commit message: "
git add .
git commit -m "%commit_message%"
set /p "branch=Enter the branch to push to (default: origin): "
if "%branch%"=="" set branch=origin
git push %branch%
echo Commit pushed to %branch%.
pause
goto menu

:status
call :check_git_folder || goto menu
git status
pause
goto menu

:diff
call :check_git_folder || goto menu
echo Select Diff Mode:
echo 1^) Staged
echo 2^) Not Staged
set /p diff_choice="Enter your choice: "
if "%diff_choice%"=="1" (
    git diff --cached
) else if "%diff_choice%"=="2" (
    git diff
) else (
    echo Invalid choice. Returning to main menu.
)
pause
goto menu

:clone
set /p "repo_url=Enter the repository URL to clone: "
git clone %repo_url%
pause
goto menu

:log
call :check_git_folder || goto menu
git log --oneline
pause
goto menu

:check_git_folder
git rev-parse --is-inside-work-tree >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo This is not a Git repository.
    set /p "git_folder=Please enter the path to a Git repository: "
    cd /d "%git_folder%" || (
        echo Invalid folder. Returning to main menu.
        pause
        exit /b 1
    )
)
exit /b 0

:exit
echo Exiting GITLOAD. Goodbye!
pause
exit /b
