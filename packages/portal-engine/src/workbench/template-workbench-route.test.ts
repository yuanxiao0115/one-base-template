import { describe, expect, it } from 'vite-plus/test';

import {
  buildNextRouteQueryWithTabId,
  buildPortalPageEditorRouteLocation,
  buildPortalPreviewRouteLocation,
  resolvePortalTabIdFromQuery,
  resolvePortalTemplateIdFromQuery
} from './template-workbench-route';

describe('template workbench route helpers', () => {
  it('应从 query 中解析 templateId 与 tabId', () => {
    expect(resolvePortalTemplateIdFromQuery({ id: 'tpl-1', templateId: 'tpl-2' })).toBe('tpl-1');
    expect(resolvePortalTemplateIdFromQuery({ templateId: 'tpl-2' })).toBe('tpl-2');
    expect(resolvePortalTemplateIdFromQuery({ templateId: ['tpl-3'] })).toBe('tpl-3');
    expect(resolvePortalTabIdFromQuery({ tabId: 'tab-1' })).toBe('tab-1');
    expect(resolvePortalTabIdFromQuery({ tabId: ['tab-2'] })).toBe('tab-2');
  });

  it('应在 tabId 变化时生成新 query', () => {
    expect(buildNextRouteQueryWithTabId({ tabId: 'tab-1', keep: 'yes' }, 'tab-1')).toBeNull();
    expect(buildNextRouteQueryWithTabId({ tabId: 'tab-1', keep: 'yes' }, 'tab-2')).toEqual({
      tabId: 'tab-2',
      keep: 'yes'
    });
    expect(buildNextRouteQueryWithTabId({ tabId: 'tab-1', keep: 'yes' }, '')).toEqual({
      tabId: undefined,
      keep: 'yes'
    });
  });

  it('应构建编辑页与预览页路由 location', () => {
    expect(buildPortalPageEditorRouteLocation('tpl-1', 'tab-1')).toEqual({
      path: '/portal/page/edit',
      query: {
        id: 'tpl-1',
        tabId: 'tab-1'
      }
    });
    expect(buildPortalPreviewRouteLocation('tpl-1', 'tab-1', 'live')).toEqual({
      name: 'PortalPreview',
      query: {
        templateId: 'tpl-1',
        tabId: 'tab-1',
        previewMode: 'live'
      }
    });
  });
});
