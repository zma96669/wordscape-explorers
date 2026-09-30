# 透明逐帧动画目录

线上版本只保存连续透明 WebP：`frame-000.webp`、`frame-001.webp`……。所有运行帧为 512×512、使用相同角色尺寸和落脚点，并保留真实透明背景。

- 主角动作：`explorer/<动作>/`
- 收藏物获得动画：`collectibles/<收藏ID>/reveal/`
- 动画参数：[animation-manifest.json](animation-manifest.json)

制作时可以在本地生成 PNG 序列，再运行：

    python asset-production/scripts/export_motion_webp.py --delete-source

脚本会输出运行 WebP 并删除本地 PNG 副本。PNG 动画源帧已加入 `.gitignore`，不会再次进入发布包。
