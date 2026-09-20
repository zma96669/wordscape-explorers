from __future__ import annotations

import argparse
from pathlib import Path

from PIL import Image, ImageDraw


def checkerboard(size: tuple[int, int], cell: int = 24) -> Image.Image:
    image = Image.new("RGB", size, (238, 240, 244))
    draw = ImageDraw.Draw(image)
    for y in range(0, size[1], cell):
        for x in range(0, size[0], cell):
            if (x // cell + y // cell) % 2:
                draw.rectangle((x, y, x + cell - 1, y + cell - 1), fill=(211, 216, 224))
    return image


def composite_frame(frame: Image.Image, size: tuple[int, int]) -> Image.Image:
    background = checkerboard(size)
    foreground = frame.convert("RGBA").resize(size, Image.Resampling.LANCZOS)
    background.paste(foreground, (0, 0), foreground)
    return background


def main() -> None:
    parser = argparse.ArgumentParser(description="Validate PNG frames and build visual previews.")
    parser.add_argument("input_dir", type=Path)
    parser.add_argument("output_dir", type=Path)
    parser.add_argument("--fps", type=int, default=12)
    args = parser.parse_args()

    frame_paths = sorted(args.input_dir.glob("frame-*.png"))
    if not frame_paths:
        raise SystemExit(f"No animation frames found in {args.input_dir}")

    frames: list[Image.Image] = []
    for path in frame_paths:
        frame = Image.open(path).convert("RGBA")
        if frame.size != (512, 512):
            raise ValueError(f"{path.name}: expected 512x512, got {frame.size}")
        alpha = frame.getchannel("A")
        minimum, maximum = alpha.getextrema()
        if minimum != 0 or maximum != 255:
            raise ValueError(f"{path.name}: incomplete alpha range {minimum}..{maximum}")
        frames.append(frame)

    args.output_dir.mkdir(parents=True, exist_ok=True)
    tile_size = (256, 256)
    columns = 4
    rows = (len(frames) + columns - 1) // columns
    sheet = Image.new("RGB", (columns * tile_size[0], rows * tile_size[1]), "white")
    draw = ImageDraw.Draw(sheet)
    for index, frame in enumerate(frames):
        tile = composite_frame(frame, tile_size)
        x = (index % columns) * tile_size[0]
        y = (index // columns) * tile_size[1]
        sheet.paste(tile, (x, y))
        draw.rectangle((x + 7, y + 7, x + 84, y + 29), fill=(23, 35, 55))
        draw.text((x + 13, y + 11), f"frame-{index:03d}", fill="white")

    sheet.save(args.output_dir / "explorer-move-contact-sheet.png", "PNG", optimize=True)

    preview_frames = [composite_frame(frame, (512, 512)) for frame in frames]
    duration = max(1, round(1000 / args.fps))
    preview_frames[0].save(
        args.output_dir / "explorer-move-preview.webp",
        "WEBP",
        save_all=True,
        append_images=preview_frames[1:],
        duration=duration,
        loop=0,
        quality=90,
        method=6,
    )
    print(f"Validated {len(frames)} frames and wrote previews to {args.output_dir}")


if __name__ == "__main__":
    main()
