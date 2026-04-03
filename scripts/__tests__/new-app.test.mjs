import test from 'node:test';
import assert from 'node:assert/strict';
import os from 'node:os';
import path from 'node:path';
import { mkdtemp, readFile, access } from 'node:fs/promises';
import { cp } from 'node:fs/promises';
import { constants as fsConstants } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { parseArgs, scaffoldApp } from '../new-app.mjs';

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
  assert.equal(
    packageJson.scripts['new:module'],
    'node ../../scripts/new-module.mjs --app sample-app'
  );
  assert.equal(
    packageJson.scripts['new:module:item'],
    'node ../../scripts/new-module-item.mjs --app sample-app'
  );

  const appConfig = await readFile(path.join(rootDir, 'apps/sample-app/src/config/app.ts'), 'utf8');
  assert.match(appConfig, /appcode: 'sample-app'/);
  assert.match(appConfig, /storageNamespace: 'one-base-template-sample-app'/);
  assert.match(appConfig, /enabledModules: \['home'\]/);

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

  const generatedAgents = await readFile(path.join(rootDir, 'apps/sample-app/AGENTS.md'), 'utf8');
  assert.match(
    generatedAgents,
    /`sample-app` 是从 `apps\/admin-lite` 派生的后台应用，继承后台基座默认约束。/
  );
  assert.match(
    generatedAgents,
    /`lint:arch`：`node \.\.\/\.\.\/scripts\/check-admin-lite-arch\.mjs --app sample-app`/
  );
  assert.match(
    generatedAgents,
    /`apps\/sample-app` 只做应用组装、页面样式、模块编排与项目级配置。/
  );
  assert.doesNotMatch(generatedAgents, /pnpm check:admin-lite:bundle/);
  assert.doesNotMatch(generatedAgents, /`admin-lite` 是\*\*后台快速起项目基座\*\*/);

  const generatedReadme = await readFile(path.join(rootDir, 'apps/sample-app/README.md'), 'utf8');
  assert.match(generatedReadme, /^# sample-app 后台项目指南$/m);
  assert.match(generatedReadme, /`sample-app` 从 `apps\/admin-lite` 派生，继承后台基座默认能力。/);
  assert.match(
    generatedReadme,
    /`pnpm new:app <app-id>` 已切到从 `apps\/admin-lite` 复制，\*\*默认只生成 `home` 模块\*\*。/
  );
  assert.doesNotMatch(generatedReadme, /^# admin-lite 后台基座指南$/m);
  assert.doesNotMatch(generatedReadme, /pnpm check:admin-lite:bundle/);

  await assertExists(path.join(rootDir, 'apps/sample-app/src/bootstrap/sample-app-styles.ts'));
  await assertExists(path.join(rootDir, 'apps/sample-app/build/vite-sample-app-build-config.ts'));
  await assertExists(path.join(rootDir, 'apps/sample-app/src/types/auto-imports.d.ts'));
  await assertExists(path.join(rootDir, 'apps/sample-app/src/types/components.d.ts'));
});

test('parseArgs 支持 preset 与模块开关参数', () => {
  const args = parseArgs([
    'demo-app',
    '--preset',
    'enterprise',
    '--with-admin-management',
    '--with-log-management',
    '--with-crud-starter',
    '--dry-run'
  ]);

  assert.equal(args.appId, 'demo-app');
  assert.equal(args.preset, 'enterprise');
  assert.equal(args.withAdminManagement, true);
  assert.equal(args.withLogManagement, true);
  assert.equal(args.withSystemManagement, false);
  assert.equal(args.withCrudStarter, true);
  assert.equal(args.dryRun, true);
});

test('scaffoldApp 支持 minimal preset 并收口顶栏能力', async () => {
  const rootDir = await createWorkspaceFixture();

  await scaffoldApp({
    rootDir,
    appId: 'sample-minimal-app',
    preset: 'minimal',
    dryRun: false,
    withCrudStarter: false
  });

  const appConfig = await readFile(
    path.join(rootDir, 'apps/sample-minimal-app/src/config/app.ts'),
    'utf8'
  );
  assert.match(appConfig, /enabledModules: \['home'\]/);

  const uiConfig = await readFile(
    path.join(rootDir, 'apps/sample-minimal-app/src/config/ui.ts'),
    'utf8'
  );
  assert.match(uiConfig, /tenantSwitcher: false,/);
  assert.match(uiConfig, /profileDialog: false,/);
  assert.match(uiConfig, /changePassword: false,/);
  assert.match(uiConfig, /personalization: false,/);
});

test('scaffoldApp 在启用 withCrudStarter 时追加 starter-crud 模块', async () => {
  const rootDir = await createWorkspaceFixture();

  await scaffoldApp({
    rootDir,
    appId: 'sample-crud-app',
    preset: 'enterprise',
    dryRun: false,
    withCrudStarter: true
  });

  const appConfig = await readFile(
    path.join(rootDir, 'apps/sample-crud-app/src/config/app.ts'),
    'utf8'
  );
  assert.match(appConfig, /enabledModules: \['home', 'starter-crud'\]/);

  const uiConfig = await readFile(
    path.join(rootDir, 'apps/sample-crud-app/src/config/ui.ts'),
    'utf8'
  );
  assert.match(uiConfig, /tenantSwitcher: true,/);

  await assertExists(path.join(rootDir, 'apps/sample-crud-app/src/modules/starter-crud/list.vue'));

  const starterRoutes = await readFile(
    path.join(rootDir, 'apps/sample-crud-app/src/modules/starter-crud/routes.ts'),
    'utf8'
  );
  assert.match(starterRoutes, /starter\/crud/);
});

test('scaffoldApp 支持通过参数追加管理模块', async () => {
  const rootDir = await createWorkspaceFixture();

  await scaffoldApp({
    rootDir,
    appId: 'sample-managed-app',
    preset: 'enterprise',
    withAdminManagement: true,
    withLogManagement: true,
    withSystemManagement: true,
    dryRun: false,
    withCrudStarter: false
  });

  const appConfig = await readFile(path.join(rootDir, 'apps/sample-managed-app/src/config/app.ts'), 'utf8');
  assert.match(
    appConfig,
    /enabledModules: \['home', 'admin-management', 'log-management', 'system-management'\]/
  );

  const uiConfig = await readFile(
    path.join(rootDir, 'apps/sample-managed-app/src/config/ui.ts'),
    'utf8'
  );
  assert.match(uiConfig, /tenantSwitcher: true,/);
});
