from pathlib import Path

ROOT = Path(r"D:\xueli_code\bisai\game")
UI = ROOT / "assets" / "ui"
ICONS = UI / "icons"
GAME = UI / "game"
SERIES = UI / "series"
MOTION = UI / "motion"

NAVY = "#24364B"
GREEN = "#268574"
SKY = "#6FB5DF"
CREAM = "#FFF8EC"
ORANGE = "#E39A4A"
YELLOW = "#F4D27A"
CORAL = "#E07A5F"
PURPLE = "#7B8CDE"
MOSS = "#5A8F4A"
GRASS = "#8FBF6A"
SAND = "#F3E2B8"
WOOD = "#C9844A"
SHADOW = "#1A2A3A"

def write(path: Path, text: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(text.strip() + "\n", encoding="utf-8")

def svg(vb: str, body: str, label: str) -> str:
    return f'''<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="{vb}" fill="none" role="img" aria-label="{label}">
{body}
</svg>
'''

def icon(body: str, label: str) -> str:
    frame = f'''  <rect x="4" y="4" width="56" height="56" rx="14" fill="{CREAM}" stroke="{NAVY}" stroke-width="2.5"/>
'''
    return svg("0 0 64 64", frame + body, label)

STROKE = f'stroke="{NAVY}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"'
STROKE_SM = f'stroke="{NAVY}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"'

icons = {}

icons["back"] = icon(f'''  <path d="M38 20 L24 32 L38 44" {STROKE}/>
  <path d="M26 32 H42" {STROKE}/>''', "返回")

icons["play"] = icon(f'''  <path d="M26 20.5 L26 43.5 L44.5 32 Z" fill="{GREEN}" {STROKE}/>''', "开始")

icons["undo"] = icon(f'''  <path d="M42 28.5c-1.8-6-9.8-8.8-15.6-4.4-5.8 4.4-5.6 13.4.4 17.4 5.4 3.6 13.2 1.8 16-3.8" {STROKE}/>
  <path d="M24.5 21.5 L24.5 29.5 L32.5 29.5" {STROKE}/>''', "撤回")

icons["reset"] = icon(f'''  <path d="M22 32a10 10 0 0 1 17.2-7.1" {STROKE}/>
  <path d="M42 32a10 10 0 0 1-17.2 7.1" {STROKE}/>
  <path d="M37.2 18.8 L39.8 25.2 L33.2 26.4" {STROKE}/>
  <path d="M26.8 45.2 L24.2 38.8 L30.8 37.6" {STROKE}/>''', "重置")

icons["audio"] = icon(f'''  <path d="M22 27.5 H27 L34 21.5 V42.5 L27 36.5 H22 A2.5 2.5 0 0 1 19.5 34 V30 A2.5 2.5 0 0 1 22 27.5 Z" fill="{SKY}" {STROKE}/>
  <path d="M39 26.5c2.4 2 2.4 9 0 11" {STROKE}/>
  <path d="M44 23c4.2 3.6 4.2 14.4 0 18" {STROKE}/>''', "音频")

icons["audio-muted"] = icon(f'''  <path d="M22 27.5 H27 L34 21.5 V42.5 L27 36.5 H22 A2.5 2.5 0 0 1 19.5 34 V30 A2.5 2.5 0 0 1 22 27.5 Z" fill="{SKY}" {STROKE}/>
  <path d="M40 26 L48 38" {STROKE}/>
  <path d="M48 26 L40 38" {STROKE}/>''', "音频关闭")

icons["hint"] = icon(f'''  <path d="M32 18c-6.2 0-11 4.6-11 10.4 0 3.8 2.1 7 5.2 8.8v4.3c0 1.3 1.2 2.3 2.6 2.3h6.4c1.4 0 2.6-1 2.6-2.3v-4.3c3.1-1.8 5.2-5 5.2-8.8C43 22.6 38.2 18 32 18Z" fill="{YELLOW}" {STROKE}/>
  <path d="M28.5 46.8 h7" {STROKE}/>
  <path d="M29.5 50.5 h5" {STROKE}/>''', "提示")

icons["settings"] = icon(f'''  <circle cx="32" cy="32" r="6.2" fill="{CREAM}" {STROKE}/>
  <path d="M32 14.8 v4.2 M32 45 v4.2 M14.8 32 h4.2 M45 32 h4.2 M19.6 19.6 l3 3 M41.4 41.4 l3 3 M44.4 19.6 l-3 3 M22.6 41.4 l-3 3" {STROKE}/>
  <path d="M32 20.8 A11.2 11.2 0 1 1 31.9 20.8" {STROKE_SM}/>''', "设置")

icons["collection"] = icon(f'''  <rect x="18" y="24" width="28" height="22" rx="4" fill="{WOOD}" {STROKE}/>
  <path d="M18 31.5 H46" {STROKE}/>
  <path d="M32 24 V46" {STROKE}/>
  <circle cx="25.5" cy="38.5" r="2.2" fill="{YELLOW}" {STROKE_SM}/>
  <circle cx="38.5" cy="38.5" r="2.2" fill="{SKY}" {STROKE_SM}/>
  <path d="M22 24 V20.5 H42 V24" {STROKE}/>''', "收藏柜")

icons["exchange"] = icon(f'''  <path d="M21 26 H41 L35.5 20.5" {STROKE}/>
  <path d="M43 38 H23 L28.5 43.5" {STROKE}/>
  <circle cx="21" cy="26" r="2.2" fill="{GREEN}"/>
  <circle cx="43" cy="38" r="2.2" fill="{ORANGE}"/>''', "兑换")

icons["wish"] = icon(f'''  <path d="M32 18.5 L35.3 27.2 L44.6 27.8 L37.6 33.8 L40 42.8 L32 37.8 L24 42.8 L26.4 33.8 L19.4 27.8 L28.7 27.2 Z" fill="{YELLOW}" {STROKE}/>''', "心愿")

icons["stardust"] = icon(f'''  <path d="M24 22 l1.8 4.4 4.6.4-3.5 3 1.2 4.5L24 31.8 19.9 34.3l1.2-4.5-3.5-3 4.6-.4Z" fill="{YELLOW}" {STROKE_SM}/>
  <path d="M41 20 l1.3 3.2 3.4.3-2.6 2.2.9 3.3L41 27.3l-3 1.7.9-3.3-2.6-2.2 3.4-.3Z" fill="{SKY}" {STROKE_SM}/>
  <path d="M36 36 l1.6 3.8 4.1.4-3.1 2.7 1.1 4L36 44.4 32.3 47l1.1-4-3.1-2.7 4.1-.4Z" fill="{ORANGE}" {STROKE_SM}/>''', "星砂")

icons["duplicate"] = icon(f'''  <rect x="22" y="22" width="18" height="22" rx="4" fill="{CREAM}" {STROKE}/>
  <rect x="27" y="18" width="18" height="22" rx="4" fill="{SKY}" opacity=".9" {STROKE}/>''', "重复转化")

icons["bridge"] = icon(f'''  <path d="M16 40 H48" {STROKE}/>
  <path d="M20 40 V34" {STROKE}/>
  <path d="M44 40 V34" {STROKE}/>
  <path d="M20 34 C26 22, 38 22, 44 34" fill="{WOOD}" {STROKE}/>
  <path d="M16 44 H22 M42 44 H48" {STROKE}/>''', "小桥")

icons["boots"] = icon(f'''  <path d="M24 22 h10 c3 0 5 2.2 5 5.2 V34 h7.5 c3 0 5 2.4 5 5.4 V42.5 H22.5 V27.2 C22.5 24 24 22 24 22Z" fill="{GREEN}" {STROKE}/>
  <path d="M24.5 34 H39" {STROKE}/>
  <path d="M27 26.5 H32.5" {STROKE_SM}/>''', "远足鞋")

icons["compass"] = icon(f'''  <circle cx="32" cy="32" r="14.5" fill="{CREAM}" {STROKE}/>
  <path d="M32 21.5 V24.5 M32 39.5 V42.5 M21.5 32 H24.5 M39.5 32 H42.5" {STROKE_SM}/>
  <path d="M32 24.8 L35.8 32 L32 39.2 L28.2 32 Z" fill="{ORANGE}" {STROKE_SM}/>
  <circle cx="32" cy="32" r="2.2" fill="{NAVY}"/>''', "指南针")

icons["correct"] = icon(f'''  <circle cx="32" cy="32" r="15" fill="{GREEN}" {STROKE}/>
  <path d="M23.5 32.5 L29 38 L41 24.5" stroke="{CREAM}" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/>''', "正确")

icons["needs-revision"] = icon(f'''  <rect x="17" y="17" width="30" height="30" rx="8" transform="rotate(45 32 32)" fill="{ORANGE}" {STROKE}/>
  <path d="M32 24 V35" stroke="{CREAM}" stroke-width="3.2" stroke-linecap="round"/>
  <circle cx="32" cy="41" r="2" fill="{CREAM}"/>''', "需要修正")

icons["task-complete"] = icon(f'''  <rect x="19" y="18" width="26" height="30" rx="5" fill="{CREAM}" {STROKE}/>
  <path d="M25 26 H39 M25 32 H35" {STROKE_SM}/>
  <circle cx="40" cy="41" r="9" fill="{GREEN}" {STROKE_SM}/>
  <path d="M35.5 41.2 L38.6 44.2 L45 36.8" stroke="{CREAM}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>''', "任务完成")

icons["series-complete"] = icon(f'''  <circle cx="32" cy="32" r="15.5" fill="{YELLOW}" {STROKE}/>
  <circle cx="32" cy="32" r="10" fill="{CREAM}" {STROKE_SM}/>
  <path d="M26 32.2 L30.2 36.4 L39 26.5" {STROKE}/>''', "系列集齐")

for name, content in icons.items():
    write(ICONS / f"{name}.svg", content)

def tile_base(fill: str, extra: str = "") -> str:
    return f'''  <rect width="128" height="128" fill="{fill}"/>
  <rect x="6" y="6" width="116" height="116" rx="18" fill="{CREAM}" stroke="{NAVY}" stroke-width="3"/>
  <path d="M18 18 C40 12, 70 14, 110 22" stroke="#FFFFFF" stroke-width="4" opacity=".35" stroke-linecap="round"/>
  <path d="M18 108 H110" stroke="{NAVY}" stroke-width="3" opacity=".12" stroke-linecap="round"/>
{extra}'''

write(GAME / "ground.svg", svg("0 0 128 128", tile_base("#C8E29A", f'''  <circle cx="24" cy="96" r="5" fill="{GRASS}" stroke="{NAVY}" stroke-width="2"/>
  <circle cx="104" cy="28" r="6" fill="{MOSS}" stroke="{NAVY}" stroke-width="2"/>
  <circle cx="98" cy="100" r="4" fill="{GRASS}" stroke="{NAVY}" stroke-width="2"/>'''), "普通地格"))

write(GAME / "path.svg", svg("0 0 128 128", tile_base("#C8E29A", f'''  <path d="M64 10 V118" stroke="{SAND}" stroke-width="36" stroke-linecap="round"/>
  <path d="M10 64 H118" stroke="{SAND}" stroke-width="36" stroke-linecap="round"/>
  <path d="M64 10 V118" stroke="{WOOD}" stroke-width="3" opacity=".18"/>
  <path d="M10 64 H118" stroke="{WOOD}" stroke-width="3" opacity=".18"/>
  <circle cx="48" cy="50" r="3" fill="{WOOD}" opacity=".35"/>
  <circle cx="78" cy="80" r="2.5" fill="{WOOD}" opacity=".3"/>'''), "道路"))

write(GAME / "start.svg", svg("0 0 128 128", tile_base("#C8E29A", f'''  <ellipse cx="50" cy="58" rx="11" ry="16" fill="{GREEN}" {STROKE.replace("stroke-width=\"3\"", "stroke-width=\"2.8\"")}/>
  <ellipse cx="78" cy="74" rx="11" ry="16" fill="{GREEN}" stroke="{NAVY}" stroke-width="2.8"/>
  <path d="M46 50 h8 M74 66 h8" stroke="{CREAM}" stroke-width="2" stroke-linecap="round"/>
  <circle cx="64" cy="24" r="7" fill="{SKY}" stroke="{NAVY}" stroke-width="2.5"/>'''), "起点脚印"))

write(GAME / "exit.svg", svg("0 0 128 128", tile_base("#C8E29A", f'''  <path d="M28 92 H100" stroke="{NAVY}" stroke-width="3" stroke-linecap="round"/>
  <path d="M38 92 V64 L64 40 L90 64 V92 Z" fill="{YELLOW}" stroke="{NAVY}" stroke-width="3" stroke-linejoin="round"/>
  <path d="M64 40 V92" stroke="{NAVY}" stroke-width="3"/>
  <path d="M52 92 V74 H76 V92" fill="{GREEN}" stroke="{NAVY}" stroke-width="3"/>
  <circle cx="70" cy="83" r="2.4" fill="{YELLOW}" stroke="{NAVY}" stroke-width="1.6"/>'''), "营地出口"))

write(GAME / "ravine.svg", svg("0 0 128 128", f'''  <rect width="128" height="128" fill="#C8E29A"/>
  <rect x="6" y="6" width="116" height="116" rx="18" fill="{CREAM}" stroke="{NAVY}" stroke-width="3"/>
  <path d="M18 18 C40 12, 70 14, 110 22" stroke="#FFFFFF" stroke-width="4" opacity=".35" stroke-linecap="round"/>
  <path d="M0 46 C36 70, 92 34, 128 58 L128 90 C88 62, 40 98, 0 78 Z" fill="{SKY}"/>
  <path d="M0 54 C36 78, 92 42, 128 66 L128 82 C88 54, 40 90, 0 70 Z" fill="#3E7CA8"/>
  <path d="M0 46 C36 70, 92 34, 128 58" stroke="{NAVY}" stroke-width="3" fill="none"/>
  <path d="M0 78 C40 98, 88 62, 128 90" stroke="{NAVY}" stroke-width="3" fill="none"/>
  <circle cx="26" cy="34" r="5" fill="{GRASS}" stroke="{NAVY}" stroke-width="2"/>
  <circle cx="104" cy="96" r="6" fill="{MOSS}" stroke="{NAVY}" stroke-width="2"/>
''', "沟壑障碍"))

write(GAME / "exploration-point.svg", svg("0 0 128 128", tile_base("#C8E29A", f'''  <circle cx="64" cy="64" r="22" fill="{YELLOW}" stroke="{NAVY}" stroke-width="3"/>
  <path d="M64 48 L68 60 L81 61 L71 70 L74 83 L64 76 L54 83 L57 70 L47 61 L60 60 Z" fill="{ORANGE}" stroke="{NAVY}" stroke-width="2.4" stroke-linejoin="round"/>
  <circle cx="64" cy="64" r="4" fill="{CREAM}" stroke="{NAVY}" stroke-width="2"/>'''), "探索点"))

write(GAME / "route-segment.svg", svg("0 0 128 128", f'''  <path d="M64 8 V120" stroke="{GREEN}" stroke-width="18" stroke-linecap="round" opacity=".88"/>
  <path d="M64 8 V120" stroke="{CREAM}" stroke-width="6" stroke-linecap="round" opacity=".55"/>
''', "路线段"))

write(GAME / "route.svg", svg("0 0 128 128", f'''  <path d="M64 8 V120" stroke="{GREEN}" stroke-width="18" stroke-linecap="round" opacity=".88"/>
  <path d="M8 64 H120" stroke="{GREEN}" stroke-width="18" stroke-linecap="round" opacity=".88"/>
  <path d="M64 8 V120" stroke="{CREAM}" stroke-width="6" stroke-linecap="round" opacity=".5"/>
  <path d="M8 64 H120" stroke="{CREAM}" stroke-width="6" stroke-linecap="round" opacity=".5"/>
''', "已选路线"))

write(GAME / "target-marker.svg", svg("0 0 128 128", f'''  <circle cx="64" cy="64" r="34" fill="none" stroke="{ORANGE}" stroke-width="8" opacity=".95"/>
  <circle cx="64" cy="64" r="34" fill="none" stroke="{NAVY}" stroke-width="3"/>
  <circle cx="64" cy="64" r="12" fill="none" stroke="{NAVY}" stroke-width="3"/>
  <circle cx="64" cy="64" r="5" fill="{ORANGE}" stroke="{NAVY}" stroke-width="2"/>
''', "目标标记"))

write(GAME / "target.svg", svg("0 0 128 128", f'''  <circle cx="64" cy="64" r="34" fill="none" stroke="{ORANGE}" stroke-width="8" opacity=".95"/>
  <circle cx="64" cy="64" r="34" fill="none" stroke="{NAVY}" stroke-width="3"/>
  <circle cx="64" cy="64" r="12" fill="none" stroke="{NAVY}" stroke-width="3"/>
  <circle cx="64" cy="64" r="5" fill="{ORANGE}" stroke="{NAVY}" stroke-width="2"/>
''', "目标标记"))

write(GAME / "route-valid.svg", svg("0 0 128 128", f'''  <circle cx="98" cy="30" r="18" fill="{GREEN}" stroke="{NAVY}" stroke-width="3"/>
  <path d="M88 30 L95 37 L109 22" stroke="{CREAM}" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/>
''', "路线合法"))

write(GAME / "route-invalid.svg", svg("0 0 128 128", f'''  <rect x="80" y="12" width="36" height="36" rx="10" fill="{CORAL}" stroke="{NAVY}" stroke-width="3"/>
  <path d="M90 22 L106 38 M106 22 L90 38" stroke="{CREAM}" stroke-width="3.2" stroke-linecap="round"/>
''', "路线不合法"))

write(GAME / "display-stand.svg", svg("0 0 256 128", f'''  <ellipse cx="128" cy="98" rx="92" ry="16" fill="{SHADOW}" opacity=".18"/>
  <path d="M36 86 H220 L200 58 H56 Z" fill="{WOOD}" stroke="{NAVY}" stroke-width="3" stroke-linejoin="round"/>
  <path d="M56 58 H200 L188 40 H68 Z" fill="{SAND}" stroke="{NAVY}" stroke-width="3" stroke-linejoin="round"/>
  <path d="M68 40 H188" stroke="#FFFFFF" stroke-width="3" opacity=".35" stroke-linecap="round"/>
''', "展示台"))

write(GAME / "main-stand.svg", svg("0 0 256 128", f'''  <ellipse cx="128" cy="102" rx="100" ry="18" fill="{SHADOW}" opacity=".2"/>
  <path d="M28 90 H228 L206 56 H50 Z" fill="{WOOD}" stroke="{NAVY}" stroke-width="3" stroke-linejoin="round"/>
  <path d="M50 56 H206 L190 32 H66 Z" fill="{YELLOW}" stroke="{NAVY}" stroke-width="3" stroke-linejoin="round"/>
  <path d="M78 32 H178 L168 18 H88 Z" fill="{GREEN}" stroke="{NAVY}" stroke-width="3" stroke-linejoin="round"/>
  <circle cx="128" cy="25" r="4" fill="{YELLOW}" stroke="{NAVY}" stroke-width="2"/>
''', "主展示台"))

write(GAME / "collection-card.svg", svg("0 0 240 320", f'''  <rect x="8" y="8" width="224" height="304" rx="28" fill="{CREAM}" stroke="{NAVY}" stroke-width="4"/>
  <rect x="24" y="24" width="192" height="192" rx="22" fill="#F7EDD3" stroke="{NAVY}" stroke-width="3"/>
  <rect x="24" y="232" width="192" height="60" rx="16" fill="{GREEN}" stroke="{NAVY}" stroke-width="3"/>
''', "收藏卡底板"))

chest_body = f'''  <g id="chest-body">
    <ellipse cx="128" cy="214" rx="78" ry="14" fill="{SHADOW}" opacity=".18"/>
    <rect x="46" y="118" width="164" height="92" rx="18" fill="{WOOD}" stroke="{NAVY}" stroke-width="4"/>
    <rect x="46" y="150" width="164" height="12" fill="{YELLOW}" stroke="{NAVY}" stroke-width="2.5"/>
    <rect x="114" y="146" width="28" height="22" rx="6" fill="{YELLOW}" stroke="{NAVY}" stroke-width="3"/>
    <circle cx="128" cy="157" r="4" fill="{NAVY}"/>
  </g>'''

write(GAME / "chest-closed.svg", svg("0 0 256 256", f'''{chest_body}
  <g id="chest-lid">
    <path d="M50 126 C50 86, 206 86, 206 126 L190 118 H66 Z" fill="{ORANGE}" stroke="{NAVY}" stroke-width="4" stroke-linejoin="round"/>
    <path d="M70 112 H186" stroke="{YELLOW}" stroke-width="6" stroke-linecap="round"/>
  </g>
''', "关闭的收藏箱"))

write(GAME / "chest-open.svg", svg("0 0 256 256", f'''{chest_body}
  <g id="chest-interior">
    <rect x="58" y="122" width="140" height="48" rx="10" fill="#6B3F22" stroke="{NAVY}" stroke-width="3"/>
    <circle cx="128" cy="142" r="16" fill="{YELLOW}" stroke="{NAVY}" stroke-width="3"/>
  </g>
  <g id="chest-lid">
    <path d="M52 120 C60 48, 196 48, 204 120 L188 108 H68 Z" fill="{ORANGE}" stroke="{NAVY}" stroke-width="4" stroke-linejoin="round"/>
    <path d="M78 88 H178" stroke="{YELLOW}" stroke-width="6" stroke-linecap="round"/>
  </g>
  <g id="sparkles">
    <circle cx="78" cy="86" r="4" fill="{YELLOW}" stroke="{NAVY}" stroke-width="2"/>
    <circle cx="176" cy="78" r="3.2" fill="{SKY}" stroke="{NAVY}" stroke-width="2"/>
    <circle cx="128" cy="58" r="3.5" fill="{CREAM}" stroke="{NAVY}" stroke-width="2"/>
  </g>
''', "开启的收藏箱"))

write(GAME / "chest-empty.svg", svg("0 0 256 256", f'''{chest_body}
  <g id="chest-interior">
    <rect x="58" y="122" width="140" height="48" rx="10" fill="#4A2C18" stroke="{NAVY}" stroke-width="3"/>
  </g>
  <g id="chest-lid">
    <path d="M52 120 C60 48, 196 48, 204 120 L188 108 H68 Z" fill="{ORANGE}" stroke="{NAVY}" stroke-width="4" stroke-linejoin="round"/>
    <path d="M78 88 H178" stroke="{YELLOW}" stroke-width="6" stroke-linecap="round"/>
  </g>
''', "空收藏箱"))

# series icons / badges
write(SERIES / "dinosaur-icon.svg", svg("0 0 128 128", f'''  <rect x="8" y="8" width="112" height="112" rx="28" fill="#E7F0C8" stroke="{NAVY}" stroke-width="4"/>
  <path d="M34 84 C40 48, 88 44, 96 78 C78 70, 58 78, 34 84Z" fill="{MOSS}" stroke="{NAVY}" stroke-width="3.2" stroke-linejoin="round"/>
  <path d="M48 58 C58 36, 84 40, 86 62" fill="none" stroke="{NAVY}" stroke-width="3" stroke-linecap="round"/>
  <circle cx="44" cy="72" r="6" fill="{ORANGE}" stroke="{NAVY}" stroke-width="2.4"/>
  <path d="M40 92 C52 102, 76 104, 90 90" fill="none" stroke="{NAVY}" stroke-width="3" stroke-linecap="round"/>
''', "恐龙系列图标"))

write(SERIES / "space-icon.svg", svg("0 0 128 128", f'''  <rect x="8" y="8" width="112" height="112" rx="28" fill="#D7E9F8" stroke="{NAVY}" stroke-width="4"/>
  <circle cx="64" cy="64" r="22" fill="{PURPLE}" stroke="{NAVY}" stroke-width="3.2"/>
  <ellipse cx="64" cy="64" rx="38" ry="10" fill="none" stroke="{YELLOW}" stroke-width="5"/>
  <ellipse cx="64" cy="64" rx="38" ry="10" fill="none" stroke="{NAVY}" stroke-width="3"/>
  <circle cx="78" cy="54" r="4" fill="{CREAM}" stroke="{NAVY}" stroke-width="2"/>
''', "太空系列图标"))

write(SERIES / "ocean-icon.svg", svg("0 0 128 128", f'''  <rect x="8" y="8" width="112" height="112" rx="28" fill="#D8F1F0" stroke="{NAVY}" stroke-width="4"/>
  <path d="M40 76 C40 50, 88 50, 88 76 C88 94, 40 94, 40 76Z" fill="{CORAL}" stroke="{NAVY}" stroke-width="3.2"/>
  <path d="M48 70 C56 62, 64 80, 72 68" fill="none" stroke="{CREAM}" stroke-width="3" stroke-linecap="round"/>
  <circle cx="64" cy="54" r="7" fill="{SKY}" stroke="{NAVY}" stroke-width="2.6"/>
''', "海洋系列图标"))

def badge(accent: str, label: str) -> str:
    return svg("0 0 128 128", f'''  <circle cx="64" cy="64" r="50" fill="{accent}" stroke="{NAVY}" stroke-width="4"/>
  <circle cx="64" cy="64" r="34" fill="{CREAM}" stroke="{NAVY}" stroke-width="3"/>
  <path d="M46 65 L58 77 L84 47" stroke="{NAVY}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
''', label)

write(SERIES / "dinosaur-badge.svg", badge(MOSS, "恐龙系列徽章"))
write(SERIES / "space-badge.svg", badge(PURPLE, "太空系列徽章"))
write(SERIES / "ocean-badge.svg", badge(SKY, "海洋系列徽章"))
write(SERIES / "dinosaur-complete.svg", badge(YELLOW, "恐龙系列完成"))
write(SERIES / "space-complete.svg", badge(YELLOW, "太空系列完成"))
write(SERIES / "ocean-complete.svg", badge(YELLOW, "海洋系列完成"))

# series covers as SVG frames 960x540 with image placeholders via HTML instead.
# Provide decorative SVG frames without embedding bitmaps.
def cover_frame(accent: str, label: str) -> str:
    return svg("0 0 960 540", f'''  <rect width="960" height="540" rx="36" fill="{accent}"/>
  <rect x="16" y="16" width="928" height="508" rx="28" fill="{CREAM}" stroke="{NAVY}" stroke-width="6"/>
  <rect x="48" y="168" width="864" height="320" rx="28" fill="#F7EDD3" stroke="{NAVY}" stroke-width="4"/>
  <rect x="48" y="40" width="420" height="96" rx="22" fill="{accent}" stroke="{NAVY}" stroke-width="4"/>
''', label)

write(SERIES / "dinosaur-cover.svg", cover_frame("#E7F0C8", "恐龙系列封面底板"))
write(SERIES / "space-cover.svg", cover_frame("#D7E9F8", "太空系列封面底板"))
write(SERIES / "ocean-cover.svg", cover_frame("#D8F1F0", "海洋系列封面底板"))

write(UI / "app-entry.svg", svg("0 0 256 256", f'''  <rect x="12" y="12" width="232" height="232" rx="56" fill="{GREEN}" stroke="{NAVY}" stroke-width="8"/>
  <rect x="46" y="50" width="164" height="156" rx="22" fill="{CREAM}" stroke="{NAVY}" stroke-width="6"/>
  <path d="M70 78 H186" stroke="{NAVY}" stroke-width="6" stroke-linecap="round"/>
  <path d="M70 108 H150" stroke="{SKY}" stroke-width="8" stroke-linecap="round"/>
  <path d="M70 138 H170" stroke="{NAVY}" stroke-width="6" stroke-linecap="round"/>
  <path d="M86 176 C110 150, 150 198, 186 160" fill="none" stroke="{ORANGE}" stroke-width="8" stroke-linecap="round"/>
  <circle cx="86" cy="176" r="8" fill="{YELLOW}" stroke="{NAVY}" stroke-width="3"/>
  <circle cx="186" cy="160" r="8" fill="{GREEN}" stroke="{NAVY}" stroke-width="3"/>
''', "App入口"))

write(UI / "title-lockup.svg", svg("0 0 640 160", f'''  <rect x="8" y="20" width="624" height="120" rx="36" fill="{CREAM}" stroke="{NAVY}" stroke-width="6"/>
  <circle cx="78" cy="80" r="28" fill="{GREEN}" stroke="{NAVY}" stroke-width="4"/>
  <path d="M66 80 L76 90 L94 68" stroke="{CREAM}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
  <text x="128" y="96" font-family="Trebuchet MS, Segoe UI, sans-serif" font-size="52" font-weight="700" fill="{NAVY}">词境探险队</text>
''', "游戏标题"))

print("icons", len(list(ICONS.glob('*.svg'))))
print("game", len(list(GAME.glob('*.svg'))))
print("series", len(list(SERIES.glob('*.svg'))))
print("app-entry", (UI/"app-entry.svg").exists())
