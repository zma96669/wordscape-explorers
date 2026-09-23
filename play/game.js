const TILE = {
  start: "../assets/ui/game/floating-platform-start.svg",
  path: "../assets/ui/game/floating-platform.svg",
  "path-h": "../assets/ui/game/floating-platform.svg",
  "path-cross": "../assets/ui/game/floating-platform.svg",
  ground: "../assets/ui/game/floating-platform.svg",
  exit: "../assets/ui/game/floating-platform-exit.svg"
};

const state = {
  level: null,
  taskIndex: 0,
  doneTasks: {},
  pos: { x: 0, y: 0 },
  route: [],
  moving: false,
  moveEpoch: 0,
  actorAction: "idle",
  actorFacing: "right",
  actorTimer: 0,
  cellEffect: null,
  cellEffectTimer: 0,
  voice: true,
  hintLevel: 0,
  levelMode: "tutorial",
  currentLevelIndex: -1,
  foundExploration: false,
  runRewardGranted: false,
  selectedSeries: null,
  seriesReturnScreen: "result",
  pendingReward: null,
  chestOpening: false,
  exchangeCandidate: null,
  motionManifest: null,
  pawnFrameTimer: 0,
  pawnFrameAction: "",
  pawnFrameIndex: 0,
  rewardFrameTimer: 0,
  treasure: null,
  transitioning: false,
  profile: null
};

const PROFILE_KEY = "wordQuestProfileV1";
let narrationAudio = null;
let musicAudio = null;
let musicTrack = "";
const motionPreloadPromises = new Map();
const SERIES = {
  dinosaur: { nameZh: "恐龙探索", icon: "../assets/ui/series/dinosaur-icon.svg" },
  space: { nameZh: "太空旅行", icon: "../assets/ui/series/space-icon.svg" },
  ocean: { nameZh: "海洋奇遇", icon: "../assets/ui/series/ocean-icon.svg" }
};

const WORD_BANK = Object.fromEntries([
  ["rabbit", "兔子", "An animal with long ears that can hop."],
  ["tiger", "老虎", "A large wild cat with dark stripes."],
  ["turtle", "龟", "An animal with a hard shell on its back."],
  ["fish", "鱼", "An animal with fins that lives in water."],
  ["bird", "鸟", "An animal with feathers and a beak."],
  ["dog", "狗", "An animal that can bark."],
  ["cat", "猫", "An animal that can meow."],
  ["umbrella", "雨伞", "Something you hold over your head in the rain."],
  ["raincoat", "雨衣", "A coat you wear to keep dry in the rain."],
  ["coat", "外套", "Clothing you wear over other clothes."],
  ["hat", "帽子", "Something you wear on your head."],
  ["shoes", "鞋", "Things you wear on your feet."],
  ["bag", "包", "Something you use to carry your things."],
  ["book", "书", "A set of pages you can read."],
  ["pencil", "铅笔", "Something you write with."],
  ["chair", "椅子", "A seat for one person."],
  ["table", "桌子", "Furniture with a flat top."],
  ["bed", "床", "Furniture you sleep in."],
  ["door", "门", "Something you open to enter a room."],
  ["window", "窗户", "An opening with glass that lets light in."],
  ["apple", "苹果", "A round fruit that can be red or green."],
  ["banana", "香蕉", "A long fruit with a yellow skin."],
  ["bread", "面包", "Food made from flour and baked."],
  ["milk", "牛奶", "A white drink that can come from cows."],
  ["run", "跑", "To move quickly on your feet."],
  ["walk", "走", "To move on your feet more slowly than running."],
  ["jump", "跳", "To push yourself off the ground with your legs."],
  ["swim", "游泳", "To move through water using your body."],
  ["fly", "飞", "To move through the air using wings."],
  ["read", "阅读", "To look at written words and understand them."],
  ["write", "写", "To make letters or words."],
  ["eat", "吃", "To put food in your mouth and swallow it."],
  ["drink", "喝", "To take water or another liquid into your mouth."],
  ["sleep", "睡觉", "To rest with your eyes closed."],
  ["open", "打开", "To move a door so people can go through it."],
  ["close", "关上", "To move a door so that it is shut."],
  ["hot", "热的", "Having a high temperature."],
  ["cold", "冷的", "Having a low temperature."],
  ["big", "大的", "Large in size."],
  ["small", "小的", "Little in size."],
  ["long", "长的", "Measuring a large distance end to end."],
  ["short", "短的", "Measuring a small distance end to end."],
  ["happy", "开心的", "Feeling pleased or glad."],
  ["sad", "难过的", "Feeling unhappy."],
  ["clean", "干净的", "Not dirty."],
  ["dirty", "脏的", "Not clean."],
  ["fast", "快的", "Moving quickly."],
  ["slow", "慢的", "Not moving quickly."]
].map(([id, zh, definition]) => [id, { en: id, zh, definition }]));

const VERB_WORDS = new Set(["run", "walk", "jump", "swim", "fly", "read", "write", "eat", "drink", "sleep", "open", "close"]);
const ADJECTIVE_WORDS = new Set(["hot", "cold", "big", "small", "long", "short", "happy", "sad", "clean", "dirty", "fast", "slow"]);

function wordPartOfSpeech(wordId) {
  if (VERB_WORDS.has(wordId)) return "动词";
  if (ADJECTIVE_WORDS.has(wordId)) return "形容词";
  return "名词";
}

const CONTEXT_TASKS = {
  run: ["During the race, I ___ as fast as I can.", "During the race, I blank as fast as I can."],
  walk: ["I ___ slowly to school on foot.", "I blank slowly to school on foot."],
  jump: ["I ___ into the air over the low rope.", "I blank into the air over the low rope."],
  swim: ["Fish ___ in the water.", "Fish blank in the water."],
  fly: ["Birds ___ through the sky.", "Birds blank through the sky."],
  read: ["I ___ a story in my book.", "I blank a story in my book."],
  write: ["I ___ my name with a pencil.", "I blank my name with a pencil."],
  eat: ["I ___ a banana for breakfast.", "I blank a banana for breakfast."],
  drink: ["I ___ a glass of milk.", "I blank a glass of milk."],
  sleep: ["At night, I ___ in my bed until morning.", "At night, I blank in my bed until morning."],
  open: ["Please ___ the closed door so I can come in.", "Please blank the closed door so I can come in."],
  close: ["Please ___ the open door to keep the cold wind out.", "Please blank the open door to keep the cold wind out."],
  hot: ["This soup is too ___ to eat. Let it cool.", "This soup is too blank to eat. Let it cool."],
  cold: ["The ice feels ___ in my hand.", "The ice feels blank in my hand."],
  big: ["This box is too ___ to fit through the small door.", "This box is too blank to fit through the small door."],
  small: ["The shoes are too ___ for my feet. I need a bigger pair.", "The shoes are too blank for my feet. I need a bigger pair."],
  long: ["The rope is too ___. Please cut some off.", "The rope is too blank. Please cut some off."],
  short: ["The rope is too ___ to reach the other side. We need a longer one.", "The rope is too blank to reach the other side. We need a longer one."],
  happy: ["I am ___ because I got a lovely gift.", "I am blank because I got a lovely gift."],
  sad: ["I feel ___ because I lost my favorite toy.", "I feel blank because I lost my favorite toy."],
  clean: ["After washing away all the mud, my hands are ___.", "After washing away all the mud, my hands are blank."],
  dirty: ["My shoes are ___ because they are covered in mud.", "My shoes are blank because they are covered in mud."],
  fast: ["This car is ___. It moves quickly.", "This car is blank. It moves quickly."],
  slow: ["This car is ___. It does not move quickly.", "This car is blank. It does not move quickly."]
};

// 每个任务由“词语 + 题型”组成。任务池按完整任务 ID 去重，
// 这样同一个词可以在不同题型中再次出现，但同一种学习内容不会重复，
// 直到本机上的整池任务都完成后才会开始下一轮复习。
const CONTEXT_TASK_IDS = Object.keys(CONTEXT_TASKS);
const TASK_POOL = [
  ...Object.keys(WORD_BANK).map((wordId) => ({ id: `listen-${wordId}`, wordId, type: "listen" })),
  ...Object.keys(WORD_BANK).map((wordId) => ({ id: `meaning-${wordId}`, wordId, type: "meaning" })),
  ...CONTEXT_TASK_IDS.map((wordId) => ({ id: `context-${wordId}`, wordId, type: "context" }))
];

