from __future__ import annotations

import argparse
from pathlib import Path

import cv2
import numpy as np
from PIL import Image


BOB_Y = (0, 5, 1, -5, 0, 5, 1, -5)
LEAN_DEGREES = (0.8, 0.3, -0.2, -0.7, -0.8, -0.3, 0.2, 0.7)


def transform_whole_character(image: Image.Image, y_offset: int, angle: float) -> Image.Image:
    rotated = image.rotate(
        angle,
        resample=Image.Resampling.BICUBIC,
        center=(256, 420),
        fillcolor=(0, 0, 0, 0),
    )
    canvas = Image.new("RGBA", image.size, (0, 0, 0, 0))
    canvas.alpha_composite(rotated, (0, y_offset))
    return canvas


def premultiply(image: Image.Image) -> np.ndarray:
    rgba = np.asarray(image.convert("RGBA"), dtype=np.float32) / 255.0
    rgba[..., :3] *= rgba[..., 3:4]
    return rgba


def unpremultiply(array: np.ndarray) -> Image.Image:
    array = np.clip(array, 0.0, 1.0)
    alpha = array[..., 3:4]
    rgb = np.divide(array[..., :3], alpha, out=np.zeros_like(array[..., :3]), where=alpha > 0.002)
    rgba = np.concatenate((rgb, alpha), axis=2)
    return Image.fromarray(np.round(rgba * 255).astype(np.uint8), "RGBA")


def optical_midpoint(first: Image.Image, second: Image.Image) -> Image.Image:
    first_pm = premultiply(first)
    second_pm = premultiply(second)
    first_gray = cv2.cvtColor(np.round(first_pm[..., :3] * 255).astype(np.uint8), cv2.COLOR_RGB2GRAY)
    second_gray = cv2.cvtColor(np.round(second_pm[..., :3] * 255).astype(np.uint8), cv2.COLOR_RGB2GRAY)

    forward = cv2.calcOpticalFlowFarneback(first_gray, second_gray, None, 0.5, 5, 25, 5, 7, 1.5, 0)
    backward = cv2.calcOpticalFlowFarneback(second_gray, first_gray, None, 0.5, 5, 25, 5, 7, 1.5, 0)
    height, width = first_gray.shape
    grid_x, grid_y = np.meshgrid(np.arange(width, dtype=np.float32), np.arange(height, dtype=np.float32))

    first_warped = cv2.remap(
        first_pm,
        grid_x - 0.5 * forward[..., 0],
        grid_y - 0.5 * forward[..., 1],
        cv2.INTER_CUBIC,
        borderMode=cv2.BORDER_CONSTANT,
        borderValue=0,
    )
    second_warped = cv2.remap(
        second_pm,
        grid_x - 0.5 * backward[..., 0],
        grid_y - 0.5 * backward[..., 1],
        cv2.INTER_CUBIC,
        borderMode=cv2.BORDER_CONSTANT,
        borderValue=0,
    )
    return unpremultiply((first_warped + second_warped) * 0.5)


def main() -> None:
    parser = argparse.ArgumentParser(description="Add whole-body weight motion and optical-flow in-betweens.")
    parser.add_argument("input_dir", type=Path)
    parser.add_argument("output_dir", type=Path)
    args = parser.parse_args()

    paths = sorted(args.input_dir.glob("frame-*.png"))
    if len(paths) != 8:
        raise ValueError(f"Expected 8 source frames, found {len(paths)}")

    keys = [
        transform_whole_character(Image.open(path).convert("RGBA"), BOB_Y[index], LEAN_DEGREES[index])
        for index, path in enumerate(paths)
    ]
    output_frames: list[Image.Image] = []
    for index, key in enumerate(keys):
        following = keys[(index + 1) % len(keys)]
        output_frames.append(key)
        output_frames.append(optical_midpoint(key, following))

    args.output_dir.mkdir(parents=True, exist_ok=True)
    for index, frame in enumerate(output_frames):
        frame.save(args.output_dir / f"frame-{index:03d}.png", "PNG", optimize=True)
    print(f"Wrote {len(output_frames)} smoothed frames")


if __name__ == "__main__":
    main()
