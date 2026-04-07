import path from 'node:path';
import { promises as fs } from 'node:fs';
import { execSync, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const DIFF_FILTER = 'ACMR';

function parseArgs(argv) {
  const args = {
    baseRef: null,
    headRef: 'HEAD',
    dryRun: false
  };

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (token === '--') {
      continue;
    }
    if (token === '--base') {
      args.baseRef = argv[index + 1] ?? null;
      index += 1;
      continue;
    }
    if (token === '--head') {
      args.headRef = argv[index + 1] ?? 'HEAD';
      index += 1;
      continue;
    }
    if (token === '--dry-run') {
      args.dryRun = true;
      continue;
    }
    throw new Error(`未知参数：${token}`);
  }

  return args;
}

function runGit(command) {
  try {
    return execSync(command, {
      cwd: rootDir,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore']
    }).trim();
  } catch {
    return null;
  }
}

function toLines(content) {
  if (!content) {
    return [];
  }
  return content
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}

function resolveDefaultBaseRef(headRef) {
  const candidates = ['origin/main', 'origin/master', 'main', 'master'];

  for (const candidate of candidates) {
    if (!runGit(`git rev-parse --verify ${candidate}`)) {
      continue;
    }
    const mergeBase = runGit(`git merge-base ${candidate} ${headRef}`);
    if (mergeBase) {
      return mergeBase;
    }
  }

  const previousCommit = runGit(`git rev-parse --verify ${headRef}~1`);
  return previousCommit || null;
}

function collectChangedFiles(baseRef, headRef) {
  const fileSet = new Set();

  // 主干对比 + 本地未提交改动 + 未跟踪文件，确保本地开发态也能正确路由。
  const rangeOutput = baseRef
    ? runGit(`git diff --name-only --diff-filter=${DIFF_FILTER} ${baseRef}...${headRef}`)
    : null;

  for (const file of toLines(rangeOutput)) {
    fileSet.add(file);
  }
  for (const file of toLines(
    runGit(`git diff --name-only --cached --diff-filter=${DIFF_FILTER}`)
  )) {
    fileSet.add(file);
  }
  for (const file of toLines(runGit(`git diff --name-only --diff-filter=${DIFF_FILTER}`))) {
    fileSet.add(file);
  }
  for (const file of toLines(runGit('git ls-files --others --exclude-standard'))) {
    fileSet.add(file);
  }

  return Array.from(fileSet).sort((left, right) => left.localeCompare(right));
}

function isDocsLikeFile(filePath) {
  return (
    filePath === 'AGENTS.md' ||
    filePath.startsWith('apps/docs/') ||
    filePath.startsWith('docs/') ||
    filePath.startsWith('.codex/')
  );
}

function isWorkspaceLevelFile(filePath) {
  return (
    filePath === 'package.json' ||
    filePath === 'pnpm-lock.yaml' ||
    filePath === 'pnpm-workspace.yaml' ||
    filePath.startsWith('.github/') ||
    filePath.startsWith('scripts/')
  );
}

function getAppName(filePath) {
  const match = /^apps\/([^/]+)\//.exec(filePath);
  return match ? match[1] : null;
}

function classifyRoute(changedFiles) {
  if (changedFiles.length === 0) {
    return { type: 'none', reason: '未发现改动文件' };
  }

  if (changedFiles.every((filePath) => isDocsLikeFile(filePath))) {
    return { type: 'docs', reason: '仅文档/规则证据改动' };
  }

  if (changedFiles.some((filePath) => filePath.startsWith('packages/'))) {
    return { type: 'full', reason: '涉及 packages 共享层，走全量门禁' };
  }

  if (changedFiles.some((filePath) => isWorkspaceLevelFile(filePath))) {
    return { type: 'full', reason: '涉及根级/脚本/CI 配置，走全量门禁' };
  }

  const appNames = new Set(changedFiles.map((filePath) => getAppName(filePath)).filter(Boolean));
  if (appNames.size === 1) {
    return {
      type: 'single-app',
      reason: `仅涉及应用 apps/${Array.from(appNames)[0]}`,
      appName: Array.from(appNames)[0]
    };
  }

  if (appNames.size > 1) {
    return { type: 'full', reason: '涉及多个 app，走全量门禁' };
  }

  return { type: 'full', reason: '改动范围无法安全定向，走全量门禁' };
}

async function readAppScripts(appName) {
  const packageJsonPath = path.join(rootDir, 'apps', appName, 'package.json');
  const raw = await fs.readFile(packageJsonPath, 'utf8');
  return JSON.parse(raw).scripts ?? {};
}

async function resolveCommands(route) {
  if (route.type === 'none') {
    return [];
  }
  if (route.type === 'docs') {
    return ['pnpm -C apps/docs lint', 'pnpm -C apps/docs build'];
  }
  if (route.type === 'full') {
    return ['pnpm verify'];
  }
  if (route.type !== 'single-app' || !route.appName) {
    return ['pnpm verify'];
  }

  const scripts = await readAppScripts(route.appName);
  const preferredScripts = ['typecheck', 'lint', 'lint:arch', 'build'];
  return preferredScripts
    .filter((scriptName) => Boolean(scripts[scriptName]))
    .map((scriptName) => `pnpm -C apps/${route.appName} ${scriptName}`);
}

function runCommand(command, dryRun) {
  if (dryRun) {
    console.log(`[dry-run] ${command}`);
    return;
  }

  const result = spawnSync(command, {
    cwd: rootDir,
    shell: true,
    stdio: 'inherit'
  });

  if (result.status !== 0) {
    const exitCode = result.status ?? 1;
    throw new Error(`命令执行失败（exit=${exitCode}）：${command}`);
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const shouldUseBaseRange =
    Boolean(args.baseRef) || process.env.CI === 'true' || process.env.GITHUB_ACTIONS === 'true';
  const baseRef = shouldUseBaseRange ? args.baseRef || resolveDefaultBaseRef(args.headRef) : null;
  const changedFiles = collectChangedFiles(baseRef, args.headRef);
  const route = classifyRoute(changedFiles);
  const commands = await resolveCommands(route);

  console.log('harness verify:changed');
  console.log(`- base: ${baseRef ?? '(无基线，按工作区改动计算)'}`);
  console.log(`- head: ${args.headRef}`);
  console.log(`- 路由: ${route.type}`);
  console.log(`- 原因: ${route.reason}`);

  if (changedFiles.length > 0) {
    console.log('- 改动文件:');
    for (const filePath of changedFiles) {
      console.log(`  - ${filePath}`);
    }
  }

  if (commands.length === 0) {
    console.log('未命中可执行命令，跳过验证。');
    return;
  }

  console.log('- 执行命令:');
  for (const command of commands) {
    console.log(`  - ${command}`);
  }

  for (const command of commands) {
    runCommand(command, args.dryRun);
  }
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`verify:changed 执行失败：${message}`);
  process.exit(1);
});
