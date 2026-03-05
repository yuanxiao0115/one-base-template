import { promises as fs } from "node:fs";
import path from "node:path";

const rootDir = process.cwd();
const whitelistPath = path.join(rootDir, "apps/docs/public/cli-naming-whitelist.json");
const TARGET_MODULE_FILE_REGEX = /\/module\.ts$|\/api\/.*\.ts$|\/services\/.*\.ts$/;
const LEADING_LOWERCASE_REGEX = /^[a-z]+/;
const CAMEL_CASE_NAME_REGEX = /^[a-z][A-Za-z0-9]*$/;
const UPPERCASE_START_REGEX = /^[A-Z]/;

function toPosixPath(filePath) {
  return filePath.split(path.sep).join("/");
}

async function walkTsFiles(dir, out = []) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      await walkTsFiles(fullPath, out);
      continue;
    }
    if (!entry.isFile()) {
      continue;
    }
    if (!entry.name.endsWith(".ts")) {
      continue;
    }
    if (entry.name.endsWith(".d.ts")) {
      continue;
    }
    out.push(fullPath);
  }
  return out;
}

function getLineByIndex(code, index) {
  let line = 1;
  for (let i = 0; i < index; i += 1) {
    if (code[i] === "\n") {
      line += 1;
    }
  }
  return line;
}

function collectNames(code) {
  const list = [];
  const patterns = [
    /function\s+([A-Za-z_$][\w$]*)\s*\(/g,
    /const\s+([A-Za-z_$][\w$]*)\s*=\s*(?:async\s*)?\([^)]*\)\s*=>/g,
    /const\s+([A-Za-z_$][\w$]*)\s*=\s*(?:async\s*)?function\b/g,
  ];

  for (const pattern of patterns) {
    let match = pattern.exec(code);
    while (match) {
      list.push({
        name: match[1],
        line: getLineByIndex(code, match.index),
      });
      match = pattern.exec(code);
    }
  }

  return list;
}

function isTargetFile(filePath) {
  const p = toPosixPath(filePath);
  if (p.startsWith("apps/admin/src/router/")) {
    return true;
  }
  if (p.startsWith("apps/admin/src/shared/services/")) {
    return true;
  }
  if (!p.startsWith("apps/admin/src/modules/")) {
    return false;
  }
  return TARGET_MODULE_FILE_REGEX.test(p);
}

function splitVerb(name) {
  const match = name.match(LEADING_LOWERCASE_REGEX);
  return match ? match[0] : "";
}

function isCamelCaseName(name) {
  return CAMEL_CASE_NAME_REGEX.test(name);
}

function startsWithPrefix(name, prefix) {
  if (!name.startsWith(prefix)) {
    return false;
  }
  const tail = name.slice(prefix.length);
  if (!tail) {
    return false;
  }
  return UPPERCASE_START_REGEX.test(tail);
}

function getNamingSettings(config) {
  const allowedVerbs = new Set([
    ...(config.methodVerbs ?? []),
    ...(config.storeActionVerbs ?? []),
    ...(config.apiClientVerbs ?? []),
    ...(config.predicateVerbs ?? []),
  ]);
  const discouragedVerbs = new Set(config.discouragedVerbs ?? []);
  const eventPrefix = config.eventHandlerPrefix ?? "on";
  const composablePrefix = config.composablePrefix ?? "use";

  return {
    allowedVerbs,
    discouragedVerbs,
    eventPrefix,
    composablePrefix,
  };
}

async function collectTargetFiles() {
  const scanDirs = [
    path.join(rootDir, "apps/admin/src/router"),
    path.join(rootDir, "apps/admin/src/shared/services"),
    path.join(rootDir, "apps/admin/src/modules"),
  ];

  const allFiles = [];
  for (const dir of scanDirs) {
    const files = await walkTsFiles(dir);
    allFiles.push(...files);
  }

  return allFiles.map((filePath) => path.relative(rootDir, filePath)).filter(isTargetFile);
}

function pushViolation(violations, relPath, item, reason) {
  violations.push({
    file: relPath,
    line: item.line,
    name: item.name,
    reason,
  });
}

function checkNameViolation(item, relPath, settings, violations) {
  const name = item.name;
  if (!isCamelCaseName(name)) {
    return;
  }
  if (startsWithPrefix(name, settings.eventPrefix)) {
    return;
  }
  if (startsWithPrefix(name, settings.composablePrefix)) {
    return;
  }

  const verb = splitVerb(name);
  if (!verb) {
    return;
  }

  if (settings.discouragedVerbs.has(verb)) {
    pushViolation(violations, relPath, item, `不建议动词 "${verb}"`);
    return;
  }

  if (!settings.allowedVerbs.has(verb)) {
    pushViolation(violations, relPath, item, `未在白名单中的动词 "${verb}"`);
  }
}

async function collectViolations(targetFiles, settings) {
  const violations = [];
  for (const relPath of targetFiles) {
    const absPath = path.join(rootDir, relPath);
    const code = await fs.readFile(absPath, "utf-8");
    const names = collectNames(code);

    for (const item of names) {
      checkNameViolation(item, relPath, settings, violations);
    }
  }
  return violations;
}

function reportViolations(violations) {
  if (violations.length === 0) {
    console.log("命名检查通过：未发现违反白名单的函数命名。");
    return;
  }

  console.error(`命名检查失败：共 ${violations.length} 处违反白名单。`);
  for (const item of violations) {
    console.error(`- ${item.file}:${item.line}  ${item.name}（${item.reason}）`);
  }
  process.exit(1);
}

async function main() {
  const raw = await fs.readFile(whitelistPath, "utf-8");
  const config = JSON.parse(raw);
  const settings = getNamingSettings(config);
  const targetFiles = await collectTargetFiles();
  const violations = await collectViolations(targetFiles, settings);
  reportViolations(violations);
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`命名检查执行失败：${message}`);
  process.exit(1);
});