function shuffle(items) {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(randomUnit() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function selectRoundTasks() {
  let available = TASK_POOL.filter((task) => !state.profile.learnedTasks[task.id]);
  const picked = [];
  if (available.length < 5) {
    // 先把上一轮剩余内容放在本局最前面；只有这些内容全部出现后，
    // 才从新一轮任务池补足本局，确保不会提前跳过尾部任务。
    picked.push(...shuffle(available));
    const carriedIds = new Set(picked.map((task) => task.id));
    state.profile.learnedTasks = {};
    saveProfile();
    available = TASK_POOL.filter((task) => !carriedIds.has(task.id));
  }
  const usedWords = new Set(picked.map((task) => task.wordId));
  for (const task of shuffle(available)) {
    if (usedWords.has(task.wordId)) continue;
    picked.push(task);
    usedWords.add(task.wordId);
    if (picked.length === 5) break;
  }
  // 只有在轮次交界处才可能出现同词不同题型，始终保证每题 ID 唯一。
  if (picked.length < 5) {
    for (const task of shuffle(available)) {
      if (!picked.some((item) => item.id === task.id)) picked.push(task);
      if (picked.length === 5) break;
    }
  }
  return picked.map((task) => makeTask(task.wordId, task.type));
}

function taskFromId(taskId) {
  const definition = TASK_POOL.find((task) => task.id === taskId);
  return definition ? makeTask(definition.wordId, definition.type) : null;
}

function transformPoint(point, symmetryIndex) {
  const [x, y] = point;
  switch (symmetryIndex % 8) {
    case 1: return [3 - x, y];
    case 2: return [x, 3 - y];
    case 3: return [3 - y, x];
    case 4: return [3 - x, 3 - y];
    case 5: return [y, 3 - x];
    case 6: return [y, x];
    case 7: return [3 - y, 3 - x];
    default: return [x, y];
  }
}

function transformTemplate(template, symmetryIndex) {
  return {
    ...template,
    blocked: template.blocked.map((point) => transformPoint(point, symmetryIndex)),
    routes: template.routes.map((route) => route.map((point) => transformPoint(point, symmetryIndex)))
  };
}

const LEVEL_TEMPLATES = [
  { id: "route-east-south-01", difficulty: "简单", blocked: [[1,1],[1,2],[2,2]], routes: [
    [[0,0],[1,0],[2,0],[3,0],[3,1],[3,2],[3,3]], [[0,0],[1,0],[2,0],[2,1],[3,1],[3,2],[3,3]], [[0,0],[0,1],[0,2],[0,3],[1,3],[2,3],[3,3]]
  ] },
  { id: "route-west-south-02", difficulty: "简单", blocked: [[2,1],[2,2],[1,2]], routes: [
    [[0,0],[1,0],[2,0],[3,0],[3,1],[3,2],[3,3]], [[0,0],[1,0],[1,1],[0,1],[0,2],[0,3],[1,3]], [[0,0],[0,1],[1,1],[1,0],[2,0],[3,0],[3,1]]
  ] },
  { id: "route-north-east-03", difficulty: "简单", blocked: [[1,3],[1,1],[2,0]], routes: [
    [[0,0],[0,1],[0,2],[1,2],[2,2],[3,2],[3,3]], [[0,0],[0,1],[0,2],[1,2],[2,2],[3,2],[3,1]], [[0,0],[0,1],[0,2],[1,2],[2,2],[2,3],[3,3]]
  ] },
  { id: "route-west-north-04", difficulty: "简单", blocked: [[3,2],[2,1],[0,1]], routes: [
    [[0,0],[1,0],[1,1],[1,2],[2,2],[2,3],[3,3]], [[0,0],[1,0],[1,1],[1,2],[2,2],[2,3],[1,3]], [[0,0],[1,0],[1,1],[1,2],[0,2],[0,3],[1,3]]
  ] },
  { id: "route-lower-zigzag-05", difficulty: "进阶", blocked: [[1,0],[2,1],[3,0]], routes: [
    [[0,0],[0,1],[1,1],[1,2],[2,2],[3,2],[3,3]], [[0,0],[0,1],[1,1],[1,2],[2,2],[3,2],[3,1]], [[0,0],[0,1],[1,1],[1,2],[2,2],[2,3],[3,3]]
  ] },
  { id: "route-upper-zigzag-06", difficulty: "进阶", blocked: [[2,3],[1,2],[0,3]], routes: [
    [[0,0],[1,0],[2,0],[3,0],[3,1],[2,1],[1,1]], [[0,0],[1,0],[2,0],[3,0],[3,1],[2,1],[2,2]], [[0,0],[1,0],[2,0],[3,0],[3,1],[3,2],[2,2]]
  ] },
  { id: "route-center-turn-07", difficulty: "进阶", blocked: [[0,2],[2,2],[2,3],[3,2]], routes: [
    [[0,0],[1,0],[2,0],[3,0],[3,1],[2,1],[1,1]], [[0,0],[1,0],[2,0],[2,1],[1,1],[1,2],[1,3]], [[0,0],[1,0],[1,1],[2,1],[3,1],[3,0],[2,0]]
  ] },
  { id: "route-center-return-08", difficulty: "进阶", blocked: [[2,0],[3,2],[1,3],[0,3]], routes: [
    [[0,0],[1,0],[1,1],[2,1],[2,2],[1,2],[0,2]], [[0,0],[1,0],[1,1],[2,1],[2,2],[2,3],[3,3]], [[0,0],[1,0],[1,1],[0,1],[0,2],[1,2],[2,2]]
  ] }
];

const LEVEL_CONTENT = [
  { title: "河谷入口", region: "河谷营地", mission: "河水挡住前路，读懂五条英语线索，为小队找出安全路线。", targets: [["raincoat","listen"],["banana","meaning"],["jump","context"]], distractors: ["rabbit","coat","book","run","cold","apple","umbrella"] },
  { title: "溪岸弯道", region: "河谷营地", mission: "沿着溪岸追踪五条单词线索，绕开水流继续前进。", targets: [["rabbit","listen"],["tiger","meaning"],["swim","context"]], distractors: ["dog","cat","fish","bird","turtle","run","fly"] },
  { title: "风鸣高地", region: "河谷营地", mission: "高地的风吹散了路标，用英语线索重新确认探险方向。", targets: [["umbrella","listen"],["bag","meaning"],["walk","context"]], distractors: ["coat","hat","shoes","book","pencil","door","raincoat"] },
  { title: "河谷回营", region: "河谷营地", mission: "黄昏前完成五项辨认任务，带着新发现安全回到营地。", targets: [["apple","listen"],["milk","meaning"],["eat","context"]], distractors: ["banana","bread","drink","book","table","bag","fish"] },
  { title: "迷雾林缘", region: "迷雾遗迹", mission: "雾气遮住了小径，跟随五条英语线索找到森林入口。", targets: [["bird","listen"],["hat","meaning"],["fly","context"]], distractors: ["rabbit","tiger","fish","cat","walk","read","write"] },
  { title: "古树小径", region: "迷雾遗迹", mission: "古树旁留下了一串词语标记，逐一破解并穿过小径。", targets: [["book","listen"],["door","meaning"],["write","context"]], distractors: ["pencil","chair","table","open","close","read","bag"] },
  { title: "遗迹岔路", region: "迷雾遗迹", mission: "岔路上的石牌真假难辨，用五次正确选择确定路线。", targets: [["cold","listen"],["big","meaning"],["fast","context"]], distractors: ["hot","small","slow","long","short","happy","sad"] },
  { title: "星光遗迹", region: "迷雾遗迹", mission: "星光照亮最后一段遗迹，完成线索并把记录带回营地。", targets: [["window","listen"],["bed","meaning"],["sleep","context"]], distractors: ["door","chair","table","clean","dirty","close","read"] }
];

const COLLECTIBLES = [
  ["triceratops", "dinosaur", "三角龙", "Triceratops", "normal", "I have three horns."],
  ["stegosaurus", "dinosaur", "剑龙", "Stegosaurus", "normal", "I have plates on my back."],
  ["pterosaur", "dinosaur", "翼龙", "Pterosaur", "normal", "I can fly."],
  ["dinosaur-egg", "dinosaur", "恐龙蛋", "Dinosaur egg", "normal", "What is inside the egg?"],
  ["fossil-display", "dinosaur", "化石展示台", "Fossil", "normal", "This fossil is very old."],
  ["little-tyrannosaurus", "dinosaur", "小霸王龙", "T. rex", "rare", "I have a long tail."],
  ["rocket", "space", "小火箭", "Rocket", "normal", "My rocket flies into space."],
  ["moon-rover", "space", "月球车", "Moon rover", "normal", "This rover moves on the moon."],
  ["satellite", "space", "卫星", "Satellite", "normal", "The satellite goes around Earth."],
  ["space-helmet", "space", "宇航头盔", "Space helmet", "normal", "This is my space helmet."],
  ["planet-model", "space", "星球摆件", "Planet", "normal", "This planet has rings."],
  ["star-robot", "space", "星际机器人", "Robot", "rare", "Hello! I am your robot friend."],
  ["sea-turtle", "ocean", "海龟", "Sea turtle", "normal", "I swim in the ocean."],
  ["clownfish", "ocean", "小丑鱼", "Clownfish", "normal", "I am a small fish."],
  ["octopus", "ocean", "章鱼", "Octopus", "normal", "I have eight arms."],
  ["shell-house", "ocean", "贝壳屋", "Shell house", "normal", "Welcome to my little house."],
  ["submarine", "ocean", "潜水艇", "Submarine", "normal", "My submarine goes underwater."],
  ["little-whale", "ocean", "小鲸鱼", "Whale", "rare", "I live in the ocean."]
].map(([id, series, nameZh, nameEn, rarity, lineEn]) => ({ id, series, nameZh, nameEn, rarity, lineEn }));

const $ = (id) => document.getElementById(id);
const sfxCache = new Map();
const motionFrameCache = new Map();
const motionExtension = (() => {
  try {
    const canvas = document.createElement("canvas");
    return canvas.toDataURL("image/webp").startsWith("data:image/webp") ? "webp" : "png";
  } catch (_) {
    return "png";
  }
})();
const keyOf = (p) => p.x + "," + p.y;
const same = (a, b) => a.x === b.x && a.y === b.y;
const nonNegativeNumber = (value) => Number.isFinite(Number(value)) ? Math.max(0, Number(value)) : 0;

function loadProfile() {
  try {
    const stored = JSON.parse(localStorage.getItem(PROFILE_KEY));
    if (stored && typeof stored === "object") {
      return {
        stardust: nonNegativeNumber(stored.stardust),
        chests: nonNegativeNumber(stored.chests),
        owned: stored.owned && typeof stored.owned === "object" ? stored.owned : {},
        completedRuns: nonNegativeNumber(stored.completedRuns),
        learnedTasks: stored.learnedTasks && typeof stored.learnedTasks === "object" ? stored.learnedTasks : {},
        activeRun: stored.activeRun && typeof stored.activeRun === "object" ? stored.activeRun : null,
        lastRouteKey: typeof stored.lastRouteKey === "string" ? stored.lastRouteKey : "",
        unlockedLevel: Math.min(8, Math.max(1, nonNegativeNumber(stored.unlockedLevel) || 1)),
        completedLevels: stored.completedLevels && typeof stored.completedLevels === "object" ? stored.completedLevels : {},
        bestSteps: stored.bestSteps && typeof stored.bestSteps === "object" ? stored.bestSteps : {},
        discoveries: stored.discoveries && typeof stored.discoveries === "object" ? stored.discoveries : {}
      };
    }
  } catch (_) {
    // 无法读取本机存储时使用当前会话资料。
  }
  return {
    stardust: 0,
    chests: 0,
    owned: {},
    completedRuns: 0,
    learnedTasks: {},
    activeRun: null,
    lastRouteKey: "",
    unlockedLevel: 1,
    completedLevels: {},
    bestSteps: {},
    discoveries: {}
  };
}

function saveProfile() {
  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(state.profile));
  } catch (_) {
    // 存储失败不阻断当前演示流程。
  }
}

