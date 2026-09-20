const fs = require("fs");
const path = require("path");

const SAMPLE_RATE = 44100;
const OUTPUT_DIR = path.resolve(__dirname, "../../assets/audio/sfx");

function seededNoise(seed = 123456789) {
  let value = seed >>> 0;
  return () => {
    value = (1664525 * value + 1013904223) >>> 0;
    return value / 0xffffffff * 2 - 1;
  };
}

function envelope(time, duration, attack = 0.008, release = 0.08) {
  const fadeIn = Math.min(1, time / Math.max(attack, 0.001));
  const fadeOut = Math.min(1, (duration - time) / Math.max(release, 0.001));
  return Math.max(0, Math.min(fadeIn, fadeOut));
}

function makeBuffer(duration) {
  return new Float64Array(Math.ceil(duration * SAMPLE_RATE));
}

function addTone(buffer, options) {
  const {
    start = 0,
    duration,
    frequency,
    endFrequency = frequency,
    gain = 0.25,
    type = "sine",
    attack = 0.008,
    release = 0.08
  } = options;
  const startSample = Math.floor(start * SAMPLE_RATE);
  const length = Math.floor(duration * SAMPLE_RATE);
  let phase = 0;
  for (let i = 0; i < length && startSample + i < buffer.length; i += 1) {
    const t = i / SAMPLE_RATE;
    const progress = i / Math.max(1, length - 1);
    const hz = frequency + (endFrequency - frequency) * progress;
    phase += Math.PI * 2 * hz / SAMPLE_RATE;
    let wave = Math.sin(phase);
    if (type === "triangle") wave = 2 / Math.PI * Math.asin(wave);
    if (type === "wood") wave = Math.sin(phase) * .72 + Math.sin(phase * 2.03) * .2 + Math.sin(phase * 3.97) * .08;
    buffer[startSample + i] += wave * gain * envelope(t, duration, attack, release);
  }
}

function addNoise(buffer, options) {
  const { start = 0, duration, gain = 0.08, attack = 0.003, release = 0.08, seed = 1 } = options;
  const random = seededNoise(seed);
  const startSample = Math.floor(start * SAMPLE_RATE);
  const length = Math.floor(duration * SAMPLE_RATE);
  let smooth = 0;
  for (let i = 0; i < length && startSample + i < buffer.length; i += 1) {
    const t = i / SAMPLE_RATE;
    smooth = smooth * .82 + random() * .18;
    buffer[startSample + i] += smooth * gain * envelope(t, duration, attack, release);
  }
}

function normalize(buffer, peak = 0.72) {
  let max = 0;
  for (const value of buffer) max = Math.max(max, Math.abs(value));
  if (!max) return buffer;
  const multiplier = Math.min(1, peak / max);
  for (let i = 0; i < buffer.length; i += 1) buffer[i] *= multiplier;
  return buffer;
}

function wavBuffer(samples) {
  const dataLength = samples.length * 2;
  const output = Buffer.alloc(44 + dataLength);
  output.write("RIFF", 0);
  output.writeUInt32LE(36 + dataLength, 4);
  output.write("WAVE", 8);
  output.write("fmt ", 12);
  output.writeUInt32LE(16, 16);
  output.writeUInt16LE(1, 20);
  output.writeUInt16LE(1, 22);
  output.writeUInt32LE(SAMPLE_RATE, 24);
  output.writeUInt32LE(SAMPLE_RATE * 2, 28);
  output.writeUInt16LE(2, 32);
  output.writeUInt16LE(16, 34);
  output.write("data", 36);
  output.writeUInt32LE(dataLength, 40);
  for (let i = 0; i < samples.length; i += 1) {
    const value = Math.max(-1, Math.min(1, samples[i]));
    output.writeInt16LE(Math.round(value * 32767), 44 + i * 2);
  }
  return output;
}

function sound(duration, build) {
  const buffer = makeBuffer(duration);
  build(buffer);
  return wavBuffer(normalize(buffer));
}

