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

describe('architecture/router-core-boundary-source', () => {
  it('assemble-routes 应复用 core 的路由诊断能力', () => {
    const source = readSourceFile('src/router/assemble-routes.ts');

    expect(source).toContain("from '@one-base-template/core'");
    expect(source).toContain('createRouteAssemblyDiagnostics');
    expect(source).not.toContain("from './route-signature'");
    expect(source).not.toContain("from './route-assembly-diagnostics'");
  });

  it('admin 本地路由诊断实现应已移除，避免重复维护', () => {
    const localSignaturePath = path.join(appRootDir, 'src/router/route-signature.ts');
    const localDiagnosticsPath = path.join(appRootDir, 'src/router/route-assembly-diagnostics.ts');

    expect(existsSync(localSignaturePath)).toBe(false);
    expect(existsSync(localDiagnosticsPath)).toBe(false);
  });
});