function collectibleArt(item, kind = "runtime") {
  if (kind === "silhouette") return `../assets/art/silhouettes/${item.id}.webp`;
  if (kind === "thumbnail") return `../assets/art/thumbnails/${item.id}.webp`;
  return `../assets/art/collectibles/${item.series}/${item.id}.webp`;
}

function motionFramePath(entry, index) {
  return `${entry.path}/frame-${String(index).padStart(3, "0")}.${motionExtension}`;
}

function preloadMotionEntry(entry) {
  if (!entry || !entry.ready || !entry.frameCount) return Promise.resolve();
  if (motionPreloadPromises.has(entry.path)) return motionPreloadPromises.get(entry.path);
  const pending = Promise.all(Array.from({ length: entry.frameCount }, (_, index) => {
    const path = motionFramePath(entry, index);
    if (motionFrameCache.has(path)) return motionFrameCache.get(path);
    const frame = new Promise((resolve) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => resolve(null);
      image.src = path;
    });
    motionFrameCache.set(path, frame);
    return frame;
  })).then((frames) => {
    entry.loaded = frames.every(Boolean);
    return frames;
  });
  motionPreloadPromises.set(entry.path, pending);
  return pending;
}

function motionEntryLoaded(entry) {
  return Boolean(entry && entry.ready && entry.loaded);
}

function warmBoardMotion() {
  ["idle", "move"].forEach((action) => {
    const entry = explorerMotion(action);
    if (entry) preloadMotionEntry(entry).then(() => {
      if (state.motionManifest && explorerMotion(state.actorAction) === entry && $("board").classList.contains("is-on")) {
        renderGrid();
      }
    });
  });
}

function explorerMotion(action) {
  return state.motionManifest && state.motionManifest.explorer && state.motionManifest.explorer[action];
}

function pawnArt(action) {
  const entry = explorerMotion(action);
  return motionEntryLoaded(entry)
    ? motionFramePath(entry, state.pawnFrameIndex % entry.frameCount)
    : "../assets/art/characters/explorer.webp";
}

function syncPawnFrameAnimation() {
  const entry = explorerMotion(state.actorAction);
  if (!entry || !entry.ready || !entry.frameCount || !entry.fps) {
    clearInterval(state.pawnFrameTimer);
    state.pawnFrameTimer = 0;
    state.pawnFrameAction = "";
    state.pawnFrameIndex = 0;
    return;
  }
  if (!motionEntryLoaded(entry)) {
    clearInterval(state.pawnFrameTimer);
    state.pawnFrameTimer = 0;
    state.pawnFrameAction = "";
    preloadMotionEntry(entry).then(() => {
      if (explorerMotion(state.actorAction) === entry && $("board").classList.contains("is-on")) renderGrid();
    });
    return;
  }
  if (state.pawnFrameAction === state.actorAction && state.pawnFrameTimer) return;
  clearInterval(state.pawnFrameTimer);
  state.pawnFrameAction = state.actorAction;
  state.pawnFrameIndex = 0;
  state.pawnFrameTimer = setInterval(() => {
    const pawn = document.querySelector("#board.is-on .pawn");
    if (!pawn) return;
    state.pawnFrameIndex = (state.pawnFrameIndex + 1) % entry.frameCount;
    pawn.src = motionFramePath(entry, state.pawnFrameIndex);
  }, Math.max(60, Math.round(1000 / entry.fps)));
}

function playRewardFrameAnimation(item) {
  clearInterval(state.rewardFrameTimer);
  state.rewardFrameTimer = 0;
  const entry = state.motionManifest && state.motionManifest.collectibles && state.motionManifest.collectibles[item.id];
  const image = $("reward-art");
  if (!entry || !entry.ready || !entry.frameCount || !entry.fps || !image) return;
  let index = 0;
  image.src = motionFramePath(entry, index);
  state.rewardFrameTimer = setInterval(() => {
    index += 1;
    if (index >= entry.frameCount) {
      if (entry.loop) index = 0;
      else {
        clearInterval(state.rewardFrameTimer);
        state.rewardFrameTimer = 0;
        return;
      }
    }
    image.src = motionFramePath(entry, index);
  }, Math.max(60, Math.round(1000 / entry.fps)));
}

async function loadMotionManifest() {
  try {
    const response = await fetch("../assets/motion/animation-manifest.json", { cache: "no-store" });
    if (!response.ok) return;
    state.motionManifest = await response.json();
    if ($("board").classList.contains("is-on") && state.level) {
      warmBoardMotion();
      renderGrid();
    }
  } catch (_) {
    // 动画帧尚未生产时继续使用静态素材。
  }
}

function ownedCount(series = null) {
  return COLLECTIBLES.filter((item) => (!series || item.series === series) && state.profile.owned[item.id]).length;
}

function updateStats() {
  const text = `星砂 ${state.profile.stardust} · 箱 ${state.profile.chests} · ${ownedCount()}/18`;
  $("camp-stats").textContent = text;
  $("collection-stats").textContent = text;
  $("series-stats").textContent = `星砂 ${state.profile.stardust} · 箱 ${state.profile.chests}`;
  const pendingButton = $("pending-chest-btn");
  pendingButton.classList.toggle("hidden", state.profile.chests < 1);
  pendingButton.lastChild.textContent = `开箱（${state.profile.chests}）`;
  $("choose-series").disabled = state.profile.chests < 1;
}

function renderCamp() {
  updateStats();
  const learnedCount = TASK_POOL.filter((task) => state.profile.learnedTasks[task.id]).length;
  const progress = $("camp-progress");
  if (progress) {
    const activeTaskIndex = state.profile.activeRun ? Math.max(0, Number(state.profile.activeRun.taskIndex) || 0) : 0;
    progress.textContent = state.profile.activeRun
      ? `学习 ${learnedCount}/${TASK_POOL.length} · ${activeTaskIndex >= 5 ? "五题完成，返回帐篷" : `上次到第 ${activeTaskIndex + 1} 题`}`
      : `学习进度 ${learnedCount}/${TASK_POOL.length} · 本轮不重复`;
  }
  const normalButton = $("normal-btn");
  if (normalButton) {
    const label = normalButton.querySelector("span");
    if (label) label.textContent = state.profile.activeRun ? "继续上次探险" : "开始随机探险";
  }
  const owned = COLLECTIBLES.filter((item) => state.profile.owned[item.id]);
  const lockedFallback = ["little-tyrannosaurus", "star-robot", "little-whale"]
    .map((id) => COLLECTIBLES.find((item) => item.id === id));
  for (let index = 0; index < 3; index += 1) {
    const slot = $(`camp-slot-${index}`);
    const item = owned[index] || lockedFallback[index];
    const locked = !owned[index];
    slot.src = collectibleArt(item, locked ? "silhouette" : "runtime");
    slot.alt = locked ? `尚未获得的${item.nameZh}` : item.nameZh;
    slot.classList.toggle("is-locked", locked);
  }
}

function makeTask(wordId, type) {
  const word = WORD_BANK[wordId];
  const labels = { listen: "听音", meaning: "含义", context: "语境" };
  const context = CONTEXT_TASKS[wordId];
  if (type === "context" && context) {
    return {
      id: `context-${wordId}`,
      type,
      labelZh: labels[type],
      promptZh: "根据句子选择合适的单词。",
      promptEn: context[0],
      spokenText: context[1],
      correctId: wordId,
      hintZh: "关注句子描述的动作或前后关系。",
      explanationZh: `${word.en} 在这句话中表示“${word.zh}”。`
    };
  }
  return {
    id: `${type}-${wordId}`,
    type,
    labelZh: labels[type],
    promptZh: type === "listen" ? "听一听，找到对应的单词。" : `找到表示“${word.zh}”的词。`,
    spokenText: type === "listen" ? word.en : word.definition,
    correctId: wordId,
    hintZh: type === "listen" ? `这个词表示“${word.zh}”。` : "读一读解释，再比较棋盘上的单词。",
    explanationZh: `${word.en} 表示“${word.zh}”。`
  };
}

function buildNormalLevel(index, variantIndex = 0, roundTasks = null, symmetryIndex = 0) {
  const template = transformTemplate(LEVEL_TEMPLATES[index], symmetryIndex);
  const content = LEVEL_CONTENT[index];
  const route = template.routes[((variantIndex % template.routes.length) + template.routes.length) % template.routes.length];
  const start = route[0];
  const exit = route[6];
  const targets = route.slice(1, 6);
  const exploration = targets[1];
  const tasks = roundTasks || content.targets.map(([wordId, type]) => makeTask(wordId, type));
  const taskWordIds = tasks.map((task) => task.correctId);
  const fallbackDistractors = Object.keys(WORD_BANK).filter((id) => !taskWordIds.includes(id));
  const allWordIds = [...new Set([...taskWordIds, ...(content.distractors || []), ...fallbackDistractors])];
  const words = Object.fromEntries(allWordIds.map((id) => [id, WORD_BANK[id]]));
  const routeKeys = new Set(route.map(([x, y]) => `${x},${y}`));
  const blocked = new Set(template.blocked.map(([x, y]) => `${x},${y}`).filter((key) => !routeKeys.has(key)));
  const targetByPosition = new Map(targets.map((point, i) => [`${point[0]},${point[1]}`, taskWordIds[i]]));
  const distractors = allWordIds.filter((id) => !taskWordIds.includes(id));
  const cells = [];
  for (let y = 0; y < 4; y += 1) {
    for (let x = 0; x < 4; x += 1) {
      const key = `${x},${y}`;
      const cell = { x, y, tile: "ground" };
      if (same(cell, { x: start[0], y: start[1] })) cell.tile = "start";
      else if (same(cell, { x: exit[0], y: exit[1] })) cell.tile = "exit";
      else if (blocked.has(key)) Object.assign(cell, { tile: "blocked", blocked: true });
      else if (targetByPosition.has(key)) {
        cell.wordId = targetByPosition.get(key);
        if (same(cell, { x: exploration[0], y: exploration[1] })) cell.exploration = true;
      }
      else if (distractors.length) cell.wordId = distractors.shift();
      cells.push(cell);
    }
  }
  return {
    id: `normal-${template.id}`,
    number: index + 1,
    titleZh: content.title,
    region: content.region,
    mission: content.mission,
    difficulty: template.difficulty,
    size: 4,
    stepBudget: 6,
    start,
    exit,
    exploration,
    route,
    tasks,
    words,
    cells
  };
}

