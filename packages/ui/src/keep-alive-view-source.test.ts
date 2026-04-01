import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vite-plus/test';

describe('KeepAliveView source', () => {
  const source = readFileSync(
    new URL('./components/view/KeepAliveView.vue', import.meta.url),
    'utf8'
  );

  it('应支持通过路由 meta.keepAlive 控制缓存分支', () => {
    expect(source).toContain(
      'function isKeepAliveRoute(route: RouteLocationNormalizedLoaded): boolean {'
    );
    expect(source).toContain('return route.meta?.keepAlive === true;');
    expect(source).toContain('v-if="Component && isKeepAliveRoute(route)"');
    expect(source).toContain('v-if="Component && !isKeepAliveRoute(route)"');
  });

  it('应基于 route.name 生成稳定组件名，避免业务组件名不一致导致 include 失效', () => {
    expect(source).toContain('const routeKeepAliveWrapperMap = new Map<string, Component>();');
    expect(source).toContain(
      'function getRouteName(route: RouteLocationNormalizedLoaded): string | null {'
    );
    expect(source).toContain('const routeName = getRouteName(route);');
    expect(source).toContain('name: routeName,');
    expect(source).toContain('routeKeepAliveWrapperMap.set(routeName, wrapper);');
    expect(source).toContain('resolveKeepAliveComponent(route, Component)');
  });
});
