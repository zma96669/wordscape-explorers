from __future__ import annotations

import argparse
import csv
import os
import threading
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path

from openai import OpenAI


ROOT = Path(__file__).resolve().parents[2]
CSV_PATH = ROOT / "assets" / "content" / "voice-script.csv"
LOCK = threading.Lock()


def synthesize(row: dict[str, str], model: str, voice: str, force: bool) -> tuple[str, str]:
    output_path = ROOT / row["planned_path"]
    if output_path.exists() and output_path.stat().st_size > 512 and not force:
        return row["id"], "skipped"

    output_path.parent.mkdir(parents=True, exist_ok=True)
    instructions = (
        "Speak in clear, warm American English for children aged 8 to 12. "
        "Use a natural teaching pace, accurate pronunciation, and a friendly calm tone. "
        "Read only the supplied text. Do not add an introduction or explanation."
    )
    last_error: Exception | None = None
    for attempt in range(1, 4):
        try:
            client = OpenAI(
                api_key=os.environ["OPENAI_API_KEY"],
                base_url=os.environ["OPENAI_BASE_URL"],
                timeout=120,
            )
            response = client.audio.speech.create(
                model=model,
                voice=voice,
                input=row["text"],
                instructions=instructions,
                response_format="mp3",
            )
            output_path.write_bytes(response.content)
            if output_path.stat().st_size <= 512:
                raise RuntimeError("Returned audio file is unexpectedly small")
            return row["id"], "generated"
        except Exception as error:  # noqa: BLE001
            last_error = error
            if attempt < 3:
                time.sleep(attempt * 2)
    raise RuntimeError(f"{row['id']}: {last_error}")


def main() -> None:
    parser = argparse.ArgumentParser(description="Generate all English voice assets from voice-script.csv.")
    parser.add_argument("--model", default="gpt-4o-mini-tts")
    parser.add_argument("--voice", default="coral")
    parser.add_argument("--concurrency", type=int, default=4)
    parser.add_argument("--limit", type=int, default=0)
    parser.add_argument("--force", action="store_true")
    args = parser.parse_args()

    if not os.environ.get("OPENAI_API_KEY") or not os.environ.get("OPENAI_BASE_URL"):
        raise SystemExit("OPENAI_API_KEY and OPENAI_BASE_URL are required")

    with CSV_PATH.open("r", encoding="utf-8-sig", newline="") as handle:
        rows = list(csv.DictReader(handle))
    if args.limit > 0:
        rows = rows[: args.limit]

    completed = 0
    generated = 0
    skipped = 0
    failures: list[str] = []
    with ThreadPoolExecutor(max_workers=max(1, args.concurrency)) as executor:
        futures = {
            executor.submit(synthesize, row, args.model, args.voice, args.force): row
            for row in rows
        }
        for future in as_completed(futures):
            row = futures[future]
            completed += 1
            try:
                item_id, status = future.result()
                generated += status == "generated"
                skipped += status == "skipped"
                with LOCK:
                    print(f"[{completed}/{len(rows)}] {status}: {item_id}", flush=True)
            except Exception as error:  # noqa: BLE001
                failures.append(f"{row['id']}: {error}")
                with LOCK:
                    print(f"[{completed}/{len(rows)}] failed: {row['id']} — {error}", flush=True)

    print(f"Generated {generated}, skipped {skipped}, failed {len(failures)}")
    if failures:
        raise SystemExit("\n".join(failures))


if __name__ == "__main__":
    main()