function cellAt(x, y) {
  return state.level.cells.find((c) => c.x === x && c.y === y);
}

function currentTask() {
  return state.level.tasks[state.taskIndex] || null;
}

function allDone() {
  return state.taskIndex >= state.level.tasks.length;
}

function show(id) {
  const leavingBoard = $("board").classList.contains("is-on") && id !== "board";
  if (leavingBoard) cancelBoardActivity();
  document.querySelectorAll(".screen").forEach((el) => el.classList.toggle("is-on", el.id === id));
  if (id === "camp") renderCamp();
  if (id === "collection") renderCollection();
  if (id === "board") requestAnimationFrame(drawRoute);
  syncBackgroundMusic(id);
}

const wait = (duration) => new Promise((resolve) => setTimeout(resolve, duration));

async function transitionScreen(id, afterEnter = null) {
  if (state.transitioning) return;
  const current = document.querySelector(".screen.is-on");
  const target = $(id);
  const overlay = $("scene-transition");
  const reducedMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!target || !overlay || !current || current.id === id || reducedMotion) {
    show(id);
    if (afterEnter) requestAnimationFrame(afterEnter);
    return;
  }
  state.transitioning = true;
  stopNarration();
  const titles = { board: "展开探险地图", result: "探险任务完成", camp: "返回小队营地" };
  $("transition-title").textContent = titles[id] || "继续探险";
  overlay.className = "scene-transition is-active";
  overlay.offsetWidth;
  overlay.classList.add("is-covering");
  await wait(360);
  show(id);
  await wait(80);
  target.classList.add("is-entering");
  overlay.classList.remove("is-covering");
  overlay.classList.add("is-revealing");
  await wait(520);
  overlay.className = "scene-transition";
  target.classList.remove("is-entering");
  state.transitioning = false;
  if (afterEnter) afterEnter();
}

function syncBackgroundMusic(screenId) {
  const track = screenId === "board" ? "explore-loop" : "camp-loop";
  if (musicTrack === track && musicAudio) return;
  if (musicAudio) musicAudio.pause();
  musicTrack = track;
  musicAudio = new Audio(`../assets/audio/music/${track}.mp3`);
  musicAudio.loop = true;
  musicAudio.volume = .11;
  const playback = musicAudio.play();
  if (playback && playback.catch) playback.catch(() => {});
}

function toast(text) {
  const el = $("toast");
  el.textContent = text;
  el.classList.remove("hidden");
  clearTimeout(toast._t);
  toast._t = setTimeout(() => el.classList.add("hidden"), 2200);
}

function stopNarration() {
  if (narrationAudio) {
    narrationAudio.pause();
    narrationAudio.src = "";
    narrationAudio = null;
  }
  if (window.speechSynthesis) window.speechSynthesis.cancel();
}

function wordAudioPath(wordId) {
  return `../assets/audio/en-US/words/${wordId}.mp3`;
}

function treasureWordIds() {
  const ids = (state.level && state.level.tasks ? state.level.tasks : [])
    .map((task) => task.correctId)
    .filter((id, index, list) => id && list.indexOf(id) === index);
  return ids.slice(0, 3);
}

function buildTreasureState(snapshot = null) {
  if (snapshot && snapshot.active && Array.isArray(snapshot.rounds)) return snapshot;
  const sourceIds = treasureWordIds();
  const fallbackIds = Object.keys(state.level.words || {});
  const ids = [...sourceIds, ...fallbackIds.filter((id) => !sourceIds.includes(id))].slice(0, 3);
  const allIds = Object.keys(state.level.words || {});
  const rounds = ids.map((wordId) => {
    const distractors = shuffle(allIds.filter((id) => id !== wordId)).slice(0, 2);
    const meaningIds = shuffle(ids.filter((id) => id !== wordId)).slice(0, 2);
    const letters = [...wordId];
    const extras = shuffle(["a", "e", "i", "o", "r", "s", "t"].filter((letter) => !letters.includes(letter))).slice(0, 2);
    const letterTokens = shuffle([...letters, ...extras]).map((letter, index) => ({ id: index, letter }));
    return {
      wordId,
      optionIds: shuffle([wordId, ...distractors]),
      meaningIds: shuffle([wordId, ...meaningIds]),
      letterTokens
    };
  });
  return {
    active: true,
    completed: false,
    roundIndex: 0,
    phase: "listen",
    spellOrder: [],
    rounds
  };
}

function currentTreasureRound() {
  return state.treasure && state.treasure.rounds[state.treasure.roundIndex];
}

function treasureWord(wordId) {
  return (state.level.words && state.level.words[wordId]) || WORD_BANK[wordId] || { en: wordId, zh: "" };
}

function playTreasurePrompt() {
  const round = currentTreasureRound();
  if (!round) return;
  const word = treasureWord(round.wordId);
  speak(word.en, [wordAudioPath(round.wordId)]);
}

function renderTreasure() {
  const event = state.treasure;
  const round = currentTreasureRound();
  if (!event || !round) return;
  const word = treasureWord(round.wordId);
  const total = event.rounds.length;
  $("treasure-progress").textContent = `地图 ${event.roundIndex + 1} / ${total}`;
  $("treasure-map").classList.toggle("is-spelling", event.phase === "spell");
  $("treasure-map").classList.toggle("is-meaning", event.phase === "meaning");
  const options = $("treasure-options");
  const clue = $("treasure-clue");
  const listen = $("treasure-listen");
  if (event.phase === "listen") {
    $("treasure-step-label").textContent = "第一步 · 漂流瓶线索";
    $("treasure-title").textContent = "听音找线索";
    $("treasure-copy").textContent = "听一听，点击你听到的英文单词。";
    clue.textContent = "漂流瓶里传来一个英文单词……";
    options.innerHTML = round.optionIds.map((id) => `<button type="button" class="treasure-option" data-treasure-word="${id}">${treasureWord(id).en}</button>`).join("");
    listen.classList.remove("hidden");
  } else if (event.phase === "spell") {
    $("treasure-step-label").textContent = "第二步 · 修复藏宝图";
    $("treasure-title").textContent = "拼出这个单词";
    $("treasure-copy").textContent = "按照正确顺序点击字母，让地图恢复完整。";
    const picked = event.spellOrder.map((tokenId) => round.letterTokens.find((token) => token.id === tokenId)?.letter || "");
    clue.innerHTML = `<div class="treasure-spell-slots">${[...word.en].map((_, index) => `<span class="treasure-spell-slot">${picked[index] || ""}</span>`).join("")}</div>`;
    options.innerHTML = round.letterTokens.map((token) => `<button type="button" class="treasure-option is-letter ${event.spellOrder.includes(token.id) ? "is-used" : ""}" data-treasure-letter="${token.id}">${token.letter}</button>`).join("");
    listen.classList.add("hidden");
  } else {
    $("treasure-step-label").textContent = "第三步 · 线索归位";
    $("treasure-title").textContent = "把线索放回地图";
    $("treasure-copy").textContent = "点击这个单词的中文含义。";
    clue.textContent = word.en;
    options.innerHTML = round.meaningIds.map((id) => `<button type="button" class="treasure-option is-meaning" data-treasure-meaning="${id}">${treasureWord(id).zh}</button>`).join("");
    listen.classList.add("hidden");
  }
  $("treasure-options").querySelectorAll("button").forEach((button) => button.addEventListener("click", handleTreasureChoice));
}

function handleTreasureChoice(event) {
  const button = event.currentTarget;
  const round = currentTreasureRound();
  if (!round || !state.treasure) return;
  if (button.dataset.treasureWord) {
    if (button.dataset.treasureWord !== round.wordId) {
      playSfx("undo", .2);
      pulseActor("encourage", 900);
      toast("再听一次，找出漂流瓶里的单词。");
      return;
    }
    playSfx("mark", .25);
    state.treasure.phase = "spell";
    state.treasure.spellOrder = [];
    renderTreasure();
    return;
  }
  if (button.dataset.treasureLetter) {
    const token = round.letterTokens.find((item) => String(item.id) === button.dataset.treasureLetter);
    const expected = round.wordId[state.treasure.spellOrder.length];
    if (!token || token.letter !== expected) {
      playSfx("undo", .18);
      toast("这个字母还没到顺序，再找找看。");
      return;
    }
    state.treasure.spellOrder.push(token.id);
    playSfx("mark", .2);
    if (state.treasure.spellOrder.length >= round.wordId.length) state.treasure.phase = "meaning";
    renderTreasure();
    return;
  }
  if (button.dataset.treasureMeaning) {
    if (button.dataset.treasureMeaning !== round.wordId) {
      playSfx("undo", .2);
      toast("再看一看这个单词的意思。");
      return;
    }
    playSfx("collect", .28);
    state.treasure.roundIndex += 1;
    state.treasure.spellOrder = [];
    if (state.treasure.roundIndex >= state.treasure.rounds.length) {
      finishTreasureEvent();
      return;
    }
    state.treasure.phase = "listen";
    renderTreasure();
    requestAnimationFrame(playTreasurePrompt);
  }
}

function startTreasureEvent(snapshot = null) {
  state.treasure = buildTreasureState(snapshot);
  persistActiveRun();
  transitionScreen("treasure", () => {
    renderTreasure();
    playTreasurePrompt();
  });
}

