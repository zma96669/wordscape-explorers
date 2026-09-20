# 界面资源

按 `04-界面与程序动效提示词.md` 生成。SVG 为可编辑矢量，不含嵌入位图，不依赖外网字体。

## 预览

- `preview.html`：图标、按钮、弹窗、棋盘拼接
- `series/covers.html`：三组系列封面，标题用 HTML 渲染
- `title-lockup.html`：中文标题字标
- `motion/preview.html`：U04 程序动效
- `character-motion/preview.html`：05角色五种基础动作

用浏览器直接打开即可。

## 目录

- `icons/`：24 个 64×64 图标
- `game/`：棋盘地格、路线覆盖层、箱子、展示台
- `series/`：系列图标、徽章、封面底板
- `character-motion/`：角色动作配置、样式和预览
- `app-entry.svg`：App 入口
- `components.css`：按钮与控件状态

## 颜色对比（约）

- 深蓝 #24364B 在奶油底：11.7:1
- 奶油字在探险绿按钮上：4.2:1
- 深蓝在天空蓝/暖橙上：约 5.3:1

## 尚未包含

PNG 256 备份未栅格化，需要时从 SVG 导出。缩略图与轮廓用 `asset-production/scripts/export_collectible_derivatives.py` 从收藏主图生成。
