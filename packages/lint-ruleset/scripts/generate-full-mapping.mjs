#!/usr/bin/env node
/**
 * 基于导出规则生成“前端全量（排除 Node.js）”映射清单：
 * - full-frontend-all-rules.csv
 * - full-frontend-direct-rules.csv
 * - full-frontend-partial-rules.csv
 * - full-frontend-none-rules.csv
 * - full-frontend-summary.json
 *
 * 用法：
 * node ./scripts/generate-full-mapping.mjs \
 *   --multi /tmp/rules-out-multi/rules-*.json \
 *   --css /tmp/rules-out-css/rules-*.json
 */

import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import process from 'node:process';
import stylelint from 'stylelint';
import vuePlugin from 'eslint-plugin-vue';
import eslintPreset from '../eslint.config.mjs';
import { jsStandardRuleMap } from '../rules/eslint/js-standard-rule-map.mjs';

const ROOT_DIR = path.resolve(new URL('..', import.meta.url).pathname);
const MAPPINGS_DIR = path.join(ROOT_DIR, 'mappings');
const EXISTING_REPLACED = path.join(MAPPINGS_DIR, 'replaced-rules.csv');
const EXISTING_UNMAPPED = path.join(MAPPINGS_DIR, 'unmapped-rules.csv');
const STYLELINT_CONFIG = path.join(ROOT_DIR, 'stylelint.config.cjs');

const CORE_HEADERS = [
  'sourceTool',
  'langName',
  'ruleId',
  'ruleName',
  'ruleLevel',
  'mappingStatus',
  'replacementTool',
  'replacementRuleOrPack',
  'note'
];
const FULL_FRONTEND_HEADERS = [
  ...CORE_HEADERS,
  'officialCategory',
  'deprecated',
  'baselineIncluded',
  'baselineReason'
];
const VUE_PRIORITY_HEADERS = [
  'ruleName',
  'officialCategory',
  'deprecated',
  'baselineIncluded',
  'currentMappingStatus',
  'governanceAction',
  'note'
];
const VUE_CATEGORY_SEQUENCE = [
  'base',
  'vue2-essential',
  'vue3-essential',
  'vue2-strongly-recommended',
  'vue3-strongly-recommended'
];
const VUE_BASELINE_CATEGORIES = new Set([
  'base',
  'vue3-essential',
  'vue3-strongly-recommended'
]);
const DEPRECATED_EXCLUDE_NOTE =
  'deprecated (eslint-plugin-vue), excluded from vue3 baseline';

function getArg(name, fallback = '') {
  const idx = process.argv.indexOf(name);
  if (idx === -1) {
    return fallback;
  }
  return process.argv[idx + 1] ?? fallback;
}

function parseCsvLine(line) {
  const out = [];
  let current = '';
  let quote = false;
  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];
    if (ch === '"') {
      if (quote && line[i + 1] === '"') {
        current += '"';
        i += 1;
      } else {
        quote = !quote;
      }
      continue;
    }
    if (ch === ',' && !quote) {
      out.push(current);
      current = '';
      continue;
    }
    current += ch;
  }
  out.push(current);
  return out;
}

function parseCsv(text) {
  const lines = text.split(/\r?\n/).filter(Boolean);
  if (!lines.length) {
    return [];
  }
  const headers = parseCsvLine(lines[0]);
  return lines.slice(1).map((line) => {
    const values = parseCsvLine(line);
    const row = {};
    headers.forEach((key, idx) => {
      row[key] = values[idx] ?? '';
    });
    return row;
  });
}

