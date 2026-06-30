import {
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
const runtimePackageDirs = ['core', 'tag', 'ui', 'adapters'];
const cliPackageDir = 'packages/create-admin-lite';
const cliPackageName = '@one-base-template/create-admin-lite';

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

async function validateGeneratedProjectSafety() {
  const files = await listFiles(generatedDir);
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

  const packageJson = readJson(join(generatedDir, 'package.json'));
  const npmrcPath = join(generatedDir, '.npmrc');
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

  const moduleDir = join(generatedDir, 'src/modules');
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

function collectRuntimeOverrides() {
  const tarballs = readdirSync(packDir)
    .filter((file) => file.endsWith('.tgz'))
    .map((file) => join(packDir, file))
    .filter((file) => packageNameFromTarball(file) !== cliPackageName);

  const tarballByPackageName = new Map(
    tarballs.map((tarball) => [packageNameFromTarball(tarball), `file:${tarball}`])
  );
  const packageJson = readJson(join(generatedDir, 'package.json'));
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

function installAndBuildGeneratedProject() {
  const packageJsonPath = join(generatedDir, 'package.json');
  const packageJson = readJson(packageJsonPath);
  packageJson.pnpm = {
    ...packageJson.pnpm,
    overrides: collectRuntimeOverrides()
  };
  writeJson(packageJsonPath, packageJson);

  run('pnpm', ['install', '--ignore-workspace', '--config.ignore-workspace=true'], {
    cwd: generatedDir
  });
  run('pnpm', ['build'], { cwd: generatedDir });
}

async function main() {
  packRuntimePackages();
  const cliBin = extractCliPackage();
  generateProject(cliBin);
  await validateGeneratedProjectSafety();
  installAndBuildGeneratedProject();
  console.log('admin-lite CLI 校验通过：本地 pack、仓库外生成、静态扫描、install/build 均完成。');
}

main();
