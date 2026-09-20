[CmdletBinding()]
param(
    [string]$Model = "gpt-image-2"
)

$ErrorActionPreference = "Stop"
$projectRoot = (Resolve-Path (Join-Path $PSScriptRoot "..\..")).Path
$python = "C:\Users\zma\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe"
$imageGen = "C:\Users\zma\.codex\skills\.system\imagegen\scripts\image_gen.py"
$pythonPackages = Join-Path $projectRoot ".codex\imagegen-python"
$output = Join-Path $projectRoot "output\imagegen\connection-test.png"

$env:OPENAI_BASE_URL = [Environment]::GetEnvironmentVariable("OPENAI_BASE_URL", "User")
$env:OPENAI_API_KEY = [Environment]::GetEnvironmentVariable("OPENAI_API_KEY", "User")
$env:PYTHONPATH = $pythonPackages

if ([string]::IsNullOrWhiteSpace($env:OPENAI_BASE_URL)) {
    throw "未找到 OPENAI_BASE_URL。请先运行 configure_imagegen.ps1。"
}
if ([string]::IsNullOrWhiteSpace($env:OPENAI_API_KEY)) {
    throw "未找到 OPENAI_API_KEY。请先运行 configure_imagegen.ps1。"
}
if (-not (Test-Path -LiteralPath $python)) {
    throw "找不到项目使用的 Python：$python"
}
if (-not (Test-Path -LiteralPath $imageGen)) {
    throw "找不到 Codex ImageGen CLI：$imageGen"
}

New-Item -ItemType Directory -Force -Path (Split-Path -Parent $output) | Out-Null
if (Test-Path -LiteralPath $output) {
    Remove-Item -LiteralPath $output -Force
}

Push-Location $projectRoot
try {
    & $python $imageGen generate `
        --model $Model `
        --prompt "A polished friendly compass badge for a children's vocabulary adventure game, centered, warm storybook 3D illustration, clean silhouette, no text, no letters, no watermark" `
        --size 1024x1024 `
        --quality low `
        --output-format png `
        --out $output

    if ($LASTEXITCODE -ne 0) {
        throw "图片接口测试失败，退出码：$LASTEXITCODE"
    }
}
finally {
    Pop-Location
}

Write-Host "图片接口测试成功：$output"
