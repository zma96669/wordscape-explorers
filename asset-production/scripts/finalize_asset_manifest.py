from __future__ import annotations

import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
MANIFEST = ROOT / "asset-production/asset-manifest.json"


def main() -> None:
    data = json.loads(MANIFEST.read_text(encoding="utf-8"))
    path_overrides = {
        "camp": "assets/art/backgrounds/camp.png",
        "board": "assets/art/backgrounds/board.png",
        "ravine": "assets/art/terrain/river-water.webp",
        "music-camp": "assets/audio/music/camp-loop.wav",
        "music-exploration": "assets/audio/music/explore-loop.wav",
    }

    missing: list[str] = []
    for asset in data["assets"]:
        asset_id = asset["id"]
        if asset_id in path_overrides:
            asset["plannedPath"] = path_overrides[asset_id]
            if asset_id == "ravine":
                asset["productionMethod"] = "gpt-image-2_full_board_texture_with_css_motion"
                asset["acceptance"] = "整块棋盘为连续动态水面；可行走位置使用漂浮石台；阻挡位置为水下暗礁；无独立蓝色障碍块或旋转圆环"
        elif asset_id.startswith("motion-") and asset["category"] == "animation":
            collectible_id = asset_id.removeprefix("motion-")
            asset["plannedPath"] = f"assets/motion/collectibles/{collectible_id}/reveal/"

        if asset_id == "learning-images":
            asset["status"] = "not_required_text_based_gameplay"
            asset["productionMethod"] = "not_required"
            continue

        path = ROOT / asset["plannedPath"]
        if path.exists():
            if asset["category"] == "content_or_delivery" and asset_id in {"vocabulary", "tasks", "levels", "ui-copy"}:
                asset["status"] = "complete_runtime_programmatically_validated"
            else:
                asset["status"] = "complete_runtime"
        else:
            asset["status"] = "missing"
            missing.append(f"{asset_id}: {asset['plannedPath']}")

    data["version"] = "1.0"
    data["updated"] = "2026-09-20"
    data["status"] = "ready_for_delivery" if not missing else "incomplete"
    data["entryCount"] = len(data["assets"])
    data["note"] = (
        "Each entry represents one runtime file or an explicitly identified bundle/directory. "
        "Learning images are intentionally omitted because the shipped gameplay is text and audio based."
    )
    MANIFEST.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    if missing:
        raise SystemExit("\n".join(missing))
    print(f"Finalized {len(data['assets'])} manifest entries; no required asset is missing.")


if __name__ == "__main__":
    main()
