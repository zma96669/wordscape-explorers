param()
$ErrorActionPreference = 'Stop'
$packRoot = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..\prompt-pack'))
$utf8 = [System.Text.UTF8Encoding]::new($false)
function Save-Text([string]$relativePath, [string]$content) {
  [System.IO.File]::WriteAllText((Join-Path $packRoot $relativePath), $content, $utf8)
}
$prompts = @(Get-Content -LiteralPath (Join-Path $packRoot 'image-prompts.json') -Raw -Encoding UTF8 | ConvertFrom-Json)
foreach ($promptItem in $prompts) {
  $text = $promptItem.prompt -replace '(?s)^【画幅与输出规格】.*?【完整绘图提示词】\r?\n', ''
  if ($promptItem.id -in @('B01','B02')) {
    $text = $text.Replace('竖版，目标1024×1536', '竖版9:16，目标1152×2048')
    $spec = [ordered]@{ aspectRatio = '9:16'; orientation = 'portrait'; generationWidth = 1152; generationHeight = 2048; masterFormat = 'PNG'; alpha = $false; runtimeFormat = 'WebP'; fit = 'cover-background-only'; safeArea = '关键装饰x12%—88%、y22%—82%；上20%、底15%低细节；只允许环境边缘裁切' }
    $header = "【画幅与输出规格】`n宽高比：9:16（竖图）。生成尺寸：1152×2048像素，宽在前、高在后。PNG主文件，不透明背景；运行时导出WebP。关键装饰放在x12%—88%、y22%—82%范围，上方20%与底部15%低细节。背景可等比裁切适配手机，文字与按钮单独渲染。禁止拉伸；工具仅支持2:3时，先生成后上下扩图到9:16。工具设置里也选择9:16。`n【完整绘图提示词】`n"
  } elseif ($promptItem.id -eq 'B03') {
    $text = $text.Replace('横版，目标1536×1024', '横版16:9，目标1536×864')
    $spec = [ordered]@{ aspectRatio = '16:9'; orientation = 'landscape'; generationWidth = 1536; generationHeight = 864; masterFormat = 'PNG'; alpha = $false; runtimeFormat = 'WebP'; fit = 'contain-or-safe-crop'; safeArea = '四边至少8%；上方25%标题留白' }
    $header = "【画幅与输出规格】`n宽高比：16:9（横图）。生成尺寸：1536×864像素，宽在前、高在后；更高清可用2048×1152。PNG主文件，不透明背景；运行时可导出WebP。四边至少8%安全边距，上方25%留作后期标题。禁止拉伸，禁止生成文字。工具设置里也选择16:9。`n【完整绘图提示词】`n"
  } else {
    $text = $text.Replace('方形画布，目标规格1024×1024', '1:1方形画布，目标规格1024×1024')
    $spec = [ordered]@{ aspectRatio = '1:1'; orientation = 'square'; generationWidth = 1024; generationHeight = 1024; masterFormat = 'PNG'; alpha = $true; runtimeFormat = 'WebP'; runtimeWidth = 512; runtimeHeight = 512; thumbnailWidth = 256; thumbnailHeight = 256; fit = 'contain'; safeArea = '主体外接框最长边约75%；四边至少10%；全部肢体完整' }
    $header = "【画幅与输出规格】`n宽高比：1:1（正方形）。生成尺寸：1024×1024像素，宽在前、高在后。PNG主文件，真正透明背景；运行图512×512透明WebP，缩略图/轮廓256×256。主体外接框最长边约占75%，四边至少10%安全边距；不拉伸，不裁掉肢体。工具设置里也选择1:1并开启透明背景（如支持）；不支持透明时按下文纯色底方案后处理。`n【完整绘图提示词】`n"
  }
  $promptItem.prompt = $header + $text
  $promptItem | Add-Member -NotePropertyName outputSpec -NotePropertyValue $spec -Force
  $txtName = $promptItem.id + '-' + $promptItem.suggestedFilename.Replace('.png', '.txt')
  Save-Text ('image-prompts/' + $txtName) ($promptItem.prompt + "`n")
}
Save-Text 'image-prompts.json' (ConvertTo-Json -InputObject $prompts -Depth 12)
$imageDoc = "# 图片生成提示词：参考图与角色收藏`n`n每个代码块都是可单独复制的完整提示词，开头明确给出比例、尺寸与安全边距。比例均为宽:高；尺寸均为宽×高。`n`n先生成P00并保存为style-anchor.png，后续上传它作为风格参考。每次只生成一个素材。工具界面有比例、尺寸、透明度选项时，需同时设置，不能只依赖提示词。相同提示词不能保证角色一致。`n`n详细要求见[比例尺寸与导出规格](09-比例尺寸与导出规格.md)。`n`n"
$sceneDoc = "# 场景与封面提示词`n`n背景统一9:16；概念封面统一16:9。比例均为宽:高，尺寸均为宽×高。已将原2:3背景和3:2封面调整到此标准，不要将旧图直接拉伸。`n`n角色、棋盘组件、文字与按钮独立绘制。详细要求见[比例尺寸与导出规格](09-比例尺寸与导出规格.md)。`n`n"
$fence = [string]::new([char]96, 3)
foreach ($promptItem in $prompts) {
  $s = $promptItem.outputSpec
  $block = "## $($promptItem.id) $($promptItem.title)`n`n保存名称：$($promptItem.suggestedFilename)。`n`n**宽高比：$($s.aspectRatio)；生成尺寸：$($s.generationWidth)×$($s.generationHeight)像素。**`n`n" + $fence + "text`n" + $promptItem.prompt + "`n" + $fence + "`n`n"
  if ($promptItem.id.StartsWith('B')) { $sceneDoc += $block } else { $imageDoc += $block }
}
$sceneDoc += "## 系列封面与徽章`n`n系列封面采用16:9、960×540，由已完成主图排版，不重新生成收藏角色。系列图标与徽章采用1:1、SVG viewBox 0 0 128 128。具体制作见界面与程序动效提示词。`n"
Save-Text '02-图片提示词.md' $imageDoc
Save-Text '03-场景与封面提示词.md' $sceneDoc