async function finishTreasureEvent() {
  if (!state.treasure || state.treasure.completed) return;
  state.treasure.active = false;
  state.treasure.completed = true;
  playSfx("complete", .32);
  renderTreasure();
  $("treasure-step-label").textContent = "寻宝完成";
  $("treasure-title").textContent = "藏宝图修复成功";
  $("treasure-copy").textContent = "探险宝箱已经找到，回到营地领取奖励。";
  $("treasure-clue").textContent = "✦ 发现收藏宝箱 ✦";
  $("treasure-options").innerHTML = "";
  $("treasure-listen").classList.add("hidden");
  await wait(1200);
  persistActiveRun();
  finishIfReady();
}

function browserSpeak(text) {
  if (!window.speechSynthesis) return;
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "en-US";
  u.rate = 0.88;
  u.onerror = (event) => {
    if (["canceled", "interrupted"].includes(event.error)) return;
    toast("暂时无法播放声音，可以先看文字继续");
  };
  try {
    window.speechSynthesis.speak(u);
  } catch (_) {
    toast("暂时无法播放声音，可以先看文字继续");
  }
}

function playCurrent() {
  const task = currentTask();
  if (task) speak(task.spokenText, [taskVoicePath(task)]);
}

function playSfx(name, volume = .3) {
  try {
    let audio = sfxCache.get(name);
    if (!audio) {
      audio = new Audio(`../assets/audio/sfx/${name}.wav`);
      sfxCache.set(name, audio);
    }
    audio.pause();
    audio.currentTime = 0;
    audio.volume = volume;
    const playback = audio.play();
    if (playback && playback.catch) playback.catch(() => {});
  } catch (_) {
    // 音效失败不影响答题和移动。
  }
}

function speak(text, audioPaths = []) {
  if (!state.voice || !text) return;
  stopNarration();
  const queue = audioPaths.filter(Boolean);
  if (!queue.length) {
    browserSpeak(text);
    return;
  }
  let index = 0;
  const playNext = () => {
    if (!state.voice || index >= queue.length) {
      narrationAudio = null;
      return;
    }
    const audio = new Audio(queue[index]);
    narrationAudio = audio;
    audio.volume = .86;
    audio.onended = () => {
      index += 1;
      playNext();
    };
    audio.onerror = () => {
      narrationAudio = null;
      browserSpeak(text);
    };
    const playback = audio.play();
    if (playback && playback.catch) {
      playback.catch(() => {
        narrationAudio = null;
        browserSpeak(text);
      });
    }
  };
  playNext();
}

function taskVoicePath(task) {
  if (!task) return "";
  if (task.type === "listen") return `../assets/audio/en-US/words/${task.correctId}.mp3`;
  return `../assets/audio/en-US/tasks/${task.id}.mp3`;
}

function collectibleVoicePaths(item) {
  const base = `../assets/audio/en-US/collectibles/${item.id}`;
  return [`${base}-name.mp3`, `${base}-line.mp3`];
}

function clearActorTimer() {
  clearTimeout(state.actorTimer);
  state.actorTimer = 0;
}

function pulseCellEffect(x, y, type) {
  clearTimeout(state.cellEffectTimer);
  state.cellEffect = { key: `${x},${y}`, type };
  renderGrid();
  state.cellEffectTimer = setTimeout(() => {
    state.cellEffect = null;
    renderGrid();
  }, type === "correct" ? 850 : 520);
}

function cancelBoardActivity() {
  state.moveEpoch += 1;
  state.moving = false;
  state.actorAction = "idle";
  clearActorTimer();
  clearTimeout(state.cellEffectTimer);
  state.cellEffect = null;
  clearInterval(state.pawnFrameTimer);
  state.pawnFrameTimer = 0;
  state.pawnFrameAction = "";
  stopNarration();
}

function pulseActor(action, duration = 1500) {
  clearActorTimer();
  state.actorAction = action;
  renderGrid();
  state.actorTimer = setTimeout(() => {
    if (state.moving) return;
    state.actorAction = "idle";
    renderGrid();
  }, duration);
}

function updateActorFacing(from, to) {
  if (!from || !to || from.x === to.x) return;
  state.actorFacing = to.x > from.x ? "right" : "left";
}

function findPath(from, to, route = state.route) {
  if (same(from, to)) return [from];
  const q = [[from]];
  const seen = new Set(route.slice(0, -1).map(keyOf));
  seen.add(keyOf(from));
  while (q.length) {
    const path = q.shift();
    const cur = path[path.length - 1];
    for (const [dx, dy] of [[1,0],[-1,0],[0,1],[0,-1]]) {
      const next = { x: cur.x + dx, y: cur.y + dy };
      if (next.x < 0 || next.y < 0 || next.x >= state.level.size || next.y >= state.level.size) continue;
      const nextCell = cellAt(next.x, next.y);
      if (!nextCell || nextCell.blocked) continue;
      const k = keyOf(next);
      if (seen.has(k)) continue;
      seen.add(k);
      const nextPath = path.concat(next);
      if (same(next, to)) return nextPath;
      q.push(nextPath);
    }
  }
  return null;
}

function shortestPath(from, to) {
  return findPath(from, to, state.route);
}

function remainingCheckpoints() {
  const targets = state.level.tasks.slice(state.taskIndex).map((task) => {
    const cell = state.level.cells.find((candidate) => candidate.wordId === task.correctId);
    return { x: cell.x, y: cell.y };
  });
  return targets.concat({ x: state.level.exit[0], y: state.level.exit[1] });
}

function canStillFinish(extraPath) {
  let simulatedRoute = state.route.concat(extraPath.slice(1));
  let from = simulatedRoute[simulatedRoute.length - 1];
  for (const checkpoint of remainingCheckpoints()) {
    const path = findPath(from, checkpoint, simulatedRoute);
    if (!path) return false;
    simulatedRoute = simulatedRoute.concat(path.slice(1));
    from = checkpoint;
  }
  return simulatedRoute.length - 1 <= state.level.stepBudget;
}

function discoverAt(point) {
  if (!state.level.exploration || state.foundExploration) return;
  if (point.x !== state.level.exploration[0] || point.y !== state.level.exploration[1]) return;
  state.foundExploration = true;
  playSfx("route", .28);
  toast("发现地图碎片！完成本关可额外获得 1 点星砂");
}

function renderTasks() {
  const total = state.level.tasks.length;
  const dots = state.level.tasks.map((task, i) => {
    const cls = i < state.taskIndex ? "is-done" : i === state.taskIndex ? "is-current" : "";
    return `<span class="task-dot ${cls}"${i === state.taskIndex ? ' aria-current="step"' : ""}>${i + 1}</span>`;
  }).join("");
  if (allDone()) {
    $("tasks").innerHTML = `<div class="task-progress"><div>${dots}</div><b>${total}/${total}</b></div>
      <div class="task is-done"><span class="badge">✓</span><span><b>任务完成</b>${total} 个词语线索都找到了</span><strong>回营</strong></div>`;
    return;
  }
  const task = currentTask();
  $("tasks").innerHTML = `<div class="task-progress"><div>${dots}</div><b>第 ${state.taskIndex + 1}/${total} 题</b></div>
    <div class="task is-current" aria-current="step">
      <span class="badge">${state.taskIndex + 1}</span>
      <span><b>${task.labelZh}</b>${task.promptZh}</span>
      <strong>请作答</strong>
    </div>`;
}

function renderGrid() {
  $("grid").style.setProperty("--size", state.level.size);
  $("grid").dataset.size = state.level.size;
  $("grid").setAttribute("aria-label", `${state.level.size}乘${state.level.size}探险棋盘`);
  $("grid").innerHTML = state.level.cells.map((cell) => {
    const here = same(cell, state.pos);
    const visited = state.route.some((point) => same(point, cell));
    const doneWord = cell.wordId && Object.values(state.doneTasks).includes(cell.wordId);
    const targetIndex = cell.wordId ? state.level.tasks.findIndex((task) => task.correctId === cell.wordId) : -1;
    const isExitTarget = allDone() && cell.tile === "exit";
    const word = cell.wordId ? state.level.words[cell.wordId].en : "";
    const explorationFound = cell.exploration && state.foundExploration;
    const cellEffect = state.cellEffect && state.cellEffect.key === `${cell.x},${cell.y}` ? state.cellEffect.type : "";
    const label = word || (cell.tile === "exit" ? "帐篷终点" : cell.tile === "start" ? "起点" : cell.blocked ? "水下暗礁，不能通行" : cell.exploration ? (explorationFound ? "已发现地图碎片" : "探索点，可能藏着地图碎片") : "浮台");
    const cls = [
      here ? "has-pawn" : "",
      visited ? "is-visited" : "",
      doneWord ? "is-done" : "",
      isExitTarget ? "is-next" : "",
      cell.blocked ? "is-blocked" : "",
      cell.exploration ? "is-exploration" : "",
      explorationFound ? "is-found" : "",
      cellEffect ? `is-${cellEffect}` : ""
    ].filter(Boolean).join(" ");
    const floatDelay = -(((cell.x * 7 + cell.y * 11) % 17) / 4).toFixed(2);
    const floatDuration = (4.2 + ((cell.x * 3 + cell.y * 5) % 7) * .16).toFixed(2);
    const floatDistance = 2 + ((cell.x + cell.y * 2) % 3) * .35;
    const platformContents = `<img class="tile" src="${TILE[cell.tile] || TILE.ground}" alt="">
      ${word ? `<span class="word">${word}</span>` : ""}
      ${doneWord && targetIndex >= 0 ? `<span class="target-number" aria-hidden="true">${targetIndex + 1}</span>` : ""}
      ${cell.exploration ? `<img class="exploration-marker" src="../assets/ui/game/exploration-point.svg" alt="">` : ""}
      ${visited && !here ? `<span class="trail-dot" aria-hidden="true"></span>` : ""}
      ${cellEffect === "correct" ? `<span class="answer-burst" aria-hidden="true">${Array.from({ length: 8 }, (_, i) => `<i style="--ray:${i}"></i>`).join("")}</span>` : ""}
      ${here ? `<img class="pawn ${explorerMotion(state.actorAction) && explorerMotion(state.actorAction).ready ? "has-frames" : ""}" data-action="${state.actorAction}" data-facing="${state.actorFacing}" src="${pawnArt(state.actorAction)}" alt="">` : ""}`;
    return `<button type="button" class="cell ${cls}" data-x="${cell.x}" data-y="${cell.y}" aria-label="${label}"${cell.blocked || state.moving ? " disabled" : ""}>
      ${cell.blocked
        ? `<img class="reef" src="../assets/ui/game/reef.svg" alt="">`
        : `<span class="floating-platform" style="--float-delay:${floatDelay}s;--float-duration:${floatDuration}s;--float-distance:${floatDistance}px">${platformContents}</span>`}
    </button>`;
  }).join("");
  drawRoute();
  syncPawnFrameAnimation();
  const used = Math.max(0, state.route.length - 1);
  $("steps").textContent = `步数 ${used} / ${state.level.stepBudget}`;
  $("route-state").textContent = routeStatus();
}

