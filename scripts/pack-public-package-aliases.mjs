import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { spawnSync } from 'node:child_process';

export const rootDir = resolve(import.meta.dirname, '..');
export const publicPackageAliasTempDir = resolve(rootDir, '.tmp/public-package-aliases');
export const publicPackageAliasPackDir = join(publicPackageAliasTempDir, 'packs');

export const publicPackageAliases = [
  {
    id: 'core',
    sourceName: '@one-base-template/core',
    aliasName: 'one-base-template-core',
    packageDir: 'packages/core'
  },
  {
    id: 'utils',
    sourceName: '@one-base-template/utils',
    aliasName: 'one-base-template-utils',
    packageDir: 'packages/utils'
  },
  {
    id: 'tag',
    sourceName: '@one-base-template/tag',
    aliasName: 'one-base-template-tag',
    packageDir: 'packages/tag'
  },
  {
    id: 'ui',
    sourceName: '@one-base-template/ui',
    aliasName: 'one-base-template-ui',
    packageDir: 'packages/ui'
  }
];

const aliasNameBySourceName = new Map(
  publicPackageAliases.map((packageAlias) => [packageAlias.sourceName, packageAlias.aliasName])
);

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

function writeJson(path, value) {
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`);
}

function sourceTarballName(sourceName, version) {
  return `${sourceName.replace(/^@/, '').replace('/', '-')}-${version}.tgz`;
}

function rewriteInternalDependencyAliases(packageJson) {
  for (const dependencyType of ['dependencies', 'peerDependencies', 'optionalDependencies']) {
    const dependencies = packageJson[dependencyType];
    if (!dependencies) {
      continue;
    }

    for (const [sourceName, aliasName] of aliasNameBySourceName) {
      const versionRange = dependencies[sourceName];
      if (!versionRange) {
        continue;
      }
      dependencies[sourceName] = `npm:${aliasName}@${versionRange}`;
    }
  }
}

function createAliasTarball(packageAlias, rawPackDir, workRoot, packDir) {
  const packageRoot = resolve(rootDir, packageAlias.packageDir);
  const sourcePackageJson = readJson(join(packageRoot, 'package.json'));
  const rawTarball = join(
    rawPackDir,
    sourceTarballName(packageAlias.sourceName, sourcePackageJson.version)
  );
  const workDir = join(workRoot, packageAlias.id);

  rmSync(workDir, { force: true, recursive: true });
  mkdirSync(workDir, { recursive: true });
  run('tar', ['-xzf', rawTarball, '-C', workDir]);

  const unpackedPackageDir = join(workDir, 'package');
  const aliasPackageJsonPath = join(unpackedPackageDir, 'package.json');
  const aliasPackageJson = readJson(aliasPackageJsonPath);
  aliasPackageJson.name = packageAlias.aliasName;
  rewriteInternalDependencyAliases(aliasPackageJson);

  if (aliasPackageJson.scripts) {
    delete aliasPackageJson.scripts.prepack;
    delete aliasPackageJson.scripts.prepublishOnly;
  }

  writeJson(aliasPackageJsonPath, aliasPackageJson);

  const npmPackOutput = run(
    'npm',
    ['pack', unpackedPackageDir, '--pack-destination', packDir, '--ignore-scripts'],
    {
      capture: true
    }
  );
  const tarballName = npmPackOutput.trim().split(/\r?\n/).at(-1);
  const tarballPath = join(packDir, tarballName);

  if (!existsSync(tarballPath)) {
    console.error(`发布别名包生成失败：${packageAlias.aliasName} 未生成 ${tarballPath}`);
    process.exit(1);
  }

  return {
    ...packageAlias,
    version: aliasPackageJson.version,
    tarballPath
  };
}

export function createPublicPackageAliasTarballs(options = {}) {
  const packDir = options.packDir ?? publicPackageAliasPackDir;
  const rawPackDir = join(publicPackageAliasTempDir, 'raw-packs');
  const workRoot = join(publicPackageAliasTempDir, 'work');

  rmSync(publicPackageAliasTempDir, { force: true, recursive: true });
  mkdirSync(rawPackDir, { recursive: true });
  mkdirSync(packDir, { recursive: true });
  mkdirSync(workRoot, { recursive: true });

  for (const packageAlias of publicPackageAliases) {
    run('pnpm', ['-C', packageAlias.packageDir, 'pack', '--pack-destination', rawPackDir]);
  }

  const aliasTarballs = publicPackageAliases.map((packageAlias) =>
    createAliasTarball(packageAlias, rawPackDir, workRoot, packDir)
  );

  for (const aliasTarball of aliasTarballs) {
    console.log(
      `发布别名包已生成：${aliasTarball.sourceName} -> ${aliasTarball.aliasName}@${aliasTarball.version}`
    );
  }

  return aliasTarballs;
}

if (process.argv[1] === import.meta.filename) {
  createPublicPackageAliasTarballs();
}
