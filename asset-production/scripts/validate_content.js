const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "../..");
const CONTENT_DIR = path.join(ROOT, "asset-production/prompt-pack/content");
const REPORT_PATH = path.join(ROOT, "asset-production/reports/content-validation.json");

function readJson(name) {
  return JSON.parse(fs.readFileSync(path.join(CONTENT_DIR, name), "utf8"));
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let quoted = false;
  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    if (quoted) {
      if (char === '"' && text[i + 1] === '"') {
        field += '"';
        i += 1;
      } else if (char === '"') {
        quoted = false;
      } else {
        field += char;
      }
    } else if (char === '"') {
      quoted = true;
    } else if (char === ",") {
      row.push(field);
      field = "";
    } else if (char === "\n") {
      row.push(field.replace(/\r$/, ""));
      if (row.some((value) => value !== "")) rows.push(row);
      row = [];
      field = "";
    } else {
      field += char;
    }
  }
  if (field || row.length) {
    row.push(field);
    rows.push(row);
  }
  const [headers, ...data] = rows;
  return data.map((values) => Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ""])));
}

function duplicates(values) {
  const seen = new Set();
  const repeated = new Set();
  for (const value of values) {
    if (seen.has(value)) repeated.add(value);
    seen.add(value);
  }
  return [...repeated];
}

const vocabulary = readJson("vocabulary.json");
const taskFile = readJson("tasks.json");
const voiceRows = parseCsv(fs.readFileSync(path.join(CONTENT_DIR, "voice-script.csv"), "utf8"));
const words = vocabulary.items;
const tasks = taskFile.tasks;
const wordIds = new Set(words.map((item) => item.id));
const errors = [];
const warnings = [];

for (const id of duplicates(words.map((item) => item.id))) errors.push({ code: "duplicate_word_id", id });
for (const id of duplicates(words.map((item) => item.senseId))) errors.push({ code: "duplicate_sense_id", id });
for (const id of duplicates(tasks.map((item) => item.id))) errors.push({ code: "duplicate_task_id", id });
for (const id of duplicates(voiceRows.map((item) => item.id))) errors.push({ code: "duplicate_voice_id", id });
for (const file of duplicates(voiceRows.map((item) => item.planned_path))) errors.push({ code: "duplicate_voice_path", file });

for (const word of words) {
  for (const field of ["id", "word", "meaningZh", "pos", "definitionEn", "senseId", "audioPath", "status"]) {
    if (!word[field]) errors.push({ code: "missing_word_field", id: word.id || null, field });
  }
  if (word.status !== "draft_pending_education_review") {
    warnings.push({ code: "unexpected_word_status", id: word.id, status: word.status });
  }
}

const allowedTypes = new Set(["listen", "meaning", "context"]);
for (const task of tasks) {
  if (!allowedTypes.has(task.type)) errors.push({ code: "unknown_task_type", id: task.id, type: task.type });
  if (!wordIds.has(task.targetId)) errors.push({ code: "missing_target", id: task.id, targetId: task.targetId });
  if (!Array.isArray(task.correctIds) || task.correctIds.length < 1) errors.push({ code: "missing_correct_ids", id: task.id });
  if (!Array.isArray(task.distractorIds) || task.distractorIds.length !== 3) errors.push({ code: "wrong_distractor_count", id: task.id });
  const candidates = [...(task.correctIds || []), ...(task.distractorIds || [])];
  for (const candidate of candidates) {
    if (!wordIds.has(candidate)) errors.push({ code: "missing_candidate", id: task.id, candidate });
  }
  if (new Set(candidates).size !== candidates.length) errors.push({ code: "duplicate_candidate", id: task.id });
  if (!(task.correctIds || []).includes(task.targetId)) errors.push({ code: "target_not_correct", id: task.id });
  for (const field of ["promptZh", "spokenText", "hintZh", "explanationZh", "audioPath", "status"]) {
    if (!task[field]) errors.push({ code: "missing_task_field", id: task.id, field });
  }
  if (task.type === "context") {
    if (!task.promptEn || !task.promptEn.includes("___")) errors.push({ code: "context_missing_blank", id: task.id });
    if (!/\bblank\b/i.test(task.spokenText || "")) errors.push({ code: "spoken_context_missing_blank", id: task.id });
  }
  if (task.status !== "draft_pending_education_review") {
    warnings.push({ code: "unexpected_task_status", id: task.id, status: task.status });
  }
}

for (const word of words) {
  const wordTasks = tasks.filter((task) => task.targetId === word.id);
  for (const requiredType of ["listen", "meaning"]) {
    if (!wordTasks.some((task) => task.type === requiredType)) {
      errors.push({ code: "missing_required_task", id: word.id, type: requiredType });
    }
  }
}

for (const row of voiceRows) {
  for (const field of ["id", "kind", "locale", "text", "meaning_zh", "planned_path", "direction", "status"]) {
    if (!row[field]) errors.push({ code: "missing_voice_field", id: row.id || null, field });
  }
  if (row.locale !== "en-US") warnings.push({ code: "unexpected_locale", id: row.id, locale: row.locale });
  if (row.status !== "draft_pending_review") warnings.push({ code: "unexpected_voice_status", id: row.id, status: row.status });
}

const typeCounts = tasks.reduce((counts, task) => {
  counts[task.type] = (counts[task.type] || 0) + 1;
  return counts;
}, {});
const voiceKindCounts = voiceRows.reduce((counts, row) => {
  counts[row.kind] = (counts[row.kind] || 0) + 1;
  return counts;
}, {});
const missingAudioFiles = voiceRows.filter((row) => !fs.existsSync(path.join(ROOT, row.planned_path))).length;

const report = {
  generatedAt: new Date().toISOString(),
  result: errors.length ? "failed" : "passed_programmatic_checks",
  scope: "Structural validation only; English educational review and audio listening review remain required.",
  counts: {
    words: words.length,
    tasks: tasks.length,
    taskTypes: typeCounts,
    voiceRows: voiceRows.length,
    voiceKinds: voiceKindCounts,
    missingAudioFiles
  },
  errors,
  warnings
};

fs.mkdirSync(path.dirname(REPORT_PATH), { recursive: true });
fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2) + "\n");
console.log(JSON.stringify(report, null, 2));
if (errors.length) process.exitCode = 1;
