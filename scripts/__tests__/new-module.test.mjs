import test from 'node:test';
import assert from 'node:assert/strict';
import os from 'node:os';
import path from 'node:path';
import { constants as fsConstants } from 'node:fs';
import { access, mkdir, mkdtemp, readFile } from 'node:fs/promises';

import { parseArgs, scaffoldModule } from '../new-module.mjs';

async function createWorkspaceFixture() {
  const rootDir = await mkdtemp(path.join(os.tmpdir(), 'one-base-template-new-module-'));
  await mkdir(path.join(rootDir, 'apps/admin/src/modules'), { recursive: true });
  return rootDir;
}

async function assertExists(targetPath) {
  await access(targetPath, fsConstants.F_OK);
}

test('parseArgs 支持 title/route/dry-run 参数', () => {
  const args = parseArgs(['demo-module', '--title', '示例模块', '--route=demo', '--dry-run']);

  assert.equal(args.moduleId, 'demo-module');
  assert.equal(args.title, '示例模块');
  assert.equal(args.routeBase, 'demo');
  assert.equal(args.dryRun, true);
});

test('scaffoldModule dry-run 仅返回计划文件不落盘', async () => {
  const rootDir = await createWorkspaceFixture();
  const result = await scaffoldModule({
    rootDir,
    moduleId: 'dry-run-demo',
    dryRun: true
  });

  assert.equal(result.created, false);
  assert.equal(result.dryRun, true);
  assert.ok(result.plannedFiles.some((filePath) => filePath.endsWith('/index.ts')));

  await assert.rejects(async () => {
    await access(path.join(rootDir, 'apps/admin/src/modules/dry-run-demo'), fsConstants.F_OK);
  }, /ENOENT/);
});

test('scaffoldModule 生成标准模块骨架', async () => {
  const rootDir = await createWorkspaceFixture();
  const result = await scaffoldModule({
    rootDir,
    moduleId: 'sample-module',
    title: '示例模块',
    routeBase: 'sample'
  });

  assert.equal(result.created, true);
  assert.equal(result.dryRun, false);
  assert.equal(result.moduleDir, path.join(rootDir, 'apps/admin/src/modules/sample-module'));

  const indexPath = path.join(result.moduleDir, 'index.ts');
  const routesPath = path.join(result.moduleDir, 'routes.ts');
  const apiClientPath = path.join(result.moduleDir, 'api/client.ts');
  const pagePath = path.join(result.moduleDir, 'pages/SampleModuleIndexPage.vue');

  await assertExists(indexPath);
  await assertExists(routesPath);
  await assertExists(apiClientPath);
  await assertExists(pagePath);

  const indexSource = await readFile(indexPath, 'utf8');
  assert.match(indexSource, /id: 'sample-module'/);
  assert.match(indexSource, /moduleTier: 'core'/);
  assert.match(indexSource, /enabledByDefault: true/);

  const routesSource = await readFile(routesPath, 'utf8');
  assert.match(routesSource, /path: 'sample\/index'/);
  assert.match(routesSource, /name: 'SampleModuleIndex'/);

  const apiClientSource = await readFile(apiClientPath, 'utf8');
  assert.match(apiClientSource, /return obHttp\(\)\.get\(sampleModuleApiEndpoints\.list\);/);
});
