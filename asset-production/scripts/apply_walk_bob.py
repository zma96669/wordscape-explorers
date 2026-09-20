from __future__ import annotations

import argparse
from pathlib import Path

from PIL import Image


# Contact, down, pass, up, then the opposite leg repeats the same rhythm.
Y_OFFSETS = (0, 5, 1, -5, 0, 5, 1, -5)


def main() -> None:
    parser = argparse.ArgumentParser(description="Apply whole-character vertical weight transfer.")
    parser.add_argument("input_dir", type=Path)
    parser.add_argument("output_dir", type=Path)
    args = parser.parse_args()

    paths = sorted(args.input_dir.glob("frame-*.png"))
    if len(paths) != 8:
        raise ValueError(f"Expected 8 walk frames, found {len(paths)}")
    args.output_dir.mkdir(parents=True, exist_ok=True)

    for index, path in enumerate(paths):
        frame = Image.open(path).convert("RGBA")
        canvas = Image.new("RGBA", frame.size, (0, 0, 0, 0))
        canvas.alpha_composite(frame, (0, Y_OFFSETS[index]))
        canvas.save(args.output_dir / f"frame-{index:03d}.png", "PNG", optimize=True)
    print("Applied whole-character walk bob to 8 frames")


if __name__ == "__main__":
    main()
