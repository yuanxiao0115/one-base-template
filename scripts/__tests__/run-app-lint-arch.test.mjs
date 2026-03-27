import test from 'node:test';
import assert from 'node:assert/strict';
import os from 'node:os';
import path from 'node:path';
import { mkdtemp, mkdir, writeFile } from 'node:fs/promises';

import { collectLintArchApps } from '../run-app-lint-arch.mjs';

test('collectLintArchApps 只收集声明了 lint:arch 的 app', async () => {
  const rootDir = await mkdtemp(path.join(os.tmpdir(), 'one-base-template-lint-arch-'));
  await mkdir(path.join(rootDir, 'apps/app-a'), { recursive: true });
  await mkdir(path.join(rootDir, 'apps/app-b'), { recursive: true });
  await mkdir(path.join(rootDir, 'apps/app-c'), { recursive: true });

  await writeFile(
    path.join(rootDir, 'apps/app-a/package.json'),
    JSON.stringify({ name: 'app-a', scripts: { 'lint:arch': 'node x.mjs' } }, null, 2)
  );
  await writeFile(
    path.join(rootDir, 'apps/app-b/package.json'),
    JSON.stringify({ name: 'app-b', scripts: { lint: 'vp lint .' } }, null, 2)
  );
  await writeFile(
    path.join(rootDir, 'apps/app-c/package.json'),
    JSON.stringify({ name: 'app-c', scripts: { 'lint:arch': 'node y.mjs' } }, null, 2)
  );

  const apps = await collectLintArchApps(rootDir);
  assert.deepEqual(
    apps.map((item) => item.name),
    ['app-a', 'app-c']
  );
});
