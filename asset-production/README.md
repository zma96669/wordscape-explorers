# 《词境探险队》素材制作与交付

版本：v1.0，2026-09-20。

## 当前状态

游戏所需运行资源已经完成并接入：

- 角色：1 个探险员主形象，待机、行走、思考、庆祝、鼓励共 5 组动作。
- 场景：营地与棋盘 2 张竖屏背景。
- 收藏：恐龙、太空、海洋 3 个系列，共 18 件透明收藏主图、运行图、缩略图和未获得轮廓。
- 动画：23 组、196 帧透明 PNG；角色 40 帧，收藏展示 156 帧。
- 界面：棋盘、河流、帐篷、收藏箱、展示台、系列封面与图标均为项目内 SVG/CSS。
- 语音：48 条单词、72 条任务、36 条收藏英语语音，共 156 条 MP3。
- 声音：13 个操作音效和 2 首 24 秒循环背景音乐。
- 内容：48 词、120 道任务、1 个教学关、8 个普通棋盘模板和 192 种旋转/镜像运行路线。
- 展示：营地、棋盘、开箱/收藏真实游戏截图和封面。

运行时入口为 `play/index.html`，使用方法见 `play/README.md`。

## 视觉方向

整体采用“圆润探险玩具”风格：奶油白底色、深青文字、探险绿主色、天空蓝与暖黄点缀。角色、收藏与场景使用柔和体积感插画；文字与状态由 HTML/CSS 独立渲染，保证手机屏幕上的清晰度。

## 目录

- `assets/art/`：角色、背景、收藏主图、运行图、缩略图和轮廓。
- `assets/ui/`：界面图标、棋盘组件、系列封面和通用样式。
- `assets/motion/`：角色与收藏逐帧动画及动画清单。
- `assets/audio/`：英语语音、操作音效和循环音乐。
- `assets/content/`：词库、任务、关卡、界面文案和语音脚本。
- `assets/licenses/`：字体说明与资源生成记录。
- `assets/showcase/`：真实游戏截图和封面。
- `asset-production/scripts/`：可重复执行的生成、导出与校验脚本。
- `asset-production/reports/`：内容、关卡与总交付校验报告。

## 重新生成与验证

```powershell
node asset-production/scripts/generate_basic_sfx.js
python asset-production/scripts/generate_basic_music.py
python asset-production/scripts/generate_tts_assets.py
python asset-production/scripts/generate_collectible_reveals.py

node --check play/game.js
node asset-production/scripts/validate_content.js
node asset-production/scripts/validate_levels.js
python asset-production/scripts/validate_delivery.py
```

动画清单位于 `assets/motion/animation-manifest.json`。所有标记为 `ready: true` 的动作都要求对应编号帧完整存在。

## 质量边界

程序校验覆盖文件完整性、图像尺寸与透明度、音频路径、任务引用和路线可解性。学习内容已可作为比赛演示内容使用；若用于正式课程或大规模教学，仍建议由英语教研人员进行最终语言审阅。生成式图像、TTS 和程序合成音频的来源记录位于 `assets/licenses/sources.json`。
