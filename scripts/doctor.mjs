import path from 'node:path';
import os from 'node:os';
import { execSync } from 'node:child_process';
import { promises as fs } from 'node:fs';

const REQUIRED_NODE = '20.11.1';
const REQUIRED_PNPM = '9.1.4';

function parseVersion(value) {
  return value
    .replace(/^v/, '')
    .split('.')
    .map(part => Number.parseInt(part, 10))
    .map(num => (Number.isFinite(num) ? num : 0));
}

function compareVersion(a, b) {
  const av = parseVersion(a);
  const bv = parseVersion(b);
  const len = Math.max(av.length, bv.length);

  for (let i = 0; i < len; i += 1) {
    const left = av[i] ?? 0;
    const right = bv[i] ?? 0;
    if (left > right) return 1;
    if (left < right) return -1;
  }
  return 0;
}

async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function checkCargoProfileWarning() {
  const bashProfile = path.join(os.homedir(), '.bash_profile');
  const cargoEnv = path.join(os.homedir(), '.cargo/env');

  if (!(await fileExists(bashProfile))) return null;

  const content = await fs.readFile(bashProfile, 'utf-8');
  if (!content.includes('.cargo/env')) return null;
  if (await fileExists(cargoEnv)) return null;

  return `检测到 ~/.bash_profile 引用了 ${cargoEnv}，但该文件不存在（可删除该行或补装 Rust）。`;
}

async function main() {
  const rootDir = process.cwd();
  const errors = [];
  const warnings = [];
  const infos = [];

  const nodeVersion = process.versions.node;
  if (compareVersion(nodeVersion, REQUIRED_NODE) < 0) {
    errors.push(`Node 版本过低：当前 ${nodeVersion}，要求 >= ${REQUIRED_NODE}`);
  } else {
    infos.push(`Node 版本通过：${nodeVersion}`);
  }

  let pnpmVersion = '';
  try {
    pnpmVersion = execSync('pnpm -v', { encoding: 'utf-8' }).trim();
    if (compareVersion(pnpmVersion, REQUIRED_PNPM) < 0) {
      errors.push(`pnpm 版本过低：当前 ${pnpmVersion}，要求 >= ${REQUIRED_PNPM}`);
    } else {
      infos.push(`pnpm 版本通过：${pnpmVersion}`);
    }
  } catch {
    errors.push('未检测到 pnpm，请先安装 pnpm。');
  }

  const mustFiles = [
    'apps/admin/public/platform-config.json',
    'apps/docs/public/cli-naming-whitelist.json',
    'pnpm-lock.yaml',
    'turbo.json'
  ];

  for (const relPath of mustFiles) {
    const absPath = path.join(rootDir, relPath);
    if (!(await fileExists(absPath))) {
      errors.push(`缺少必要文件：${relPath}`);
    } else {
      infos.push(`文件存在：${relPath}`);
    }
  }

  const cargoWarning = await checkCargoProfileWarning();
  if (cargoWarning) warnings.push(cargoWarning);

  console.log('开发环境自检结果：');
  for (const item of infos) {
    console.log(`- OK: ${item}`);
  }
  for (const item of warnings) {
    console.log(`- WARN: ${item}`);
  }
  for (const item of errors) {
    console.log(`- ERROR: ${item}`);
  }

  if (errors.length > 0) {
    process.exit(1);
  }
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`doctor 执行失败：${message}`);
  process.exit(1);
});
