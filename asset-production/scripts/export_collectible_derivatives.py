from pathlib import Path
from PIL import Image, ImageChops, ImageOps, ImageStat
import json

ROOT = Path(r"D:\xueli_code\bisai\game")
SRC_ROOT = ROOT / "assets" / "art" / "collectibles"
RUNTIME_ROOT = ROOT / "assets" / "art" / "collectibles"
THUMB_ROOT = ROOT / "assets" / "art" / "thumbnails"
SIL_ROOT = ROOT / "assets" / "art" / "silhouettes"

ITEMS = [
    ("dinosaur", "triceratops"),
    ("dinosaur", "stegosaurus"),
    ("dinosaur", "pterosaur"),
    ("dinosaur", "dinosaur-egg"),
    ("dinosaur", "fossil-display"),
    ("dinosaur", "little-tyrannosaurus"),
    ("space", "rocket"),
    ("space", "moon-rover"),
    ("space", "satellite"),
    ("space", "space-helmet"),
    ("space", "planet-model"),
    ("space", "star-robot"),
    ("ocean", "sea-turtle"),
    ("ocean", "clownfish"),
    ("ocean", "octopus"),
    ("ocean", "shell-house"),
    ("ocean", "submarine"),
    ("ocean", "little-whale"),
]


def fit_square(im: Image.Image, size: int) -> Image.Image:
    im = im.convert("RGBA")
    canvas = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    fitted = ImageOps.contain(im, (size, size), Image.Resampling.LANCZOS)
    x = (size - fitted.width) // 2
    y = (size - fitted.height) // 2
    canvas.paste(fitted, (x, y), fitted)
    return canvas


def silhouette(im: Image.Image, size: int) -> Image.Image:
    square = fit_square(im, size)
    alpha = square.getchannel("A")
    navy = Image.new("RGBA", square.size, (36, 54, 75, 255))
    out = Image.new("RGBA", square.size, (0, 0, 0, 0))
    out.paste(navy, mask=alpha)
    return out


def inspect_alpha(path: Path) -> dict:
    with Image.open(path) as im:
        im = im.convert("RGBA")
        extrema = im.getchannel("A").getextrema()
        corners = [im.getpixel(p)[3] for p in [(0, 0), (im.width - 1, 0), (0, im.height - 1), (im.width - 1, im.height - 1)]]
        return {
            "size": [im.width, im.height],
            "alphaRange": list(extrema),
            "cornerAlpha": corners,
            "transparent": extrema[0] < 255,
        }


def export_one(series: str, name: str) -> dict:
    src = SRC_ROOT / series / f"{name}.png"
    record = {"id": name, "series": series, "src": str(src.relative_to(ROOT)).replace("\\", "/")}
    if not src.exists():
        record["status"] = "missing"
        return record
    try:
        with Image.open(src) as im:
            src_info = inspect_alpha(src)
            if not src_info["transparent"]:
                record["status"] = "failed"
                record["reason"] = "source_has_no_transparency"
                record["source"] = src_info
                return record
            runtime = fit_square(im, 512)
            thumb = fit_square(im, 256)
            sil = silhouette(im, 256)
        runtime_path = RUNTIME_ROOT / series / f"{name}.webp"
        thumb_path = THUMB_ROOT / f"{name}.webp"
        sil_path = SIL_ROOT / f"{name}.webp"
        runtime.save(runtime_path, "WEBP", quality=90, method=6)
        thumb.save(thumb_path, "WEBP", quality=90, method=6)
        sil.save(sil_path, "WEBP", quality=90, method=6)
        record.update({
            "status": "ok",
            "source": src_info,
            "runtime": str(runtime_path.relative_to(ROOT)).replace("\\", "/"),
            "thumbnail": str(thumb_path.relative_to(ROOT)).replace("\\", "/"),
            "silhouette": str(sil_path.relative_to(ROOT)).replace("\\", "/"),
        })
        return record
    except Exception as exc:
        record["status"] = "failed"
        record["reason"] = str(exc)
        return record


def main() -> None:
    THUMB_ROOT.mkdir(parents=True, exist_ok=True)
    SIL_ROOT.mkdir(parents=True, exist_ok=True)
    records = [export_one(series, name) for series, name in ITEMS]
    report = {
        "ok": sum(1 for r in records if r["status"] == "ok"),
        "missing": [r["id"] for r in records if r["status"] == "missing"],
        "failed": [r for r in records if r["status"] == "failed"],
        "items": records,
    }
    out = ROOT / "asset-production" / "scripts" / "collectible-export-report.json"
    out.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps({k: report[k] for k in ("ok", "missing", "failed")}, ensure_ascii=False))


if __name__ == "__main__":
    main()