function toCsv(rows, headers = CORE_HEADERS) {
  const escape = (value) => {
    if (value == null) {
      return '';
    }
    const str = String(value);
    if (/[",\n\r]/.test(str)) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };
  const lines = [headers.join(',')];
  for (const row of rows) {
    lines.push(headers.map((key) => escape(row[key])).join(','));
  }
  return lines.join('\n');
}

function createDefaultGovernanceMeta() {
  return {
    officialCategory: '-',
    deprecated: 'false',
    baselineIncluded: 'false',
    baselineReason: 'out-of-scope'
  };
}

function createVueRuleMetaMap() {
  const map = new Map();
  for (const [ruleName, rule] of Object.entries(vuePlugin.rules)) {
    const fullName = `vue/${ruleName}`;
    const categories = (rule?.meta?.docs?.categories ?? []).filter((category) =>
      VUE_CATEGORY_SEQUENCE.includes(category)
    );
    const orderedCategories = VUE_CATEGORY_SEQUENCE.filter((category) =>
      categories.includes(category)
    );
    map.set(fullName, {
      categories: orderedCategories,
      deprecated: Boolean(rule?.meta?.deprecated)
    });
  }
  return map;
}

function buildVueGovernanceMeta(base, context) {
  const defaultMeta = createDefaultGovernanceMeta();
  if (
    base.sourceTool !== 'ESLint-缺陷' ||
    base.langName !== 'Vue' ||
    !base.ruleName.startsWith('vue/')
  ) {
    return defaultMeta;
  }

  const vueMeta = context.vueRuleMetaMap.get(base.ruleName);
  if (!vueMeta) {
    return defaultMeta;
  }

  const hasVue2Category = vueMeta.categories.some((category) => category.startsWith('vue2-'));
  const baselineIncluded =
    !vueMeta.deprecated &&
    vueMeta.categories.some((category) => VUE_BASELINE_CATEGORIES.has(category));
  let baselineReason = 'out-of-scope';
  if (vueMeta.deprecated) {
    baselineReason = 'deprecated';
  } else if (baselineIncluded) {
    baselineReason = 'vue3-baseline';
  } else if (hasVue2Category) {
    baselineReason = 'vue2-legacy';
  }

  return {
    officialCategory: vueMeta.categories.length ? vueMeta.categories.join('|') : '-',
    deprecated: vueMeta.deprecated ? 'true' : 'false',
    baselineIncluded: baselineIncluded ? 'true' : 'false',
    baselineReason
  };
}

function collectRuleNamesFromEslintPreset(preset) {
  const names = new Set();
  for (const item of preset) {
    if (!item || typeof item !== 'object') {
      continue;
    }
    if (item.rules && typeof item.rules === 'object') {
      Object.keys(item.rules).forEach((name) => names.add(name));
    }
  }
  return names;
}

async function resolveStylelintRuleNames() {
  const tempFile = path.join(os.tmpdir(), 'lint-ruleset-stylelint-resolve.css');
  await fs.writeFile(tempFile, '.a { color: red; }\n', 'utf8');
  const resolved = await stylelint.resolveConfig(tempFile, {
    configFile: STYLELINT_CONFIG
  });
  const rules = resolved?.rules ?? {};
  return new Set(Object.keys(rules));
}

function normalizeItems(payload) {
  if (Array.isArray(payload?.items)) {
    return payload.items;
  }
  if (Array.isArray(payload?.data)) {
    return payload.data;
  }
  return [];
}

async function readJson(filePath) {
  const raw = await fs.readFile(filePath, 'utf8');
  return JSON.parse(raw);
}

function formatRow(base, override, governance = createDefaultGovernanceMeta()) {
  return {
    sourceTool: base.sourceTool,
    langName: base.langName,
    ruleId: String(base.ruleId),
    ruleName: base.ruleName,
    ruleLevel: String(base.ruleLevel),
    mappingStatus: override.mappingStatus,
    replacementTool: override.replacementTool,
    replacementRuleOrPack: override.replacementRuleOrPack,
    note: override.note,
    officialCategory: governance.officialCategory,
    deprecated: governance.deprecated,
    baselineIncluded: governance.baselineIncluded,
    baselineReason: governance.baselineReason
  };
}

function summarize(rows) {
  const summary = {
    total: rows.length,
    byStatus: {},
    byTool: {},
    byLevel: {},
    governance: {
      excludedDeprecatedVueRules: 0,
      actionableNone: 0
    }
  };

  for (const row of rows) {
    summary.byStatus[row.mappingStatus] = (summary.byStatus[row.mappingStatus] ?? 0) + 1;

    if (!summary.byTool[row.sourceTool]) {
      summary.byTool[row.sourceTool] = {};
    }
    summary.byTool[row.sourceTool][row.mappingStatus] =
      (summary.byTool[row.sourceTool][row.mappingStatus] ?? 0) + 1;

    if (!summary.byLevel[row.ruleLevel]) {
      summary.byLevel[row.ruleLevel] = {};
    }
    summary.byLevel[row.ruleLevel][row.mappingStatus] =
      (summary.byLevel[row.ruleLevel][row.mappingStatus] ?? 0) + 1;

    if (row.deprecated === 'true') {
      summary.governance.excludedDeprecatedVueRules += 1;
    }
    if (row.mappingStatus === 'none' && row.deprecated !== 'true') {
      summary.governance.actionableNone += 1;
    }
  }
  return summary;
}

function buildVueGovernanceAction(row) {
  if (row.deprecated === 'true') {
    return 'exclude-deprecated';
  }
  if (row.baselineReason === 'vue2-legacy') {
    return 'exclude-vue2-legacy';
  }
  if (row.baselineIncluded === 'true') {
    if (row.mappingStatus === 'direct' || row.mappingStatus === 'partial') {
      return 'enforce';
    }
    return 'defer';
  }
  return 'defer';
}

function buildVuePriorityNote(row, action) {
  if (action === 'exclude-deprecated') {
    return DEPRECATED_EXCLUDE_NOTE;
  }
  if (action === 'exclude-vue2-legacy') {
    return 'legacy vue2 rule, excluded from vue3 baseline';
  }
  if (action === 'enforce') {
    return 'in vue3 baseline and already mappable, enforce in team lint gate';
  }
  if (row.baselineIncluded !== 'true') {
    return 'outside vue3 baseline scope, keep deferred for now';
  }
  return 'in vue3 governance scope but currently not mappable, defer for phased rollout';
}

function buildVuePriorityRows(rows) {
  return rows
    .filter(
      (row) =>
        row.sourceTool === 'ESLint-缺陷' &&
        row.langName === 'Vue' &&
        row.ruleName.startsWith('vue/')
    )
    .map((row) => {
      const action = buildVueGovernanceAction(row);
      return {
        ruleName: row.ruleName,
        officialCategory: row.officialCategory,
        deprecated: row.deprecated,
        baselineIncluded: row.baselineIncluded,
        currentMappingStatus: row.mappingStatus,
        governanceAction: action,
        note: buildVuePriorityNote(row, action)
      };
    })
    .sort((a, b) => a.ruleName.localeCompare(b.ruleName, 'en'));
}

function summarizeVuePriority(rows) {
  const counts = {
    byCategory: {},
    byMappingStatus: {},
    deprecated: 0,
    vue2LegacyExcluded: 0,
    baselineGap: 0
  };

  for (const row of rows) {
    const categories = row.officialCategory === '-' ? ['-'] : row.officialCategory.split('|');
    for (const category of categories) {
      counts.byCategory[category] = (counts.byCategory[category] ?? 0) + 1;
    }

    counts.byMappingStatus[row.currentMappingStatus] =
      (counts.byMappingStatus[row.currentMappingStatus] ?? 0) + 1;

    if (row.deprecated === 'true') {
      counts.deprecated += 1;
    }
    if (row.governanceAction === 'exclude-vue2-legacy') {
      counts.vue2LegacyExcluded += 1;
    }
    if (
      row.baselineIncluded === 'true' &&
      row.deprecated !== 'true' &&
      row.currentMappingStatus === 'none'
    ) {
      counts.baselineGap += 1;
    }
  }

  return counts;
}

function buildBaseRule(item) {
  return {
    sourceTool: item.toolName,
    langName: item.langName,
    ruleId: item.ruleId,
    ruleName: item.ruleName,
    ruleLevel: item.ruleLevel
  };
}

function mapSonarOrCsslintRule(base, existingMap) {
  const key = `${base.sourceTool}:${base.ruleId}`;
  const exist = existingMap.get(key);
  if (!exist) {
    return formatRow(base, {
      mappingStatus: 'none',
      replacementTool: '-',
      replacementRuleOrPack: '-',
      note: '缺少已维护映射记录，建议补充到 replaced/unmapped 清单'
    });
  }
  return formatRow(base, {
    mappingStatus: exist.mappingStatus,
    replacementTool: exist.replacementTool,
    replacementRuleOrPack: exist.replacementRuleOrPack,
    note: exist.note
  });
}

function mapStylelintRule(base, stylelintRuleNames) {
  if (stylelintRuleNames.has(base.ruleName)) {
    return formatRow(base, {
      mappingStatus: 'direct',
      replacementTool: 'Stylelint',
      replacementRuleOrPack: base.ruleName,
      note: 'stylelint 配置可直接命中（含 extends 后的有效规则）'
    });
  }
  const stylisticRule = `@stylistic/${base.ruleName}`;
  if (stylelintRuleNames.has(stylisticRule)) {
    return formatRow(base, {
      mappingStatus: 'partial',
      replacementTool: 'Stylelint(+@stylistic)',
      replacementRuleOrPack: stylisticRule,
      note: '原规则由 @stylistic 前缀规则近似替代'
    });
  }
  return formatRow(base, {
    mappingStatus: 'none',
    replacementTool: '-',
    replacementRuleOrPack: '-',
    note: '当前 stylelint 规则包未覆盖，建议按需增补或保留平台校验'
  });
}

function mapEslintDefectRule(base, eslintRuleNames) {
  if (eslintRuleNames.has(base.ruleName)) {
    return formatRow(base, {
      mappingStatus: 'direct',
      replacementTool: 'ESLint(+plugins)',
      replacementRuleOrPack: base.ruleName,
      note: 'ESLint 规则包可直接命中'
    });
  }

  if (base.ruleName.startsWith('@typescript-eslint/')) {
    const coreRule = base.ruleName.split('/', 2)[1];
    if (eslintRuleNames.has(coreRule)) {
      return formatRow(base, {
        mappingStatus: 'partial',
        replacementTool: 'ESLint core',
        replacementRuleOrPack: coreRule,
        note: '通过同名 core 规则近似替代'
      });
    }
  } else {
    const tsRule = `@typescript-eslint/${base.ruleName}`;
    if (eslintRuleNames.has(tsRule)) {
      return formatRow(base, {
        mappingStatus: 'partial',
        replacementTool: '@typescript-eslint',
        replacementRuleOrPack: tsRule,
        note: '通过 @typescript-eslint 同名规则近似替代'
      });
    }
  }

  return formatRow(base, {
    mappingStatus: 'none',
    replacementTool: '-',
    replacementRuleOrPack: '-',
    note: '当前 ESLint 规则包未启用该规则，建议按需补齐'
  });
}

function mapEslintStandardRule(base) {
  const mapped = jsStandardRuleMap[base.ruleName];
  if (mapped) {
    return formatRow(base, mapped);
  }
  return formatRow(base, {
    mappingStatus: 'none',
    replacementTool: '-',
    replacementRuleOrPack: '-',
    note: '平台 JS 编码规范编号规则（JSxxx），需维护专用映射字典'
  });
}

function mapDefaultRule(base) {
  return formatRow(base, {
    mappingStatus: 'none',
    replacementTool: '-',
    replacementRuleOrPack: '-',
    note: '未知规则来源，默认未映射'
  });
}

function mapRule(item, context) {
  const base = buildBaseRule(item);
  const governance = buildVueGovernanceMeta(base, context);
  let mapped;
  switch (base.sourceTool) {
    case 'Sonar':
    case 'Csslint':
      mapped = mapSonarOrCsslintRule(base, context.existingMap);
      break;
    case 'Stylelint':
      mapped = mapStylelintRule(base, context.stylelintRuleNames);
      break;
    case 'ESLint-缺陷':
      mapped = mapEslintDefectRule(base, context.eslintRuleNames);
      break;
    case 'ESLint-规范':
      mapped = mapEslintStandardRule(base);
      break;
    default:
      mapped = mapDefaultRule(base);
      break;
  }

  const row = {
    ...mapped,
    officialCategory: governance.officialCategory,
    deprecated: governance.deprecated,
    baselineIncluded: governance.baselineIncluded,
    baselineReason: governance.baselineReason
  };

  if (row.deprecated === 'true') {
    row.note = DEPRECATED_EXCLUDE_NOTE;
  }
  return row;
}

function sortRows(rows) {
  return [...rows].sort((a, b) => {
    const byTool = a.sourceTool.localeCompare(b.sourceTool, 'zh-CN');
    if (byTool) {
      return byTool;
    }
    const byLang = a.langName.localeCompare(b.langName, 'zh-CN');
    if (byLang) {
      return byLang;
    }
    return Number(a.ruleId) - Number(b.ruleId);
  });
}

async function writeMappingFiles(rows, meta) {
  const directRows = rows.filter((row) => row.mappingStatus === 'direct');
  const partialRows = rows.filter((row) => row.mappingStatus === 'partial');
  const noneRows = rows.filter((row) => row.mappingStatus === 'none');
  const vuePriorityRows = buildVuePriorityRows(rows);
  const summary = summarize(rows);
  const vuePrioritySummary = summarizeVuePriority(vuePriorityRows);

  await fs.writeFile(
    path.join(MAPPINGS_DIR, 'full-frontend-all-rules.csv'),
    toCsv(rows, FULL_FRONTEND_HEADERS),
    'utf8'
  );
  await fs.writeFile(
    path.join(MAPPINGS_DIR, 'full-frontend-direct-rules.csv'),
    toCsv(directRows, FULL_FRONTEND_HEADERS),
    'utf8'
  );
  await fs.writeFile(
    path.join(MAPPINGS_DIR, 'full-frontend-partial-rules.csv'),
    toCsv(partialRows, FULL_FRONTEND_HEADERS),
    'utf8'
  );
  await fs.writeFile(
    path.join(MAPPINGS_DIR, 'full-frontend-none-rules.csv'),
    toCsv(noneRows, FULL_FRONTEND_HEADERS),
    'utf8'
  );
  await fs.writeFile(
    path.join(MAPPINGS_DIR, 'vue-priority-baseline.csv'),
    toCsv(vuePriorityRows, VUE_PRIORITY_HEADERS),
    'utf8'
  );
  await fs.writeFile(
    path.join(MAPPINGS_DIR, 'full-frontend-summary.json'),
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        input: meta,
        summary
      },
      null,
      2
    ),
    'utf8'
  );
  await fs.writeFile(
    path.join(MAPPINGS_DIR, 'vue-priority-summary.json'),
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        baseline: 'vue3-priority',
        input: meta,
        counts: vuePrioritySummary
      },
      null,
      2
    ),
    'utf8'
  );

  return { directRows, partialRows, noneRows, summary, vuePriorityRows };
}

