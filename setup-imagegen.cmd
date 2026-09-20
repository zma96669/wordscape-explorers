@echo off
powershell.exe -NoLogo -NoProfile -STA -ExecutionPolicy Bypass -File "%~dp0asset-production\scripts\configure_imagegen.ps1"
