import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

function resolveRepoRoot() {
  return path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
}

function normalizeTarget(target, currentDir, repoRoot) {
  const absoluteTarget = path.resolve(currentDir, target || '.');
  const relativeTarget = path.relative(repoRoot, absoluteTarget);

  if (relativeTarget.startsWith('..')) {
    throw new Error(`目标路径超出仓库范围: ${target}`);
  }

  return relativeTarget ? relativeTarget.split(path.sep).join('/') : '.';
}

function createArgs(command, rawArgs, currentDir, repoRoot) {
  const nextArgs = [];
  let hasTarget = false;

  for (const arg of rawArgs) {
    if (arg.startsWith('-')) {
      nextArgs.push(arg);
      continue;
    }

    nextArgs.push(normalizeTarget(arg, currentDir, repoRoot));
    hasTarget = true;
  }

  if (!hasTarget) {
    nextArgs.push(normalizeTarget('.', currentDir, repoRoot));
  }

  return ['exec', 'vp', command, ...nextArgs];
}

const [command, ...rawArgs] = process.argv.slice(2);

if (!command) {
  throw new Error('缺少 vp 子命令，例如：lint / check');
}

const repoRoot = resolveRepoRoot();
const child = spawn(
  process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm',
  createArgs(command, rawArgs, process.cwd(), repoRoot),
  {
    cwd: repoRoot,
    stdio: 'inherit',
    env: process.env
  }
);

child.on('close', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }
  process.exit(code ?? 1);
});
