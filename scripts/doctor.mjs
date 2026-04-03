import path from 'node:path';
import os from 'node:os';
import { execSync } from 'node:child_process';
import { promises as fs } from 'node:fs';

const REQUIRED_NODE = '20.19.0';
const REQUIRED_PNPM = '10.32.1';
const REQUIRED_VP = '0.1.14';
const TOOLCHAIN_CATALOG_RULES = [
  {
    label: 'vite',
    pattern: /^\s+vite:\s+npm:@voidzero-dev\/vite-plus-core@0\.1\.14\s*$/m,
    expected: 'vite: npm:@voidzero-dev/vite-plus-core@0.1.14'
  },
  {
    label: 'vitest',
    pattern: /^\s+vitest:\s+npm:@voidzero-dev\/vite-plus-test@0\.1\.14\s*$/m,
    expected: 'vitest: npm:@voidzero-dev/vite-plus-test@0.1.14'
  },
  {
    label: 'vite-plus',
    pattern: /^\s+vite-plus:\s+0\.1\.14\s*$/m,
    expected: 'vite-plus: 0.1.14'
  }
];
const LEADING_V_PREFIX_REGEX = /^v/;
const VP_VERSION_REGEX = /vp v([0-9]+\.[0-9]+\.[0-9]+)/;

function parseVersion(value) {
  return value
    .replace(LEADING_V_PREFIX_REGEX, '')
    .split('.')
    .map((part) => Number.parseInt(part, 10))
    .map((num) => (Number.isFinite(num) ? num : 0));
}

function compareVersion(a, b) {
  const av = parseVersion(a);
  const bv = parseVersion(b);
  const len = Math.max(av.length, bv.length);

  for (let i = 0; i < len; i += 1) {
    const left = av[i] ?? 0;
    const right = bv[i] ?? 0;
    if (left > right) {
      return 1;
    }
    if (left < right) {
      return -1;
    }
  }
  return 0;
}

function runCommand(command) {
  try {
    return execSync(command, { encoding: 'utf-8' }).trim();
  } catch {
    return null;
  }
}

function parseVpVersion(output) {
  if (!output) {
    return null;
  }
  const match = output.match(VP_VERSION_REGEX);
  return match ? match[1] : null;
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

  if (!(await fileExists(bashProfile))) {
    return null;
  }

  const content = await fs.readFile(bashProfile, 'utf-8');
  if (!content.includes('.cargo/env')) {
    return null;
  }
  if (await fileExists(cargoEnv)) {
    return null;
  }

  return `检测到 ~/.bash_profile 引用了 ${cargoEnv}，但该文件不存在（可删除该行或补装 Rust）。`;
}

async function checkToolchainCatalog(rootDir, infos, errors) {
  const workspaceFile = path.join(rootDir, 'pnpm-workspace.yaml');
  if (!(await fileExists(workspaceFile))) {
    errors.push('缺少必要文件：pnpm-workspace.yaml');
    return;
  }
  const content = await fs.readFile(workspaceFile, 'utf-8');
  for (const rule of TOOLCHAIN_CATALOG_RULES) {
    if (rule.pattern.test(content)) {
      infos.push(`工具链版本已锁定：${rule.label}`);
    } else {
      errors.push(`pnpm-workspace.yaml 未锁定 ${rule.label} 版本，请设置为 ${rule.expected}`);
    }
  }
}

function checkVpVersionConsistency(infos, warnings, errors) {
  const localOutput = runCommand('pnpm exec vp --version');
  if (!localOutput) {
    errors.push('无法执行 `pnpm exec vp --version`，请先执行 `pnpm install`。');
    return;
  }

  const localVersion = parseVpVersion(localOutput);
  if (!localVersion) {
    errors.push('无法解析本地 vp 版本（`pnpm exec vp --version` 输出异常）。');
    return;
  }

  if (compareVersion(localVersion, REQUIRED_VP) !== 0) {
    errors.push(`本地 vp 版本不符合预期：当前 ${localVersion}，要求 ${REQUIRED_VP}`);
  } else {
    infos.push(`本地 vp 版本通过：${localVersion}`);
  }

  const globalOutput = runCommand('vp --version');
  if (!globalOutput) {
    warnings.push('未检测到全局 vp（可忽略，推荐直接使用 `pnpm exec vp` / `pnpm` 脚本）。');
    return;
  }

  const globalVersion = parseVpVersion(globalOutput);
  if (!globalVersion) {
    warnings.push('无法解析全局 vp 版本（`vp --version` 输出异常）。');
    return;
  }

  if (compareVersion(globalVersion, localVersion) !== 0) {
    errors.push(
      `全局 vp 与本地 vp 版本不一致：全局 ${globalVersion}，本地 ${localVersion}。请执行 \`vp upgrade\` 或改用 \`pnpm exec vp\`。`
    );
    return;
  }

  infos.push(`全局 vp 版本通过：${globalVersion}`);
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

  const pnpmVersion = runCommand('pnpm -v');
  if (!pnpmVersion) {
    errors.push('未检测到 pnpm，请先安装 pnpm。');
  } else if (compareVersion(pnpmVersion, REQUIRED_PNPM) < 0) {
    errors.push(`pnpm 版本过低：当前 ${pnpmVersion}，要求 >= ${REQUIRED_PNPM}`);
  } else {
    infos.push(`pnpm 版本通过：${pnpmVersion}`);
  }

  const mustFiles = [
    'apps/admin/src/config/app.ts',
    'apps/docs/public/cli-naming-whitelist.json',
    'pnpm-lock.yaml',
    'vite.config.ts'
  ];

  for (const relPath of mustFiles) {
    const absPath = path.join(rootDir, relPath);
    if (await fileExists(absPath)) {
      infos.push(`文件存在：${relPath}`);
    } else {
      errors.push(`缺少必要文件：${relPath}`);
    }
  }

  checkVpVersionConsistency(infos, warnings, errors);
  await checkToolchainCatalog(rootDir, infos, errors);

  const cargoWarning = await checkCargoProfileWarning();
  if (cargoWarning) {
    warnings.push(cargoWarning);
  }

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