function routeStatus() {
  if (!allDone()) {
    const n = state.taskIndex + 1;
    return `第 ${n} 题：点正确的单词，走到那一格`;
  }
  if (same(state.pos, { x: state.level.exit[0], y: state.level.exit[1] })) return "探险完成";
  return `${state.level.tasks.length} 题完成了，点击帐篷，走回营地`;
}

function drawRoute() {
  const svg = $("route-layer");
  if (!svg) return;
  const stage = svg.parentElement;
  if (!stage) return;
  const cells = [...stage.querySelectorAll(".cell")];
  if (!cells.length) return;
  const stageRect = stage.getBoundingClientRect();
  const box = Math.max(1, stageRect.width);
  const rectFor = (p) => {
    const cell = cells.find((el) => Number(el.dataset.x) === p.x && Number(el.dataset.y) === p.y);
    if (!cell) return null;
    const rect = cell.getBoundingClientRect();
    const edgeInset = rect.width * .08;
    return {
      left: rect.left - stageRect.left + edgeInset,
      right: rect.right - stageRect.left - edgeInset,
      top: rect.top - stageRect.top + edgeInset,
      bottom: rect.bottom - stageRect.top - edgeInset,
      midX: rect.left - stageRect.left + rect.width / 2,
      midY: rect.top - stageRect.top + rect.height / 2
    };
  };
  const segs = [];
  for (let i = 1; i < state.route.length; i += 1) {
    const a = state.route[i - 1];
    const b = state.route[i];
    const ao = rectFor(a);
    const bo = rectFor(b);
    if (!ao || !bo) continue;
    if (a.y === b.y) {
      const y = ao.midY;
      const x1 = a.x < b.x ? ao.right + 2 : ao.left - 2;
      const x2 = a.x < b.x ? bo.left - 2 : bo.right + 2;
      segs.push(`<line x1="${x1}" y1="${y}" x2="${x2}" y2="${y}" />`);
    } else {
      const x = ao.midX;
      const y1 = a.y < b.y ? ao.bottom + 2 : ao.top - 2;
      const y2 = a.y < b.y ? bo.top - 2 : bo.bottom + 2;
      segs.push(`<line x1="${x}" y1="${y1}" x2="${x}" y2="${y2}" />`);
    }
  }
  svg.setAttribute("viewBox", `0 0 ${box} ${stageRect.height}`);
  svg.innerHTML = `<g class="route-rope-shadow" fill="none" stroke-linecap="round" stroke-linejoin="round">${segs.join("")}</g>
    <g class="route-rope" fill="none" stroke-linecap="round" stroke-linejoin="round">${segs.join("")}</g>`;
}

function finishIfReady() {
  const end = { x: state.level.exit[0], y: state.level.exit[1] };
  if (!allDone() || !same(state.pos, end)) return;
  if (state.levelMode === "normal" && !(state.treasure && state.treasure.completed)) {
    startTreasureEvent(state.treasure && state.treasure.active ? state.treasure : null);
    return;
  }
  renderResult();
}

function renderResult() {
  const results = state.level.tasks.map((task) => ({
    ...task,
    chosen: task.correctId,
    correct: true
  }));
  const usedSteps = Math.max(0, state.route.length - 1);
  const treasureDone = Boolean(state.treasure && state.treasure.completed);
  const bonusStars = (state.foundExploration ? 1 : 0) + (treasureDone ? 1 : 0);
  $("result-sub").textContent = state.levelMode === "tutorial"
    ? "教学目标都找对了，已经回到营地"
    : `${state.level.titleZh}完成 · ${usedSteps} 步回营${treasureDone ? " · 寻宝完成" : ""}`;
  $("result-tasks").innerHTML = results.map((r, index) => {
    const word = state.level.words[r.correctId] || WORD_BANK[r.correctId];
    return `<button type="button" class="result-word-card" data-word-id="${r.correctId}" aria-label="朗读 ${word.en}，${word.zh}，${wordPartOfSpeech(r.correctId)}">
      <span class="result-word-index">${index + 1}</span>
      <span class="result-word-copy"><b>${word.en}</b><small>${word.zh}<i>·</i>${wordPartOfSpeech(r.correctId)}</small></span>
      <img src="../assets/ui/icons/audio.svg" alt="">
    </button>`;
  }).join("");
  $("result-discovery").classList.toggle("hidden", !state.foundExploration && !treasureDone);
  $("result-discovery").innerHTML = [
    state.foundExploration ? `<span><img src="../assets/ui/game/exploration-point.svg" alt="">发现地图碎片，额外获得 <b>1 点星砂</b></span>` : "",
    treasureDone ? `<span><img src="../assets/ui/icons/compass.svg" alt="">漂流瓶寻宝完成，额外获得 <b>1 点星砂</b></span>` : ""
  ].filter(Boolean).join("");
  $("result-map").classList.toggle("hidden", state.levelMode !== "normal");
  if (!state.runRewardGranted) {
    state.profile.stardust += 1 + bonusStars;
    state.profile.chests += 1;
    state.profile.completedRuns += 1;
    if (state.levelMode === "normal") {
      const previous = state.profile.completedLevels[state.level.id];
      state.profile.completedLevels[state.level.id] = {
        completedAt: new Date().toISOString(),
        count: nonNegativeNumber(previous && previous.count) + 1
      };
      const previousBest = nonNegativeNumber(state.profile.bestSteps[state.level.id]);
      if (!previousBest || usedSteps < previousBest) state.profile.bestSteps[state.level.id] = usedSteps;
      if (state.foundExploration) state.profile.discoveries[state.level.id] = true;
    }
    if (state.levelMode === "normal") state.profile.activeRun = null;
    state.runRewardGranted = true;
    saveProfile();
  }
  $("result-reward-copy").innerHTML = `<strong>获得 1 个收藏箱</strong><br>星砂 +${1 + bonusStars}${bonusStars ? "（含探索奖励）" : ""}`;
  updateStats();
  transitionScreen("result", () => playSfx("complete", .38));
}

async function walkTo(target) {
  const path = shortestPath(state.pos, target);
  if (!path) {
    toast("这条路走不通，请换一个相邻方向");
    return false;
  }
  const nextStepCount = Math.max(0, path.length - 1);
  const usedStepCount = Math.max(0, state.route.length - 1);
  if (usedStepCount + nextStepCount > state.level.stepBudget) {
    toast("这条路会超过步数，请走更短的路线");
    return false;
  }
  if (path.length < 2) {
    state.pos = target;
    if (!state.route.length) state.route = [target];
    discoverAt(target);
    renderGrid();
    return true;
  }
  clearActorTimer();
  const moveEpoch = state.moveEpoch;
  state.moving = true;
  state.actorAction = "move";
  for (let i = 1; i < path.length; i += 1) {
    updateActorFacing(path[i - 1], path[i]);
    state.pos = path[i];
    state.route.push(path[i]);
    discoverAt(path[i]);
    persistActiveRun();
    playSfx("move", .18);
    renderGrid();
    await new Promise((resolve) => setTimeout(resolve, 240));
    if (moveEpoch !== state.moveEpoch) return false;
  }
  if (moveEpoch !== state.moveEpoch) return false;
  state.moving = false;
  state.actorAction = "idle";
  renderGrid();
  return true;
}

async function clickCell(x, y) {
  if (state.moving) return;
  const cell = cellAt(x, y);
  if (allDone()) {
    const end = { x: state.level.exit[0], y: state.level.exit[1] };
    if (!same(cell, end)) {
      toast(`${state.level.tasks.length} 题完成了，请点击帐篷终点`);
      return;
    }
    const arrived = await walkTo(end);
    if (arrived) finishIfReady();
    return;
  }

  const task = currentTask();
  if (!cell.wordId) {
    playSfx("click", .22);
    toast("点有单词的格子");
    return;
  }
  if (cell.wordId !== task.correctId) {
    playSfx("undo", .22);
    pulseCellEffect(cell.x, cell.y, "wrong");
    toast("不是这一题。再听一次，点正确的单词。");
    pulseActor("encourage");
    playCurrent();
    return;
  }
  playSfx("mark", .28);
  pulseCellEffect(cell.x, cell.y, "correct");
  const arrived = await walkTo({ x: cell.x, y: cell.y });
  if (!arrived) return;
  playSfx("collect", .32);
  state.doneTasks[task.id] = task.correctId;
  state.profile.learnedTasks[task.id] = true;
  state.taskIndex += 1;
  state.hintLevel = 0;
  renderTasks();
  persistActiveRun();
  pulseActor("happy", 1600);
  if (allDone()) {
    $("route-state").textContent = `${state.level.tasks.length} 题完成了，点击帐篷，走回营地`;
  } else {
    playCurrent();
  }
}

function persistActiveRun() {
  if (!state.level || state.levelMode !== "normal") return;
  state.profile.activeRun = {
    levelIndex: state.currentLevelIndex,
    variantIndex: state.level.variantIndex,
    symmetryIndex: state.level.symmetryIndex,
    taskIds: state.level.tasks.map((task) => task.id),
    taskIndex: state.taskIndex,
    doneTasks: { ...state.doneTasks },
    pos: { ...state.pos },
    route: state.route.map((point) => ({ ...point })),
    foundExploration: state.foundExploration,
    treasure: state.treasure && state.treasure.active ? state.treasure : null,
    savedAt: new Date().toISOString()
  };
  saveProfile();
}

