import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { readdir } from 'node:fs/promises';
import { basename, join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

const rootDir = resolve(import.meta.dirname, '..');
const tempDir = resolve(rootDir, '.tmp/public-packages');
const packDir = join(tempDir, 'packs');
const fixtureDir = join(tempDir, 'consumer');
const pnpmCliPath = process.env.npm_execpath || '';
const pnpmCommand = pnpmCliPath ? process.execPath : 'pnpm';
const pnpmBaseArgs = pnpmCliPath ? [pnpmCliPath] : [];
const publicPackages = ['core', 'utils', 'tag', 'ui', 'adapters', 'app-starter'];
const publicPackageNames = publicPackages.map((pkg) => `@one-base-template/${pkg}`);
const cliPackageNames = ['@one-base-template/create-admin-lite'];
const deferredPackageNames = ['document-form-engine', 'portal-engine'].map(
  (pkg) => `@one-base-template/${pkg}`
);
const packageChecks = {
  '@one-base-template/adapters': {
    files: ['dist/index.js', 'dist/index.d.ts'],
    imports: [
      "import { createBasicAdapter, createDefaultAdapter } from '@one-base-template/adapters';"
    ]
  },
  '@one-base-template/app-starter': {
    files: ['dist/index.js', 'dist/index.d.ts'],
    imports: [
      "import { createRuntimeConfigLoader, startAppWithRuntimeConfig } from '@one-base-template/app-starter';"
    ]
  },
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
      'dist/style.css',
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
      'dist/shell.d.ts',
      'dist/style.css'
    ],
    imports: [
      "import { TableBox } from '@one-base-template/ui';",
      "import ObTablePlugin from '@one-base-template/ui/obtable';",
      "import VxePlugin from '@one-base-template/ui/vxe';",
      "import { LoginBox } from '@one-base-template/ui/lite-auth';",
      "import { AdminLayout } from '@one-base-template/ui/shell';",
      "import '@one-base-template/ui/style';"
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

function runPnpm(args, options = {}) {
  return run(pnpmCommand, [...pnpmBaseArgs, ...args], options);
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

function writeLocalOverrideWorkspace(projectDir, overrides) {
  const lines = ['packages:', '  - .', 'overrides:'];
  for (const [name, value] of Object.entries(overrides)) {
    lines.push(`  '${name}': ${JSON.stringify(value)}`);
  }
  writeFileSync(join(projectDir, 'pnpm-workspace.yaml'), `${lines.join('\n')}\n`);
}

function validatePackageMetadata() {
  for (const packageName of publicPackageNames) {
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
    assert(packageJson.private === true, `${packageName} 不应进入当前发布范围`);
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

  const adaptersPackageJson = readJson(join(rootDir, 'packages/adapters/package.json'));
  assert(
    adaptersPackageJson.dependencies['@one-base-template/core'] === 'workspace:^',
    'adapters -> core 未使用 workspace:^'
  );

  const tagPackageJson = readJson(join(rootDir, 'packages/tag/package.json'));
  assert(
    tagPackageJson.exports?.['./style'] === './dist/style.css',
    'tag 样式入口未指向 dist/style.css'
  );

  assert(
    uiPackageJson.exports?.['./style'] === './dist/style.css',
    'ui 样式入口未指向 dist/style.css'
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
  const knownPackageNames = new Set([
    ...publicPackageNames,
    ...cliPackageNames,
    ...deferredPackageNames
  ]);
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

  for (const pkg of publicPackages) {
    runPnpm(['-C', `packages/${pkg}`, 'pack', '--pack-destination', packDir]);
  }
}

async function createConsumerFixture() {
  mkdirSync(fixtureDir, { recursive: true });

  const tarballs = (await readdir(packDir))
    .filter((file) => file.endsWith('.tgz'))
    .map((file) => join(packDir, file));

  assert(
    tarballs.length === publicPackages.length,
    `期望 ${publicPackages.length} 个 tarball，实际 ${tarballs.length} 个`
  );

  const localPackageEntries = Object.fromEntries(
    tarballs.map((tarball) => [
      `@one-base-template/${basename(tarball)
        .replace(/^one-base-template-/, '')
        .replace(/-\d+\.\d+\.\d+\.tgz$/, '')}`,
      `file:${tarball}`
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
        }
      },
      null,
      2
    )
  );
  writeLocalOverrideWorkspace(fixtureDir, localPackageEntries);

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
      )}\n\nconsole.log(Boolean(createCore), Boolean(utilsVersion), Boolean(OneTagPlugin), Boolean(setTagPiniaInstance), Boolean(TableBox), Boolean(ObTablePlugin), Boolean(VxePlugin), Boolean(LoginBox), Boolean(AdminLayout), Boolean(createBasicAdapter), Boolean(createDefaultAdapter), Boolean(createRuntimeConfigLoader), Boolean(startAppWithRuntimeConfig));\n`
  );
  writeFileSync(
    join(fixtureDir, 'vite.config.ts'),
    "import vue from '@vitejs/plugin-vue';\nimport { defineConfig } from 'vite-plus';\n\nexport default defineConfig({ plugins: [vue()] });\n"
  );
}

function installAndBuildConsumer() {
  runPnpm(['install'], { cwd: fixtureDir });
  runPnpm(['build'], { cwd: fixtureDir });
}

async function main() {
  runPnpm(['release:build']);
  validatePackageMetadata();
  await validateChangesetsAsync();
  validateTrackedCredentialSafety();
  packPackages();
  await createConsumerFixture();
  installAndBuildConsumer();
  console.log('公共包发布校验通过：metadata、credential scan、pack、临时消费者构建均完成。');
}

main();
