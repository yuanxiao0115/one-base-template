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

describe('architecture/login-route-robustness-source', () => {
  it('登录页应优先处理 direct token，避免被登录配置加载阻塞', () => {
    const source = readSourceFile('src/pages/login/LoginPage.vue');

    const directTokenIndex = source.indexOf('if (loginScenario.directLoginToken)');
    const configLoadIndex = source.indexOf('if (loginScenario.shouldLoadLoginPageConfig)');

    expect(directTokenIndex).toBeGreaterThan(-1);
    expect(configLoadIndex).toBeGreaterThan(-1);
    expect(directTokenIndex).toBeLessThan(configLoadIndex);
    expect(source).toContain('await handleDirectTokenLogin(loginScenario.directLoginToken);');
    expect(source).toContain('return;');
  });

  it('SSO 失败分支应同时清理 token 与 idToken', () => {
    const source = readSourceFile('src/pages/sso/SsoCallbackPage.vue');

    expect(source).toContain('localStorage.removeItem(tokenKey);');
    expect(source).toContain('localStorage.removeItem(idTokenKey);');
  });
});
