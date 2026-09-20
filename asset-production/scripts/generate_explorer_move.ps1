[CmdletBinding()]
param(
    [string]$Model = "gpt-image-2",
    [ValidateSet("low", "medium", "high", "auto")]
    [string]$Quality = "low"
)

$ErrorActionPreference = "Stop"
$projectRoot = (Resolve-Path (Join-Path $PSScriptRoot "..\..")).Path
$python = "C:\Users\zma\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe"
$imageGen = "C:\Users\zma\.codex\skills\.system\imagegen\scripts\image_gen.py"
$pythonPackages = Join-Path $projectRoot ".codex\imagegen-python"
$referenceImage = Join-Path $projectRoot "assets\art\characters\explorer.png"
$rawDir = Join-Path $projectRoot "tmp\imagegen\explorer-move-raw"

$env:OPENAI_BASE_URL = [Environment]::GetEnvironmentVariable("OPENAI_BASE_URL", "User")
$env:OPENAI_API_KEY = [Environment]::GetEnvironmentVariable("OPENAI_API_KEY", "User")
$env:PYTHONPATH = $pythonPackages

if ([string]::IsNullOrWhiteSpace($env:OPENAI_BASE_URL) -or [string]::IsNullOrWhiteSpace($env:OPENAI_API_KEY)) {
    throw "图片生成环境变量未配置。"
}

$poses = @(
    "Frame 1 of an eight-frame seamless in-place walk cycle: left leg reaches forward with the heel just touching, right leg extends behind, right arm swings forward and left arm swings back. Mid-height body position.",
    "Frame 2 of an eight-frame seamless in-place walk cycle: weight settles onto the flat left foot, body is slightly lower, right heel lifts behind, arms continue their natural opposite swing.",
    "Frame 3 of an eight-frame seamless in-place walk cycle: right leg passes directly beneath the torso while the left leg supports the body, arms pass near the middle of their swing. Neutral body height.",
    "Frame 4 of an eight-frame seamless in-place walk cycle: right knee moves forward while the left foot pushes off behind, body is slightly higher, left arm moves forward and right arm moves back.",
    "Frame 5 of an eight-frame seamless in-place walk cycle: right leg reaches forward with the heel just touching, left leg extends behind, left arm swings forward and right arm swings back. Mid-height body position.",
    "Frame 6 of an eight-frame seamless in-place walk cycle: weight settles onto the flat right foot, body is slightly lower, left heel lifts behind, arms continue their natural opposite swing.",
    "Frame 7 of an eight-frame seamless in-place walk cycle: left leg passes directly beneath the torso while the right leg supports the body, arms pass near the middle of their swing. Neutral body height.",
    "Frame 8 of an eight-frame seamless in-place walk cycle: left knee moves forward while the right foot pushes off behind, body is slightly higher, right arm moves forward and left arm moves back. This pose must flow naturally back into Frame 1."
)

$commonPrompt = @"
Use Image 1 as the exact and only character identity reference. Preserve the same child explorer's face, large dark-blue eyes, small smile, head and body proportions, teal explorer hat with cream badge, blue jacket, orange backpack, navy shorts and boots, colors, materials, and soft matte 3D toy illustration style. Keep the same front three-quarter view facing slightly right. This is an in-place walk animation: the character must not travel across the canvas. Keep the full body centered at the same scale, with both feet visible and generous empty space around the figure. Keep the foot contact anchor at horizontal 50 percent and vertical 85 percent. Use a fixed square camera and consistent soft upper-left lighting.

FRAME_POSE

Use a perfectly uniform flat solid chroma background color #FF00FF covering every background pixel. No floor, no platform, no ground contact shadow, no cast shadow, no scenery, no props, no particles, no text, no numbers, no border, no watermark, no motion blur. Do not add or remove clothing, backpack parts, fingers, limbs, facial features, or accessories. Do not redesign the character.
"@

New-Item -ItemType Directory -Force -Path $rawDir | Out-Null
Push-Location $projectRoot
try {
    for ($index = 0; $index -lt $poses.Count; $index++) {
        $frameName = "frame-{0:D3}.png" -f $index
        $outputPath = Join-Path $rawDir $frameName
        $prompt = $commonPrompt.Replace("FRAME_POSE", $poses[$index])
        Write-Host "生成 $frameName ($($index + 1)/$($poses.Count))..."

        & $python $imageGen edit `
            --model $Model `
            --image $referenceImage `
            --prompt $prompt `
            --size 1024x1024 `
            --quality $Quality `
            --output-format png `
            --out $outputPath `
            --force

        if ($LASTEXITCODE -ne 0) {
            throw "生成 $frameName 失败，退出码：$LASTEXITCODE"
        }
    }
}
finally {
    Pop-Location
}

Write-Host "8 张行走原始帧生成完成：$rawDir"
