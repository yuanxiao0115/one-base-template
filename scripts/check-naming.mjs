import { promises as fs } from 'node:fs';
import path from 'node:path';

const rootDir = process.cwd();
const whitelistPath = path.join(rootDir, 'apps/docs/public/cli-naming-whitelist.json');
const TARGET_MODULE_FILE_REGEX = /\/module\.ts$|\/api\/.*\.ts$|\/services\/.*\.ts$/;
const TARGET_BASE_ROUTE_REGEX = /\/routes\.ts$/;
const LEADING_LOWERCASE_REGEX = /^[a-z]+/;
const CAMEL_CASE_NAME_REGEX = /^[a-z][A-Za-z0-9]*$/;
const UPPERCASE_START_REGEX = /^[A-Z]/;
const DATE_PATTERN_REGEX = /^\d{4}-\d{2}-\d{2}$/;

function toPosixPath(filePath) {
  return filePath.split(path.sep).join('/');
}

async function walkTsFiles(dir, out = []) {
  let entries;
  try {
    entries = await fs.readdir(dir, { withFileTypes: true });
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT') {
      return out;
    }
    throw error;
  }
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      await walkTsFiles(fullPath, out);
      continue;
    }
    if (!entry.isFile()) {
      continue;
    }
    if (!entry.name.endsWith('.ts')) {
      continue;
    }
    if (entry.name.endsWith('.d.ts')) {
      continue;
    }
    out.push(fullPath);
  }
  return out;
}

