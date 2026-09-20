const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "../..");
const LEVELS_PATH = path.join(ROOT, "assets/content/levels.json");
const REPORT_PATH = path.join(ROOT, "asset-production/reports/level-validation.json");
const data = JSON.parse(fs.readFileSync(LEVELS_PATH, "utf8"));
const errors = [];
const key = ([x, y]) => `${x},${y}`;
const inside = ([x, y], size) => Number.isInteger(x) && Number.isInteger(y) && x >= 0 && y >= 0 && x < size && y < size;
const adjacent = ([ax, ay], [bx, by]) => Math.abs(ax - bx) + Math.abs(ay - by) === 1;
const transform = ([x, y], symmetry) => {
  switch (symmetry) {
    case 1: return [3 - x, y];
    case 2: return [x, 3 - y];
    case 3: return [3 - y, x];
    case 4: return [3 - x, 3 - y];
    case 5: return [y, 3 - x];
    case 6: return [y, x];
    case 7: return [3 - y, 3 - x];
    default: return [x, y];
  }
};

for (const level of data.templates) {
  if (level.size !== 4) errors.push({ level: level.id, code: "unexpected_size" });
  if (level.stepBudget !== 6) errors.push({ level: level.id, code: "step_budget_must_match_five_tasks_plus_exit" });
  if (!Array.isArray(level.routes) || level.routes.length < 2) errors.push({ level: level.id, code: "missing_route_variants" });
  for (let symmetry = 0; symmetry < 8; symmetry += 1) {
    const transformedBlocked = level.blocked.map((point) => transform(point, symmetry));
    const blocked = new Set(transformedBlocked.map(key));
    for (let variantIndex = 0; variantIndex < (level.routes || []).length; variantIndex += 1) {
      const route = level.routes[variantIndex].map((point) => transform(point, symmetry));
      const prefix = `${level.id}#${variantIndex + 1}@${symmetry}`;
      if (route.length !== 7) errors.push({ level: prefix, code: "route_must_have_start_five_tasks_exit" });
      if (route.length - 1 !== level.stepBudget) errors.push({ level: prefix, code: "route_step_count_mismatch" });
      const routeKeys = route.map(key);
      if (new Set(routeKeys).size !== routeKeys.length) errors.push({ level: prefix, code: "route_revisits_cell" });
      for (const point of route) {
        if (!inside(point, level.size)) errors.push({ level: prefix, code: "route_out_of_bounds", point });
        if (blocked.has(key(point))) errors.push({ level: prefix, code: "route_hits_blocked_river", point });
      }
      for (let index = 1; index < route.length; index += 1) {
        if (!adjacent(route[index - 1], route[index])) errors.push({ level: prefix, code: "non_adjacent_task_step", index });
      }
      for (const point of transformedBlocked) {
        if (!inside(point, level.size)) errors.push({ level: prefix, code: "blocked_out_of_bounds", point });
      }
    }
  }
}

const duplicateIds = data.templates.map((item) => item.id).filter((id, index, ids) => ids.indexOf(id) !== index);
for (const id of new Set(duplicateIds)) errors.push({ level: id, code: "duplicate_id" });

const report = {
  generatedAt: new Date().toISOString(),
  result: errors.length ? "failed" : "passed",
  templateCount: data.templates.length,
  routeVariantCount: data.templates.reduce((sum, level) => sum + level.routes.length, 0),
  runtimeRouteVariantCount: data.templates.reduce((sum, level) => sum + level.routes.length * 8, 0),
  checkedRules: ["bounds", "adjacent task steps", "no revisits", "blocked river cells", "five tasks plus exit", "step budget", "route variants", "eight rotations and reflections"],
  errors
};

fs.mkdirSync(path.dirname(REPORT_PATH), { recursive: true });
fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2) + "\n");
console.log(JSON.stringify(report, null, 2));
if (errors.length) process.exitCode = 1;
