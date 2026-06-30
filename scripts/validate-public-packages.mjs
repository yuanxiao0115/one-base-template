import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { readdir } from 'node:fs/promises';
import { basename, join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { createPublicPackageAliasTarballs } from './pack-public-package-aliases.mjs';

const rootDir = resolve(import.meta.dirname, '..');
const tempDir = resolve(rootDir, '.tmp/public-packages');
const packDir = join(tempDir, 'packs');
const fixtureDir = join(tempDir, 'consumer');
const firstBatch = ['core', 'utils', 'tag', 'ui'];
const firstBatchPackageNames = firstBatch.map((pkg) => `@one-base-template/${pkg}`);
const publishPackageNameBySourceName = {
  '@one-base-template/core': 'one-base-template-core',
  '@one-base-template/utils': 'one-base-template-utils',
  '@one-base-template/tag': 'one-base-template-tag',
  '@one-base-template/ui': 'one-base-template-ui'
};
const deferredPackageNames = [
  'adapters',
  'app-starter',
  'document-form-engine',
  'portal-engine'
].map((pkg) => `@one-base-template/${pkg}`);
const packageChecks = {
  '@one-base-template/core': {
    files: ['dist/index.js', 'dist/index.d.ts'],
    imports: ["import { createCore } from '@one-base-template/core';"]
  },
  '@one-base-template/utils': {
    files: ['dist/index.js', 'dist/index.d.ts'],
    imports: ["import { version as utilsVersion } from '@one-base-template/utils';"]
  },
  '@one-base-template/tag': {
    files: [
      'dist/index.js',
      'dist/index.d.ts',
      'dist/store-entry.js',
      'dist/store-entry.d.ts',
      'dist/styles/global.scss'
    ],
    imports: [
      "import OneTagPlugin from '@one-base-template/tag';",
      "import { setTagPiniaInstance } from '@one-base-template/tag/store';",
      "import '@one-base-template/tag/style';"
    ]
  },
  '@one-base-template/ui': {
    files: [
      'dist/index.js',
      'dist/index.d.ts',
      'dist/obtable.js',
      'dist/obtable.d.ts',
      'dist/vxe.js',
      'dist/vxe.d.ts',
      'dist/lite.js',
      'dist/lite.d.ts',
      'dist/lite-auth.js',
      'dist/lite-auth.d.ts',
      'dist/shell.js',
      'dist/shell.d.ts'
    ],
    imports: [
      "import { TableBox } from '@one-base-template/ui';",
      "import ObTablePlugin from '@one-base-template/ui/obtable';",
      "import VxePlugin from '@one-base-template/ui/vxe';",
      "import { LoginBox } from '@one-base-template/ui/lite-auth';",
      "import { AdminLayout } from '@one-base-template/ui/shell';"
    ]
  }
};

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: options.cwd ?? rootDir,
    encoding: 'utf8',
    shell: process.platform === 'win32',
    stdio: options.capture ? 'pipe' : 'inherit',
    env: { ...process.env, ...options.env }
  });

  if (result.status !== 0) {
    if (options.capture) {
      process.stderr.write(result.stdout ?? '');
      process.stderr.write(result.stderr ?? '');
    }
    process.exit(result.status ?? 1);
  }

  return result.stdout ?? '';
}

function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'));
}

function assert(condition, message) {
  if (!condition) {
    console.error(`发布校验失败：${message}`);
    process.exit(1);
  }
}

function validatePackageMetadata() {
  for (const packageName of firstBatchPackageNames) {
    const packageDir = join(rootDir, 'packages', packageName.replace('@one-base-template/', ''));
    const packageJson = readJson(join(packageDir, 'package.json'));

    assert(packageJson.private !== true, `${packageName} 仍为 private`);
    assert(packageJson.publishConfig?.registry, `${packageName} 缺少 publishConfig.registry`);
    assert(
      Array.isArray(packageJson.files) && packageJson.files.includes('dist'),
      `${packageName} files 未包含 dist`
    );
    assert(
      packageJson.exports?.['.']?.default?.startsWith('./dist/'),
      `${packageName} 默认导出未指向 dist`
    );

    for (const requiredFile of packageChecks[packageName].files) {
      assert(existsSync(join(packageDir, requiredFile)), `${packageName} 缺少 ${requiredFile}`);
    }
  }

  for (const packageName of deferredPackageNames) {
    const packageDir = join(rootDir, 'packages', packageName.replace('@one-base-template/', ''));
    const packageJson = readJson(join(packageDir, 'package.json'));
    assert(packageJson.private === true, `${packageName} 不应进入首批发布`);
  }

  const uiPackageJson = readJson(join(rootDir, 'packages/ui/package.json'));
  assert(
    uiPackageJson.dependencies['@one-base-template/core'] === 'workspace:^',
    'ui -> core 未使用 workspace:^'
  );
  assert(
    uiPackageJson.dependencies['@one-base-template/tag'] === 'workspace:^',
    'ui -> tag 未使用 workspace:^'
  );
}

