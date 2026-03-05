import fs from 'node:fs/promises';
import path from 'node:path';
import stylelint from 'stylelint';
import tseslint from 'typescript-eslint';
import vue from 'eslint-plugin-vue';

const ROOT_DIR = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const MAPPINGS_DIR = path.join(ROOT_DIR, 'mappings');
const NONE_RULES_FILE = path.join(MAPPINGS_DIR, 'full-frontend-none-rules.csv');
const OUTPUT_FILE = path.join(MAPPINGS_DIR, 'full-frontend-gap-catalog.json');

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

async function readCsvRows(filePath) {
  const text = (await fs.readFile(filePath, 'utf8')).trim();
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

function normalizeRuleRow(row) {
  return {
    sourceTool: row.sourceTool,
    langName: row.langName,
    ruleId: Number(row.ruleId),
    ruleName: row.ruleName,
    ruleLevel: Number(row.ruleLevel),
    mappingStatus: row.mappingStatus,
    deprecated: row.deprecated === 'true',
    note: row.note
  };
}

async function canEnableStylelintRuleWithBoolean(ruleName) {
  const result = await stylelint.lint({
    code: '.a { color: #fff; }',
    codeFilename: path.join(ROOT_DIR, 'tmp', 'gap-catalog-stylelint.css'),
    config: {
      rules: {
        [ruleName]: true
      }
    }
  });
  const invalidOptionWarnings = result.results[0]?.invalidOptionWarnings ?? [];
  return invalidOptionWarnings.length === 0;
}

async function buildStylelintBuckets(rows) {
  const coreRules = new Set(Object.keys(stylelint.rules));
  const directBoolean = [];
  const needsOptions = [];
  const missingInCore = [];

  for (const row of rows) {
    if (!coreRules.has(row.ruleName)) {
      missingInCore.push(row.ruleName);
      continue;
    }

    // 仅把“主选项可直接为 true 且不报配置错误”的规则归为可直接启用。
    if (await canEnableStylelintRuleWithBoolean(row.ruleName)) {
      directBoolean.push(row.ruleName);
      continue;
    }
    needsOptions.push(row.ruleName);
  }

  return {
    directBoolean: directBoolean.sort((a, b) => a.localeCompare(b, 'en')),
    needsOptions: needsOptions.sort((a, b) => a.localeCompare(b, 'en')),
    missingInCore: missingInCore.sort((a, b) => a.localeCompare(b, 'en'))
  };
}

function buildEslintBuckets(rows) {
  const tsRuleMap = new Map(Object.entries(tseslint.plugin?.rules ?? {}));
  const vueRuleMap = new Map(Object.entries(vue.rules ?? {}));

  const typeAware = [];
  const removedOrRenamed = [];
  const officialDeprecated = [];
  const mergedDeprecated = [];
  const other = [];

  for (const row of rows) {
    if (row.deprecated) {
      officialDeprecated.push(row.ruleName);
      mergedDeprecated.push(row.ruleName);
      continue;
    }

    if (row.ruleName.startsWith('@typescript-eslint/')) {
      const shortRuleName = row.ruleName.split('/', 2)[1];
      const ruleMeta = tsRuleMap.get(shortRuleName);
      if (!ruleMeta) {
        removedOrRenamed.push(row.ruleName);
        mergedDeprecated.push(row.ruleName);
        continue;
      }
      if (ruleMeta?.meta?.docs?.requiresTypeChecking) {
        typeAware.push(row.ruleName);
        continue;
      }
      other.push(row.ruleName);
      continue;
    }

    if (row.ruleName.startsWith('vue/')) {
      const shortRuleName = row.ruleName.split('/', 2)[1];
      const ruleMeta = vueRuleMap.get(shortRuleName);
      if (!ruleMeta) {
        removedOrRenamed.push(row.ruleName);
        mergedDeprecated.push(row.ruleName);
        continue;
      }
      if (ruleMeta?.meta?.deprecated) {
        officialDeprecated.push(row.ruleName);
        mergedDeprecated.push(row.ruleName);
        continue;
      }
      other.push(row.ruleName);
      continue;
    }

    other.push(row.ruleName);
  }

  return {
    typeAware: typeAware.sort((a, b) => a.localeCompare(b, 'en')),
    deprecated: mergedDeprecated.sort((a, b) => a.localeCompare(b, 'en')),
    removedOrRenamed: removedOrRenamed.sort((a, b) => a.localeCompare(b, 'en')),
    officialDeprecated: officialDeprecated.sort((a, b) => a.localeCompare(b, 'en')),
    other: other.sort((a, b) => a.localeCompare(b, 'en'))
  };
}

async function main() {
  const rows = (await readCsvRows(NONE_RULES_FILE)).map(normalizeRuleRow);
  const stylelintRows = rows.filter((row) => row.sourceTool === 'Stylelint');
  const eslintRows = rows.filter((row) => row.sourceTool === 'ESLint-缺陷');

  const stylelintBuckets = await buildStylelintBuckets(stylelintRows);
  const eslintBuckets = buildEslintBuckets(eslintRows);
  const actionableNoneOfficial = rows.filter((row) => !row.deprecated).length;
  const actionableNoneMergedDeprecated = rows.length - eslintBuckets.deprecated.length;

  const catalog = {
    generatedAt: new Date().toISOString(),
    input: path.relative(ROOT_DIR, NONE_RULES_FILE),
    totals: {
      none: rows.length,
      actionableNoneOfficial,
      actionableNoneMergedDeprecated
    },
    buckets: {
      stylelint: {
        directBooleanCount: stylelintBuckets.directBoolean.length,
        needsOptionsCount: stylelintBuckets.needsOptions.length,
        missingInCoreCount: stylelintBuckets.missingInCore.length,
        directBoolean: stylelintBuckets.directBoolean,
        needsOptions: stylelintBuckets.needsOptions,
        missingInCore: stylelintBuckets.missingInCore
      },
      eslintDefect: {
        typeAwareCount: eslintBuckets.typeAware.length,
        deprecatedCount: eslintBuckets.deprecated.length,
        removedOrRenamedCount: eslintBuckets.removedOrRenamed.length,
        officialDeprecatedCount: eslintBuckets.officialDeprecated.length,
        otherCount: eslintBuckets.other.length,
        typeAware: eslintBuckets.typeAware,
        deprecated: eslintBuckets.deprecated,
        removedOrRenamed: eslintBuckets.removedOrRenamed,
        officialDeprecated: eslintBuckets.officialDeprecated,
        other: eslintBuckets.other
      }
    },
    suggestedPackages: [
      {
        name: '@stylistic/stylelint-plugin',
        purpose: '承接 Stylelint core 已移除的格式化类规则（@stylistic/*）。',
        source: 'https://github.com/stylelint-stylistic/stylelint-stylistic'
      },
      {
        name: 'stylelint-config-standard-scss',
        purpose: '提供 SCSS 场景下的社区标准规则参数，可复用 option 型规则基线。',
        source: 'https://github.com/stylelint-scss/stylelint-config-standard-scss'
      },
      {
        name: '@typescript-eslint/eslint-plugin + @typescript-eslint/parser',
        purpose: '支持 type-aware 规则（requiresTypeChecking），用于 TS 语义类缺口。',
        source: 'https://typescript-eslint.io/getting-started/typed-linting/'
      },
      {
        name: '@stylistic/eslint-plugin',
        purpose: '承接 eslint/@typescript-eslint 已迁移的格式化类规则。',
        source: 'https://eslint.style/packages/plus'
      }
    ]
  };

  await fs.writeFile(OUTPUT_FILE, `${JSON.stringify(catalog, null, 2)}\n`, 'utf8');
  console.log(`已生成 gap 清单：${path.relative(ROOT_DIR, OUTPUT_FILE)}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
