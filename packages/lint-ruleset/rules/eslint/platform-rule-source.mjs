import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import tseslint from 'typescript-eslint';
import vue from 'eslint-plugin-vue';
import importPlugin from 'eslint-plugin-import';
import { builtinRules } from 'eslint/use-at-your-own-risk';

const MAPPINGS_FILE = path.resolve(
  path.dirname(new URL(import.meta.url).pathname),
  '../../mappings/full-frontend-all-rules.csv'
);

function parseCsvLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    if (char === '"') {
      if (inQuotes && line[index + 1] === '"') {
        current += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }
    if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
      continue;
    }
    current += char;
  }
  result.push(current);
  return result;
}

function readPlatformRows() {
  const text = fs.readFileSync(MAPPINGS_FILE, 'utf8').trim();
  if (!text) {
    return [];
  }
  const lines = text.split(/\r?\n/).filter(Boolean);
  const headers = parseCsvLine(lines[0]);
  return lines.slice(1).map((line) => {
    const values = parseCsvLine(line);
    const row = {};
    headers.forEach((header, index) => {
      row[header] = values[index] ?? '';
    });
    return row;
  });
}

const cachedRows = readPlatformRows();
const require = createRequire(import.meta.url);
const eslintVersion = require('eslint/package.json').version ?? '0.0.0';
const eslintMajorVersion = Number.parseInt(eslintVersion.split('.')[0] ?? '0', 10);
const temporarilyUnsupportedRuleNames = new Set(
  eslintMajorVersion >= 10
    ? [
        // eslint-plugin-import 目前尚未声明兼容 ESLint 10，该规则会触发运行时异常。
        'import/order'
      ]
    : []
);
const coreRuleNames = new Set(builtinRules.keys());
const importRuleNames = new Set(
  Object.keys(importPlugin.rules ?? {}).map((ruleName) => `import/${ruleName}`)
);
const tsRuleNames = new Set(
  Object.keys(tseslint.plugin?.rules ?? {}).map((ruleName) => `@typescript-eslint/${ruleName}`)
);
const tsTypeAwareRuleNames = new Set(
  Object.entries(tseslint.plugin?.rules ?? {})
    .filter(([, rule]) => rule?.meta?.docs?.requiresTypeChecking)
    .map(([ruleName]) => `@typescript-eslint/${ruleName}`)
);
const vueRuleNames = new Set(
  Object.keys(vue.rules ?? {}).map((ruleName) => `vue/${ruleName}`)
);

function isSupportedRule(ruleName) {
  if (!ruleName.includes('/')) {
    return coreRuleNames.has(ruleName);
  }
  if (ruleName.startsWith('import/')) {
    return importRuleNames.has(ruleName);
  }
  if (ruleName.startsWith('@typescript-eslint/')) {
    return tsRuleNames.has(ruleName);
  }
  if (ruleName.startsWith('vue/')) {
    return vueRuleNames.has(ruleName);
  }
  return false;
}

function getRuleByName(ruleName) {
  if (!ruleName.includes('/')) {
    return builtinRules.get(ruleName);
  }
  if (ruleName.startsWith('import/')) {
    return importPlugin.rules?.[ruleName.slice('import/'.length)];
  }
  if (ruleName.startsWith('@typescript-eslint/')) {
    return tseslint.plugin?.rules?.[ruleName.slice('@typescript-eslint/'.length)];
  }
  if (ruleName.startsWith('vue/')) {
    return vue.rules?.[ruleName.slice('vue/'.length)];
  }
  return null;
}

export function getRuleDefaultOptions(ruleName) {
  const rule = getRuleByName(ruleName);
  const defaultOptions = rule?.defaultOptions ?? rule?.meta?.defaultOptions;
  return Array.isArray(defaultOptions) ? defaultOptions : null;
}

export function getPlatformRuleNames({
  langName,
  includePrefixes,
  excludeDeprecated = true,
  includeTypeAware = false,
  typeAwareOnly = false
}) {
  const names = new Set();

  for (const row of cachedRows) {
    if (row.sourceTool !== 'ESLint-缺陷') {
      continue;
    }
    if (row.langName !== langName) {
      continue;
    }
    if (excludeDeprecated && row.deprecated === 'true') {
      continue;
    }

    const ruleName = row.ruleName;
    if (!ruleName) {
      continue;
    }

    const matchedPrefix = includePrefixes.some((prefix) => {
      if (prefix === '(core)') {
        return !ruleName.includes('/');
      }
      return ruleName.startsWith(prefix);
    });
    if (!matchedPrefix) {
      continue;
    }
    if (!isSupportedRule(ruleName)) {
      continue;
    }
    if (temporarilyUnsupportedRuleNames.has(ruleName)) {
      continue;
    }
    const isTypeAwareRule = tsTypeAwareRuleNames.has(ruleName);
    if (typeAwareOnly && !isTypeAwareRule) {
      continue;
    }
    if (!includeTypeAware && isTypeAwareRule) {
      continue;
    }
    names.add(ruleName);
  }

  return [...names].sort((left, right) => left.localeCompare(right, 'en'));
}

export function toWarnRules(ruleNames) {
  return Object.fromEntries(ruleNames.map((ruleName) => [ruleName, 'warn']));
}

export function toWarnRulesWithDefaultOptions(ruleNames) {
  return Object.fromEntries(
    ruleNames.map((ruleName) => {
      const defaultOptions = getRuleDefaultOptions(ruleName);
      if (defaultOptions && defaultOptions.length > 0) {
        return [ruleName, ['warn', ...defaultOptions]];
      }
      return [ruleName, 'warn'];
    })
  );
}