function getLineByIndex(code, index) {
  let line = 1;
  for (let i = 0; i < index; i += 1) {
    if (code[i] === '\n') {
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
  if (p.startsWith('apps/admin/src/router/')) {
    return true;
  }
  if (p.startsWith('apps/admin/src/services/auth/')) {
    return true;
  }
  if (p.startsWith('apps/admin-lite/src/router/')) {
    return true;
  }
  if (p.startsWith('apps/admin-lite/src/services/auth/')) {
    return true;
  }
  if (p.startsWith('apps/portal/src/services/auth/')) {
    return true;
  }
  if (p.startsWith('apps/admin-lite/src/modules/')) {
    return TARGET_MODULE_FILE_REGEX.test(p) || TARGET_BASE_ROUTE_REGEX.test(p);
  }
  if (p.startsWith('apps/admin/src/modules/') || p.startsWith('apps/portal/src/modules/')) {
    return TARGET_MODULE_FILE_REGEX.test(p);
  }
  return false;
}

function splitVerb(name) {
  const match = name.match(LEADING_LOWERCASE_REGEX);
  return match ? match[0] : '';
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

function escapeRegex(input) {
  return input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function createScopeMatcher(scope) {
  const normalized = toPosixPath(scope).replace(/^\.\//, '');
  const pattern = normalized
    .split('*')
    .map((segment) => escapeRegex(segment))
    .join('.*');
  return new RegExp(`^${pattern}$`);
}

function createAllowedNameMatcher(config) {
  const legacyAllowedNames = config.allowedNames ?? [];
  if (Array.isArray(legacyAllowedNames) && legacyAllowedNames.length > 0) {
    throw new Error(
      'allowedNames 已停用，请改用 allowedNameExemptions，并补充 owner/reason/expiresAt/scope。'
    );
  }

  const rawExemptions = config.allowedNameExemptions ?? [];
  if (!Array.isArray(rawExemptions)) {
    throw new Error('allowedNameExemptions 必须是数组。');
  }

  const today = new Date().toISOString().slice(0, 10);
  const rules = rawExemptions.map((raw, index) => {
    if (!raw || typeof raw !== 'object') {
      throw new Error(`allowedNameExemptions[${index}] 必须是对象。`);
    }

    const name = typeof raw.name === 'string' ? raw.name.trim() : '';
    const owner = typeof raw.owner === 'string' ? raw.owner.trim() : '';
    const reason = typeof raw.reason === 'string' ? raw.reason.trim() : '';
    const expiresAt = typeof raw.expiresAt === 'string' ? raw.expiresAt.trim() : '';
    const scopes = Array.isArray(raw.scopes) ? raw.scopes : [];

    if (!name) {
      throw new Error(`allowedNameExemptions[${index}] 缺少 name。`);
    }
    if (!owner) {
      throw new Error(`allowedNameExemptions[${index}] 缺少 owner。`);
    }
    if (!reason) {
      throw new Error(`allowedNameExemptions[${index}] 缺少 reason。`);
    }
    if (!DATE_PATTERN_REGEX.test(expiresAt)) {
      throw new Error(`allowedNameExemptions[${index}] 的 expiresAt 必须是 YYYY-MM-DD。`);
    }
    if (expiresAt < today) {
      throw new Error(
        `allowedNameExemptions[${index}] 已过期（${expiresAt}），请先清理豁免或完成重命名。`
      );
    }
    if (scopes.length === 0) {
      throw new Error(`allowedNameExemptions[${index}] 缺少 scopes。`);
    }
    if (scopes.some((scope) => typeof scope !== 'string' || !scope.trim())) {
      throw new Error(`allowedNameExemptions[${index}] 的 scopes 必须是非空字符串数组。`);
    }

    return {
      key: `${name}#${index}`,
      name,
      scopes,
      matchers: scopes.map((scope) => createScopeMatcher(scope))
    };
  });

  const usedRuleKeys = new Set();

  return {
    isAllowed(relPath, name) {
      for (const rule of rules) {
        if (rule.name !== name) {
          continue;
        }
        if (rule.matchers.some((matcher) => matcher.test(relPath))) {
          usedRuleKeys.add(rule.key);
          return true;
        }
      }
      return false;
    },
    collectUnusedRules() {
      return rules.filter((rule) => !usedRuleKeys.has(rule.key));
    }
  };
}

function getNamingSettings(config) {
  const allowedVerbs = new Set([
    ...(config.methodVerbs ?? []),
    ...(config.storeActionVerbs ?? []),
    ...(config.apiClientVerbs ?? []),
    ...(config.predicateVerbs ?? [])
  ]);
  const discouragedVerbs = new Set(config.discouragedVerbs ?? []);
  const allowedNameMatcher = createAllowedNameMatcher(config);
  const eventPrefix = config.eventHandlerPrefix ?? 'on';
  const composablePrefix = config.composablePrefix ?? 'use';

  return {
    allowedVerbs,
    discouragedVerbs,
    allowedNameMatcher,
    eventPrefix,
    composablePrefix
  };
}

async function collectTargetFiles() {
  const scanDirs = [
    path.join(rootDir, 'apps/admin/src/router'),
    path.join(rootDir, 'apps/admin/src/services/auth'),
    path.join(rootDir, 'apps/admin/src/modules'),
    path.join(rootDir, 'apps/admin-lite/src/router'),
    path.join(rootDir, 'apps/admin-lite/src/services/auth'),
    path.join(rootDir, 'apps/admin-lite/src/modules'),
    path.join(rootDir, 'apps/portal/src/services/auth'),
    path.join(rootDir, 'apps/portal/src/modules')
  ];

  const allFiles = [];
  for (const dir of scanDirs) {
    const files = await walkTsFiles(dir);
    allFiles.push(...files);
  }

  return allFiles
    .map((filePath) => toPosixPath(path.relative(rootDir, filePath)))
    .filter(isTargetFile);
}

function pushViolation(violations, relPath, item, reason) {
  violations.push({
    file: relPath,
    line: item.line,
    name: item.name,
    reason
  });
}

function checkNameViolation(item, relPath, settings, violations) {
  const name = item.name;
  if (!isCamelCaseName(name)) {
    return;
  }
  if (settings.allowedNameMatcher.isAllowed(relPath, name)) {
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
    const code = await fs.readFile(absPath, 'utf-8');
    const names = collectNames(code);

    for (const item of names) {
      checkNameViolation(item, relPath, settings, violations);
    }
  }
  return violations;
}

function reportViolations(violations, unusedRules) {
  if (violations.length === 0 && unusedRules.length === 0) {
    console.log('命名检查通过：未发现违反白名单的函数命名。');
    return;
  }

  console.error(`命名检查失败：共 ${violations.length + unusedRules.length} 处问题。`);
  for (const item of violations) {
    console.error(`- ${item.file}:${item.line}  ${item.name}（${item.reason}）`);
  }
  for (const rule of unusedRules) {
    console.error(
      `- apps/docs/public/cli-naming-whitelist.json:1  ${rule.name}（豁免未命中任何文件，请删除）`
    );
  }
  process.exit(1);
}

async function main() {
  const raw = await fs.readFile(whitelistPath, 'utf-8');
  const config = JSON.parse(raw);
  const settings = getNamingSettings(config);
  const targetFiles = await collectTargetFiles();
  const violations = await collectViolations(targetFiles, settings);
  const unusedRules = settings.allowedNameMatcher.collectUnusedRules();
  reportViolations(violations, unusedRules);
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`命名检查执行失败：${message}`);
  process.exit(1);
});
