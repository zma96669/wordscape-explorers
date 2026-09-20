from __future__ import annotations

import math
import random
import wave
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
OUTPUT = ROOT / "assets" / "audio" / "music"
RATE = 32_000
DURATION = 24.0


def midi(note: int) -> float:
    return 440.0 * 2 ** ((note - 69) / 12)


def soft_tone(frequency: float, time_in_note: float, note_duration: float) -> float:
    attack = min(1.0, time_in_note / 0.08)
    release = min(1.0, max(0.0, (note_duration - time_in_note) / 0.22))
    envelope = attack * release
    fundamental = math.sin(math.tau * frequency * time_in_note)
    overtone = 0.22 * math.sin(math.tau * frequency * 2 * time_in_note)
    return envelope * (fundamental + overtone)


def render(path: Path, bpm: int, chords: list[tuple[int, int, int]], melody: list[int], seed: int) -> None:
    rng = random.Random(seed)
    beat = 60 / bpm
    total_samples = round(DURATION * RATE)
    frames = bytearray()
    melody_step = beat / 2

    for sample_index in range(total_samples):
        t = sample_index / RATE
        beat_index = int(t / beat)
        chord = chords[(beat_index // 4) % len(chords)]
        value = 0.0
        for voice_index, note in enumerate(chord):
            value += 0.075 * math.sin(math.tau * midi(note) * t + voice_index * 0.17)

        melody_index = int(t / melody_step) % len(melody)
        local_time = t % melody_step
        note = melody[melody_index]
        if note:
            value += 0.11 * soft_tone(midi(note), local_time, melody_step)

        pulse = (t % beat) / beat
        value += 0.025 * math.exp(-pulse * 15) * math.sin(math.tau * 92 * t)
        shimmer = math.sin(math.tau * 0.08 * t) * math.sin(math.tau * (1200 + 40 * math.sin(t)) * t)
        value += 0.006 * shimmer + rng.uniform(-0.0012, 0.0012)

        fade = min(1.0, t / 0.35, (DURATION - t) / 0.35)
        sample = max(-1.0, min(1.0, value * fade))
        pcm = int(sample * 32767)
        frames.extend(pcm.to_bytes(2, "little", signed=True))
        frames.extend(pcm.to_bytes(2, "little", signed=True))

    path.parent.mkdir(parents=True, exist_ok=True)
    with wave.open(str(path), "wb") as output:
        output.setnchannels(2)
        output.setsampwidth(2)
        output.setframerate(RATE)
        output.writeframes(frames)


def main() -> None:
    render(
        OUTPUT / "camp-loop.wav",
        84,
        [(60, 64, 67), (57, 60, 64), (53, 57, 60), (55, 59, 62)],
        [72, 0, 76, 0, 79, 76, 74, 0, 72, 0, 69, 0, 67, 69, 71, 0],
        20260920,
    )
    render(
        OUTPUT / "explore-loop.wav",
        104,
        [(57, 60, 64), (55, 59, 62), (53, 57, 60), (55, 59, 64)],
        [69, 72, 76, 72, 71, 74, 79, 74, 69, 72, 77, 72, 67, 71, 74, 71],
        20260921,
    )
    print("Generated camp-loop.wav and explore-loop.wav")


if __name__ == "__main__":
    main()
