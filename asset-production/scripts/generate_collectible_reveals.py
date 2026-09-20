from __future__ import annotations

import json
import math
import random
from pathlib import Path

from PIL import Image, ImageDraw


ROOT = Path(__file__).resolve().parents[2]
COLLECTIBLES_FILE = ROOT / "asset-production" / "collectibles.json"
MANIFEST_FILE = ROOT / "assets" / "motion" / "animation-manifest.json"
SERIES_COLORS = {
    "dinosaur": ((92, 190, 125), (255, 210, 91)),
    "space": ((99, 163, 255), (255, 219, 104)),
    "ocean": ((70, 198, 217), (255, 224, 125)),
}


def normalized_subject(path: Path) -> Image.Image:
    source = Image.open(path).convert("RGBA")
    alpha = source.getchannel("A")
    bbox = alpha.point(lambda value: 255 if value > 5 else 0).getbbox()
    if not bbox:
        raise ValueError(f"No visible subject in {path}")
    subject = source.crop(bbox)
    scale = min(400 / subject.width, 400 / subject.height)
    size = (max(1, round(subject.width * scale)), max(1, round(subject.height * scale)))
    return subject.resize(size, Image.Resampling.LANCZOS)


def ease_out_back(progress: float) -> float:
    c1 = 1.70158
    c3 = c1 + 1
    return 1 + c3 * (progress - 1) ** 3 + c1 * (progress - 1) ** 2


def sparkle(draw: ImageDraw.ImageDraw, x: float, y: float, radius: float, color: tuple[int, int, int], alpha: int) -> None:
    if radius <= 0 or alpha <= 0:
        return
    fill = (*color, alpha)
    width = max(1, round(radius * 0.32))
    draw.rounded_rectangle((x - width / 2, y - radius, x + width / 2, y + radius), radius=width / 2, fill=fill)
    draw.rounded_rectangle((x - radius, y - width / 2, x + radius, y + width / 2), radius=width / 2, fill=fill)


def build_frames(item: dict, frame_count: int, output_dir: Path) -> None:
    subject = normalized_subject(ROOT / item["artMaster"])
    rng = random.Random(item["id"])
    primary, accent = SERIES_COLORS[item["series"]]
    points = [
        (rng.uniform(75, 437), rng.uniform(65, 425), rng.uniform(8, 17), accent if index % 2 else primary)
        for index in range(10)
    ]
    output_dir.mkdir(parents=True, exist_ok=True)

    for index in range(frame_count):
        progress = index / max(1, frame_count - 1)
        reveal_progress = min(1.0, progress / 0.72)
        scale = 0.16 + 0.84 * ease_out_back(reveal_progress)
        if progress > 0.72:
            scale = 1.0 + 0.035 * math.sin((progress - 0.72) / 0.28 * math.pi)
        scale = max(0.08, scale)
        opacity = round(255 * min(1, progress / 0.25))
        rotation = (1 - progress) * (8 if rng.random() > 0.5 else -8)
        vertical = round((1 - progress) * 34 - 7 * math.sin(progress * math.pi))

        resized = subject.resize(
            (max(1, round(subject.width * scale)), max(1, round(subject.height * scale))),
            Image.Resampling.LANCZOS,
        ).rotate(rotation, resample=Image.Resampling.BICUBIC, expand=True)
        alpha = resized.getchannel("A").point(lambda value: round(value * opacity / 255))
        resized.putalpha(alpha)

        canvas = Image.new("RGBA", (512, 512), (0, 0, 0, 0))
        draw = ImageDraw.Draw(canvas, "RGBA")
        particle_peak = math.sin(min(1, progress / 0.78) * math.pi)
        for point_index, (x, y, radius, color) in enumerate(points):
            delay = (point_index % 4) * 0.045
            local = max(0.0, min(1.0, (progress - delay) / 0.72))
            local_alpha = round(210 * particle_peak * math.sin(local * math.pi))
            sparkle(draw, x, y, radius * math.sin(local * math.pi), color, local_alpha)

        left = round((512 - resized.width) / 2)
        top = round((512 - resized.height) / 2 + vertical)
        canvas.alpha_composite(resized, (left, top))
        canvas.save(output_dir / f"frame-{index:03d}.png", "PNG", optimize=True)


def main() -> None:
    data = json.loads(COLLECTIBLES_FILE.read_text(encoding="utf-8"))
    manifest = json.loads(MANIFEST_FILE.read_text(encoding="utf-8"))
    by_id = {item["id"]: item for item in data["items"]}

    for item_id, entry in manifest["collectibles"].items():
        item = by_id[item_id]
        output_dir = ROOT / "assets" / "motion" / "collectibles" / item_id / "reveal"
        build_frames(item, int(entry["frameCount"]), output_dir)
        entry["ready"] = True
        print(f"Generated {item_id}: {entry['frameCount']} frames")

    MANIFEST_FILE.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


if __name__ == "__main__":
    main()
