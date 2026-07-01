import {
  cpSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync
} from 'node:fs';
import { readdir } from 'node:fs/promises';
import { basename, join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

const rootDir = resolve(import.meta.dirname, '..');
const tempDir = resolve(rootDir, '.tmp/admin-lite-cli');
const packDir = join(tempDir, 'packs');
const cliExtractDir = join(tempDir, 'cli-package');
const outsideDir = join(tempDir, 'outside-consumer');
const generatedDir = join(outsideDir, 'sample-admin');
const upgradeDryRunDir = join(outsideDir, 'sample-admin-upgrade-dry-run');
const upgradeApplyDir = join(outsideDir, 'sample-admin-upgrade-apply');
const upgradeConflictDir = join(outsideDir, 'sample-admin-upgrade-conflict');
const upgradeCurrentLegacyDir = join(outsideDir, 'sample-admin-current-legacy');
const doctorFailureDir = join(outsideDir, 'sample-admin-doctor-failure');
const runtimePackageDirs = ['core', 'tag', 'ui', 'adapters'];
const cliPackageDir = 'packages/create-admin-lite';
const cliPackageName = '@one-base-template/create-admin-lite';
const cliPackageVersion = readJson(join(rootDir, cliPackageDir, 'package.json')).version;
const metadataFileName = '.admin-lite-template.json';
const reportFileName = '.admin-lite-upgrade-report.md';
const uiSourceLine = '@source "../../node_modules/@one-base-template/ui/dist/**/*.{js,css}";';
const tagStyleImportLine = "import '@one-base-template/tag/style';";
const previousOfficialTemplateBaselineTest = `import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const projectDir = process.cwd();
const ignoredDirs = new Set(['.git', '.tmp', 'coverage', 'dist', 'node_modules']);
const textExtensions = [
  '.css',
  '.html',
  '.js',
  '.json',
  '.md',
  '.mjs',
  '.npmrc',
  '.ts',
  '.tsx',
  '.vue',
  '.yaml',
  '.yml'
];

function readProjectFile(relativePath: string) {
  return readFileSync(join(projectDir, relativePath), 'utf8');
}

function listTextFiles(dir: string): string[] {
  const files: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (ignoredDirs.has(entry.name)) {
      continue;
    }
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...listTextFiles(fullPath));
      continue;
    }
    if (entry.isFile() && textExtensions.some((ext) => fullPath.endsWith(ext))) {
      files.push(fullPath);
    }
  }
  return files;
}

describe('admin-lite template baseline', () => {
  it('写入完整模板元信息且不残留占位符', () => {
    const metadata = JSON.parse(readProjectFile('.admin-lite-template.json'));

    expect(metadata.packageName).toBe('@one-base-template/create-admin-lite');
    expect(metadata.templateName).toBe('admin-lite-minimal');
    expect(metadata.templateVersion).toMatch(/^\\d+\\.\\d+\\.\\d+/);
    expect(metadata.projectName).not.toContain('__');
    expect(metadata.generatedAt).not.toContain('__');
  });

  it('保持企业 npm registry 路由且不提交认证配置', () => {
    const npmrc = readProjectFile('.npmrc');

    expect(npmrc).toContain('registry=https://registry.npmmirror.com');
    expect(npmrc).toContain(
      '@one-base-template:registry=http://artifact.nc.rdcloud.4c.hq.cmcc/artifactory/api/npm/one-package/'
    );

    for (const filePath of listTextFiles(projectDir)) {
      const content = readFileSync(filePath, 'utf8');
      expect(content).not.toMatch(/(?:_auth|_authToken)\\s*=\\s*\\S+/i);
    }
  });

  it('保留独立项目需要的样式入口', () => {
    expect(readProjectFile('src/styles/index.css')).toContain(
      '@source "../../node_modules/@one-base-template/ui/dist/**/*.{js,css}";'
    );
    expect(readProjectFile('src/bootstrap/admin-lite-styles.ts')).toContain(
      "import '@one-base-template/tag/style';"
    );
  });

  it('提供仓外项目的基础开发脚本', () => {
    const packageJson = JSON.parse(readProjectFile('package.json'));

    expect(packageJson.scripts['test:run']).toBe('vp test run --config vitest.config.ts');
    expect(packageJson.scripts['test:run:file']).toContain('vp test run --config vitest.config.ts');
    expect(packageJson.scripts['new:module']).toBe('node ./scripts/new-module.mjs');
    expect(packageJson.scripts['new:module:item']).toBe('node ./scripts/new-module-item.mjs');
  });

  it('默认保留 home 模块和项目内脚手架入口', () => {
    expect(existsSync(join(projectDir, 'src/modules/home'))).toBe(true);
    expect(existsSync(join(projectDir, 'scripts/new-module.mjs'))).toBe(true);
    expect(existsSync(join(projectDir, 'scripts/new-module-item.mjs'))).toBe(true);
    expect(statSync(join(projectDir, 'src/modules/home')).isDirectory()).toBe(true);
  });
});
`;
const pnpmCliPath = process.env.npm_execpath || '';
const pnpmCommand = pnpmCliPath ? process.execPath : 'pnpm';
const pnpmBaseArgs = pnpmCliPath ? [pnpmCliPath] : [];
const generatedModuleId = 'demo-management';
const generatedItemId = 'user';
const defaultTitleItemId = 'audit-log';
const additiveTemplateFilePaths = [
  'scripts/new-module.mjs',
  'scripts/new-module-item.mjs',
  'tests/scaffold/template-baseline.unit.test.ts'
];
const additivePackageScriptNames = ['test:run:file', 'new:module', 'new:module:item'];
const ignoredScanDirs = new Set([
  '.git',
  '.idea',
  '.output',
  '.tmp',
  '.vscode',
  'coverage',
  'dist',
  'node_modules'
]);

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

function spawnPnpm(args, options = {}) {
  return spawnSync(pnpmCommand, [...pnpmBaseArgs, ...args], {
    cwd: options.cwd ?? rootDir,
    encoding: 'utf8',
    shell: process.platform === 'win32',
    stdio: 'pipe',
    env: { ...process.env, ...options.env }
  });
}

function assert(condition, message) {
  if (!condition) {
    console.error(`admin-lite CLI 校验失败：${message}`);
    process.exit(1);
  }
}

function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'));
}

