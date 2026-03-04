import { execFileSync } from 'node:child_process';
import { readdirSync } from 'node:fs';
import path from 'node:path';

const rootDir = process.cwd();
const ignoreDirs = new Set(['node_modules', 'dist', 'build', '.turbo', '.vite', '.cache']);

function walkCssFiles(dirPath, out = []) {
  const entries = readdirSync(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    const absPath = path.join(dirPath, entry.name);

    if (entry.isDirectory()) {
      if (ignoreDirs.has(entry.name)) {
        continue;
      }
      walkCssFiles(absPath, out);
      continue;
    }

    if (!entry.isFile()) {
      continue;
    }
    if (!entry.name.endsWith('.css')) {
      continue;
    }
    out.push(absPath);
  }

  return out;
}

const cssFiles = walkCssFiles(rootDir);

if (cssFiles.length === 0) {
  console.log('未找到 CSS 文件，跳过 Csslint 检查。');
  process.exit(0);
}

const csslintBin = process.platform === 'win32' ? 'csslint.cmd' : 'csslint';
execFileSync(csslintBin, [...cssFiles, '--quiet'], { stdio: 'inherit' });
