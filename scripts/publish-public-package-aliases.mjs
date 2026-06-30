import { spawnSync } from 'node:child_process';
import { createPublicPackageAliasTarballs } from './pack-public-package-aliases.mjs';

const registry =
  process.env.NPM_CONFIG_REGISTRY ??
  'http://artifact.nc.rdcloud.4c.hq.cmcc/artifactory/api/npm/one-package/';

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: options.cwd,
    stdio: 'inherit',
    shell: process.platform === 'win32',
    env: { ...process.env, ...options.env }
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

const aliasTarballs = createPublicPackageAliasTarballs();

for (const aliasTarball of aliasTarballs) {
  run('npm', [
    'publish',
    aliasTarball.tarballPath,
    '--registry',
    registry,
    '--access',
    'public',
    '--ignore-scripts'
  ]);
}

console.log(
  `企业 npm 仓库发布完成：${aliasTarballs
    .map((aliasTarball) => `${aliasTarball.aliasName}@${aliasTarball.version}`)
    .join(', ')}`
);
