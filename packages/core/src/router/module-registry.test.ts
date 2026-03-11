import { describe, expect, it } from 'vitest';
import type { AppModuleManifestMeta } from './module-assembly';
import {
  collectModuleLoadEntries,
  pickEnabledModuleEntries,
  resolveModuleDeclarationCandidate,
  validateModuleDeclaration,
} from './module-registry';

describe('core/router/module-registry', () => {
  it('collectModuleLoadEntries 应过滤无效清单并按 id 排序', () => {
    const warnings: string[] = [];
    const validMeta = {
      id: 'portalManagement',
      version: '1',
      moduleTier: 'optional',
      enabledByDefault: false,
    } as const satisfies AppModuleManifestMeta;

    const entries = collectModuleLoadEntries({
      manifestDefinitions: {
        '../modules/portalManagement/manifest.ts': {
          default: validMeta,
        },
        '../modules/home/manifest.ts': {
          default: {
            id: 'home',
            version: '1',
            moduleTier: 'core',
            enabledByDefault: true,
          },
        },
        '../modules/bad/manifest.ts': {
          default: {
            id: 'bad',
            version: '1',
            moduleTier: 'optional',
            enabledByDefault: true,
          },
        },
      },
      hasModuleDeclaration(modulePath) {
        return modulePath.includes('/home/') || modulePath.includes('/portalManagement/');
      },
      onWarn(message) {
        warnings.push(message);
      },
    });

    expect(entries.map((item) => item.id)).toEqual(['home', 'portalManagement']);
    expect(warnings.some((message) => message.includes('忽略无效模块清单'))).toBe(true);
  });

  it('pickEnabledModuleEntries 应支持 * / 默认 / 去重与未知告警', () => {
    const warnings: string[] = [];
    const allModules = [
      {
        id: 'home',
        version: '1',
        moduleTier: 'core',
        enabledByDefault: true,
        manifestPath: '../modules/home/manifest.ts',
        modulePath: '../modules/home/module.ts',
      },
      {
        id: 'portalManagement',
        version: '1',
        moduleTier: 'optional',
        enabledByDefault: false,
        manifestPath: '../modules/portalManagement/manifest.ts',
        modulePath: '../modules/portalManagement/module.ts',
      },
    ] as const;

    expect(
      pickEnabledModuleEntries({
        allModules: [...allModules],
        enabledModules: '*',
        onWarn: (message) => warnings.push(message),
      }).map((item) => item.id),
    ).toEqual(['home', 'portalManagement']);

    expect(
      pickEnabledModuleEntries({
        allModules: [...allModules],
        enabledModules: [],
        onWarn: (message) => warnings.push(message),
      }).map((item) => item.id),
    ).toEqual(['home']);

    warnings.length = 0;
    expect(
      pickEnabledModuleEntries({
        allModules: [...allModules],
        enabledModules: ['home', 'home', 'unknown', 'portalManagement'],
        onWarn: (message) => warnings.push(message),
      }).map((item) => item.id),
    ).toEqual(['home', 'portalManagement']);
    expect(warnings).toEqual(
      expect.arrayContaining([
        expect.stringContaining('enabledModules 包含重复模块 id：home'),
        expect.stringContaining('enabledModules 包含未知模块 id：unknown'),
      ]),
    );
  });

  it('validateModuleDeclaration 应校验声明与清单一致性', () => {
    const warnings: string[] = [];
    const entry = {
      id: 'home',
      version: '1',
      moduleTier: 'core',
      enabledByDefault: true,
      manifestPath: '../modules/home/manifest.ts',
      modulePath: '../modules/home/module.ts',
    } as const;

    const valid = validateModuleDeclaration({
      entry,
      candidate: {
        id: 'home',
        version: '1',
        moduleTier: 'core',
        enabledByDefault: true,
        apiNamespace: 'home',
        routes: { layout: [] },
      },
      onWarn: (message) => warnings.push(message),
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
        routes: { layout: [] },
      },
      onWarn: (message) => warnings.push(message),
    });
    expect(mismatch).toBeNull();
    expect(warnings.some((message) => message.includes('模块清单与声明不一致'))).toBe(true);
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
          routes: { layout: [] },
        },
      })?.id,
    ).toBe('home');

    expect(
      resolveModuleDeclarationCandidate({
        module: {
          id: 'portalManagement',
          version: '1',
          moduleTier: 'optional',
          enabledByDefault: false,
          apiNamespace: 'portal',
          routes: { layout: [] },
        },
      })?.id,
    ).toBe('portalManagement');
  });
});