const sounds = {
  "click.wav": sound(.08, (b) => {
    addTone(b, { duration: .075, frequency: 230, endFrequency: 165, gain: .35, type: "wood", release: .06 });
    addNoise(b, { duration: .045, gain: .05, release: .04, seed: 11 });
  }),
  "mark.wav": sound(.15, (b) => {
    addTone(b, { duration: .09, frequency: 520, gain: .22, type: "triangle", release: .06 });
    addTone(b, { start: .055, duration: .095, frequency: 660, gain: .23, type: "triangle", release: .07 });
  }),
  "route.wav": sound(.12, (b) => {
    addTone(b, { duration: .1, frequency: 390, endFrequency: 330, gain: .2, type: "wood", release: .08 });
    addNoise(b, { duration: .035, gain: .03, release: .03, seed: 23 });
  }),
  "undo.wav": sound(.15, (b) => {
    addTone(b, { duration: .15, frequency: 540, endFrequency: 300, gain: .23, type: "triangle", release: .06 });
  }),
  "move.wav": sound(.10, (b) => {
    addTone(b, { duration: .09, frequency: 145, endFrequency: 95, gain: .28, type: "wood", release: .07 });
    addNoise(b, { duration: .055, gain: .055, release: .05, seed: 31 });
  }),
  "collect.wav": sound(.25, (b) => {
    addTone(b, { duration: .14, frequency: 440, endFrequency: 540, gain: .2, type: "triangle", release: .08 });
    addTone(b, { start: .09, duration: .16, frequency: 660, gain: .22, type: "triangle", release: .12 });
  }),
  "tool.wav": sound(.35, (b) => {
    addNoise(b, { duration: .28, gain: .085, attack: .06, release: .12, seed: 47 });
    addTone(b, { start: .22, duration: .12, frequency: 310, endFrequency: 240, gain: .18, type: "wood", release: .08 });
  }),
  "complete.wav": sound(.70, (b) => {
    addTone(b, { start: 0, duration: .28, frequency: 523.25, gain: .22, type: "wood", release: .18 });
    addTone(b, { start: .16, duration: .30, frequency: 659.25, gain: .22, type: "wood", release: .2 });
    addTone(b, { start: .34, duration: .36, frequency: 783.99, gain: .24, type: "triangle", release: .28 });
  }),
  "chest.wav": sound(.60, (b) => {
    addTone(b, { duration: .16, frequency: 185, endFrequency: 125, gain: .3, type: "wood", release: .12 });
    addNoise(b, { duration: .12, gain: .06, release: .1, seed: 59 });
    addTone(b, { start: .22, duration: .32, frequency: 740, gain: .11, type: "triangle", release: .25 });
    addTone(b, { start: .32, duration: .28, frequency: 990, gain: .09, type: "triangle", release: .24 });
  }),
  "reward.wav": sound(.55, (b) => {
    addTone(b, { duration: .34, frequency: 659.25, gain: .2, type: "triangle", release: .26 });
    addTone(b, { start: .13, duration: .42, frequency: 880, gain: .18, type: "triangle", release: .32 });
  }),
  "rare.wav": sound(1.10, (b) => {
    [523.25, 659.25, 783.99, 1046.5].forEach((frequency, index) => {
      addTone(b, { start: index * .16, duration: .52, frequency, gain: .15, type: "triangle", release: .4 });
    });
    addNoise(b, { start: .3, duration: .65, gain: .025, attack: .2, release: .35, seed: 71 });
  }),
  "exchange.wav": sound(.45, (b) => {
    addTone(b, { duration: .18, frequency: 440, gain: .2, type: "wood", release: .12 });
    addTone(b, { start: .12, duration: .33, frequency: 698.46, gain: .19, type: "triangle", release: .26 });
  }),
  "series-complete.wav": sound(1.30, (b) => {
    [392, 523.25, 659.25, 783.99, 1046.5].forEach((frequency, index) => {
      addTone(b, { start: index * .17, duration: .48, frequency, gain: .16, type: index < 3 ? "wood" : "triangle", release: .35 });
    });
  })
};

fs.mkdirSync(OUTPUT_DIR, { recursive: true });
for (const [name, data] of Object.entries(sounds)) {
  fs.writeFileSync(path.join(OUTPUT_DIR, name), data);
}
console.log(`Generated ${Object.keys(sounds).length} procedural WAV files in ${OUTPUT_DIR}`);
