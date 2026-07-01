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
const runtimePackageDirs = ['core', 'tag', 'ui', 'adapters'];
const cliPackageDir = 'packages/create-admin-lite';
const cliPackageName = '@one-base-template/create-admin-lite';
const cliPackageVersion = readJson(join(rootDir, cliPackageDir, 'package.json')).version;
const metadataFileName = '.admin-lite-template.json';
const reportFileName = '.admin-lite-upgrade-report.md';
const uiSourceLine = '@source "../../node_modules/@one-base-template/ui/dist/**/*.{js,css}";';
const tagStyleImportLine = "import '@one-base-template/tag/style';";

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

async function validateGeneratedProjectSafety(projectDir = generatedDir) {
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
  assert(
    modules.length === 1 && modules[0] === 'home',
    `默认模块不是仅 home：${modules.join(', ')}`
  );
}

function packRuntimePackages() {
  rmSync(tempDir, { force: true, recursive: true });
  mkdirSync(packDir, { recursive: true });

  run('pnpm', ['release:build']);
  for (const pkg of runtimePackageDirs) {
    run('pnpm', ['-C', `packages/${pkg}`, 'pack', '--pack-destination', packDir]);
  }
  run('pnpm', ['-C', cliPackageDir, 'pack', '--pack-destination', packDir]);
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

function installAndBuildGeneratedProject(projectDir = generatedDir) {
  const packageJsonPath = join(projectDir, 'package.json');
  const packageJson = readJson(packageJsonPath);
  packageJson.pnpm = {
    ...packageJson.pnpm,
    overrides: collectRuntimeOverrides(projectDir)
  };
  writeJson(packageJsonPath, packageJson);

  run('pnpm', ['install', '--ignore-workspace', '--config.ignore-workspace=true'], {
    cwd: projectDir
  });
  run('pnpm', ['build'], { cwd: projectDir });
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

function prepareOldProjectFixture(targetDir, options = {}) {
  cpSync(generatedDir, targetDir, { recursive: true });
  rmSync(join(targetDir, metadataFileName), { force: true });

  const packageJsonPath = join(targetDir, 'package.json');
  const packageJson = readJson(packageJsonPath);
  packageJson.dependencies['@one-base-template/tag'] = '^0.1.0';
  packageJson.dependencies['@one-base-template/ui'] = '0.1.0';
  writeJson(packageJsonPath, packageJson);

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
  prepareOldProjectFixture(upgradeApplyDir);
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
  assert(existsSync(join(upgradeApplyDir, reportFileName)), 'upgrade 后缺少升级报告');

  await validateGeneratedProjectSafety(upgradeApplyDir);
  installAndBuildGeneratedProject(upgradeApplyDir);
  validateGeneratedCss(upgradeApplyDir);
}

function validateUpgradeConflict(cliBin) {
  prepareOldProjectFixture(upgradeConflictDir, { conflict: true });
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
  await validateUpgradeDryRun(cliBin);
  await validateUpgradeApply(cliBin);
  validateUpgradeConflict(cliBin);
  validateCurrentLegacyInference(cliBin);
  installAndBuildGeneratedProject();
  validateGeneratedCss();
  console.log(
    'admin-lite CLI 校验通过：本地 pack、仓库外生成、upgrade dry-run、upgrade apply、冲突保护、静态扫描、install/build 均完成。'
  );
}

main();