async function readChangesetFiles() {
  const changesetDir = join(rootDir, '.changeset');
  return (await readdir(changesetDir)).filter(
    (file) => file.endsWith('.md') && file !== 'README.md'
  );
}

async function validateChangesetsAsync() {
  const changesetDir = join(rootDir, '.changeset');
  const knownPackageNames = new Set([...firstBatchPackageNames, ...deferredPackageNames]);
  for (const file of await readChangesetFiles()) {
    const content = readFileSync(join(changesetDir, file), 'utf8');
    const matches = [
      ...content.matchAll(/^['"]?(@one-base-template\/[^'":]+)['"]?:\s+(patch|minor|major)$/gm)
    ];
    for (const match of matches) {
      assert(knownPackageNames.has(match[1]), `${file} 引用了不存在或未纳入治理的包 ${match[1]}`);
    }
  }
}

function validateTrackedCredentialSafety() {
  const files = run('git', ['ls-files'], { capture: true }).split(/\r?\n/).filter(Boolean);

  const unsafePatterns = [
    /\/\/artifact\.nc\.rdcloud\.4c\.hq\.cmcc\/artifactory\/api\/npm\/one-package\/:_auth=/,
    /_auth\s*=\s*[A-Za-z0-9+/=]{16,}/
  ];

  for (const file of files) {
    const fullPath = join(rootDir, file);
    if (!existsSync(fullPath)) {
      continue;
    }
    let content = '';
    try {
      content = readFileSync(fullPath, 'utf8');
    } catch {
      continue;
    }
    for (const pattern of unsafePatterns) {
      assert(!pattern.test(content), `tracked file ${file} 含有疑似 npm auth 配置`);
    }
  }
}

function packPackages() {
  rmSync(tempDir, { force: true, recursive: true });
  mkdirSync(packDir, { recursive: true });

  createPublicPackageAliasTarballs({ packDir });
}

async function createConsumerFixture() {
  mkdirSync(fixtureDir, { recursive: true });

  const tarballs = (await readdir(packDir))
    .filter((file) => file.endsWith('.tgz'))
    .map((file) => join(packDir, file));

  assert(
    tarballs.length === firstBatch.length,
    `期望 ${firstBatch.length} 个 tarball，实际 ${tarballs.length} 个`
  );

  const tarballByPublishPackageName = new Map(
    tarballs.map((tarball) => [
      basename(tarball).replace(/-\d+\.\d+\.\d+\.tgz$/, ''),
      `file:${tarball}`
    ])
  );
  const localPackageEntries = Object.fromEntries(
    Object.entries(publishPackageNameBySourceName).map(([sourceName, publishPackageName]) => [
      sourceName,
      tarballByPublishPackageName.get(publishPackageName)
    ])
  );

  writeFileSync(
    join(fixtureDir, 'package.json'),
    JSON.stringify(
      {
        private: true,
        type: 'module',
        scripts: {
          build: 'vp build'
        },
        dependencies: {
          '@vitejs/plugin-vue': '^6.0.4',
          '@vueuse/core': '^10.7.0',
          'element-plus': '^2.13.2',
          pinia: '^3.0.4',
          typescript: '^5.0.0',
          vite: 'npm:@voidzero-dev/vite-plus-core@0.1.14',
          'vite-plus': '0.1.14',
          vue: '^3.5.28',
          'vue-router': '^5.0.2',
          ...localPackageEntries
        },
        pnpm: {
          overrides: localPackageEntries
        }
      },
      null,
      2
    )
  );

  writeFileSync(
    join(fixtureDir, 'index.html'),
    '<div id="app"></div>\n<script type="module" src="/src/main.ts"></script>\n'
  );
  mkdirSync(join(fixtureDir, 'src'), { recursive: true });
  writeFileSync(
    join(fixtureDir, 'src/main.ts'),
    `${Object.values(packageChecks)
      .flatMap((check) => check.imports)
      .join(
        '\n'
      )}\n\nconsole.log(Boolean(createCore), Boolean(utilsVersion), Boolean(OneTagPlugin), Boolean(setTagPiniaInstance), Boolean(TableBox), Boolean(ObTablePlugin), Boolean(VxePlugin), Boolean(LoginBox), Boolean(AdminLayout));\n`
  );
  writeFileSync(
    join(fixtureDir, 'vite.config.ts'),
    "import vue from '@vitejs/plugin-vue';\nimport { defineConfig } from 'vite-plus';\n\nexport default defineConfig({ plugins: [vue()] });\n"
  );
}

function installAndBuildConsumer() {
  run('pnpm', ['install', '--ignore-workspace', '--config.ignore-workspace=true'], {
    cwd: fixtureDir
  });
  run('pnpm', ['build'], { cwd: fixtureDir });
}

async function main() {
  run('pnpm', ['release:build']);
  validatePackageMetadata();
  await validateChangesetsAsync();
  validateTrackedCredentialSafety();
  packPackages();
  await createConsumerFixture();
  installAndBuildConsumer();
  console.log('公共包发布校验通过：metadata、credential scan、pack、临时消费者构建均完成。');
}

main();