function clearActiveRun() {
  if (!state.profile) return;
  state.profile.activeRun = null;
  saveProfile();
}

function resetBoard(snapshot = null) {
  cancelBoardActivity();
  state.taskIndex = snapshot ? Math.max(0, Math.min(state.level.tasks.length, Number(snapshot.taskIndex) || 0)) : 0;
  state.doneTasks = snapshot && snapshot.doneTasks && typeof snapshot.doneTasks === "object" ? { ...snapshot.doneTasks } : {};
  state.pos = snapshot && snapshot.pos && Number.isInteger(snapshot.pos.x) && Number.isInteger(snapshot.pos.y)
    ? { x: snapshot.pos.x, y: snapshot.pos.y }
    : { x: state.level.start[0], y: state.level.start[1] };
  state.route = snapshot && Array.isArray(snapshot.route) && snapshot.route.length
    ? snapshot.route.map((point) => ({ x: point.x, y: point.y }))
    : [{ ...state.pos }];
  state.actorAction = "idle";
  state.actorFacing = "right";
  for (let i = state.route.length - 1; i > 0; i -= 1) {
    if (state.route[i].x !== state.route[i - 1].x) {
      updateActorFacing(state.route[i - 1], state.route[i]);
      break;
    }
  }
  state.foundExploration = Boolean(snapshot && snapshot.foundExploration);
  state.treasure = snapshot && snapshot.treasure && snapshot.treasure.active ? snapshot.treasure : null;
  state.hintLevel = 0;
  state.runRewardGranted = false;
  $("mission-title").textContent = state.levelMode === "tutorial"
    ? "探险教学 · 第一次出发"
    : `${state.level.region} · 第 ${state.level.number} 站 ${state.level.titleZh}`;
  $("mission-copy").textContent = state.levelMode === "tutorial"
    ? `跟随 ${state.level.tasks.length} 个词语线索，最后点击帐篷回营。`
    : state.level.mission;
  $("back-camp").lastChild.textContent = "营地";
  renderTasks();
  renderGrid();
  persistActiveRun();
}

function startLevel(level, mode, levelIndex = -1, snapshot = null) {
  state.level = level;
  state.levelMode = mode;
  state.currentLevelIndex = levelIndex;
  resetBoard(snapshot);
  if (state.levelMode === "normal" && state.treasure && state.treasure.active) {
    transitionScreen("treasure", () => {
      renderTreasure();
      playTreasurePrompt();
    });
    return;
  }
  warmBoardMotion();
  transitionScreen("board", () => {
    renderGrid();
    playCurrent();
  });
}

function startRandomLevel() {
  const active = state.profile.activeRun;
  if (active && Number.isInteger(active.levelIndex) && active.levelIndex >= 0 && active.levelIndex < LEVEL_TEMPLATES.length && Array.isArray(active.taskIds) && active.taskIds.length === 5) {
    const tasks = active.taskIds.map(taskFromId);
    if (tasks.every(Boolean)) {
      const variantIndex = Number.isInteger(active.variantIndex) ? active.variantIndex : 0;
      const symmetryIndex = Number.isInteger(active.symmetryIndex) ? active.symmetryIndex : 0;
      const level = buildNormalLevel(active.levelIndex, variantIndex, tasks, symmetryIndex);
      level.variantIndex = variantIndex;
      level.symmetryIndex = symmetryIndex;
      startLevel(level, "normal", active.levelIndex, active);
      return;
    }
    clearActiveRun();
  }
  let index = 0;
  let variantIndex = 0;
  let symmetryIndex = 0;
  let routeKey = "";
  for (let attempt = 0; attempt < 8; attempt += 1) {
    index = Math.floor(randomUnit() * LEVEL_TEMPLATES.length);
    variantIndex = Math.floor(randomUnit() * LEVEL_TEMPLATES[index].routes.length);
    symmetryIndex = Math.floor(randomUnit() * 8);
    routeKey = `${index}:${variantIndex}:${symmetryIndex}`;
    if (routeKey !== state.profile.lastRouteKey) break;
  }
  state.profile.lastRouteKey = routeKey;
  const level = buildNormalLevel(index, variantIndex, selectRoundTasks(), symmetryIndex);
  level.variantIndex = variantIndex;
  level.symmetryIndex = symmetryIndex;
  startLevel(level, "normal", index);
}

function showHint() {
  const task = currentTask();
  if (!task) {
    toast("点到右下角帐篷就结束了。");
    return;
  }
  pulseActor("think", 1600);
  playSfx("tool", .24);
  toast(task.hintZh);
}

function renderSeriesOptions() {
  $("series-options").innerHTML = Object.entries(SERIES).map(([id, series]) => {
    const count = ownedCount(id);
    return `<button type="button" class="series-option" data-series="${id}">
      <img src="${series.icon}" alt="">
      <span><strong>${series.nameZh}</strong><small>普通 5 件 · 珍藏 1 件</small></span>
      <span class="series-count">${count}/6</span>
    </button>`;
  }).join("");
  updateStats();
}

function randomUnit() {
  if (window.crypto && window.crypto.getRandomValues) {
    const value = new Uint32Array(1);
    window.crypto.getRandomValues(value);
    return value[0] / 4294967296;
  }
  return Math.random();
}

function chooseReward(seriesId) {
  const rarity = randomUnit() < .1 ? "rare" : "normal";
  const rarityPool = COLLECTIBLES.filter((item) => item.series === seriesId && item.rarity === rarity);
  const unowned = rarityPool.filter((item) => !state.profile.owned[item.id]);
  const pool = rarity === "normal" && unowned.length ? unowned : rarityPool;
  return pool[Math.floor(randomUnit() * pool.length)];
}

function prepareChest(seriesId) {
  if (state.profile.chests < 1) {
    toast("当前没有待开启的收藏箱");
    return;
  }
  state.selectedSeries = seriesId;
  state.pendingReward = null;
  state.chestOpening = false;
  clearInterval(state.rewardFrameTimer);
  state.rewardFrameTimer = 0;
  $("chest-series-title").textContent = `${SERIES[seriesId].nameZh}收藏箱`;
  $("chest-art").src = "../assets/ui/game/chest-closed.webp";
  $("chest-art").alt = "关闭的收藏箱";
  $("chest-art").classList.remove("hidden", "is-open");
  $("reward-reveal").classList.add("hidden");
  $("open-chest").classList.remove("hidden");
  $("open-chest").disabled = false;
  $("reward-actions").classList.add("hidden");
  show("chest");
}

async function openChest() {
  if (state.pendingReward || state.chestOpening || !state.selectedSeries) return;
  if (state.profile.chests < 1) {
    toast("当前没有待开启的收藏箱");
    return;
  }
  state.chestOpening = true;
  $("open-chest").disabled = true;
  playSfx("chest", .36);
  $("chest-art").src = "../assets/ui/game/chest-open.webp";
  $("chest-art").alt = "打开的收藏箱";
  $("chest-art").classList.add("is-open");
  await new Promise((resolve) => setTimeout(resolve, 620));

  if (state.profile.chests < 1) {
    state.chestOpening = false;
    toast("当前没有待开启的收藏箱");
    return;
  }
  const countBefore = ownedCount(state.selectedSeries);
  const item = chooseReward(state.selectedSeries);
  const duplicate = Boolean(state.profile.owned[item.id]);
  const converted = duplicate ? (item.rarity === "rare" ? 4 : 2) : 0;
  state.pendingReward = { item, duplicate, converted };
  state.profile.chests -= 1;
  if (duplicate) {
    state.profile.stardust += converted;
  } else {
    state.profile.owned[item.id] = { obtainedAt: new Date().toISOString() };
  }
  const seriesCompleted = !duplicate && countBefore === 5 && ownedCount(state.selectedSeries) === 6;
  saveProfile();
  updateStats();

  const rewardMotion = state.motionManifest && state.motionManifest.collectibles && state.motionManifest.collectibles[item.id];
  await preloadMotionEntry(rewardMotion);

  $("reward-art").src = collectibleArt(item, "runtime");
  $("reward-art").alt = item.nameZh;
  $("reward-rarity").textContent = item.rarity === "rare" ? "珍藏" : "普通收藏";
  $("reward-name").textContent = `${item.nameZh} · ${item.nameEn}`;
  $("reward-line").textContent = item.lineEn;
  $("duplicate-note").textContent = seriesCompleted
    ? `${SERIES[item.series].nameZh}系列已经集齐！`
    : duplicate ? `已经拥有，转化为 ${converted} 点星砂` : "新收藏已经放进收藏柜";
  $("duplicate-note").classList.remove("hidden");
  $("chest-art").classList.add("hidden");
  $("reward-reveal").classList.remove("hidden");
  playRewardFrameAnimation(item);
  speak(`${item.nameEn}. ${item.lineEn}`, collectibleVoicePaths(item));
  $("open-chest").classList.add("hidden");
  $("reward-actions").classList.remove("hidden");
  state.chestOpening = false;
  playSfx(item.rarity === "rare" ? "rare" : "reward", item.rarity === "rare" ? .34 : .3);
  if (seriesCompleted) {
    setTimeout(() => playSfx("series-complete", .36), 500);
    toast(`${SERIES[item.series].nameZh}系列已经集齐`);
  }
}

function renderCollection() {
  updateStats();
  state.exchangeCandidate = null;
  $("collection-detail").classList.add("hidden");
  $("collection-exchange").classList.add("hidden");
  $("collection-content").innerHTML = Object.entries(SERIES).map(([seriesId, series]) => {
    const items = COLLECTIBLES.filter((item) => item.series === seriesId);
    const cards = items.map((item) => {
      const owned = Boolean(state.profile.owned[item.id]);
      const attrs = owned
        ? `data-collectible="${item.id}" aria-label="播放${item.nameZh}互动和英文"`
        : `data-locked-collectible="${item.id}" aria-label="查看${item.nameZh}兑换信息"`;
      return `<button type="button" class="collectible-card ${owned ? "is-owned" : "is-locked"} ${item.rarity === "rare" ? "is-rare" : ""}" ${attrs}>
        <img src="${collectibleArt(item, owned ? "thumbnail" : "silhouette")}" loading="lazy" decoding="async" alt="">
        <strong>${item.nameZh}</strong>
        <small>${owned ? item.nameEn : "未获得 · 点击查看"}</small>
      </button>`;
    }).join("");
    return `<section class="collection-series">
      <div class="collection-series-head"><h2>${series.nameZh}</h2><span>${ownedCount(seriesId)}/6</span></div>
      <div class="collection-grid">${cards}</div>
    </section>`;
  }).join("");
}

