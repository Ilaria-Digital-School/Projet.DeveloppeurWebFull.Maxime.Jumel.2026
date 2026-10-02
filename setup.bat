@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion
title Souflydev - GitHub Deploy Tool

git --version >nul 2>&1
if errorlevel 1 (
    echo.
    echo  [ERREUR] Git n est pas installe.
    echo  Telechargez-le sur : https://git-scm.com/download/win
    echo.
    pause
    exit /b 1
)

:MENU
cls
echo.
echo  ======================================================
echo       SOUFLYDEV ^|^| GitHub Deploy Tool
echo  ======================================================
echo.

for /f "delims=" %%b in ('git rev-parse --abbrev-ref HEAD 2^>nul') do set "BRANCH=%%b"

if not defined BRANCH (
    echo  [!] Ce dossier n est pas un depot Git initialise.
    echo.
    pause
    exit /b 1
)

echo   Branche active : %BRANCH%
echo.
echo   [1] Voir le statut Git
echo   [2] Commit + Push rapide
echo   [3] Pusher sur une autre branche
echo   [4] Creer une nouvelle branche
echo   [5] Voir les derniers commits
echo   [6] Pull - recuperer les mises a jour
echo   [0] Quitter
echo.
echo  ======================================================
echo.
set "CHOICE="
set /p CHOICE=  Votre choix : 

if "!CHOICE!"=="1" goto STATUS
if "!CHOICE!"=="2" goto QUICK_PUSH
if "!CHOICE!"=="3" goto CHOOSE_BRANCH
if "!CHOICE!"=="4" goto NEW_BRANCH
if "!CHOICE!"=="5" goto LOG
if "!CHOICE!"=="6" goto PULL
if "!CHOICE!"=="0" goto END

echo  Choix invalide. Reessayez.
timeout /t 2 >nul
goto MENU

:STATUS
cls
echo.
echo  === Git Status ===
echo.
git status
echo.
pause
goto MENU

:QUICK_PUSH
cls
echo.
echo  === Commit + Push rapide ===
echo.
git add -A
echo  [OK] git add -A effectue
echo.
set "MSG="
set /p MSG=  Message de commit : 
if "!MSG!"=="" set "MSG=update: mise a jour"

git commit -m "!MSG!"
if errorlevel 1 (
    echo.
    echo  [!] Rien a commiter.
    pause
    goto MENU
)

echo.
git push origin %BRANCH%
if errorlevel 1 (
    echo.
    echo  [ERREUR] Push echoue. Verifiez vos droits GitHub.
) else (
    echo.
    echo  [OK] Code pousse sur GitHub : origin/%BRANCH%
)
echo.
pause
goto MENU

:CHOOSE_BRANCH
cls
echo.
echo  === Branches disponibles ===
echo.
git branch -a
echo.
set "TB="
set /p TB=  Nom de la branche cible : 
if "!TB!"=="" (
    echo  [!] Nom vide. Annulation.
    pause
    goto MENU
)

git checkout !TB!
if errorlevel 1 (
    echo  [ERREUR] Branche introuvable.
    pause
    goto MENU
)

echo.
git add -A
set "MSG2="
set /p MSG2=  Message de commit : 
if "!MSG2!"=="" set "MSG2=update: mise a jour"

git commit -m "!MSG2!"
git push origin !TB!

if errorlevel 1 (
    echo  [ERREUR] Push echoue.
) else (
    echo  [OK] Pousse sur origin/!TB!
)
echo.
pause
goto MENU

:NEW_BRANCH
cls
echo.
echo  === Nouvelle branche ===
echo.
set "NB="
set /p NB=  Nom de la nouvelle branche : 
if "!NB!"=="" (
    echo  [!] Nom vide. Annulation.
    pause
    goto MENU
)

git checkout -b !NB!
if errorlevel 1 (
    echo  [ERREUR] Impossible de creer la branche.
    pause
    goto MENU
)

echo  [OK] Branche !NB! creee.
echo.
set "PN="
set /p PN=  Pusher sur GitHub maintenant ? (o/n) : 
if /i "!PN!"=="o" (
    git push -u origin !NB!
    echo  [OK] Branche poussee.
)
echo.
pause
goto MENU

:LOG
cls
echo.
echo  === 10 derniers commits ===
echo.
git log --oneline --graph --decorate -10
echo.
pause
goto MENU

:PULL
cls
echo.
echo  === Pull origin/%BRANCH% ===
echo.
git pull origin %BRANCH%
if errorlevel 1 (
    echo  [ERREUR] Pull echoue.
) else (
    echo  [OK] Mise a jour recuperee.
)
echo.
pause
goto MENU

:END
echo.
echo  A bientot !
echo.
timeout /t 2 >nul
exit /b 0
