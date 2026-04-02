import { describe, expect, it } from 'vite-plus/test';
import type { AppModuleManifestMeta } from './module-assembly';
import {
  collectModuleLoadEntries,
  pickEnabledModuleEntries,
  resolveModuleDeclarationCandidate,
  validateModuleDeclaration
} from './module-registry';

describe('core/router/module-registry', () => {
  it('collectModuleLoadEntries 应过滤无效元信息并按 id 排序', () => {
    const warnings: string[] = [];
    const validMeta = {
      id: 'PortalManagement',
      version: '1',
      moduleTier: 'optional',
      enabledByDefault: false
    } as const satisfies AppModuleManifestMeta;

    const entries = collectModuleLoadEntries({
      moduleMetaDefinitions: {
        '../modules/PortalManagement/index.ts': validMeta,
        '../modules/home/index.ts': {
          id: 'home',
          version: '1',
          moduleTier: 'core',
          enabledByDefault: true
        },
        '../modules/bad/index.ts': {
          id: 'bad',
          version: '1',
          moduleTier: 'optional',
          enabledByDefault: true
        }
      },
      onWarn(message) {
        warnings.push(message);
      }
    });

    expect(entries.map((item) => item.id)).toEqual(['home', 'PortalManagement']);
    expect(warnings.some((message) => message.includes('忽略无效模块元信息'))).toBe(true);
  });

  it('pickEnabledModuleEntries 应支持 * / 默认 / 去重与未知告警', () => {
    const warnings: string[] = [];
    const allModules = [
      {
        id: 'home',
        version: '1',
        moduleTier: 'core',
        enabledByDefault: true,
        modulePath: '../modules/home/index.ts'
      },
      {
        id: 'PortalManagement',
        version: '1',
        moduleTier: 'optional',
        enabledByDefault: false,
        modulePath: '../modules/PortalManagement/index.ts'
      }
    ] as const;

    expect(
      pickEnabledModuleEntries({
        allModules: [...allModules],
        enabledModules: '*',
        onWarn: (message) => warnings.push(message)
      }).map((item) => item.id)
    ).toEqual(['home', 'PortalManagement']);

    expect(
      pickEnabledModuleEntries({
        allModules: [...allModules],
        enabledModules: [],
        onWarn: (message) => warnings.push(message)
      }).map((item) => item.id)
    ).toEqual(['home']);

    warnings.length = 0;
    expect(
      pickEnabledModuleEntries({
        allModules: [...allModules],
        enabledModules: ['home', 'home', 'unknown', 'PortalManagement'],
        onWarn: (message) => warnings.push(message)
      }).map((item) => item.id)
    ).toEqual(['home', 'PortalManagement']);
    expect(warnings).toEqual(
      expect.arrayContaining([
        expect.stringContaining('enabledModules 包含重复模块 id：home'),
        expect.stringContaining('enabledModules 包含未知模块 id：unknown')
      ])
    );
  });

  it('validateModuleDeclaration 应校验声明与元信息一致性', () => {
    const warnings: string[] = [];
    const entry = {
      id: 'home',
      version: '1',
      moduleTier: 'core',
      enabledByDefault: true,
      modulePath: '../modules/home/index.ts'
    } as const;

    const valid = validateModuleDeclaration({
      entry,
      candidate: {
        id: 'home',
        version: '1',
        moduleTier: 'core',
        enabledByDefault: true,
        apiNamespace: 'home',
        routes: { layout: [] }
      },
      onWarn: (message) => warnings.push(message)
    });
    expect(valid).not.toBeNull();

    const mismatch = validateModuleDeclaration({
      entry,
      candidate: {
        id: 'home-v2',
        version: '1',
        moduleTier: 'core',
        enabledByDefault: true,
        apiNamespace: 'home',
        routes: { layout: [] }
      },
      onWarn: (message) => warnings.push(message)
    });
    expect(mismatch).toBeNull();
    expect(warnings.some((message) => message.includes('模块元信息与声明不一致'))).toBe(true);
  });

  it('resolveModuleDeclarationCandidate 应优先 default 再 fallback module', () => {
    expect(
      resolveModuleDeclarationCandidate({
        default: {
          id: 'home',
          version: '1',
          moduleTier: 'core',
          enabledByDefault: true,
          apiNamespace: 'home',
          routes: { layout: [] }
        }
      })?.id
    ).toBe('home');

    expect(
      resolveModuleDeclarationCandidate({
        module: {
          id: 'PortalManagement',
          version: '1',
          moduleTier: 'optional',
          enabledByDefault: false,
          apiNamespace: 'portal',
          routes: { layout: [] }
        }
      })?.id
    ).toBe('PortalManagement');
  });
});
