import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { readFile } from 'node:fs/promises';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

async function readJson(relativePath) {
  return JSON.parse(await readFile(path.join(repoRoot, relativePath), 'utf8'));
}

async function readText(relativePath) {
  return readFile(path.join(repoRoot, relativePath), 'utf8');
}

for (const appName of ['admin', 'admin-lite']) {
  test(`${appName} typecheck 配置必须纳入 source-controlled d.ts`, async () => {
    const tsconfig = await readJson(`apps/${appName}/tsconfig.json`);
    assert.ok(
      tsconfig.include.includes('src/**/*.d.ts'),
      `${appName} tsconfig 必须包含 src/**/*.d.ts`
    );

    const vitePlugins = await readText(`apps/${appName}/build/vite-plugins.ts`);
    assert.match(vitePlugins, /dts:\s*'src\/types\/auto-imports\.d\.ts'/);
    assert.match(vitePlugins, /dts:\s*'src\/types\/components\.d\.ts'/);

    const autoImportsDts = await readText(`apps/${appName}/src/types/auto-imports.d.ts`);
    assert.match(autoImportsDts, /const message:/);
    assert.match(autoImportsDts, /const obConfirm:/);
    assert.match(autoImportsDts, /const useTable:/);
    assert.match(autoImportsDts, /const useEntityEditor:/);

    const componentsDts = await readText(`apps/${appName}/src/types/components.d.ts`);
    assert.match(componentsDts, /declare module 'vue'/);
  });
}
