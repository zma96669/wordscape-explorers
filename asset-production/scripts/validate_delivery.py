from __future__ import annotations

import csv
import json
import re
import wave
from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[2]
EXPECTED_SFX = {
    "click.wav", "mark.wav", "route.wav", "undo.wav", "move.wav", "collect.wav",
    "tool.wav", "complete.wav", "chest.wav", "reward.wav", "rare.wav",
    "exchange.wav", "series-complete.wav",
}
EXPECTED_SHOWCASE = {"concept-cover.png", "camp.png", "board.png", "chest.png", "collection.png"}


def validate_animations(errors: list[str], report: dict) -> None:
    manifest = json.loads((ROOT / "assets/motion/animation-manifest.json").read_text(encoding="utf-8"))
    entries = {**manifest["explorer"], **manifest["collectibles"]}
    frame_total = 0
    for name, entry in entries.items():
        directory = (ROOT / "play" / entry["path"]).resolve()
        frames = sorted(directory.glob("frame-*.png"))
        frame_total += len(frames)
        if not entry["ready"]:
            errors.append(f"Animation is not ready: {name}")
        if len(frames) != entry["frameCount"]:
            errors.append(f"{name}: expected {entry['frameCount']} frames, found {len(frames)}")
        for frame in frames:
            image = Image.open(frame)
            if image.size != (512, 512) or image.mode != "RGBA":
                errors.append(f"{frame}: expected 512x512 RGBA, got {image.size} {image.mode}")
                continue
            minimum, maximum = image.getchannel("A").getextrema()
            if minimum != 0:
                errors.append(f"{frame}: transparent background is missing")
            if frame == frames[-1] and maximum != 255:
                errors.append(f"{frame}: final reveal frame is not fully visible")
    report["animations"] = {"groups": len(entries), "frames": frame_total, "ready": sum(e["ready"] for e in entries.values())}


def validate_audio(errors: list[str], report: dict) -> None:
    with (ROOT / "assets/content/voice-script.csv").open(encoding="utf-8-sig", newline="") as handle:
        rows = list(csv.DictReader(handle))
    voice_files = []
    for row in rows:
        path = ROOT / row["planned_path"]
        if not path.exists() or path.stat().st_size <= 512:
            errors.append(f"Missing or invalid voice file: {row['planned_path']}")
        else:
            voice_files.append(path)

    music_files = sorted((ROOT / "assets/audio/music").glob("*.wav"))
    if {path.name for path in music_files} != {"camp-loop.wav", "explore-loop.wav"}:
        errors.append("Expected camp-loop.wav and explore-loop.wav")
    for path in music_files:
        with wave.open(str(path)) as audio:
            if audio.getnchannels() != 2 or audio.getframerate() != 32_000 or audio.getnframes() <= 0:
                errors.append(f"Invalid music WAV: {path}")

    sfx_files = sorted((ROOT / "assets/audio/sfx").glob("*.wav"))
    if {path.name for path in sfx_files} != EXPECTED_SFX:
        errors.append("The operation sound-effect set is incomplete")
    for path in sfx_files:
        with wave.open(str(path)) as audio:
            if audio.getnchannels() not in {1, 2} or audio.getframerate() < 22_050 or audio.getnframes() <= 0:
                errors.append(f"Invalid sound-effect WAV: {path}")
    report["audio"] = {
        "voiceFiles": len(voice_files),
        "musicFiles": len(music_files),
        "soundEffectFiles": len(sfx_files),
    }


def validate_manifest(errors: list[str], report: dict) -> None:
    path = ROOT / "asset-production/asset-manifest.json"
    manifest = json.loads(path.read_text(encoding="utf-8"))
    missing = []
    incomplete = []
    for asset in manifest["assets"]:
        status = asset["status"]
        if status == "not_required_text_based_gameplay":
            continue
        target = ROOT / asset["plannedPath"]
        if not target.exists():
            missing.append(asset["id"])
        if not status.startswith("complete_runtime"):
            incomplete.append(asset["id"])
    if manifest.get("status") != "ready_for_delivery":
        errors.append("Asset manifest is not marked ready_for_delivery")
    if missing:
        errors.append(f"Manifest paths are missing: {', '.join(missing)}")
    if incomplete:
        errors.append(f"Manifest entries are incomplete: {', '.join(incomplete)}")
    report["manifest"] = {
        "entries": len(manifest["assets"]),
        "missing": len(missing),
        "notRequired": sum(a["status"] == "not_required_text_based_gameplay" for a in manifest["assets"]),
    }


def validate_showcase(errors: list[str], report: dict) -> None:
    directory = ROOT / "assets/showcase"
    existing = {path.name for path in directory.glob("*.png")}
    missing = sorted(EXPECTED_SHOWCASE - existing)
    if missing:
        errors.append(f"Missing showcase images: {', '.join(missing)}")
    dimensions = {}
    for name in sorted(EXPECTED_SHOWCASE & existing):
        with Image.open(directory / name) as image:
            dimensions[name] = list(image.size)
            if image.width < 400 or image.height < 600:
                errors.append(f"Showcase image is too small: {name} {image.size}")
    report["showcase"] = {"files": len(existing), "required": len(EXPECTED_SHOWCASE), "dimensions": dimensions}


def validate_runtime_references(errors: list[str], report: dict) -> None:
    sources = [ROOT / "play/index.html", ROOT / "play/game.css", ROOT / "play/game.js"]
    pattern = re.compile(r"(?:src=|url\(|new Audio\(|:\s*)[\"']?(\.\./assets/[^\"')`]+)")
    checked: set[Path] = set()
    for source in sources:
        text = source.read_text(encoding="utf-8")
        for match in pattern.finditer(text):
            reference = match.group(1)
            if "${" in reference or "`" in reference:
                continue
            path = (source.parent / reference).resolve()
            checked.add(path)
            if not path.exists():
                errors.append(f"Missing runtime reference in {source.name}: {reference}")
    report["runtimeReferences"] = {"staticFilesChecked": len(checked)}


def main() -> None:
    errors: list[str] = []
    report: dict = {"result": "passed"}
    validate_animations(errors, report)
    validate_audio(errors, report)
    validate_manifest(errors, report)
    validate_showcase(errors, report)
    validate_runtime_references(errors, report)
    report["errors"] = errors
    if errors:
        report["result"] = "failed"
    output = ROOT / "asset-production/reports/delivery-validation.json"
    output.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(report, ensure_ascii=False, indent=2))
    if errors:
        raise SystemExit(1)


if __name__ == "__main__":
    main()