$styleDoc = [System.IO.File]::ReadAllText((Join-Path $packRoot '01-统一风格规范.md'))
$styleDoc = $styleDoc.Replace('方形画布，目标规格1024×1024', '1:1方形画布，目标规格1024×1024')
if (-not $styleDoc.Contains('## 比例速查')) {
  $styleDoc += "`n## 比例速查`n`n单体角色/收藏/图标：1:1；手机背景：9:16；横封面/系列封面：16:9；展示台：2:1；收藏卡底板：3:4；角色动作单帧：1:1。完整像素、格式、安全边距及适配规则见[比例尺寸与导出规格](09-比例尺寸与导出规格.md)。`n"
}
Save-Text '01-统一风格规范.md' $styleDoc

$uiDoc = [System.IO.File]::ReadAllText((Join-Path $packRoot '04-界面与程序动效提示词.md'))
$uiDoc = $uiDoc.Replace('SVG使用统一viewBox 0 0 64 64', '图标画幅比例1:1，SVG使用统一viewBox 0 0 64 64，PNG备用导出256×256像素')
$uiDoc = $uiDoc.Replace('棋盘组件统一viewBox 0 0 128 128', '棋盘组件比例1:1，统一viewBox 0 0 128 128，PNG备用导出256×256像素')
$uiDoc = $uiDoc.Replace('收藏箱使用同一结构与配色', '收藏箱三种状态均为1:1，viewBox 0 0 256 256；展示台及主展示台均为2:1，viewBox 0 0 256 128；收藏卡底板为3:4，viewBox 0 0 240 320。收藏箱使用同一结构与配色')
$uiDoc = $uiDoc.Replace('封面使用横向卡片布局', '封面宽高比16:9，导出尺寸960×540像素，使用横向卡片布局')
$uiDoc = $uiDoc.Replace('图标分别为叶片化石意象', '系列图标和徽章比例1:1、viewBox 0 0 128 128、PNG备用256×256。图标分别为叶片化石意象')
$uiDoc = $uiDoc.Replace('另外制作app-entry.svg（', '另外制作app-entry.svg（1:1，viewBox 0 0 256 256，PNG备用512×512；')
$uiDoc = $uiDoc.Replace('512px运行WebP、256px缩略图、256px未解锁轮廓', '1:1的512×512运行WebP、256×256缩略图、256×256未解锁轮廓')
Save-Text '04-界面与程序动效提示词.md' $uiDoc

