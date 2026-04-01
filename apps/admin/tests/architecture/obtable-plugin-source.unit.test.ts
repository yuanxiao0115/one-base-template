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

describe('architecture/obtable-plugin-source', () => {
  it('admin 启动插件应使用 obtable 专用入口，避免引入 vxe 运行时', () => {
    const source = readSourceFile('src/bootstrap/plugins.ts');

    expect(source).toContain("from '@one-base-template/ui/obtable'");
    expect(source).toContain('OneUiObTablePlugin');
    expect(source).not.toContain("from '@one-base-template/ui';");
    expect(source).not.toContain('OneUiPlugin');
  });
});
