[CmdletBinding()]
param(
    [string]$Model = "gpt-image-2",
    [ValidateSet("low", "medium", "high", "auto")]
    [string]$Quality = "medium"
)

$ErrorActionPreference = "Stop"
$projectRoot = (Resolve-Path (Join-Path $PSScriptRoot "..\..")).Path
$python = "C:\Users\zma\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe"
$imageGen = "C:\Users\zma\.codex\skills\.system\imagegen\scripts\image_gen.py"
$pythonPackages = Join-Path $projectRoot ".codex\imagegen-python"
$identityReference = Join-Path $projectRoot "assets\art\characters\explorer.png"
$outputDir = Join-Path $projectRoot "tmp\imagegen\explorer-move-chained"

$env:OPENAI_BASE_URL = [Environment]::GetEnvironmentVariable("OPENAI_BASE_URL", "User")
$env:OPENAI_API_KEY = [Environment]::GetEnvironmentVariable("OPENAI_API_KEY", "User")
$env:PYTHONPATH = $pythonPackages

if ([string]::IsNullOrWhiteSpace($env:OPENAI_BASE_URL) -or [string]::IsNullOrWhiteSpace($env:OPENAI_API_KEY)) {
    throw "图片生成环境变量未配置。"
}

$poses = @(
    @{
        Phase = "LEFT CONTACT";
        Pose = "The character's LEFT heel (appearing on the viewer's RIGHT) reaches forward and touches down. The character's RIGHT leg extends behind. The RIGHT arm swings forward and the LEFT arm swings back. Torso is upright with a tiny forward intent. Head and shoulders are at neutral height."
    },
    @{
        Phase = "LEFT DOWN";
        Pose = "Advance only a small amount from Image 1. Weight settles onto the character's LEFT foot. The left sole becomes flatter; the right heel lifts behind. The whole body, including head, shoulders, torso, hips, and backpack, moves downward by a small visible amount. Arms continue their opposite swing."
    },
    @{
        Phase = "LEFT PASS";
        Pose = "Advance only a small amount from Image 1. The character's RIGHT leg passes beneath the torso while the LEFT leg supports the weight. The right knee bends naturally. Arms pass near their middle positions. Head and torso return toward neutral height and shift over the planted left foot."
    },
    @{
        Phase = "LEFT UP";
        Pose = "Advance only a small amount from Image 1. The LEFT toe pushes off behind while the RIGHT knee travels forward. The whole body, including head and shoulders, rises slightly to the highest point. The LEFT arm comes forward and the RIGHT arm moves back."
    },
    @{
        Phase = "RIGHT CONTACT";
        Pose = "Advance only a small amount from Image 1. The character's RIGHT heel (appearing on the viewer's LEFT) reaches forward and touches down. The LEFT leg extends behind. The LEFT arm swings forward and the RIGHT arm swings back. Head and shoulders return to neutral height. This must clearly be the opposite-leg counterpart of the first frame."
    },
    @{
        Phase = "RIGHT DOWN";
        Pose = "Advance only a small amount from Image 1. Weight settles onto the character's RIGHT foot. The right sole becomes flatter; the left heel lifts behind. The whole body, including head, shoulders, torso, hips, and backpack, moves downward by a small visible amount. Arms continue their opposite swing."
    },
    @{
        Phase = "RIGHT PASS";
        Pose = "Advance only a small amount from Image 1. The character's LEFT leg passes beneath the torso while the RIGHT leg supports the weight. The left knee bends naturally. Arms pass near their middle positions. Head and torso return toward neutral height and shift over the planted right foot. Begin approaching the first frame without copying it yet."
    },
    @{
        Phase = "RIGHT UP";
        Pose = "Advance only a small amount from Image 1 and create the final transition pose. The RIGHT toe pushes off behind while the LEFT knee travels forward. The whole body, including head and shoulders, rises slightly. The RIGHT arm comes forward and the LEFT arm moves back. It must flow smoothly into Image 2, which is the first frame of the loop, without duplicating Image 2."
    }
)

$identityRules = @"
Preserve the exact child explorer identity from the original identity reference: identical face, large dark-blue eyes, small smile, head and body proportions, teal explorer hat with cream badge, blue jacket, orange backpack, navy shorts and boots, colors, materials, and soft matte 3D toy illustration style. Keep the same front three-quarter view facing slightly right. Keep a fixed square camera, full body visible, identical character scale, horizontal center, and foot baseline near 85 percent of the canvas. This is an IN-PLACE walk: never move across the canvas.

The step must be physically readable. The head is attached to the body and must follow the body's weight transfer with subtle vertical bob and tiny counter-rotation. Shoulders, torso, hips, backpack, arms, and legs must change together. Arms swing opposite the legs. Keep face identity and expression stable.

Use true transparent alpha background. No floor, platform, ground contact shadow, cast shadow, scenery, props, particles, text, numbers, border, or watermark. No duplicated or missing limbs, fused feet, floating, sliding, running, motion blur, camera movement, scale change, costume change, or redesign.
"@

New-Item -ItemType Directory -Force -Path $outputDir | Out-Null
Push-Location $projectRoot
try {
    for ($index = 0; $index -lt $poses.Count; $index++) {
        $frameName = "frame-{0:D3}.png" -f $index
        $outputPath = Join-Path $outputDir $frameName
        $pose = $poses[$index]

        if ($index -eq 0) {
            $images = @($identityReference)
            $referenceRules = "Image 1 is the original identity reference. Create the first animation keyframe from it."
        }
        elseif ($index -eq 7) {
            $previousFrame = Join-Path $outputDir ("frame-{0:D3}.png" -f ($index - 1))
            $firstFrame = Join-Path $outputDir "frame-000.png"
            $images = @($previousFrame, $firstFrame, $identityReference)
            $referenceRules = "Image 1 is the immediately previous animation frame and is the primary continuity reference. Image 2 is the first frame and is the loop-closing target. Image 3 is the original identity reference. Make the smallest controlled change from Image 1 while preserving Image 3 identity and preparing a smooth return to Image 2."
        }
        else {
            $previousFrame = Join-Path $outputDir ("frame-{0:D3}.png" -f ($index - 1))
            $images = @($previousFrame, $identityReference)
            $referenceRules = "Image 1 is the immediately previous animation frame and is the primary continuity reference. Image 2 is the original identity reference. Make only the smallest controlled pose change from Image 1; preserve Image 2 identity exactly."
        }

        $prompt = @"
$referenceRules

Generate exactly one animation frame for phase $($index + 1) of 8: $($pose.Phase).
$($pose.Pose)

$identityRules
"@

        $arguments = @($imageGen, "edit", "--model", $Model)
        foreach ($imagePath in $images) {
            $arguments += @("--image", $imagePath)
        }
        $arguments += @(
            "--prompt", $prompt,
            "--size", "1024x1024",
            "--quality", $Quality,
            "--output-format", "png",
            "--out", $outputPath,
            "--force"
        )

        Write-Host "链式生成 $frameName：$($pose.Phase) ($($index + 1)/8)..."
        & $python @arguments
        if ($LASTEXITCODE -ne 0) {
            throw "生成 $frameName 失败，退出码：$LASTEXITCODE"
        }
    }
}
finally {
    Pop-Location
}

Write-Host "链式行走关键帧生成完成：$outputDir"
