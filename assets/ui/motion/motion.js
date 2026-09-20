
const durations = {
  press: 100,
  mark: 160,
  route: 180,
  move: 280,
  fly: 300,
  correct: 220,
  revise: 350,
  bridge: 300,
  compass: 500,
  complete: 600,
  chest: 1200,
  common: 700,
  rare: 1400,
  convert: 700,
  exchange: 700,
  series: 1500
};

const listeners = [];
export function onMotionEvent(fn) { listeners.push(fn); }
function emit(name) { listeners.forEach((fn) => fn(name)); }

export function reduced() {
  return document.documentElement.classList.contains("wx-reduced")
    || window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function play(name, el) {
  emit(name);
  if (reduced() || document.documentElement.classList.contains("wx-skip")) return Promise.resolve(name);
  el.classList.remove("wx-anim");
  void el.offsetWidth;
  el.classList.add("wx-anim");
  el.style.animation = "none";
  const map = {
    press: `press ${durations.press}ms ease`,
    mark: `pop ${durations.mark}ms ease`,
    route: `draw ${durations.route}ms ease`,
    move: `step ${durations.move}ms ease`,
    fly: `fly ${durations.fly}ms ease`,
    correct: `pop ${durations.correct}ms ease`,
    revise: `shake ${durations.revise}ms ease`,
    bridge: `pop ${durations.bridge}ms ease`,
    compass: `pop ${durations.compass}ms ease`,
    complete: `settle ${durations.complete}ms ease`,
    chest: `lid ${durations.chest}ms ease`,
    common: `glow ${durations.common}ms ease`,
    rare: `glow ${durations.rare}ms ease`,
    convert: `pop ${durations.convert}ms ease`,
    exchange: `pop ${durations.exchange}ms ease`,
    series: `settle ${durations.series}ms ease`
  };
  el.style.animation = map[name] || `pop 300ms ease`;
  return new Promise((resolve) => setTimeout(() => resolve(name), durations[name] || 300));
}

export function skipNext() { document.documentElement.classList.add("wx-skip"); }
export function clearSkip() { document.documentElement.classList.remove("wx-skip"); }
export function setReduced(on) { document.documentElement.classList.toggle("wx-reduced", on); }
export { durations };
