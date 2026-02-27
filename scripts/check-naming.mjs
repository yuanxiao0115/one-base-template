import { promises as fs } from 'node:fs';
import path from 'node:path';

const rootDir = process.cwd();
const whitelistPath = path.join(rootDir, 'apps/docs/public/cli-naming-whitelist.json');

function toPosixPath(filePath) {
  return filePath.split(path.sep).join('/');
}

async function walkTsFiles(dir, out = []) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      await walkTsFiles(fullPath, out);
      continue;
    }
    if (!entry.isFile()) continue;
    if (!entry.name.endsWith('.ts')) continue;
    if (entry.name.endsWith('.d.ts')) continue;
    out.push(fullPath);
  }
  return out;
}

function getLineByIndex(code, index) {
  let line = 1;
  for (let i = 0; i < index; i += 1) {
    if (code[i] === '\n') line += 1;
  }
  return line;
}

function collectNames(code) {
  const list = [];
  const patterns = [
    /function\s+([A-Za-z_$][\w$]*)\s*\(/g,
    /const\s+([A-Za-z_$][\w$]*)\s*=\s*(?:async\s*)?\([^)]*\)\s*=>/g,
    /const\s+([A-Za-z_$][\w$]*)\s*=\s*(?:async\s*)?function\b/g
  ];

  for (const pattern of patterns) {
    let match = pattern.exec(code);
    while (match) {
      list.push({
        name: match[1],
        line: getLineByIndex(code, match.index)
      });
      match = pattern.exec(code);
    }
  }

  return list;
}

function isTargetFile(filePath) {
  const p = toPosixPath(filePath);
  if (p.startsWith('apps/admin/src/router/')) return true;
  if (p.startsWith('apps/admin/src/shared/services/')) return true;
  if (!p.startsWith('apps/admin/src/modules/')) return false;
  return /\/module\.ts$|\/api\/.*\.ts$|\/services\/.*\.ts$/.test(p);
}

function splitVerb(name) {
  const match = name.match(/^[a-z]+/);
  return match ? match[0] : '';
}

function isCamelCaseName(name) {
  return /^[a-z][A-Za-z0-9]*$/.test(name);
}

function startsWithPrefix(name, prefix) {
  if (!name.startsWith(prefix)) return false;
  const tail = name.slice(prefix.length);
  if (!tail) return false;
  return /^[A-Z]/.test(tail);
}

async function main() {
  const raw = await fs.readFile(whitelistPath, 'utf-8');
  const config = JSON.parse(raw);

  const allowedVerbs = new Set([
    ...(config.methodVerbs ?? []),
    ...(config.storeActionVerbs ?? []),
    ...(config.apiClientVerbs ?? []),
    ...(config.predicateVerbs ?? [])
  ]);
  const discouragedVerbs = new Set(config.discouragedVerbs ?? []);
  const eventPrefix = config.eventHandlerPrefix ?? 'on';
  const composablePrefix = config.composablePrefix ?? 'use';

  const scanDirs = [
    path.join(rootDir, 'apps/admin/src/router'),
    path.join(rootDir, 'apps/admin/src/shared/services'),
    path.join(rootDir, 'apps/admin/src/modules')
  ];

  const allFiles = [];
  for (const dir of scanDirs) {
    const files = await walkTsFiles(dir);
    allFiles.push(...files);
  }

  const targetFiles = allFiles
    .map(filePath => path.relative(rootDir, filePath))
    .filter(isTargetFile);

  const violations = [];
  for (const relPath of targetFiles) {
    const absPath = path.join(rootDir, relPath);
    const code = await fs.readFile(absPath, 'utf-8');
    const names = collectNames(code);

    for (const item of names) {
      const name = item.name;
      if (!isCamelCaseName(name)) continue;
      if (startsWithPrefix(name, eventPrefix)) continue;
      if (startsWithPrefix(name, composablePrefix)) continue;

      const verb = splitVerb(name);
      if (!verb) continue;

      if (discouragedVerbs.has(verb)) {
        violations.push({
          file: relPath,
          line: item.line,
          name,
          reason: `不建议动词 "${verb}"`
        });
        continue;
      }

      if (!allowedVerbs.has(verb)) {
        violations.push({
          file: relPath,
          line: item.line,
          name,
          reason: `未在白名单中的动词 "${verb}"`
        });
      }
    }
  }

  if (violations.length === 0) {
    console.log('命名检查通过：未发现违反白名单的函数命名。');
    return;
  }

  console.error(`命名检查失败：共 ${violations.length} 处违反白名单。`);
  for (const item of violations) {
    console.error(`- ${item.file}:${item.line}  ${item.name}（${item.reason}）`);
  }
  process.exit(1);
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`命名检查执行失败：${message}`);
  process.exit(1);
});
