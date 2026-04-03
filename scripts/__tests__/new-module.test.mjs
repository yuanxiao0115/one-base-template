import test from 'node:test';
import assert from 'node:assert/strict';
import os from 'node:os';
import path from 'node:path';
import { execFile as execFileCallback } from 'node:child_process';
import { constants as fsConstants } from 'node:fs';
import { access, mkdir, mkdtemp, readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';

import { parseArgs, scaffoldModule } from '../new-module.mjs';

const execFile = promisify(execFileCallback);
const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

async function createWorkspaceFixture(appIds = ['admin-lite']) {
  const rootDir = await mkdtemp(path.join(os.tmpdir(), 'one-base-template-new-module-'));
  for (const appId of appIds) {
    await mkdir(path.join(rootDir, `apps/${appId}/src/modules`), { recursive: true });
  }
  return rootDir;
}

async function assertExists(targetPath) {
  await access(targetPath, fsConstants.F_OK);
}

test('parseArgs 支持模块级参数', () => {
  const args = parseArgs([
    'demo-management',
    '--app',
    'zfw-system-sfss',
    '--title',
    '示例管理模块',
    '--route=demo/management',
    '--tier',
    'core',
    '--enabled-by-default',
    '--dry-run'
  ]);

  assert.equal(args.moduleId, 'demo-management');
  assert.equal(args.appId, 'zfw-system-sfss');
  assert.equal(args.title, '示例管理模块');
  assert.equal(args.routeBase, 'demo/management');
  assert.equal(args.moduleTier, 'core');
  assert.equal(args.enabledByDefault, true);
  assert.equal(args.dryRun, true);
});

test('parseArgs 支持先传 --app 再传 module-id', () => {
  const args = parseArgs(['--app', 'admin-lite', 'demo-management', '--dry-run']);

  assert.equal(args.appId, 'admin-lite');
  assert.equal(args.moduleId, 'demo-management');
  assert.equal(args.dryRun, true);
});

test('scaffoldModule dry-run 仅返回计划文件不落盘', async () => {
  const rootDir = await createWorkspaceFixture();
  const result = await scaffoldModule({
    rootDir,
    appId: 'admin-lite',
    moduleId: 'dry-run-demo',
    dryRun: true
  });

  assert.equal(result.created, false);
  assert.equal(result.dryRun, true);
  assert.ok(result.plannedFiles.some((filePath) => filePath.endsWith('/routes.ts')));

  await assert.rejects(async () => {
    await access(path.join(rootDir, 'apps/admin-lite/src/modules/dry-run-demo'), fsConstants.F_OK);
  }, /ENOENT/);
});

test('scaffoldModule 生成 legacy 聚合模块骨架', async () => {
  const rootDir = await createWorkspaceFixture(['admin-lite', 'zfw-system-sfss']);
  const result = await scaffoldModule({
    rootDir,
    appId: 'zfw-system-sfss',
    moduleId: 'sample-management',
    title: '示例管理模块',
    routeBase: 'sample/management',
    moduleTier: 'optional',
    enabledByDefault: false
  });

  assert.equal(result.created, true);
  assert.equal(result.dryRun, false);
  assert.equal(
    result.moduleDir,
    path.join(rootDir, 'apps/zfw-system-sfss/src/modules/sample-management')
  );

  const indexPath = path.join(result.moduleDir, 'index.ts');
  const routesPath = path.join(result.moduleDir, 'routes.ts');
  const viewPath = path.join(result.moduleDir, 'index.vue');

  await assertExists(indexPath);
  await assertExists(routesPath);
  await assertExists(viewPath);

  const indexSource = await readFile(indexPath, 'utf8');
  assert.match(indexSource, /id: 'sample-management'/);
  assert.match(indexSource, /moduleTier: 'optional'/);
  assert.match(indexSource, /enabledByDefault: false/);

  const routesSource = await readFile(routesPath, 'utf8');
  assert.match(routesSource, /const legacyModuleRoutes = collectGlobRouteModules\(/);
  assert.match(routesSource, /\.\/\*\/router\/index\.ts/);
  assert.match(routesSource, /\.\/\*\/router\.ts/);
  assert.match(routesSource, /path: '\/sample\/management\/index'/);
  assert.match(routesSource, /name: 'SampleManagementIndex'/);
});

test('CLI 在子项目目录执行时也能正确解析仓库根目录', async () => {
  const moduleId = `cli-root-check-${Date.now()}`;
  const { stdout } = await execFile(
    'node',
    ['../../scripts/new-module.mjs', moduleId, '--app', 'admin-lite', '--dry-run'],
    {
      cwd: path.join(repoRoot, 'apps/admin-lite')
    }
  );

  assert.match(stdout, /\[dry-run\] 计划创建以下文件：/);
  assert.match(stdout, new RegExp(`apps/admin-lite/src/modules/${moduleId}/index.ts`));
});
