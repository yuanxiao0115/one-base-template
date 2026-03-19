import { computed, ref } from 'vue';
import { describe, expect, it, vi } from 'vite-plus/test';

import type { PortalRouteQueryLike } from './template-workbench-route';
import { usePortalPreviewPageByRoute } from './usePortalPreviewPageByRoute';

describe('usePortalPreviewPageByRoute', () => {
  it('应解析 query 中的 tabId/templateId/preview 参数', () => {
    const routeQuery = ref<PortalRouteQueryLike>({
      templateId: 'tpl-1',
      tabId: 'tab-1',
      previewMode: 'live',
      vw: '1280',
      vh: '720'
    });

    const binding = usePortalPreviewPageByRoute({
      routeQuery: computed(() => routeQuery.value),
      replaceRouteQuery: vi.fn()
    });

    expect(binding.tabId.value).toBe('tab-1');
    expect(binding.templateId.value).toBe('tpl-1');
    expect(binding.previewMode.value).toBe('live');
    expect(binding.previewViewport.value).toEqual({
      width: 1280,
      height: 720
    });
  });

  it('query 缺少 tabId 时应回退到 route params', () => {
    const routeQuery = ref<PortalRouteQueryLike>({
      id: 'tpl-2'
    });
    const routeParams = ref({
      tabId: 'tab-from-param'
    });

    const binding = usePortalPreviewPageByRoute({
      routeQuery: computed(() => routeQuery.value),
      routeParams: computed(() => routeParams.value),
      replaceRouteQuery: vi.fn()
    });

    expect(binding.templateId.value).toBe('tpl-2');
    expect(binding.tabId.value).toBe('tab-from-param');
    expect(binding.previewViewport.value).toEqual({
      width: 0,
      height: 0
    });
  });

  it('tab 导航应写回 query 并保留已有参数', () => {
    const routeQuery = ref<PortalRouteQueryLike>({
      templateId: 'tpl-3',
      tabId: 'tab-old',
      keep: 'yes'
    });
    const replaceRouteQuery = vi.fn();

    const binding = usePortalPreviewPageByRoute({
      routeQuery: computed(() => routeQuery.value),
      replaceRouteQuery
    });

    binding.onNavigate({
      type: 'tab',
      tabId: 'tab-new',
      item: { key: 'tab-new', label: 'Tab New' }
    });

    expect(replaceRouteQuery).toHaveBeenCalledWith({
      templateId: 'tpl-3',
      tabId: 'tab-new',
      keep: 'yes'
    });
  });

  it('tab 导航写回应沿用现有 template key（id）', () => {
    const routeQuery = ref<PortalRouteQueryLike>({
      id: 'tpl-3',
      tabId: 'tab-old',
      keep: 'yes'
    });
    const replaceRouteQuery = vi.fn();

    const binding = usePortalPreviewPageByRoute({
      routeQuery: computed(() => routeQuery.value),
      replaceRouteQuery
    });

    binding.onNavigate({
      type: 'tab',
      tabId: 'tab-new',
      item: { key: 'tab-new', label: 'Tab New' }
    });

    expect(replaceRouteQuery).toHaveBeenCalledWith({
      id: 'tpl-3',
      tabId: 'tab-new',
      keep: 'yes'
    });
  });

  it('tab 导航到当前 tab 时不应重复写回 query', () => {
    const routeQuery = ref<PortalRouteQueryLike>({
      templateId: 'tpl-3',
      tabId: 'tab-old'
    });
    const replaceRouteQuery = vi.fn();

    const binding = usePortalPreviewPageByRoute({
      routeQuery: computed(() => routeQuery.value),
      replaceRouteQuery
    });

    binding.onNavigate({
      type: 'tab',
      tabId: 'tab-old',
      item: { key: 'tab-old', label: 'Tab Old' }
    });

    expect(replaceRouteQuery).not.toHaveBeenCalled();
  });

  it('外链导航应调用 openWindow', () => {
    const openWindow = vi.fn();

    const binding = usePortalPreviewPageByRoute({
      routeQuery: computed(() => ({}) as PortalRouteQueryLike),
      replaceRouteQuery: vi.fn(),
      openWindow
    });

    binding.onNavigate({
      type: 'url',
      url: 'https://example.com',
      item: { key: 'link-1', label: 'Link 1' }
    });

    expect(openWindow).toHaveBeenCalledWith('https://example.com', '_blank', 'noopener,noreferrer');
  });

  it('replaceRouteQuery 失败时应触发错误回调', async () => {
    const error = new Error('replace failed');
    const onReplaceRouteQueryError = vi.fn();
    const replaceRouteQuery = vi.fn().mockRejectedValue(error);

    const binding = usePortalPreviewPageByRoute({
      routeQuery: computed(() => ({ templateId: 'tpl-4' }) as PortalRouteQueryLike),
      replaceRouteQuery,
      onReplaceRouteQueryError
    });

    binding.onNavigate({
      type: 'tab',
      tabId: 'tab-xx',
      item: { key: 'tab-xx', label: 'Tab XX' }
    });

    await Promise.resolve();
    await Promise.resolve();
    expect(onReplaceRouteQueryError).toHaveBeenCalledWith(error);
  });
});
