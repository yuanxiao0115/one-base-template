import { describe, expect, it } from 'vite-plus/test';
import {
  createOneAppManualChunks,
  createOneAppPreloadDependenciesResolver,
  pruneBuiltChunkPreloadMaps
} from '../../../../scripts/vite/manual-chunks';

describe('manual-chunks admin-lite feature chunk 策略', () => {
  const manualChunks = createOneAppManualChunks({
    appName: 'zfw-system-sfss',
    featureChunks: [
      {
        name: 'zfw-system-sfss-log-management',
        patterns: ['/apps/zfw-system-sfss/src/modules/LogManagement/']
      }
    ]
  });

  it('应保持日志管理页面继续进入 feature chunk', () => {
    expect(
      manualChunks('/repo/apps/zfw-system-sfss/src/modules/LogManagement/login-log/list.vue')
    ).toBe('zfw-system-sfss-log-management');
  });
});

describe('admin preload resolver', () => {
  const preloadResolver = createOneAppPreloadDependenciesResolver({
    appName: 'zfw-system-sfss'
  });

  it('LoginPage 不应预加载 app-shell/wangeditor 等重依赖', () => {
    const deps = [
      'assets/zfw-system-sfss-app-shell-xxx.js',
      'assets/wangeditor-yyy.js',
      'assets/vue-vendor-zzz.js'
    ];
    expect(
      preloadResolver('assets/LoginPage-abc.js', deps, {
        hostId: 'assets/LoginPage-abc.js',
        hostType: 'js'
      })
    ).toEqual(['assets/vue-vendor-zzz.js']);
  });

  it('zfw-system-sfss-app-shell 不应预加载 portal/vxe/element-plus 等重依赖', () => {
    const deps = [
      'assets/admin-lite-portal-xxx.js',
      'assets/portal-engine-yyy.js',
      'assets/vxe-zzz.js',
      'assets/element-plus-www.js',
      'assets/vue-vendor-keep.js'
    ];
    expect(
      preloadResolver('assets/zfw-system-sfss-app-shell-abc.js', deps, {
        hostId: 'assets/zfw-system-sfss-app-shell-abc.js',
        hostType: 'js'
      })
    ).toEqual(['assets/vue-vendor-keep.js']);
  });
});

describe('admin preload map prune', () => {
  it('应重写 zfw-system-sfss-app-shell 的 built preload map，过滤重依赖前缀', () => {
    const source =
      'const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/portal-engine-1.js","assets/element-plus-1.js","assets/vue-vendor-1.js"])) )=>i.map(i=>d[i]);';
    const nextSource = pruneBuiltChunkPreloadMaps(
      source,
      'assets/zfw-system-sfss-app-shell-abc.js',
      {
        appName: 'zfw-system-sfss'
      }
    );

    expect(nextSource).not.toBe(source);
    expect(nextSource).toContain('dep=>dep&&!["assets/admin-lite-entry-"');
    expect(nextSource).toContain('prefix=>dep.startsWith(prefix)');
  });
});
