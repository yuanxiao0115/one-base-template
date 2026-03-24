import { promises as fs } from 'node:fs';
import path from 'node:path';

const rootDir = process.cwd();
const whitelistPath = path.join(rootDir, 'apps/docs/public/cli-naming-whitelist.json');
const DATE_PATTERN_REGEX = /^\d{4}-\d{2}-\d{2}$/;

function isPlainObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function pushError(errors, message) {
  errors.push(message);
}

function validateStringArrayField(config, key, errors) {
  const value = config[key];
  if (!Array.isArray(value)) {
    pushError(errors, `${key} 必须是字符串数组`);
    return;
  }
  if (value.some((item) => !isNonEmptyString(item))) {
    pushError(errors, `${key} 只能包含非空字符串`);
    return;
  }

  const normalized = value.map((item) => item.trim());
  if (new Set(normalized).size !== normalized.length) {
    pushError(errors, `${key} 存在重复项`);
  }
}

function validateRules(config, errors) {
  if (!('rules' in config)) {
    return;
  }

  const rules = config.rules;
  if (!isPlainObject(rules)) {
    pushError(errors, 'rules 必须是对象');
    return;
  }

  const stringFields = ['methodPattern'];
  for (const key of stringFields) {
    if (key in rules && !isNonEmptyString(rules[key])) {
      pushError(errors, `rules.${key} 必须是非空字符串`);
    }
  }

  const boolFields = ['preferShortNames', 'allowHandleOnlyForEvents'];
  for (const key of boolFields) {
    if (key in rules && typeof rules[key] !== 'boolean') {
      pushError(errors, `rules.${key} 必须是布尔值`);
    }
  }
}

function validateCheckTargets(config, errors) {
  if (!isPlainObject(config.checkTargets)) {
    pushError(errors, 'checkTargets 必须是对象');
    return;
  }

  const entries = Object.entries(config.checkTargets);
  if (entries.length === 0) {
    pushError(errors, 'checkTargets 不能为空');
    return;
  }

  for (const [key, value] of entries) {
    if (!isNonEmptyString(value)) {
      pushError(errors, `checkTargets.${key} 必须是非空字符串`);
    }
  }
}

function validateAllowedNameExemptions(config, errors) {
  if ('allowedNames' in config) {
    pushError(errors, 'allowedNames 已废弃，请改用 allowedNameExemptions 并移除 allowedNames 字段');
  }

  const exemptions = config.allowedNameExemptions;
  if (!Array.isArray(exemptions)) {
    pushError(errors, 'allowedNameExemptions 必须是数组');
    return;
  }

  const today = new Date().toISOString().slice(0, 10);
  const duplicateKeySet = new Set();

  for (let index = 0; index < exemptions.length; index += 1) {
    const item = exemptions[index];
    const itemLabel = `allowedNameExemptions[${index}]`;
    if (!isPlainObject(item)) {
      pushError(errors, `${itemLabel} 必须是对象`);
      continue;
    }

    if (!isNonEmptyString(item.name)) {
      pushError(errors, `${itemLabel}.name 必须是非空字符串`);
    }
    if (!isNonEmptyString(item.owner)) {
      pushError(errors, `${itemLabel}.owner 必须是非空字符串`);
    }
    if (!isNonEmptyString(item.reason)) {
      pushError(errors, `${itemLabel}.reason 必须是非空字符串`);
    }

    if (!isNonEmptyString(item.expiresAt) || !DATE_PATTERN_REGEX.test(item.expiresAt.trim())) {
      pushError(errors, `${itemLabel}.expiresAt 必须是 YYYY-MM-DD`);
    } else if (item.expiresAt.trim() < today) {
      pushError(errors, `${itemLabel}.expiresAt 已过期（${item.expiresAt.trim()}）`);
    }

    if (!Array.isArray(item.scopes) || item.scopes.length === 0) {
      pushError(errors, `${itemLabel}.scopes 必须是非空字符串数组`);
      continue;
    }
    if (item.scopes.some((scope) => !isNonEmptyString(scope))) {
      pushError(errors, `${itemLabel}.scopes 只能包含非空字符串`);
      continue;
    }

    const scopeKey = [...new Set(item.scopes.map((scope) => scope.trim()))].sort().join('|');
    const duplicateKey = `${item.name.trim()}#${scopeKey}`;
    if (duplicateKeySet.has(duplicateKey)) {
      pushError(errors, `${itemLabel} 与其他豁免重复（name + scopes）`);
      continue;
    }
    duplicateKeySet.add(duplicateKey);
  }
}

function validateConfig(config) {
  const errors = [];

  if (!isPlainObject(config)) {
    pushError(errors, '命名白名单配置必须是 JSON 对象');
    return errors;
  }

  if (!isNonEmptyString(config.version)) {
    pushError(errors, 'version 必须是非空字符串');
  }

  if (!isNonEmptyString(config.updatedAt) || !DATE_PATTERN_REGEX.test(config.updatedAt.trim())) {
    pushError(errors, 'updatedAt 必须是 YYYY-MM-DD');
  }

  validateStringArrayField(config, 'methodVerbs', errors);
  validateStringArrayField(config, 'storeActionVerbs', errors);
  validateStringArrayField(config, 'apiClientVerbs', errors);
  validateStringArrayField(config, 'predicateVerbs', errors);
  validateStringArrayField(config, 'discouragedVerbs', errors);

  if (!isNonEmptyString(config.eventHandlerPrefix)) {
    pushError(errors, 'eventHandlerPrefix 必须是非空字符串');
  }
  if (!isNonEmptyString(config.composablePrefix)) {
    pushError(errors, 'composablePrefix 必须是非空字符串');
  }

  validateRules(config, errors);
  validateAllowedNameExemptions(config, errors);
  validateCheckTargets(config, errors);

  return errors;
}

async function main() {
  const raw = await fs.readFile(whitelistPath, 'utf-8');
  const config = JSON.parse(raw);
  const errors = validateConfig(config);

  if (errors.length > 0) {
    console.error(`命名白名单 schema 校验失败：共 ${errors.length} 处问题。`);
    for (const error of errors) {
      console.error(`- apps/docs/public/cli-naming-whitelist.json: ${error}`);
    }
    process.exit(1);
  }

  console.log('命名白名单 schema 校验通过。');
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`命名白名单 schema 校验执行失败：${message}`);
  process.exit(1);
});
