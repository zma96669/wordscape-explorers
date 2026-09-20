# 词境探险队

面向儿童的英语词汇探险与收藏网页游戏。玩家听取或阅读英语线索，在 4×4 棋盘上逐题选择单词；每答对一题，探险员前进一步，完成五题后回到帐篷，并开启主题收藏箱。

## 运行

在本目录打开 PowerShell：

```powershell
python -m http.server 4173
```

然后访问：

```text
http://127.0.0.1:4173/play/
```

完整玩法、资源数量与校验命令见 [play/README.md](play/README.md)。制作与来源记录见 [asset-production/README.md](asset-production/README.md)。

## GitHub Pages 部署

在线版本：

```text
https://zma96669.github.io/wordscape-explorers/
```

仓库已使用 GitHub Actions 自动部署。根地址会自动进入游戏页面，后续每次推送到 `main`，GitHub Pages 都会自动更新。

## 当前内容

- 3×3 教学关与随机 4×4 探险。
- 48 个词、120 道学习任务。
- 8 个棋盘模板、192 种运行路线。
- 5 组角色动画、18 组收藏动画，共 196 帧。
- 156 条英语语音、13 个音效、2 首循环音乐。
- 恐龙、太空、海洋三个系列共 18 件收藏。
- 本地存档、学习轮换、开箱、重复收藏转化和星砂兑换。

比赛封面与真实游戏截图位于 `assets/showcase/`。
