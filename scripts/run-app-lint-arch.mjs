import path from 'node:path';
import { promises as fs } from 'node:fs';
import { spawn } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

async function pathExists(targetPath) {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

export async function collectLintArchApps(workspaceRoot) {
  const appsDir = path.join(workspaceRoot, 'apps');
  if (!(await pathExists(appsDir))) {
    return [];
  }

  const entries = await fs.readdir(appsDir, { withFileTypes: true });
  const collected = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) {
      continue;
    }

    const packageJsonPath = path.join(appsDir, entry.name, 'package.json');
    if (!(await pathExists(packageJsonPath))) {
      continue;
    }

    const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf8'));
    const lintArchCommand = packageJson.scripts?.['lint:arch'];
    if (!lintArchCommand) {
      continue;
    }

    collected.push({
      dirName: entry.name,
      name: packageJson.name || entry.name,
      packageJsonPath,
      lintArchCommand
    });
  }

  return collected.sort((left, right) => left.name.localeCompare(right.name));
}

function runLintArchForApp(workspaceRoot, appDirName) {
  return new Promise((resolve, reject) => {
    const child = spawn('pnpm', ['-C', `apps/${appDirName}`, 'lint:arch'], {
      cwd: workspaceRoot,
      stdio: 'inherit',
      shell: process.platform === 'win32'
    });

    child.on('error', reject);
    child.on('close', (code) => {
      if (code === 0) {
        resolve();
        return;
      }
      reject(new Error(`apps/${appDirName} lint:arch 执行失败，退出码 ${code}`));
    });
  });
}

async function main() {
  const apps = await collectLintArchApps(rootDir);
  if (apps.length === 0) {
    console.log('未发现声明 lint:arch 的 app，跳过架构检查。');
    return;
  }

  for (const app of apps) {
    console.log(`执行 lint:arch -> ${app.name}`);
    await runLintArchForApp(rootDir, app.dirName);
  }
}

const invokedPath = process.argv[1] ? pathToFileURL(path.resolve(process.argv[1])).href : '';

if (invokedPath === import.meta.url) {
  main().catch((error) => {
    const message = error instanceof Error ? error.message : String(error);
    console.error(message);
    process.exit(1);
  });
}
