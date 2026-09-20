# 透明逐帧动画目录

每个动作目录保存连续透明 PNG：`frame-000.png`、`frame-001.png`……。所有帧必须是 512×512、同一角色尺寸、同一落脚点、真正透明背景，不含地面、投影、文字或边框。

- 主角动作：`explorer/<动作>/`
- 收藏物获得动画：`collectibles/<收藏ID>/reveal/`
- 动画参数：[animation-manifest.json](animation-manifest.json)

保存完一整组帧后，将清单中对应动作的 `ready` 改为 `true`。游戏会自动播放帧序列；`ready` 为 `false` 或文件缺失时继续显示现有静态图。

不要直接放 MP4。MP4通常没有透明通道，而且浏览器无法把它作为棋盘精灵逐帧控制。若网站只生成视频，应先导出 PNG 序列、去除背景、统一画布和锚点，再放进上述目录。
