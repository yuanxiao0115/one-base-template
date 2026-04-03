import { describe, expect, it } from 'vite-plus/test';

import {
  buildRouteFullPath,
  collectGlobRouteModules,
  normalizeRoutePath,
  toRouteNameKey
} from './route-utils';

describe('core/router/route-utils', () => {
  it('toRouteNameKey 应兼容 string 与 symbol', () => {
    expect(toRouteNameKey('HomeIndex')).toBe('HomeIndex');
    expect(toRouteNameKey(Symbol.for('PortalDesigner'))).toBe('Symbol(PortalDesigner)');
    expect(toRouteNameKey(undefined)).toBeNull();
  });

  it('normalizeRoutePath 应补齐前导斜杠并去重', () => {
    expect(normalizeRoutePath('portal/templates')).toBe('/portal/templates');
    expect(normalizeRoutePath('/portal//templates')).toBe('/portal/templates');
    expect(normalizeRoutePath('')).toBe('/');
  });

  it('buildRouteFullPath 应按 parentPath 组装完整路径', () => {
    expect(buildRouteFullPath('/', 'portal/templates')).toBe('/portal/templates');
    expect(buildRouteFullPath('/system', 'user/list')).toBe('/system/user/list');
    expect(buildRouteFullPath('/system', '/portal/designer')).toBe('/portal/designer');
    expect(buildRouteFullPath('/system', '')).toBe('/system');
  });

  it('collectGlobRouteModules 应稳定排序并扁平化模块导出', () => {
    const routes = collectGlobRouteModules<string>({
      './b/routes.ts': ['b-1', 'b-2'],
      './a/routes.ts': 'a-1',
      './c/routes.ts': undefined,
      './d/routes.ts': null
    });

    expect(routes).toEqual(['a-1', 'b-1', 'b-2']);
  });
});
