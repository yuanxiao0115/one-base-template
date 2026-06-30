import { cpSync, existsSync, rmSync } from 'node:fs';
import { resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

const rootDir = resolve(import.meta.dirname, '..');
const packageConfigs = {
  core: { dir: 'packages/core', declaration: 'tsc', styles: [] },
  utils: { dir: 'packages/utils', declaration: 'tsc', styles: [] },
  tag: { dir: 'packages/tag', declaration: 'vue-tsc', styles: [['src/styles', 'dist/styles']] },
  ui: { dir: 'packages/ui', declaration: 'vue-tsc', styles: [] }
};

const target = process.argv[2];
const targets = target === 'all' ? Object.keys(packageConfigs) : [target];

function run(command, args, cwd) {
  const result = spawnSync(command, args, {
    cwd,
    stdio: 'inherit',
    shell: process.platform === 'win32'
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

function ensureKnownPackage(packageName) {
  if (!packageConfigs[packageName]) {
    console.error(`未知公共包构建目标：${packageName}`);
    process.exit(1);
  }
}

for (const packageName of targets) {
  ensureKnownPackage(packageName);
  const config = packageConfigs[packageName];
  const packageDir = resolve(rootDir, config.dir);
  const distDir = resolve(packageDir, 'dist');

  rmSync(distDir, { force: true, recursive: true });

  run('pnpm', ['exec', 'vp', 'build'], packageDir);

  if (config.declaration === 'tsc') {
    run('pnpm', ['exec', 'tsc', '-p', 'tsconfig.build.json'], packageDir);
  } else {
    run('pnpm', ['exec', 'vue-tsc', '-p', 'tsconfig.build.json'], packageDir);
  }

  for (const [from, to] of config.styles) {
    const source = resolve(packageDir, from);
    if (!existsSync(source)) {
      continue;
    }
    cpSync(source, resolve(packageDir, to), { recursive: true });
  }
}
