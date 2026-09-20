from __future__ import annotations

import argparse
import math
from pathlib import Path

from PIL import Image


def normalize(path: Path) -> Image.Image:
    image = Image.open(path).convert("RGBA")
    bbox = image.getchannel("A").point(lambda value: 255 if value > 5 else 0).getbbox()
    if not bbox:
        raise ValueError(f"No visible character in {path}")
    subject = image.crop(bbox)
    scale = min(420 / subject.width, 430 / subject.height)
    subject = subject.resize(
        (max(1, round(subject.width * scale)), max(1, round(subject.height * scale))),
        Image.Resampling.LANCZOS,
    )
    canvas = Image.new("RGBA", (512, 512), (0, 0, 0, 0))
    canvas.alpha_composite(subject, (round((512 - subject.width) / 2), 474 - subject.height))
    return canvas


def transform(image: Image.Image, scale_x: float, scale_y: float, y: int, angle: float) -> Image.Image:
    width = max(1, round(image.width * scale_x))
    height = max(1, round(image.height * scale_y))
    resized = image.resize((width, height), Image.Resampling.BICUBIC)
    rotated = resized.rotate(angle, resample=Image.Resampling.BICUBIC, expand=False, fillcolor=(0, 0, 0, 0))
    canvas = Image.new("RGBA", (512, 512), (0, 0, 0, 0))
    canvas.alpha_composite(rotated, (round((512 - width) / 2), round((512 - height) / 2 + y)))
    return canvas


def parameters(action: str, index: int, frame_count: int) -> tuple[float, float, int, float]:
    phase = index / frame_count * math.tau
    if action == "idle":
        return 1.0 + 0.004 * math.sin(phase), 1.0 + 0.009 * math.sin(phase), round(-2 * math.sin(phase)), 0.35 * math.sin(phase)
    if action == "think":
        curve = math.sin(index / (frame_count - 1) * math.pi)
        return 1.0, 1.0, round(-3 * curve), -2.6 * curve
    if action == "happy":
        jump = (0, -10, -30, -46, -30, -12, 2, 0)[index]
        squash = (0.98, 1.0, 1.015, 1.025, 1.01, 0.99, 0.975, 1.0)[index]
        return 2 - squash, squash, jump, 1.2 * math.sin(phase)
    if action == "encourage":
        angles = (0, -2.2, 2.4, -2.6, 2.3, -1.4, 0.7, 0)
        return 1.0, 1.0, round(-2 * abs(math.sin(phase))), angles[index]
    raise ValueError(f"Unknown action: {action}")


def main() -> None:
    parser = argparse.ArgumentParser(description="Generate stable transform-based explorer frames.")
    parser.add_argument("action", choices=("idle", "think", "happy", "encourage"))
    parser.add_argument("source", type=Path)
    parser.add_argument("output_dir", type=Path)
    parser.add_argument("--frames", type=int, default=8)
    args = parser.parse_args()

    base = normalize(args.source)
    args.output_dir.mkdir(parents=True, exist_ok=True)
    for index in range(args.frames):
        frame = transform(base, *parameters(args.action, index, args.frames))
        frame.save(args.output_dir / f"frame-{index:03d}.png", "PNG", optimize=True)
    print(f"Generated {args.action}: {args.frames} frames")


if __name__ == "__main__":
    main()
