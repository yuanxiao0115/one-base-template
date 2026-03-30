import test from 'node:test';
import assert from 'node:assert/strict';
import os from 'node:os';
import path from 'node:path';
import { mkdtemp, readFile, access } from 'node:fs/promises';
import { cp } from 'node:fs/promises';
import { constants as fsConstants } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { scaffoldApp } from '../new-app.mjs';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const adminLiteSourceDir = path.join(repoRoot, 'apps/admin-lite');

async function createWorkspaceFixture() {
  const tempRoot = await mkdtemp(path.join(os.tmpdir(), 'one-base-template-new-app-'));
  await cp(adminLiteSourceDir, path.join(tempRoot, 'apps/admin-lite'), {
    recursive: true,
    filter: (source) => {
      const normalized = source.replaceAll('\\', '/');
      return !normalized.includes('/dist/') && !normalized.includes('/node_modules/');
    }
  });
  return tempRoot;
}

async function assertExists(targetPath) {
  await access(targetPath, fsConstants.F_OK);
}

test('scaffoldApp 生成最小可运行 app 并替换关键标识', async () => {
  const rootDir = await createWorkspaceFixture();

  const result = await scaffoldApp({
    rootDir,
    appId: 'sample-app',
    dryRun: false,
    withCrudStarter: false
  });

  assert.equal(result.created, true);
  assert.equal(result.targetDir, path.join(rootDir, 'apps/sample-app'));

  const packageJson = JSON.parse(
    await readFile(path.join(rootDir, 'apps/sample-app/package.json'), 'utf8')
  );
  assert.equal(packageJson.name, 'sample-app');
  assert.equal(packageJson.scripts.lint, 'node ../../scripts/run-vp-task-from-root.mjs lint');
  assert.equal(
    packageJson.scripts['lint:fix'],
    'node ../../scripts/run-vp-task-from-root.mjs check --fix src'
  );

  const platformConfig = await readFile(
    path.join(rootDir, 'apps/sample-app/src/config/platform-config.ts'),
    'utf8'
  );
  assert.match(platformConfig, /appcode: 'sample-app'/);
  assert.match(platformConfig, /storageNamespace: 'one-base-template-sample-app'/);

  const viteConfig = await readFile(path.join(rootDir, 'apps/sample-app/vite.config.ts'), 'utf8');
  assert.match(viteConfig, /SampleAppBuildConfig/);
  assert.match(viteConfig, /createSampleAppPlugins/);

  const buildConfig = await readFile(
    path.join(rootDir, 'apps/sample-app/build/vite-sample-app-build-config.ts'),
    'utf8'
  );
  assert.match(buildConfig, /appName: 'sample-app'/);
  assert.match(buildConfig, /sample-app-home/);
  assert.doesNotMatch(buildConfig, /\/apps\/admin-lite\/src\/modules\/home\//);

  const mainFile = await readFile(path.join(rootDir, 'apps/sample-app/src/main.ts'), 'utf8');
  assert.match(mainFile, /startSampleApp\s*\(/);

  const generatedPackageJson = await readFile(
    path.join(rootDir, 'apps/sample-app/package.json'),
    'utf8'
  );
  assert.match(generatedPackageJson, /check-admin-lite-arch\.mjs --app sample-app/);

  await assertExists(path.join(rootDir, 'apps/sample-app/src/bootstrap/sample-app-styles.ts'));
  await assertExists(path.join(rootDir, 'apps/sample-app/build/vite-sample-app-build-config.ts'));
});

test('scaffoldApp 在启用 withCrudStarter 时追加 starter-crud 模块', async () => {
  const rootDir = await createWorkspaceFixture();

  await scaffoldApp({
    rootDir,
    appId: 'sample-crud-app',
    dryRun: false,
    withCrudStarter: true
  });

  const platformConfig = await readFile(
    path.join(rootDir, 'apps/sample-crud-app/src/config/platform-config.ts'),
    'utf8'
  );
  assert.match(
    platformConfig,
    /enabledModules: \['home', 'admin-management', 'log-management', 'system-management', 'starter-crud'\]/
  );

  await assertExists(path.join(rootDir, 'apps/sample-crud-app/src/modules/starter-crud/list.vue'));

  const starterRoutes = await readFile(
    path.join(rootDir, 'apps/sample-crud-app/src/modules/starter-crud/routes.ts'),
    'utf8'
  );
  assert.match(starterRoutes, /starter\/crud/);
});
