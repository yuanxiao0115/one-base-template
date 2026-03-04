import fs from 'node:fs';
import path from 'node:path';

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

export function getPlatformRuleNames({
  langName,
  includePrefixes,
  excludeDeprecated = true
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
    names.add(ruleName);
  }

  return [...names].sort((left, right) => left.localeCompare(right, 'en'));
}

export function toWarnRules(ruleNames) {
  return Object.fromEntries(ruleNames.map((ruleName) => [ruleName, 'warn']));
}