function playCollectible(itemId, card) {
  const item = COLLECTIBLES.find((candidate) => candidate.id === itemId);
  if (!item || !state.profile.owned[item.id]) return;
  playSfx("mark", .2);
  speak(`${item.nameEn}. ${item.lineEn}`, collectibleVoicePaths(item));
  const obtainedAt = state.profile.owned[item.id] && state.profile.owned[item.id].obtainedAt;
  const obtainedDate = obtainedAt ? new Date(obtainedAt) : null;
  state.exchangeCandidate = null;
  $("collection-detail-title").textContent = `${item.nameZh} · ${item.nameEn}`;
  $("collection-detail-line").textContent = item.lineEn;
  $("collection-detail-date").textContent = obtainedDate && !Number.isNaN(obtainedDate.getTime())
    ? `获得日期：${obtainedDate.toLocaleDateString("zh-CN")}`
    : "获得日期：本机记录中未保存";
  $("collection-detail").classList.remove("hidden");
  $("collection-exchange").classList.add("hidden");
  card.classList.remove("is-playing");
  void card.offsetWidth;
  card.classList.add("is-playing");
  setTimeout(() => card.classList.remove("is-playing"), 850);
}

function exchangeCost(item) {
  return item.rarity === "rare" ? 12 : 6;
}

function showLockedCollectible(itemId) {
  const item = COLLECTIBLES.find((candidate) => candidate.id === itemId);
  if (!item || state.profile.owned[item.id]) return;
  const cost = exchangeCost(item);
  const missing = Math.max(0, cost - state.profile.stardust);
  state.exchangeCandidate = { id: item.id, armed: false };
  $("collection-detail-title").textContent = `${item.nameZh} · ${item.nameEn}`;
  $("collection-detail-line").textContent = item.lineEn;
  $("collection-detail-date").textContent = missing
    ? `需要 ${cost} 点星砂，还差 ${missing} 点`
    : `需要 ${cost} 点星砂`;
  const button = $("collection-exchange");
  button.textContent = missing ? `星砂不足，还差 ${missing} 点` : `用 ${cost} 点星砂兑换`;
  button.disabled = missing > 0;
  button.classList.remove("hidden");
  $("collection-detail").classList.remove("hidden");
}

function exchangeCollectible() {
  const candidate = state.exchangeCandidate;
  if (!candidate) return;
  const item = COLLECTIBLES.find((entry) => entry.id === candidate.id);
  if (!item || state.profile.owned[item.id]) return;
  const cost = exchangeCost(item);
  if (state.profile.stardust < cost) {
    showLockedCollectible(item.id);
    return;
  }
  if (!candidate.armed) {
    candidate.armed = true;
    $("collection-exchange").textContent = `再次点击，确认兑换 ${item.nameZh}`;
    toast("再点一次确认兑换");
    return;
  }
  const countBefore = ownedCount(item.series);
  state.profile.stardust -= cost;
  state.profile.owned[item.id] = { obtainedAt: new Date().toISOString() };
  const seriesCompleted = countBefore === 5 && ownedCount(item.series) === 6;
  saveProfile();
  playSfx("exchange", .34);
  renderCollection();
  const card = document.querySelector(`[data-collectible="${item.id}"]`);
  if (card) playCollectible(item.id, card);
  if (seriesCompleted) {
    setTimeout(() => playSfx("series-complete", .36), 500);
    toast(`${SERIES[item.series].nameZh}系列已经集齐`);
  } else {
    toast(`${item.nameZh}已经放进收藏柜`);
  }
}

function bind() {
  $("normal-btn").onclick = () => { playSfx("click"); startRandomLevel(); };
  $("start-btn").onclick = () => { playSfx("click"); startLevel(TUTORIAL_LEVEL, "tutorial"); };
  $("back-camp").onclick = () => { playSfx("click"); persistActiveRun(); transitionScreen("camp"); };
  $("reset").onclick = () => { playSfx("click", .2); playCurrent(); };
  $("hint").onclick = showHint;
  $("collection-btn").onclick = () => { playSfx("click"); show("collection"); };
  $("pending-chest-btn").onclick = () => {
    state.seriesReturnScreen = "camp";
    playSfx("click"); renderSeriesOptions(); show("series");
  };
  $("collection-back").onclick = () => { playSfx("click"); show("camp"); };
  $("choose-series").onclick = () => {
    if (state.profile.chests < 1) return;
    state.seriesReturnScreen = "result";
    playSfx("click"); renderSeriesOptions(); show("series");
  };
  $("result-map").onclick = () => { playSfx("click"); startRandomLevel(); };
  $("result-home").onclick = () => { playSfx("click"); transitionScreen("camp"); };
  $("back-result").onclick = () => { playSfx("click"); show(state.seriesReturnScreen); };
  $("series-options").addEventListener("click", (e) => {
    const button = e.target.closest("[data-series]");
    if (!button) return;
    playSfx("click");
    prepareChest(button.dataset.series);
  });
  $("open-chest").onclick = openChest;
  $("view-collection").onclick = () => { playSfx("click"); show("collection"); };
  $("reward-home").onclick = () => { playSfx("click"); show("camp"); };
  $("collection-content").addEventListener("click", (e) => {
    const card = e.target.closest("[data-collectible]");
    if (card) playCollectible(card.dataset.collectible, card);
    const lockedCard = e.target.closest("[data-locked-collectible]");
    if (lockedCard) showLockedCollectible(lockedCard.dataset.lockedCollectible);
  });
  $("result-tasks").addEventListener("click", (e) => {
    const card = e.target.closest("[data-word-id]");
    if (!card) return;
    const wordId = card.dataset.wordId;
    const word = WORD_BANK[wordId];
    if (!word) return;
    document.querySelectorAll(".result-word-card.is-speaking").forEach((el) => el.classList.remove("is-speaking"));
    card.classList.add("is-speaking");
    clearTimeout(card._speakingTimer);
    card._speakingTimer = setTimeout(() => card.classList.remove("is-speaking"), 900);
    playSfx("click", .16);
    speak(word.en, [`../assets/audio/en-US/words/${wordId}.mp3`]);
  });
  $("collection-exchange").onclick = exchangeCollectible;
  $("treasure-listen").onclick = () => {
    playSfx("click", .16);
    playTreasurePrompt();
  };
  $("voice-toggle").onclick = () => {
    playSfx("click", .2);
    state.voice = !state.voice;
    $("voice-toggle").setAttribute("aria-pressed", String(state.voice));
    $("voice-toggle").lastChild.textContent = state.voice ? "朗读开" : "朗读关";
    $("voice-toggle").querySelector("img").src = state.voice
      ? "../assets/ui/icons/audio.svg"
      : "../assets/ui/icons/audio-muted.svg";
    if (!state.voice) stopNarration();
    if (state.voice) playCurrent();
  };
  $("grid").addEventListener("click", (e) => {
    const btn = e.target.closest(".cell");
    if (!btn) return;
    clickCell(Number(btn.dataset.x), Number(btn.dataset.y));
  });
  let resizeFrame = 0;
  window.addEventListener("resize", () => {
    cancelAnimationFrame(resizeFrame);
    resizeFrame = requestAnimationFrame(drawRoute);
  });
}

const TUTORIAL_LEVEL = {"id": "tutorial-1", "titleZh": "教学关：找到三个目标，再走回营地", "size": 3, "stepBudget": 4, "start": [0, 0], "exit": [2, 2], "note": "示范教学内容，尚未教研审核。", "tasks": [{"id": "listen-umbrella", "type": "listen", "labelZh": "听音", "promptZh": "听一听，找到对应的单词。", "spokenText": "umbrella", "correctId": "umbrella", "hintZh": "这个词常用来表示“雨伞”。", "explanationZh": "umbrella 在本词包中表示“雨伞”。"}, {"id": "meaning-rabbit", "type": "meaning", "labelZh": "含义", "promptZh": "找到表示“兔子”的词。", "spokenText": "An animal with long ears that can hop.", "correctId": "rabbit", "hintZh": "这是一种动物，也会出现在目标词的发音里。", "explanationZh": "rabbit 表示“兔子”。"}, {"id": "context-run", "type": "context", "labelZh": "语境", "promptZh": "根据句子选择合适的动词。", "promptEn": "During the race, I ___ as fast as I can.", "spokenText": "During the race, I blank as fast as I can.", "correctId": "run", "hintZh": "注意句子里的动作是在比赛中赛跑。", "explanationZh": "句子意思是：比赛时，我尽可能快跑。"}], "words": {"umbrella": {"en": "umbrella", "zh": "雨伞"}, "rabbit": {"en": "rabbit", "zh": "兔子"}, "run": {"en": "run", "zh": "跑"}, "eat": {"en": "eat", "zh": "吃"}, "hot": {"en": "hot", "zh": "热的"}, "book": {"en": "book", "zh": "书"}}, "cells": [{"x": 0, "y": 0, "tile": "start"}, {"x": 1, "y": 0, "tile": "path-h", "wordId": "umbrella"}, {"x": 2, "y": 0, "tile": "path", "wordId": "rabbit"}, {"x": 0, "y": 1, "tile": "ground", "wordId": "eat"}, {"x": 1, "y": 1, "tile": "ground"}, {"x": 2, "y": 1, "tile": "path", "wordId": "run"}, {"x": 0, "y": 2, "tile": "ground", "wordId": "hot"}, {"x": 1, "y": 2, "tile": "ground", "wordId": "book"}, {"x": 2, "y": 2, "tile": "exit"}]};

function main() {
  state.profile = loadProfile();
  state.level = TUTORIAL_LEVEL;
  bind();
  renderCamp();
  loadMotionManifest();
}

main();

