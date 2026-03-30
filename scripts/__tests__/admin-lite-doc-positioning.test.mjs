import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { access, readFile } from 'node:fs/promises';
import { constants as fsConstants } from 'node:fs';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

async function readRepoFile(relativePath) {
  return readFile(path.join(repoRoot, relativePath), 'utf8');
}

test('当前仓库不再保留 apps/template 目录', async () => {
  await assert.rejects(access(path.join(repoRoot, 'apps/template'), fsConstants.F_OK), /ENOENT/);
});

test('admin-lite 文档入口不再使用 template 时代定位', async () => {
  const guideIndex = await readRepoFile('apps/docs/docs/guide/index.md');
  const forUsers = await readRepoFile('apps/docs/docs/guide/for-users.md');
  const forMaintainers = await readRepoFile('apps/docs/docs/guide/for-maintainers.md');

  assert.doesNotMatch(guideIndex, /新应用孵化/);
  assert.doesNotMatch(guideIndex, /迁移承接/);
  assert.match(guideIndex, /后台快速起项目/);
  assert.match(forUsers, /\/guide\/admin-lite-base-app/);
  assert.match(forMaintainers, /\/guide\/admin-lite-base-app/);
});