function writeJson(path, value) {
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`);
}

function writeLocalOverrideWorkspace(projectDir, overrides) {
  const lines = ['packages:', '  - .', 'overrides:'];
  for (const [name, value] of Object.entries(overrides)) {
    lines.push(`  '${name}': ${JSON.stringify(value)}`);
  }
  writeFileSync(join(projectDir, 'pnpm-workspace.yaml'), `${lines.join('\n')}\n`);
}

function packageNameFromTarball(tarball) {
  const name = basename(tarball)
    .replace(/^one-base-template-/, '')
    .replace(/-\d+\.\d+\.\d+(?:-[^/]+)?\.tgz$/, '');
  return `@one-base-template/${name}`;
}

async function listFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    if (ignoredScanDirs.has(entry.name)) {
      continue;
    }
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await listFiles(fullPath)));
      continue;
    }
    if (entry.isFile()) {
      files.push(fullPath);
    }
  }
  return files;
}

function isTextFile(path) {
  const textExtensions = [
    '.npmrc',
    '.css',
    '.html',
    '.js',
    '.json',
    '.md',
    '.mjs',
    '.ts',
    '.tsx',
    '.vue',
    '.yaml',
    '.yml'
  ];
  return textExtensions.some((ext) => path.endsWith(ext));
}

async function validateGeneratedProjectSafety(projectDir = generatedDir, options = {}) {
  const { expectOnlyHomeModule = true } = options;
  const files = await listFiles(projectDir);
  const unsafePatterns = [
    { pattern: /workspace:/, label: 'workspace 协议' },
    { pattern: /catalog:/, label: 'catalog 协议' },
    { pattern: /\.\.\/\.\.\/scripts/, label: 'monorepo scripts 相对路径' },
    { pattern: new RegExp(rootDir.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')), label: '本机仓库路径' },
    {
      pattern:
        /\/\/artifact\.nc\.rdcloud\.4c\.hq\.cmcc\/artifactory\/api\/npm\/one-package\/:_auth=/,
      label: 'npm auth 配置'
    },
    { pattern: /_auth\s*=\s*[A-Za-z0-9+/=]{16,}/, label: 'npm auth 值' }
  ];

  for (const file of files) {
    if (!isTextFile(file)) {
      continue;
    }
    const content = readFileSync(file, 'utf8');
    for (const { pattern, label } of unsafePatterns) {
      assert(!pattern.test(content), `${file} 含有 ${label}`);
    }
  }

  const packageJson = readJson(join(projectDir, 'package.json'));
  const npmrcPath = join(projectDir, '.npmrc');
  assert(existsSync(npmrcPath), '生成项目缺少 .npmrc');
  const npmrcContent = readFileSync(npmrcPath, 'utf8');
  assert(
    npmrcContent.includes('registry=https://registry.npmmirror.com'),
    '生成项目 .npmrc 缺少公共 registry'
  );
  assert(
    npmrcContent.includes(
      '@one-base-template:registry=http://artifact.nc.rdcloud.4c.hq.cmcc/artifactory/api/npm/one-package/'
    ),
    '生成项目 .npmrc 缺少 @one-base-template scope registry'
  );

  const metadataPath = join(projectDir, metadataFileName);
  assert(existsSync(metadataPath), '生成项目缺少 .admin-lite-template.json');
  const metadata = readJson(metadataPath);
  assert(metadata.packageName === cliPackageName, '模板元信息 packageName 不正确');
  assert(metadata.templateName === 'admin-lite-minimal', '模板元信息 templateName 不正确');
  assert(typeof metadata.templateVersion === 'string', '模板元信息缺少 templateVersion');
  assert(!metadata.templateVersion.includes('__'), '模板元信息 templateVersion 仍包含占位符');
  assert(typeof metadata.generatedAt === 'string', '模板元信息缺少 generatedAt');
  assert(!metadata.generatedAt.includes('__'), '模板元信息 generatedAt 仍包含占位符');

  const styleEntry = readFileSync(join(projectDir, 'src/styles/index.css'), 'utf8');
  assert(
    styleEntry.includes(uiSourceLine),
    '生成项目 styles/index.css 缺少 @one-base-template/ui dist 扫描源'
  );

  const dependencies = {
    ...packageJson.dependencies,
    ...packageJson.devDependencies
  };
  for (const [name, version] of Object.entries(dependencies)) {
    assert(typeof version === 'string', `${name} 版本不是字符串`);
    assert(!version.startsWith('workspace:'), `${name} 使用 workspace 协议`);
    assert(!version.startsWith('catalog:'), `${name} 使用 catalog 协议`);
    assert(!version.startsWith('file:'), `${name} 使用 file 本地路径`);
    assert(!version.startsWith('link:'), `${name} 使用 link 本地路径`);
  }

  const moduleDir = join(projectDir, 'src/modules');
  const modules = readdirSync(moduleDir)
    .filter((name) => statSync(join(moduleDir, name)).isDirectory())
    .sort();
  if (expectOnlyHomeModule) {
    assert(
      modules.length === 1 && modules[0] === 'home',
      `默认模块不是仅 home：${modules.join(', ')}`
    );
  } else {
    assert(modules.includes('home'), `模块清单缺少 home：${modules.join(', ')}`);
  }

  const scripts = packageJson.scripts ?? {};
  assert(scripts['test:run'], '生成项目缺少 test:run 脚本');
  for (const scriptName of additivePackageScriptNames) {
    assert(scripts[scriptName], `生成项目缺少 ${scriptName} 脚本`);
  }
  for (const relativePath of additiveTemplateFilePaths) {
    assert(existsSync(join(projectDir, relativePath)), `生成项目缺少 ${relativePath}`);
  }
}

function packRuntimePackages() {
  rmSync(tempDir, { force: true, recursive: true });
  mkdirSync(packDir, { recursive: true });

  runPnpm(['release:build']);
  for (const pkg of runtimePackageDirs) {
    runPnpm(['-C', `packages/${pkg}`, 'pack', '--pack-destination', packDir]);
  }
  runPnpm(['-C', cliPackageDir, 'pack', '--pack-destination', packDir]);
}

function extractCliPackage() {
  mkdirSync(cliExtractDir, { recursive: true });
  const cliTarball = readdirSync(packDir)
    .filter((file) => file.endsWith('.tgz'))
    .map((file) => join(packDir, file))
    .find((file) => packageNameFromTarball(file) === cliPackageName);

  assert(cliTarball, `${cliPackageName} tarball 缺失`);
  run('tar', ['-xzf', cliTarball, '-C', cliExtractDir]);
  return join(cliExtractDir, 'package/bin/create-admin-lite.mjs');
}

function generateProject(cliBin) {
  mkdirSync(outsideDir, { recursive: true });
  run('node', [cliBin, 'sample-admin', generatedDir], { cwd: outsideDir });
  assert(existsSync(join(generatedDir, 'package.json')), '生成项目缺少 package.json');
}

function runDoctor(cliBin, projectDir, options = {}) {
  const { expectSuccess = true } = options;
  const result = spawnSync('node', [cliBin, 'doctor', '--json'], {
    cwd: projectDir,
    encoding: 'utf8',
    shell: process.platform === 'win32',
    stdio: 'pipe',
    env: { ...process.env }
  });

  if (expectSuccess) {
    assert(result.status === 0, `doctor 应通过：${result.stdout}${result.stderr}`);
  } else {
    assert(result.status !== 0, 'doctor 应返回非零状态');
  }

  const report = JSON.parse(result.stdout);
  assert(typeof report.ok === 'boolean', 'doctor JSON 缺少 ok 字段');
  const serialized = JSON.stringify(report);
  assert(!serialized.includes('_auth='), 'doctor 输出不应包含 _auth 值');
  assert(!serialized.includes('_authToken='), 'doctor 输出不应包含 _authToken 值');
  return report;
}

function validateDoctorFailure(cliBin) {
  cpSync(generatedDir, doctorFailureDir, { recursive: true });
  writeFileSync(join(doctorFailureDir, '.npmrc'), 'registry=https://registry.npmmirror.com\n');

  const report = runDoctor(cliBin, doctorFailureDir, { expectSuccess: false });
  assert(report.errors > 0, 'doctor 失败场景应包含 error');
  assert(
    report.checks.some(
      (check) => check.status === 'error' && check.name === '.npmrc enterprise registry'
    ),
    'doctor 失败场景应指出缺少 @one-base-template scope registry'
  );
}

function collectRuntimeOverrides(projectDir = generatedDir) {
  const tarballs = readdirSync(packDir)
    .filter((file) => file.endsWith('.tgz'))
    .map((file) => join(packDir, file))
    .filter((file) => packageNameFromTarball(file) !== cliPackageName);

  const tarballByPackageName = new Map(
    tarballs.map((tarball) => [packageNameFromTarball(tarball), `file:${tarball}`])
  );
  const packageJson = readJson(join(projectDir, 'package.json'));
  const dependencies = {
    ...packageJson.dependencies,
    ...packageJson.devDependencies
  };
  const internalDependencyNames = Object.keys(dependencies).filter((name) =>
    name.startsWith('@one-base-template/')
  );

  const overrides = {};
  for (const name of internalDependencyNames) {
    const tarball = tarballByPackageName.get(name);
    assert(tarball, `${name} 本地 tarball 缺失`);
    overrides[name] = tarball;
  }

  return overrides;
}

function installGeneratedProject(projectDir = generatedDir) {
  writeLocalOverrideWorkspace(projectDir, collectRuntimeOverrides(projectDir));

  runPnpm(['install'], { cwd: projectDir });
}

function validateGeneratedProjectCommands(projectDir = generatedDir) {
  runPnpm(['test:run'], { cwd: projectDir });
  runPnpm(['test:run:file', 'tests/scaffold/template-baseline.unit.test.ts'], {
    cwd: projectDir
  });
  runPnpm(['typecheck'], { cwd: projectDir });
  runPnpm(['build'], { cwd: projectDir });
}

function installAndBuildGeneratedProject(projectDir = generatedDir) {
  installGeneratedProject(projectDir);
  validateGeneratedProjectCommands(projectDir);
}

function validateGeneratedCss(projectDir = generatedDir) {
  const assetsDir = join(projectDir, 'dist/assets');
  const cssFiles = readdirSync(assetsDir)
    .filter((file) => file.endsWith('.css'))
    .map((file) => join(assetsDir, file));
  assert(cssFiles.length > 0, '生成项目 dist/assets 缺少 CSS 产物');

  const cssContent = cssFiles.map((file) => readFileSync(file, 'utf8')).join('\n');
  const requiredStyleMarkers = [
    '--tag-text-color',
    '.tags-view',
    '.context-menu',
    '.dropdown-menu',
    '.h-screen',
    '.w-screen',
    '.flex-col'
  ];
  for (const marker of requiredStyleMarkers) {
    assert(cssContent.includes(marker), `生成项目 CSS 产物缺少 ${marker}`);
  }
}

async function snapshotTextFiles(projectDir) {
  const files = await listFiles(projectDir);
  const snapshot = new Map();
  for (const file of files) {
    if (!isTextFile(file)) {
      continue;
    }
    snapshot.set(file.slice(projectDir.length + 1), readFileSync(file, 'utf8'));
  }
  return snapshot;
}

async function assertSnapshotEqual(projectDir, before, message) {
  const after = await snapshotTextFiles(projectDir);
  assert(before.size === after.size, `${message}：文件数量发生变化`);
  for (const [file, content] of before) {
    assert(after.get(file) === content, `${message}：${file} 被修改`);
  }
}

async function validateGeneratedProjectScaffold(projectDir = generatedDir) {
  const moduleArgs = [
    'new:module',
    generatedModuleId,
    '--title',
    'Demo 管理',
    '--route',
    'demo/management'
  ];
  const itemArgs = [
    'new:module:item',
    generatedItemId,
    '--module',
    generatedModuleId,
    '--title',
    '用户管理',
    '--route',
    '/demo/management/user'
  ];

  const moduleDryRunSnapshot = await snapshotTextFiles(projectDir);
  runPnpm([...moduleArgs, '--dry-run'], { cwd: projectDir });
  await assertSnapshotEqual(projectDir, moduleDryRunSnapshot, 'new:module dry-run 不应写文件');

  runPnpm(moduleArgs, { cwd: projectDir });

  const moduleDir = join(projectDir, 'src/modules', generatedModuleId);
  for (const relativePath of ['meta.ts', 'index.ts', 'routes.ts', 'index.vue', 'README.md']) {
    assert(existsSync(join(moduleDir, relativePath)), `new:module 缺少 ${relativePath}`);
  }
  assert(
    readFileSync(join(moduleDir, 'routes.ts'), 'utf8').includes('/demo/management/index'),
    'new:module 路由前缀未生效'
  );

  const duplicateModule = spawnPnpm(['new:module', generatedModuleId], {
    cwd: projectDir
  });
  assert(duplicateModule.status !== 0, '重复 new:module 应失败');

  const defaultTitleItemSnapshot = await snapshotTextFiles(projectDir);
  runPnpm(['new:module:item', defaultTitleItemId, '--module', generatedModuleId, '--dry-run'], {
    cwd: projectDir
  });
  await assertSnapshotEqual(
    projectDir,
    defaultTitleItemSnapshot,
    'new:module:item 默认标题 dry-run 不应写文件'
  );

  const itemDryRunSnapshot = await snapshotTextFiles(projectDir);
  runPnpm([...itemArgs, '--dry-run'], { cwd: projectDir });
  await assertSnapshotEqual(projectDir, itemDryRunSnapshot, 'new:module:item dry-run 不应写文件');

  runPnpm(itemArgs, { cwd: projectDir });

  const itemDir = join(moduleDir, generatedItemId);
  for (const relativePath of [
    'router/index.ts',
    'types.ts',
    'api.ts',
    'form.ts',
    'columns.tsx',
    'const.ts',
    'list.vue'
  ]) {
    assert(existsSync(join(itemDir, relativePath)), `new:module:item 缺少 ${relativePath}`);
  }
  const itemList = readFileSync(join(itemDir, 'list.vue'), 'utf8');
  assert(itemList.includes('ObTableBox'), 'new:module:item list.vue 未使用 ObTableBox');
  assert(itemList.includes('ObTable'), 'new:module:item list.vue 未使用 ObTable');

  const duplicateItem = spawnPnpm(
    ['new:module:item', generatedItemId, '--module', generatedModuleId],
    { cwd: projectDir }
  );
  assert(duplicateItem.status !== 0, '重复 new:module:item 应失败');
}

function prepareOldProjectFixture(targetDir, options = {}) {
  cpSync(generatedDir, targetDir, { recursive: true });
  rmSync(join(targetDir, metadataFileName), { force: true });

  const packageJsonPath = join(targetDir, 'package.json');
  const packageJson = readJson(packageJsonPath);
  packageJson.dependencies['@one-base-template/tag'] = '^0.1.0';
  packageJson.dependencies['@one-base-template/ui'] = '0.1.0';
  for (const scriptName of additivePackageScriptNames) {
    delete packageJson.scripts[scriptName];
  }
  writeJson(packageJsonPath, packageJson);

  for (const relativePath of additiveTemplateFilePaths) {
    rmSync(join(targetDir, relativePath), { force: true, recursive: true });
  }
  if (options.previousOfficialTest) {
    mkdirSync(join(targetDir, 'tests/scaffold'), { recursive: true });
    writeFileSync(
      join(targetDir, 'tests/scaffold/template-baseline.unit.test.ts'),
      previousOfficialTemplateBaselineTest
    );
  }

  const stylePath = join(targetDir, 'src/styles/index.css');
  const styleEntry = readFileSync(stylePath, 'utf8').replace(`\n${uiSourceLine}\n`, '\n');
  writeFileSync(stylePath, styleEntry);

  const bootstrapStylePath = join(targetDir, 'src/bootstrap/admin-lite-styles.ts');
  const bootstrapStyle = readFileSync(bootstrapStylePath, 'utf8').replace(
    `${tagStyleImportLine}\n`,
    ''
  );
  writeFileSync(
    bootstrapStylePath,
    options.conflict ? "/* 用户自定义样式入口 */\nimport '../styles/index.css';\n" : bootstrapStyle
  );
}

async function validateUpgradeDryRun(cliBin) {
  prepareOldProjectFixture(upgradeDryRunDir);
  const before = await snapshotTextFiles(upgradeDryRunDir);
  run('node', [cliBin, 'upgrade', '--dry-run', '--yes'], { cwd: upgradeDryRunDir });
  await assertSnapshotEqual(upgradeDryRunDir, before, 'upgrade dry-run 不应修改项目文件');
}

async function validateUpgradeApply(cliBin) {
  prepareOldProjectFixture(upgradeApplyDir, { previousOfficialTest: true });
  run('node', [cliBin, 'upgrade', '--yes'], { cwd: upgradeApplyDir });

  const packageJson = readJson(join(upgradeApplyDir, 'package.json'));
  const templatePackageJson = readJson(
    join(rootDir, 'packages/create-admin-lite/templates/admin-lite-minimal/package.json')
  );
  for (const name of Object.keys(packageJson.dependencies).filter((dep) =>
    dep.startsWith('@one-base-template/')
  )) {
    assert(
      packageJson.dependencies[name] === templatePackageJson.dependencies[name],
      `upgrade 后 ${name} 未同步到模板版本`
    );
  }

  const metadata = readJson(join(upgradeApplyDir, metadataFileName));
  assert(metadata.templateVersion === cliPackageVersion, 'upgrade 后模板版本未更新到当前 CLI 版本');
  assert(metadata.previousTemplateVersion === '0.1.0', 'upgrade 后缺少 previousTemplateVersion');

  const styleEntry = readFileSync(join(upgradeApplyDir, 'src/styles/index.css'), 'utf8');
  assert(styleEntry.includes(uiSourceLine), 'upgrade 后缺少 UI Tailwind 扫描源');
  const bootstrapStyle = readFileSync(
    join(upgradeApplyDir, 'src/bootstrap/admin-lite-styles.ts'),
    'utf8'
  );
  assert(bootstrapStyle.includes(tagStyleImportLine), 'upgrade 后缺少 tag style 入口');
  for (const scriptName of additivePackageScriptNames) {
    assert(packageJson.scripts[scriptName], `upgrade 后缺少 ${scriptName} 脚本`);
  }
  for (const relativePath of additiveTemplateFilePaths) {
    assert(existsSync(join(upgradeApplyDir, relativePath)), `upgrade 后缺少 ${relativePath}`);
  }
  const baselineTest = readFileSync(
    join(upgradeApplyDir, 'tests/scaffold/template-baseline.unit.test.ts'),
    'utf8'
  );
  assert(
    baselineTest.includes("packageJson.packageManager).toBe('pnpm@10.32.1'"),
    'upgrade 后未更新旧官方基线测试'
  );
  assert(existsSync(join(upgradeApplyDir, reportFileName)), 'upgrade 后缺少升级报告');

  await validateGeneratedProjectSafety(upgradeApplyDir);
  runDoctor(cliBin, upgradeApplyDir);
  installAndBuildGeneratedProject(upgradeApplyDir);
  validateGeneratedCss(upgradeApplyDir);
}

function validateUpgradeConflict(cliBin) {
  prepareOldProjectFixture(upgradeConflictDir, { conflict: true });
  mkdirSync(join(upgradeConflictDir, 'scripts'), { recursive: true });
  writeFileSync(
    join(upgradeConflictDir, 'scripts/new-module.mjs'),
    "console.log('user custom new-module');\n"
  );
  const result = spawnSync('node', [cliBin, 'upgrade', '--yes'], {
    cwd: upgradeConflictDir,
    encoding: 'utf8',
    shell: process.platform === 'win32',
    stdio: 'pipe',
    env: { ...process.env }
  });
  assert(result.status !== 0, '冲突场景 upgrade 应返回非零状态');
  const bootstrapStyle = readFileSync(
    join(upgradeConflictDir, 'src/bootstrap/admin-lite-styles.ts'),
    'utf8'
  );
  assert(bootstrapStyle.includes('用户自定义样式入口'), '冲突场景不应覆盖用户样式入口');
  const report = readFileSync(join(upgradeConflictDir, reportFileName), 'utf8');
  assert(report.includes('Conflicts'), '冲突报告缺少 Conflicts 区块');
  assert(
    report.includes('src/bootstrap/admin-lite-styles.ts 不是可识别的官方样式入口'),
    '冲突报告缺少用户改动文件说明'
  );
  assert(
    report.includes('scripts/new-module.mjs 已存在且内容不同'),
    '冲突报告缺少用户自定义脚手架说明'
  );
}

function validateCurrentLegacyInference(cliBin) {
  cpSync(generatedDir, upgradeCurrentLegacyDir, { recursive: true });
  rmSync(join(upgradeCurrentLegacyDir, metadataFileName), { force: true });
  const output = run('node', [cliBin, 'upgrade', '--dry-run', '--yes'], {
    cwd: upgradeCurrentLegacyDir,
    capture: true
  });
  assert(
    output.includes('Source version: 0.1.2 (inferred)') ||
      output.includes('来源版本: 0.1.2 (inferred)'),
    '当前模板特征的无元信息项目不应被推断为 0.1.0'
  );
}

async function main() {
  packRuntimePackages();
  const cliBin = extractCliPackage();
  generateProject(cliBin);
  await validateGeneratedProjectSafety();
  runDoctor(cliBin, generatedDir);
  validateDoctorFailure(cliBin);
  await validateUpgradeDryRun(cliBin);
  await validateUpgradeApply(cliBin);
  validateUpgradeConflict(cliBin);
  validateCurrentLegacyInference(cliBin);
  await validateGeneratedProjectScaffold();
  await validateGeneratedProjectSafety(generatedDir, { expectOnlyHomeModule: false });
  installAndBuildGeneratedProject();
  validateGeneratedCss();
  console.log(
    'admin-lite CLI 校验通过：本地 pack、仓库外生成、doctor、项目内脚手架、upgrade、静态扫描、install/test/typecheck/build 均完成。'
  );
}

main();
