from __future__ import annotations

import argparse
from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[2]
MOTION = ROOT / "assets" / "motion"


def main() -> None:
    parser = argparse.ArgumentParser(description="Export authoring PNG animation frames as runtime WebP files.")
    parser.add_argument("--quality", type=int, default=82)
    parser.add_argument("--delete-source", action="store_true")
    args = parser.parse_args()

    sources = sorted(MOTION.rglob("frame-*.png"))
    converted = 0
    for source in sources:
        with Image.open(source) as image:
            rgba = image.convert("RGBA")
            if rgba.size != (512, 512):
                raise ValueError(f"Expected 512x512 frame: {source}")
            target = source.with_suffix(".webp")
            rgba.save(target, "WEBP", quality=args.quality, method=6)
        if args.delete_source:
            source.unlink()
        converted += 1
    print(f"Exported {converted} motion frames as WebP.")


if __name__ == "__main__":
    main()
