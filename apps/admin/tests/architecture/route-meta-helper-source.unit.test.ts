import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vite-plus/test';

const appRootDir = process.cwd();

const ROUTE_FILES = [
  'src/modules/home/routes.ts',
  'src/modules/CmsManagement/routes.ts',
  'src/modules/PortalManagement/routes/layout.ts',
  'src/modules/PortalManagement/routes/standalone.ts',
  'src/modules/LogManagement/routes.ts',
  'src/modules/SystemManagement/routes.ts',
  'src/modules/adminManagement/routes.ts'
] as const;

function readSourceFile(relativePath: string): string {
  const absolutePath = path.join(appRootDir, relativePath);
  if (!existsSync(absolutePath)) {
    throw new Error(`文件不存在: ${relativePath}`);
  }
  return readFileSync(absolutePath, 'utf8');
}

describe('architecture/route-meta-helper-source', () => {
  it('模块路由应统一从 @/router/meta 导入 meta helper', () => {
    for (const relativePath of ROUTE_FILES) {
      const source = readSourceFile(relativePath);
      expect(source).toContain("from '@/router/meta'");
    }
  });

  it('模块路由应禁止散写 meta: {}，避免漏配公共策略', () => {
    for (const relativePath of ROUTE_FILES) {
      const source = readSourceFile(relativePath);
      expect(source).not.toMatch(/meta:\s*\{/);
    }
  });
});
