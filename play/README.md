# 词境探险队

这是可直接运行的完整单机网页游戏。它包含教学、随机探险、英语朗读、逐帧角色动画、路线与河流、探索发现、结算、开箱、18 件收藏、收藏兑换、本地存档、背景音乐和操作音效。

在项目根目录启动静态服务器：

```powershell
python -m http.server 4173
```

访问 `http://127.0.0.1:4173/play/`。不要直接双击 HTML，因为浏览器的 `file:` 协议会阻止动画清单加载。

## 游戏流程

1. 首次可进入 3×3 教学关，按顺序完成 3 道题并点击帐篷回营。
2. “开始随机探险”会创建一个 4×4 随机关。每局 5 道题，每答对一题移动一步，最后再走一步到帐篷。
3. 路线从 8 个模板、每个模板 3 条基础路线和 8 种旋转/镜像中随机选择，并避免连续两局完全相同。
4. 完成探险获得星砂和收藏箱。玩家选择恐龙、太空或海洋系列后开箱。
5. 普通收藏优先抽取未拥有物品；重复收藏转为星砂；星砂也可在收藏柜兑换未获得收藏。

普通探险会保存题目、当前位置、路线和探索发现。离开棋盘或刷新后可以继续。学习任务按完整任务 ID 记录，整池学习完成后才开始下一轮。

## 资源与验证

- 角色动作：5 组、40 帧。
- 收藏展示动作：18 组、156 帧。
- 正式英语语音：156 条 MP3。
- 音效：13 个 WAV。
- 循环音乐：2 首 WAV。

运行完整检查：

```powershell
node --check play/game.js
node asset-production/scripts/validate_content.js
node asset-production/scripts/validate_levels.js
python asset-production/scripts/validate_delivery.py
```

校验报告保存在 `asset-production/reports/`。
