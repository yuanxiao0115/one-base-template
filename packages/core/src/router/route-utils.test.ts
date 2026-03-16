import { describe, expect, it } from 'vite-plus/test';

import { buildRouteFullPath, normalizeRoutePath, toRouteNameKey } from './route-utils';

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
});
