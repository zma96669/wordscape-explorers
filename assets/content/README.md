# 运行时学习内容

- `tutorial-level.json`：3×3 教学关，包含 3 道固定引导题。
- `vocabulary.json`：48 个英语词语。
- `tasks.json`：120 道任务，包括听音 48、含义 48、语境 24。
- `voice-script.csv`：156 条已经生成本地 MP3 的配音文本，包括单词 48、任务 72、收藏 36。
- `levels.json`：8 个 4×4 棋盘模板。每个模板有 3 条基础路线，再通过 8 种旋转与镜像得到 192 种运行路线。
- `ui-copy.zh-CN.json`：中文界面文案和数值参数。

普通探险每局从尚未学过的“单词 + 题型”中抽取 5 道题。同一轮尽量不重复单词；完成整个任务池后才进入下一轮复习。浏览器会保存当前探险、学习进度和收藏进度。

运行校验：

```powershell
node asset-production/scripts/validate_content.js
node asset-production/scripts/validate_levels.js
```

程序校验覆盖 ID、引用、候选项、语境空缺、音频路径、路线相邻性、河流障碍、无重复格和步数预算。正式教学投放前仍建议由英语教研人员复核词义与例句。
