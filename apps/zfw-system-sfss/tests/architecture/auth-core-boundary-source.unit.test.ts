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

describe('architecture/auth-core-boundary-source', () => {
  it('auth-scenario-provider 应复用 core 的 SSO 参数策略能力', () => {
    const source = readSourceFile('src/services/auth/auth-scenario-provider.ts');

    expect(source).toContain("from '@one-base-template/core'");
    expect(source).toContain('startSsoCallbackStrategy');
    expect(source).not.toContain('buildLoginScenario as buildCoreLoginScenario');
    expect(source).not.toContain("from '@/services/auth/sso-callback-strategy'");
  });

  it('登录页应直接复用 core 的 buildLoginScenario', () => {
    const source = readSourceFile('src/pages/login/LoginPage.vue');

    expect(source).toContain('buildLoginScenario');
    expect(source).toContain("from '@one-base-template/core'");
    expect(source).not.toContain("from '@/services/auth/auth-scenario-provider'");
  });

  it('admin 本地 SSO 策略文件应已移除，避免重复维护', () => {
    const localStrategyPath = path.join(appRootDir, 'src/services/auth/sso-callback-strategy.ts');
    expect(existsSync(localStrategyPath)).toBe(false);
  });
});
