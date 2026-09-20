from __future__ import annotations

import argparse
from pathlib import Path

from PIL import Image


def main() -> None:
    parser = argparse.ArgumentParser(description="Split a fixed sprite sheet into equal cells.")
    parser.add_argument("sheet", type=Path)
    parser.add_argument("output_dir", type=Path)
    parser.add_argument("--columns", type=int, default=4)
    parser.add_argument("--rows", type=int, default=2)
    args = parser.parse_args()

    sheet = Image.open(args.sheet).convert("RGBA")
    args.output_dir.mkdir(parents=True, exist_ok=True)

    index = 0
    for row in range(args.rows):
        for column in range(args.columns):
            left = round(column * sheet.width / args.columns)
            right = round((column + 1) * sheet.width / args.columns)
            top = round(row * sheet.height / args.rows)
            bottom = round((row + 1) * sheet.height / args.rows)
            frame = sheet.crop((left, top, right, bottom))
            if frame.size != (512, 512):
                frame = frame.resize((512, 512), Image.Resampling.LANCZOS)
            frame.save(args.output_dir / f"frame-{index:03d}.png", "PNG", optimize=True)
            index += 1
    print(f"Wrote {index} frames of 512x512")


if __name__ == "__main__":
    main()
