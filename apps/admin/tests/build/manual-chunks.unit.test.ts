import { describe, expect, it } from 'vite-plus/test';
import {
  createOneAppManualChunks,
  createOneAppPreloadDependenciesResolver,
  pruneBuiltChunkPreloadMaps
} from '../../../../scripts/vite/manual-chunks';

describe('manual-chunks wangeditor 策略', () => {
  const manualChunks = createOneAppManualChunks({
    appName: 'admin',
    featureChunks: [
      {
        name: 'admin-cms-management',
        patterns: ['/apps/admin/src/modules/CmsManagement/']
      }
    ]
  });

  it('应将 wangeditor 依赖收敛到单独 vendor chunk', () => {
    expect(manualChunks('/repo/node_modules/@wangeditor/editor/dist/index.esm.js')).toBe(
      'wangeditor'
    );
    expect(manualChunks('/repo/node_modules/prismjs/components/prism-core.js')).toBe('wangeditor');
  });

  it('应保持 CMS 业务页面继续进入 feature chunk', () => {
    expect(manualChunks('/repo/apps/admin/src/modules/CmsManagement/content/list.vue')).toBe(
      'admin-cms-management'
    );
  });
});

describe('admin preload resolver', () => {
  const preloadResolver = createOneAppPreloadDependenciesResolver({
    appName: 'admin'
  });

  it('LoginPage 不应预加载 app-shell/wangeditor 等重依赖', () => {
    const deps = [
      'assets/admin-app-shell-xxx.js',
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

  it('admin-app-shell 不应预加载 portal/vxe/element-plus 等重依赖', () => {
    const deps = [
      'assets/admin-portal-xxx.js',
      'assets/portal-engine-yyy.js',
      'assets/vxe-zzz.js',
      'assets/element-plus-www.js',
      'assets/vue-vendor-keep.js'
    ];
    expect(
      preloadResolver('assets/admin-app-shell-abc.js', deps, {
        hostId: 'assets/admin-app-shell-abc.js',
        hostType: 'js'
      })
    ).toEqual(['assets/vue-vendor-keep.js']);
  });
});

describe('admin preload map prune', () => {
  it('应重写 admin-app-shell 的 built preload map，过滤重依赖前缀', () => {
    const source =
      'const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/admin-portal-1.js","assets/element-plus-1.js","assets/vue-vendor-1.js"])) )=>i.map(i=>d[i]);';
    const nextSource = pruneBuiltChunkPreloadMaps(source, 'assets/admin-app-shell-abc.js', {
      appName: 'admin'
    });

    expect(nextSource).not.toBe(source);
    expect(nextSource).toContain('dep=>dep&&!["assets/admin-entry-"');
    expect(nextSource).toContain('prefix=>dep.startsWith(prefix)');
  });
});
