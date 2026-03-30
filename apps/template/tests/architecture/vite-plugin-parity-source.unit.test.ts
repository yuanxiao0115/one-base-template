import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vite-plus/test';

const appRootDir = process.cwd();

function readSourceFile(relativePath: string): string {
  const absolutePath = path.join(appRootDir, relativePath);
  if (!existsSync(absolutePath)) {
    throw new Error(`文件不存在: ${relativePath}`);
  }
  return readFileSync(absolutePath, 'utf8');
}

describe('architecture/vite-plugin-parity-source', () => {
  it('template vite 配置应通过 createTemplatePlugins 装配插件，避免遗漏 Element Plus 解析链路', () => {
    const source = readSourceFile('vite.config.ts');

    expect(source).toContain("from './build'");
    expect(source).toContain('plugins: createTemplatePlugins()');
    expect(source).not.toContain('plugins: [vue()]');
  });

  it('template 构建插件应接入 Element Plus 自动导入与组件解析', () => {
    const source = readSourceFile('build/vite-plugins.ts');

    expect(source).toContain("import AutoImport from 'unplugin-auto-import/vite'");
    expect(source).toContain("import Components from 'unplugin-vue-components/vite'");
    expect(source).toContain(
      "import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'"
    );
    expect(source).toContain('resolvers: [ElementPlusResolver()]');
    expect(source).toContain("resolvers: [ElementPlusResolver({ importStyle: 'css' })]");
  });
});
