import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
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
    expect(metadata.templateVersion).toMatch(/^\d+\.\d+\.\d+/);
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
      expect(content).not.toMatch(/(?:_auth|_authToken)\s*=\s*\S+/i);
    }
  });

  it('保留独立项目需要的样式入口', () => {
    expect(readProjectFile('src/styles/index.css')).toContain(
      "@import '../../node_modules/@one-base-template/ui/dist/style.css';"
    );
    expect(readProjectFile('src/styles/index.css')).toContain(
      '@source "../../node_modules/@one-base-template/ui/dist/**/*.{js,css}";'
    );
    expect(readProjectFile('src/bootstrap/admin-lite-styles.ts')).toContain(
      "import '@one-base-template/tag/style';"
    );
  });

  it('默认提供主题切换入口', () => {
    expect(readProjectFile('src/config/ui.ts')).toContain('personalization: true');
    const topbar = readProjectFile('src/components/top/AdminTopBar.vue');

    expect(topbar).toContain('ThemeSwitcher');
    expect(topbar).toContain('markRaw(ThemeSwitcher)');
    expect(topbar).toContain('个性设置');
    expect(topbar).toContain('<ObDialogHost />');
    expect(topbar).toContain('background: transparent;');
    expect(topbar).toContain('border: 0;');
  });

  it('提供仓外项目的基础开发脚本', () => {
    const packageJson = JSON.parse(readProjectFile('package.json'));

    expect(packageJson.packageManager).toBe('pnpm@10.32.1');
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