async function main() {
  const multiPath = getArg('--multi');
  const cssPath = getArg('--css');
  if (!multiPath || !cssPath) {
    throw new Error('请传入 --multi 和 --css 两个 JSON 文件路径');
  }

  const multiResolvedPath = path.resolve(multiPath);
  const cssResolvedPath = path.resolve(cssPath);
  const [multiPayload, cssPayload, existingReplacedRaw, existingUnmappedRaw] = await Promise.all([
    readJson(multiResolvedPath),
    readJson(cssResolvedPath),
    fs.readFile(EXISTING_REPLACED, 'utf8'),
    fs.readFile(EXISTING_UNMAPPED, 'utf8')
  ]);

  const multiItems = normalizeItems(multiPayload);
  const cssItems = normalizeItems(cssPayload);
  const frontItems = [...multiItems, ...cssItems].filter((item) => item?.langName !== 'Node.js');

  const existingRows = [
    ...parseCsv(existingReplacedRaw),
    ...parseCsv(existingUnmappedRaw)
  ];
  const context = {
    existingMap: new Map(existingRows.map((row) => [`${row.sourceTool}:${row.ruleId}`, row])),
    eslintRuleNames: collectRuleNamesFromEslintPreset(eslintPreset),
    stylelintRuleNames: await resolveStylelintRuleNames(),
    vueRuleMetaMap: createVueRuleMetaMap()
  };

  const mappedRows = frontItems.map((item) => mapRule(item, context));
  const sortedRows = sortRows(mappedRows);

  const { directRows, partialRows, noneRows, summary, vuePriorityRows } = await writeMappingFiles(
    sortedRows,
    {
    multiPath: multiResolvedPath,
    cssPath: cssResolvedPath
    }
  );

  console.log('生成完成：');
  console.log(`- 全量：${sortedRows.length}`);
  console.log(`- direct：${directRows.length}`);
  console.log(`- partial：${partialRows.length}`);
  console.log(`- none：${noneRows.length}`);
  console.log(`- 可治理 none（排除 deprecated）：${summary.governance.actionableNone}`);
  console.log(`- Vue 规则基线报表：${vuePriorityRows.length} 条`);
  console.log('- 输出目录：packages/lint-ruleset/mappings');
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`生成失败：${message}`);
  process.exit(1);
});
