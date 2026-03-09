import { describe, expect, it } from 'vitest';

import {
  createOneAppCodeSplitting,
  createOneAppManualChunks,
  createOneAppPreloadDependenciesResolver,
  pruneBuiltChunkPreloadMaps,
  stripIndexHtmlUnusedStylesheets,
} from '../../../../scripts/vite/manual-chunks';

describe('admin manual chunks', () => {
  const manualChunks = createOneAppManualChunks({ appName: 'admin' });
  const resolvePreloadDependencies = createOneAppPreloadDependenciesResolver({ appName: 'admin' });

  it('登录轻量启动相关文件应归入 runtime/auth chunk，而不是 admin-app-shell', () => {
    expect(manualChunks('/Users/demo/code/one-base-template/apps/admin/src/bootstrap/entry.ts')).toBe('bootstrap');
    expect(manualChunks('/Users/demo/code/one-base-template/apps/admin/src/bootstrap/switcher.ts')).toBe('bootstrap');
    expect(manualChunks('/Users/demo/code/one-base-template/apps/admin/src/bootstrap/core.ts')).toBe('admin-runtime');
    expect(manualChunks('/Users/demo/code/one-base-template/apps/admin/src/bootstrap/public-entry.ts')).toBe('admin-auth');
    expect(manualChunks('/Users/demo/code/one-base-template/apps/admin/src/bootstrap/public.ts')).toBe('admin-auth');
    expect(manualChunks('/Users/demo/code/one-base-template/apps/admin/src/pages/login/LoginPage.vue')).toBe('admin-auth');
  });

  it('完整业务壳装配文件仍应归入 admin-app-shell', () => {
    expect(manualChunks('/Users/demo/code/one-base-template/apps/admin/src/bootstrap/index.ts')).toBe('admin-app-shell');
    expect(manualChunks('/Users/demo/code/one-base-template/apps/admin/src/router/registry.ts')).toBe('admin-app-shell');
  });

  it('packages/ui 的壳层共享资源应固定落入 one-ui-shell，避免被 admin-entry 反向持有', () => {
    expect(manualChunks('/Users/demo/code/one-base-template/packages/ui/src/components/icon/FontIcon.vue')).toBe(
      'one-ui-shell'
    );
    expect(manualChunks('/Users/demo/code/one-base-template/packages/ui/src/iconify/menu-iconify.ts')).toBe(
      'one-ui-shell'
    );
    expect(manualChunks('/Users/demo/code/one-base-template/packages/ui/src/assets/app-header-bg.webp')).toBe(
      'one-ui-shell'
    );
    expect(manualChunks('/Users/demo/code/one-base-template/packages/ui/src/shell.ts')).toBe('one-ui-shell');
  });

  it('登录轻量 auth 入口应固定落入 one-ui-auth，避免再借道 one-ui-shell', () => {
    expect(manualChunks('/Users/demo/code/one-base-template/packages/ui/src/lite/auth.ts')).toBe('one-ui-auth');
    expect(manualChunks('/Users/demo/code/one-base-template/packages/ui/src/lite-auth.ts')).toBe('one-ui-auth');
  });

  it('Element Plus / VXE / 可视化依赖的底层 node_modules 应并入对应 vendor chunk，避免反向落进业务入口 chunk', () => {
    expect(manualChunks('/Users/demo/code/one-base-template/node_modules/dayjs/plugin/weekOfYear.js')).toBe(
      'element-plus'
    );
    expect(manualChunks('/Users/demo/code/one-base-template/node_modules/lodash-es/debounce.js')).toBe(
      'element-plus'
    );
    expect(manualChunks('/Users/demo/code/one-base-template/node_modules/lodash-unified/index.js')).toBe(
      'element-plus'
    );
    expect(manualChunks('/Users/demo/code/one-base-template/node_modules/@ctrl/tinycolor/dist/module.js')).toBe(
      'element-plus'
    );
    expect(manualChunks('/Users/demo/code/one-base-template/node_modules/async-validator/dist-web/index.js')).toBe(
      'element-plus'
    );
    expect(manualChunks('/Users/demo/code/one-base-template/node_modules/@vxe-ui/core/index.js')).toBe('vxe');
    expect(manualChunks('/Users/demo/code/one-base-template/node_modules/xe-utils/index.js')).toBe('vxe');
    expect(manualChunks('/Users/demo/code/one-base-template/node_modules/interactjs/index.js')).toBe(
      'sortable-grid'
    );
  });

  it('命名 chunk 应递归携带其依赖，避免 vendor 的共享依赖回落到 admin-entry', () => {
    expect(createOneAppCodeSplitting({ appName: 'admin' }).includeDependenciesRecursively).toBe(true);
  });

  it('vendor / auth / app-shell 应按优先级拆成独立分组，避免递归分块时互相吞并', () => {
    const codeSplitting = createOneAppCodeSplitting({ appName: 'admin' });
    const elementPlusId = '/Users/demo/code/one-base-template/node_modules/dayjs/plugin/weekOfYear.js';
    const adminAuthId = '/Users/demo/code/one-base-template/apps/admin/src/pages/login/LoginPage.vue';
    const adminShellId = '/Users/demo/code/one-base-template/apps/admin/src/router/registry.ts';

    const resolvePriority = (id: string, chunkName: string) =>
      codeSplitting.groups.find((group) => group.test(id) && group.name(id) === chunkName)?.priority;

    expect(resolvePriority(elementPlusId, 'element-plus')).toBeGreaterThan(
      resolvePriority(adminShellId, 'admin-app-shell') ?? 0
    );
    expect(resolvePriority(adminAuthId, 'admin-auth')).toBeGreaterThan(
      resolvePriority(adminShellId, 'admin-app-shell') ?? 0
    );
  });

  it('共享 runtime/core/table 分组应高于 feature 与 shell，避免公共依赖被业务页或壳层 chunk 反向持有', () => {
    const codeSplitting = createOneAppCodeSplitting({
      appName: 'admin',
      featureChunks: [
        {
          name: 'admin-home',
          patterns: ['/apps/admin/src/modules/home/'],
        },
      ],
    });
    const resolvePriority = (id: string, chunkName: string) =>
      codeSplitting.groups.find((group) => group.test(id) && group.name(id) === chunkName)?.priority ?? 0;

    expect(resolvePriority('/Users/demo/code/one-base-template/packages/core/src/index.ts', 'one-core')).toBeGreaterThan(
      resolvePriority('/Users/demo/code/one-base-template/packages/ui/src/layouts/AdminLayout.vue', 'one-ui-shell')
    );
    expect(
      resolvePriority('/Users/demo/code/one-base-template/packages/ui/src/components/table/TableBox.vue', 'one-ui-table')
    ).toBeGreaterThan(
      resolvePriority('/Users/demo/code/one-base-template/packages/ui/src/layouts/AdminLayout.vue', 'one-ui-shell')
    );
    expect(
      resolvePriority('/Users/demo/code/one-base-template/apps/admin/src/bootstrap/core.ts', 'admin-runtime')
    ).toBeGreaterThan(
      resolvePriority('/Users/demo/code/one-base-template/apps/admin/src/modules/home/routes.ts', 'admin-home')
    );
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

    expect(
      resolvePreloadDependencies(
        'assets/bootstrap-demo.js',
        [
          'assets/admin-runtime-demo.js',
          'assets/admin-auth-demo.js',
          'assets/admin-entry-demo.js',
          'assets/admin-app-shell-demo.js',
          'assets/one-ui-shell-demo.js',
          'assets/vxe-demo.js',
        ],
        {
          hostId: '/Users/demo/code/one-base-template/apps/admin/src/bootstrap/switcher.ts',
          hostType: 'js',
        }
      )
    ).toEqual(['assets/admin-runtime-demo.js', 'assets/admin-auth-demo.js']);

    expect(
      resolvePreloadDependencies(
        'assets/lite-demo.js',
        [
          'assets/one-ui-auth-demo.js',
          'assets/admin-entry-demo.js',
          'assets/admin-app-shell-demo.js',
          'assets/one-ui-shell-demo.js',
          'assets/vxe-demo.js',
          'assets/element-plus-demo.js',
        ],
        {
          hostId: '/Users/demo/code/one-base-template/packages/ui/src/lite/auth.ts',
          hostType: 'js',
        }
      )
    ).toEqual(['assets/one-ui-auth-demo.js', 'assets/element-plus-demo.js']);
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
    expect(pruneBuiltChunkPreloadMaps(code, 'assets/bootstrap-demo.js', { appName: 'admin' })).toContain(
      'assets/admin-entry-'
    );
    expect(pruneBuiltChunkPreloadMaps(code, 'assets/lite-demo.js', { appName: 'admin' })).toContain(
      'assets/admin-entry-'
    );
    expect(pruneBuiltChunkPreloadMaps(code, 'assets/other-demo.js', { appName: 'admin' })).toBe(code);
  });
});
