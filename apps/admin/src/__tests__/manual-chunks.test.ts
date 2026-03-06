import { describe, expect, it } from 'vitest';

import {
  createOneAppManualChunks,
  createOneAppPreloadDependenciesResolver,
  pruneBuiltChunkPreloadMaps,
  stripIndexHtmlUnusedStylesheets,
} from '../../../../scripts/vite/manual-chunks';

describe('admin manual chunks', () => {
  const manualChunks = createOneAppManualChunks({ appName: 'admin' });
  const resolvePreloadDependencies = createOneAppPreloadDependenciesResolver({ appName: 'admin' });

  it('登录轻量启动相关文件应归入 runtime/auth chunk，而不是 admin-app-shell', () => {
    expect(manualChunks('/Users/demo/code/one-base-template/apps/admin/src/bootstrap/entry.ts')).toBe('admin-runtime');
    expect(manualChunks('/Users/demo/code/one-base-template/apps/admin/src/bootstrap/switcher.ts')).toBe('admin-runtime');
    expect(manualChunks('/Users/demo/code/one-base-template/apps/admin/src/bootstrap/core.ts')).toBe('admin-runtime');
    expect(manualChunks('/Users/demo/code/one-base-template/apps/admin/src/bootstrap/public-entry.ts')).toBe('admin-auth');
    expect(manualChunks('/Users/demo/code/one-base-template/apps/admin/src/bootstrap/public.ts')).toBe('admin-auth');
    expect(manualChunks('/Users/demo/code/one-base-template/apps/admin/src/pages/login/LoginPage.vue')).toBe('admin-auth');
  });

  it('完整业务壳装配文件仍应归入 admin-app-shell', () => {
    expect(manualChunks('/Users/demo/code/one-base-template/apps/admin/src/bootstrap/index.ts')).toBe('admin-app-shell');
    expect(manualChunks('/Users/demo/code/one-base-template/apps/admin/src/router/registry.ts')).toBe('admin-app-shell');
  });

  it('入口与 runtime 预加载不应提前拉取登录页与业务壳 chunk', () => {
    const deps = [
      'assets/admin-runtime-demo.js',
      'assets/admin-auth-demo.js',
      'assets/LoginPage-demo.js',
      'assets/bootstrap-demo.js',
      'assets/admin-app-shell-demo.js',
      'assets/admin-user-management-demo.js',
      'assets/vxe-demo.js',
      'assets/one-ui-auth-demo.js',
      'assets/element-plus-demo.js',
      'assets/vue-vendor-demo.js',
    ];

    expect(
      resolvePreloadDependencies('assets/index-demo.js', deps, {
        hostId: 'index.html',
        hostType: 'html',
      })
    ).toEqual(['assets/admin-runtime-demo.js', 'assets/element-plus-demo.js', 'assets/vue-vendor-demo.js']);

    expect(
      resolvePreloadDependencies('assets/admin-runtime-demo.js', deps, {
        hostId: '/Users/demo/code/one-base-template/apps/admin/src/main.ts',
        hostType: 'js',
      })
    ).toEqual(['assets/admin-runtime-demo.js', 'assets/element-plus-demo.js', 'assets/vue-vendor-demo.js']);
  });

  it('public bootstrap 与 LoginPage 预加载应只保留鉴权所需依赖', () => {
    expect(
      resolvePreloadDependencies(
        'assets/admin-auth-demo.js',
        [
          'assets/admin-runtime-demo.js',
          'assets/LoginPage-demo.js',
          'assets/one-ui-auth-demo.js',
          'assets/bootstrap-demo.js',
          'assets/admin-app-shell-demo.js',
          'assets/one-ui-shell-demo.js',
          'assets/vxe-demo.js',
        ],
        {
          hostId: '/Users/demo/code/one-base-template/apps/admin/src/bootstrap/public.ts',
          hostType: 'js',
        }
      )
    ).toEqual(['assets/admin-runtime-demo.js', 'assets/LoginPage-demo.js', 'assets/one-ui-auth-demo.js']);

    expect(
      resolvePreloadDependencies(
        'assets/LoginPage-demo.js',
        [
          'assets/one-ui-auth-demo.js',
          'assets/one-ui-shell-demo.js',
          'assets/admin-app-shell-demo.js',
          'assets/vxe-demo.js',
        ],
        {
          hostId: '/Users/demo/code/one-base-template/apps/admin/src/pages/login/LoginPage.vue',
          hostType: 'js',
        }
      )
    ).toEqual(['assets/one-ui-auth-demo.js']);
  });

  it('index.html 应剔除与登录首屏无关的业务壳样式标签', () => {
    const html = [
      '<link rel="stylesheet" crossorigin href="/assets/one-tag-demo.css">',
      '<link rel="stylesheet" crossorigin href="/assets/admin-user-management-demo.css">',
      '<link rel="stylesheet" crossorigin href="/assets/vxe-demo.css">',
      '<link rel="stylesheet" crossorigin href="/assets/one-ui-auth-demo.css">',
      '<link rel="stylesheet" crossorigin href="/assets/bootstrap-demo.css">',
    ].join('\n');

    expect(stripIndexHtmlUnusedStylesheets(html, { appName: 'admin' }).trimEnd()).toBe(
      [
        '<link rel="stylesheet" crossorigin href="/assets/one-tag-demo.css">',
        '<link rel="stylesheet" crossorigin href="/assets/one-ui-auth-demo.css">',
      ].join('\n')
    );
  });

  it('构建后应收紧 index/admin-auth/LoginPage chunk 的 preload 资产集合', () => {
    const code = 'const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=[])))=>i.map(i=>d[i]);';

    expect(pruneBuiltChunkPreloadMaps(code, 'assets/index-demo.js', { appName: 'admin' })).toContain(
      'assets/admin-entry-'
    );
    expect(pruneBuiltChunkPreloadMaps(code, 'assets/admin-auth-demo.js', { appName: 'admin' })).toContain(
      'assets/one-ui-shell-'
    );
    expect(pruneBuiltChunkPreloadMaps(code, 'assets/other-demo.js', { appName: 'admin' })).toBe(code);
  });
});
