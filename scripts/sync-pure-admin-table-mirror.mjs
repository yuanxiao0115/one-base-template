import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const mirrorRoot = resolve(repoRoot, '.codex', 'mirrors');
const mirrorPath = resolve(mirrorRoot, 'pure-admin-table-upstream');
const remoteUrl = 'https://github.com/pure-admin/pure-admin-table.git';
const targetRef = process.argv[2] || 'v3.3.0';

function runGit(args, cwd = repoRoot) {
  const result = spawnSync('git', args, {
    cwd,
    stdio: 'inherit',
    env: process.env
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

function readGit(args, cwd = repoRoot) {
  const result = spawnSync('git', args, {
    cwd,
    stdio: ['ignore', 'pipe', 'inherit'],
    env: process.env
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }

  return String(result.stdout).trim();
}

mkdirSync(mirrorRoot, { recursive: true });

if (!existsSync(resolve(mirrorPath, '.git'))) {
  console.log(`\n[mirror] 初始化只读镜像: ${mirrorPath}`);
  runGit(['clone', '--filter=blob:none', '--no-tags', remoteUrl, mirrorPath]);
} else {
  console.log(`\n[mirror] 更新只读镜像: ${mirrorPath}`);
}

runGit(['fetch', '--tags', '--prune', 'origin'], mirrorPath);
runGit(['checkout', '--detach', targetRef], mirrorPath);

const pinnedCommit = readGit(['rev-parse', 'HEAD'], mirrorPath);

console.log('\n[mirror] 完成');
console.log(`[mirror] ref: ${targetRef}`);
console.log(`[mirror] commit: ${pinnedCommit}`);
console.log('[mirror] 说明: 该目录仅用于对照与同步，不作为运行时依赖。');
