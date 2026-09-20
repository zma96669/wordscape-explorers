from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont


ROOT = Path(__file__).resolve().parents[2]
SHOWCASE = ROOT / "assets/showcase"
FONT_BOLD = Path("C:/Windows/Fonts/msyhbd.ttc")
FONT_REGULAR = Path("C:/Windows/Fonts/msyh.ttc")


def font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont:
    source = FONT_BOLD if bold else FONT_REGULAR
    return ImageFont.truetype(str(source), size)


def phone_crop(path: Path) -> Image.Image:
    image = Image.open(path).convert("RGB")
    # Browser screenshots include desktop side margins; retain the 430 px game viewport.
    left = max(0, (image.width - 430) // 2)
    return image.crop((left, 0, min(image.width, left + 430), image.height))


def rounded_phone(image: Image.Image, target_height: int) -> Image.Image:
    scale = target_height / image.height
    resized = image.resize((round(image.width * scale), target_height), Image.Resampling.LANCZOS)
    mask = Image.new("L", resized.size, 0)
    ImageDraw.Draw(mask).rounded_rectangle((0, 0, resized.width - 1, resized.height - 1), radius=28, fill=255)
    layer = Image.new("RGBA", resized.size, (0, 0, 0, 0))
    layer.paste(resized, mask=mask)
    return layer


def main() -> None:
    width, height = 1600, 900
    cover = Image.new("RGBA", (width, height), "#123f48")
    draw = ImageDraw.Draw(cover)

    # Calm, map-like atmosphere behind the interface previews.
    draw.ellipse((-220, 480, 580, 1280), fill="#1f6f68")
    draw.ellipse((1120, -330, 1860, 410), fill="#4f9db5")
    draw.ellipse((1010, 610, 1710, 1260), fill="#e8b853")
    for x, y, radius, color in [
        (126, 120, 6, "#f5cf68"), (236, 190, 4, "#8cc8d7"),
        (420, 90, 5, "#f5cf68"), (90, 720, 5, "#ffffff"),
        (520, 760, 7, "#8cc8d7"), (1460, 130, 6, "#ffffff"),
    ]:
        draw.ellipse((x - radius, y - radius, x + radius, y + radius), fill=color)

    draw.rounded_rectangle((78, 78, 288, 126), radius=24, fill="#f4cc68")
    draw.text((103, 88), "英语学习探险游戏", font=font(23, True), fill="#173d46")
    draw.text((76, 178), "词境", font=font(92, True), fill="#fff9eb")
    draw.text((76, 282), "探险队", font=font(92, True), fill="#fff9eb")
    draw.text((82, 405), "听懂线索 · 走出路线 · 收集伙伴", font=font(30, True), fill="#f5cf68")
    draw.multiline_text(
        (82, 470),
        "120 道英语任务随机轮换\n192 种棋盘路线变化\n18 件主题收藏与逐帧动画",
        font=font(25), fill="#d8ece8", spacing=18,
    )
    draw.rounded_rectangle((78, 690, 500, 770), radius=24, fill="#fff9eb")
    draw.text((110, 710), "每答对一题，探险员前进一步", font=font(24, True), fill="#173d46")

    panels = [
        rounded_phone(phone_crop(SHOWCASE / "camp.png"), 690),
        rounded_phone(phone_crop(SHOWCASE / "board.png"), 740),
        rounded_phone(phone_crop(SHOWCASE / "chest.png"), 690),
    ]
    positions = [(610, 125), (935, 80), (1265, 125)]
    for panel, (x, y) in zip(panels, positions):
        shadow = Image.new("RGBA", cover.size, (0, 0, 0, 0))
        shadow_layer = Image.new("RGBA", panel.size, (20, 40, 45, 170))
        shadow_layer.putalpha(panel.getchannel("A"))
        shadow.paste(shadow_layer, (x + 18, y + 24), shadow_layer)
        cover.alpha_composite(shadow.filter(ImageFilter.GaussianBlur(16)))
        cover.alpha_composite(panel, (x, y))

    cover.convert("RGB").save(SHOWCASE / "concept-cover.png", quality=95)
    print(SHOWCASE / "concept-cover.png")


if __name__ == "__main__":
    main()
