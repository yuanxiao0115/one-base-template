import test from 'node:test';
import assert from 'node:assert/strict';
import os from 'node:os';
import path from 'node:path';
import { execFile as execFileCallback } from 'node:child_process';
import { constants as fsConstants } from 'node:fs';
import { access, mkdir, mkdtemp, readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';

import { parseArgs, scaffoldModuleItem } from '../new-module-item.mjs';

const execFile = promisify(execFileCallback);
const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

async function createWorkspaceFixture(appId = 'admin-lite', moduleId = 'demo-management') {
  const rootDir = await mkdtemp(path.join(os.tmpdir(), 'one-base-template-new-module-item-'));
  await mkdir(path.join(rootDir, `apps/${appId}/src/modules/${moduleId}`), { recursive: true });
  return rootDir;
}

async function assertExists(targetPath) {
  await access(targetPath, fsConstants.F_OK);
}

test('parseArgs 支持模块子业务参数', () => {
  const args = parseArgs([
    'user',
    '--app',
    'zfw-system-sfss',
    '--module',
    'demo-management',
    '--title',
    '用户管理',
    '--route=/demo/management/user',
    '--dry-run'
  ]);

  assert.equal(args.itemId, 'user');
  assert.equal(args.appId, 'zfw-system-sfss');
  assert.equal(args.moduleId, 'demo-management');
  assert.equal(args.title, '用户管理');
  assert.equal(args.routePath, '/demo/management/user');
  assert.equal(args.dryRun, true);
});

test('parseArgs 支持先传 --app 再传 item-id', () => {
  const args = parseArgs(['--app', 'admin-lite', 'user', '--module', 'home', '--dry-run']);

  assert.equal(args.appId, 'admin-lite');
  assert.equal(args.itemId, 'user');
  assert.equal(args.moduleId, 'home');
  assert.equal(args.dryRun, true);
});

test('scaffoldModuleItem dry-run 仅返回计划文件不落盘', async () => {
  const rootDir = await createWorkspaceFixture();
  const result = await scaffoldModuleItem({
    rootDir,
    appId: 'admin-lite',
    moduleId: 'demo-management',
    itemId: 'dry-item',
    dryRun: true
  });

  assert.equal(result.created, false);
  assert.equal(result.dryRun, true);
  assert.ok(result.plannedFiles.some((filePath) => filePath.endsWith('/router/index.ts')));

  await assert.rejects(async () => {
    await access(
      path.join(rootDir, 'apps/admin-lite/src/modules/demo-management/dry-item'),
      fsConstants.F_OK
    );
  }, /ENOENT/);
});

test('scaffoldModuleItem 生成 user 结构子业务骨架', async () => {
  const rootDir = await createWorkspaceFixture('zfw-system-sfss', 'sample-management');
  const result = await scaffoldModuleItem({
    rootDir,
    appId: 'zfw-system-sfss',
    moduleId: 'sample-management',
    itemId: 'user',
    title: '用户管理',
    routePath: '/sample/management/user'
  });

  assert.equal(result.created, true);
  assert.equal(result.dryRun, false);
  assert.equal(
    result.itemDir,
    path.join(rootDir, 'apps/zfw-system-sfss/src/modules/sample-management/user')
  );

  const listPath = path.join(result.itemDir, 'list.vue');
  const routerPath = path.join(result.itemDir, 'router/index.ts');
  const apiPath = path.join(result.itemDir, 'api.ts');
  const formPath = path.join(result.itemDir, 'form.ts');

  await assertExists(listPath);
  await assertExists(routerPath);
  await assertExists(apiPath);
  await assertExists(formPath);

  const routerSource = await readFile(routerPath, 'utf8');
  assert.match(routerSource, /path: '\/sample\/management\/user'/);
  assert.match(routerSource, /component: async \(\) => import\('\.\.\/list\.vue'\)/);

  const listSource = await readFile(listPath, 'utf8');
  assert.match(listSource, /ObPageContainer/);
  assert.match(listSource, /ObTableBox/);
  assert.match(listSource, /ObTable/);

  const apiSource = await readFile(apiPath, 'utf8');
  assert.match(apiSource, /obHttp\(\)\.post\('\/api\/sample-management\/user\/page'/);
});

test('CLI 在子项目目录执行时可正确生成 dry-run 计划', async () => {
  const itemId = `cli-item-${Date.now()}`;
  const { stdout } = await execFile(
    'node',
    [
      '../../scripts/new-module-item.mjs',
      itemId,
      '--app',
      'admin-lite',
      '--module',
      'home',
      '--dry-run'
    ],
    {
      cwd: path.join(repoRoot, 'apps/admin-lite')
    }
  );

  assert.match(stdout, /\[dry-run\] 计划创建以下文件：/);
  assert.match(stdout, new RegExp(`apps/admin-lite/src/modules/home/${itemId}/list.vue`));
});
