[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)]
    [string]$InputFile,

    [Parameter(Mandatory = $true)]
    [string]$OutputDir,

    [ValidateRange(1, 10)]
    [int]$Concurrency = 3,

    [switch]$Force
)

$ErrorActionPreference = "Stop"
$projectRoot = (Resolve-Path (Join-Path $PSScriptRoot "..\..")).Path
$python = "C:\Users\zma\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe"
$imageGen = "C:\Users\zma\.codex\skills\.system\imagegen\scripts\image_gen.py"
$pythonPackages = Join-Path $projectRoot ".codex\imagegen-python"

$resolvedInput = (Resolve-Path -LiteralPath $InputFile).Path
$resolvedOutput = if ([IO.Path]::IsPathRooted($OutputDir)) {
    $OutputDir
} else {
    Join-Path $projectRoot $OutputDir
}

$env:OPENAI_BASE_URL = [Environment]::GetEnvironmentVariable("OPENAI_BASE_URL", "User")
$env:OPENAI_API_KEY = [Environment]::GetEnvironmentVariable("OPENAI_API_KEY", "User")
$env:PYTHONPATH = $pythonPackages

if ([string]::IsNullOrWhiteSpace($env:OPENAI_BASE_URL) -or [string]::IsNullOrWhiteSpace($env:OPENAI_API_KEY)) {
    throw "图片生成环境变量未配置。请先运行 configure_imagegen.ps1。"
}

New-Item -ItemType Directory -Force -Path $resolvedOutput | Out-Null
$arguments = @(
    $imageGen,
    "generate-batch",
    "--input", $resolvedInput,
    "--out-dir", $resolvedOutput,
    "--concurrency", $Concurrency
)
if ($Force) {
    $arguments += "--force"
}

Push-Location $projectRoot
try {
    & $python @arguments
    if ($LASTEXITCODE -ne 0) {
        throw "批量生图失败，退出码：$LASTEXITCODE"
    }
}
finally {
    Pop-Location
}

Write-Host "批量生图完成：$resolvedOutput"