$motionDoc = [System.IO.File]::ReadAllText((Join-Path $packRoot '05-角色动画提示词.md'))
$motionDoc = $motionDoc.Replace('交付可播放预览、动作参数、资源依赖和减少动画版本。', '单帧比例1:1，源帧1024×1024，游戏导出512×512；所有帧使用同一锚点与缩放，四边至少10%安全边距。交付可播放预览、动作参数、资源依赖和减少动画版本。')
$motionDoc = $motionDoc.Replace('所有素材沿用同一风格、相机、画幅和缩放。', '所有素材沿用同一风格、相机、1:1画幅和缩放；动画单帧源图1024×1024，运行帧512×512，逐帧动画目标12—24fps。')
$motionDoc = $motionDoc.Replace('创作4秒固定镜头的游戏收藏品动作短片，方形画幅', '创作4秒固定镜头的游戏收藏品动作短片，宽高比1:1，目标1024×1024像素（工具仅支持1080时用1080×1080），目标24fps，方形画幅')
Save-Text '05-角色动画提示词.md' $motionDoc

$videoDoc = [System.IO.File]::ReadAllText((Join-Path $packRoot '08-演示视频与交付检查.md'))
$videoDoc = $videoDoc.Replace('输出16:9 1080p主版', '输出宽高比16:9、1920×1080像素、目标30fps的MP4主版')
$videoDoc = $videoDoc.Replace('另导出中文字幕SRT和剪辑时间表。', '可另剪9:16、1080×1920像素的竖版；所有原录屏等比适配，不横向拉伸。另导出中文字幕SRT和剪辑时间表。')
Save-Text '08-演示视频与交付检查.md' $videoDoc

$guideDoc = [System.IO.File]::ReadAllText((Join-Path $packRoot '00-使用指南.md'))
if (-not $guideDoc.Contains('09-比例尺寸与导出规格.md')) {
  $guideDoc = $guideDoc.Replace('## 从哪里开始', "## 先设置比例`n`n生成前先看[比例尺寸与导出规格](09-比例尺寸与导出规格.md)：角色/收藏1:1，手机背景9:16，横封面16:9。每个独立图片提示词和JSON也已加入明确规格，工具设置需要同步选择。`n`n## 从哪里开始")
  $guideDoc = $guideDoc.Replace('| image-prompts.json |', "| 09-比例尺寸与导出规格.md | 全部素材的比例、尺寸、透明度、安全边距、裁切与动画/音频规格 |`n| image-prompts.json |")
}
Save-Text '00-使用指南.md' $guideDoc

$sections = @(Get-ChildItem -LiteralPath $packRoot -Filter '*.md' | Where-Object { $_.Name -match '^\d{2}-' } | Sort-Object Name)
$combined = @('# 《词境探险队》完整素材生成提示词手册', '', '> v0.2：已补齐宽高比、像素尺寸、安全边距与导出要求。当前交付为提示词与内容草稿，图片、音频、视频尚未生成。')
foreach ($section in $sections) { $combined += "`n---`n"; $combined += [System.IO.File]::ReadAllText($section.FullName) }
Save-Text '完整提示词手册.md' ($combined -join "`n")
Write-Output ('Updated image specifications: ' + $prompts.Count)
Write-Output ('Combined source documents: ' + $sections.Count)
