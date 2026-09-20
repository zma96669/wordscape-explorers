from __future__ import annotations

import argparse
from pathlib import Path

from PIL import Image, ImageChops, ImageFilter


def chroma_alpha(image: Image.Image, softness: int = 72) -> Image.Image:
    rgb = image.convert("RGB")
    background = Image.new("RGB", rgb.size, (255, 0, 255))
    distance = ImageChops.difference(rgb, background).convert("L")
    alpha = distance.point(lambda value: max(0, min(255, round(value * 255 / softness))))
    return alpha.filter(ImageFilter.GaussianBlur(0.6))


def recover_edge_color(image: Image.Image, alpha: Image.Image) -> Image.Image:
    rgba = image.convert("RGBA")
    source = rgba.load()
    mask = alpha.load()
    output = Image.new("RGBA", rgba.size, (0, 0, 0, 0))
    target = output.load()

    for y in range(rgba.height):
        for x in range(rgba.width):
            a = mask[x, y]
            if a <= 2:
                continue
            r, g, b, _ = source[x, y]
            fraction = a / 255.0
            recovered_r = round((r - (1.0 - fraction) * 255) / fraction)
            recovered_g = round(g / fraction)
            recovered_b = round((b - (1.0 - fraction) * 255) / fraction)
            target[x, y] = (
                max(0, min(255, recovered_r)),
                max(0, min(255, recovered_g)),
                max(0, min(255, recovered_b)),
                a,
            )
    return output


def normalize_frame(source_path: Path, output_path: Path) -> None:
    source = Image.open(source_path)
    source_rgba = source.convert("RGBA")
    source_alpha = source_rgba.getchannel("A")
    if source_alpha.getextrema()[0] < 255:
        # Some compatible gateways return real alpha even when gpt-image-2 was
        # asked for a chroma fallback. Preserve that higher-quality cutout.
        alpha = source_alpha
        keyed = source_rgba
    else:
        alpha = chroma_alpha(source)
        keyed = recover_edge_color(source, alpha)
    bbox = alpha.point(lambda value: 255 if value >= 10 else 0).getbbox()
    if bbox is None:
        raise ValueError(f"No foreground subject detected in {source_path}")

    subject = keyed.crop(bbox)
    max_width, max_height = 404, 430
    scale = min(max_width / subject.width, max_height / subject.height)
    resized_size = (
        max(1, round(subject.width * scale)),
        max(1, round(subject.height * scale)),
    )
    subject = subject.resize(resized_size, Image.Resampling.LANCZOS)

    canvas = Image.new("RGBA", (512, 512), (0, 0, 0, 0))
    left = round((512 - subject.width) / 2)
    bottom_anchor = 476
    top = bottom_anchor - subject.height
    canvas.alpha_composite(subject, (left, top))
    output_path.parent.mkdir(parents=True, exist_ok=True)
    canvas.save(output_path, "PNG", optimize=True)


def main() -> None:
    parser = argparse.ArgumentParser(description="Remove #FF00FF and normalize animation frames.")
    parser.add_argument("input_dir", type=Path)
    parser.add_argument("output_dir", type=Path)
    args = parser.parse_args()

    frames = sorted(args.input_dir.glob("frame-*.png"))
    if not frames:
        raise SystemExit(f"No frame PNG files found in {args.input_dir}")

    for frame in frames:
        normalize_frame(frame, args.output_dir / frame.name)
        print(f"Prepared {frame.name}")


if __name__ == "__main__":
    main()
