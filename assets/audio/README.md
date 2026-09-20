# 音频资源

游戏当前使用完整的本地音频资源，浏览器语音只作为加载失败时的降级方案。

- `en-US/words/`：48 条单词发音 MP3。
- `en-US/tasks/`：72 条含义与语境任务 MP3。
- `en-US/collectibles/`：18 件收藏的名称与短句，共 36 条 MP3。
- `music/camp-loop.wav`：营地、结算、开箱与收藏页的 24 秒循环音乐。
- `music/explore-loop.wav`：棋盘探险页的 24 秒循环音乐。
- `sfx/`：13 个操作、移动、完成、开箱和收藏音效。

重新生成基础音效：

```powershell
node asset-production/scripts/generate_basic_sfx.js
```

重新生成正式英语语音：

```powershell
python asset-production/scripts/generate_tts_assets.py
```

英语语音与脚本的文件对应关系记录在 `assets/content/voice-script.csv`。交付校验会检查全部 156 条语音和两首循环音乐是否存在。
