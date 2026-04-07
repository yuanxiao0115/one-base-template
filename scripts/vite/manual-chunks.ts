interface AppFeatureChunk {
  name: string;
  patterns: string[];
}

interface OneAppManualChunkOptions {
  appName: string;
  featureChunks?: AppFeatureChunk[];
}

interface OneAppCodeSplittingOptions {
  groups: Array<{
    name: (moduleId: string) => string | null | undefined;
    test: (moduleId: string) => boolean;
    priority: number;
  }>;
  includeDependenciesRecursively: boolean;
  minSize: number;
  minShareCount: number;
}

interface PreloadDependencyContext {
  hostId: string;
  hostType: 'html' | 'js';
}

interface CodeSplittingGroupDefinition {
  chunkName: string;
  patterns: string[];
  priority: number;
}

function normalizeModuleId(id: string) {
  return id.replaceAll('\\', '/');
}

function includesAny(id: string, patterns: string[]) {
  return patterns.some((pattern) => id.includes(pattern));
}

function normalizeOutputFileName(fileName: string) {
  return normalizeModuleId(fileName).split('?')[0] ?? normalizeModuleId(fileName);
}

function matchesOutputPrefix(fileName: string, prefixes: string[]) {
  const normalized = normalizeOutputFileName(fileName);
  return prefixes.some((prefix) => normalized.startsWith(prefix));
}

function filterPreloadDependencies(deps: string[], blockedPrefixes: string[]) {
  return deps.filter((dep) => !matchesOutputPrefix(dep, blockedPrefixes));
}

const VENDOR_CHUNK_RULES: AppFeatureChunk[] = [
  {
    name: 'vue-vendor',
    patterns: ['/node_modules/vue/', '/node_modules/vue-router/', '/node_modules/pinia/']
  },
  {
    name: 'element-plus',
    patterns: [
      '/node_modules/element-plus/',
      '/node_modules/@element-plus/',
      '/node_modules/dayjs/',
      '/node_modules/lodash-es/',
      '/node_modules/lodash-unified/',
      '/node_modules/@ctrl/tinycolor/',
      '/node_modules/async-validator/'
    ]
  },
  {
    name: 'vxe',
    patterns: [
      '/node_modules/vxe-table/',
      '/node_modules/vxe-pc-ui/',
      '/node_modules/@vxe-ui/',
      '/node_modules/xe-utils/'
    ]
  },
  {
    name: 'iconify-runtime',
    patterns: ['/node_modules/@iconify/vue/', '/node_modules/@iconify/types/']
  },
  {
    name: 'iconify-ep',
    patterns: ['/node_modules/@iconify-json/ep/']
  },
  {
    name: 'iconify-ri',
    patterns: ['/node_modules/@iconify-json/ri/']
  },
  {
    // 富文本编辑器链路体积较大，独立成单 vendor chunk：
    // 1) 压低 page-* 业务 chunk，降低预算贴线风险；
    // 2) 保持“单大块”而非多小块，避免 HTTP1.0 下请求排队放大。
    name: 'wangeditor',
    patterns: ['/node_modules/@wangeditor/', '/node_modules/slate/', '/node_modules/prismjs/']
  },
  {
    // DocumentForm 设计器基于 Univer，拆成更细粒度 vendor，避免单大块告警。
    name: 'univer-presets-vendor',
    patterns: ['/node_modules/@univerjs/presets/']
  },
  {
    name: 'univer-sheets-vendor',
    patterns: ['/node_modules/@univerjs/preset-sheets-core/']
  },
  {
    name: 'univer-runtime-vendor',
    patterns: ['/node_modules/@univerjs/']
  },
  {
    // Office 预览引擎按文件类型拆分，降低单 chunk 峰值体积。
    name: 'vue-office-pdf-vendor',
    patterns: ['/node_modules/@vue-office/pdf/']
  },
  {
    name: 'vue-office-docx-vendor',
    patterns: ['/node_modules/@vue-office/docx/']
  },
  {
    name: 'vue-office-excel-vendor',
    patterns: ['/node_modules/@vue-office/excel/']
  },
  {
    name: 'vue-office-pptx-vendor',
    patterns: ['/node_modules/@vue-office/pptx/']
  },
  {
    // OFD 预览链路拆分 viewer 与 parser，避免单大块。
    name: 'ofd-viewer-vendor',
    patterns: ['/node_modules/ofdview-vue3/']
  },
  {
    name: 'ofd-parser-vendor',
    patterns: ['/node_modules/parser_x.js/']
  },
  {
    name: 'crypto',
    patterns: ['/node_modules/gm-crypto/', '/node_modules/crypto-js/', '/node_modules/sm-crypto/']
  },
  {
    name: 'sortable-grid',
    patterns: [
      '/node_modules/sortablejs/',
      '/node_modules/grid-layout-plus/',
      '/node_modules/interactjs/'
    ]
  }
];

const WORKSPACE_CHUNK_RULES: AppFeatureChunk[] = [
  {
    name: 'one-core',
    patterns: ['/packages/core/src/']
  },
  {
    name: 'one-ui-shell',
    patterns: [
      '/packages/ui/src/assets/',
      '/packages/ui/src/components/icon/',
      '/packages/ui/src/layouts/',
      '/packages/ui/src/components/menu/',
      '/packages/ui/src/components/top/',
      '/packages/ui/src/components/tabs/',
      '/packages/ui/src/components/theme/',
      '/packages/ui/src/components/view/',
      '/packages/ui/src/components/container/',
      '/packages/ui/src/components/tree/',
      '/packages/ui/src/iconify/',
      '/packages/ui/src/pages/error/',
      '/packages/ui/src/plugin.ts',
      '/packages/ui/src/shell.ts',
      '/packages/ui/src/config.ts',
      '/packages/ui/src/index.ts'
    ]
  },
  {
    name: 'one-ui-auth',
    patterns: [
      '/packages/ui/src/components/auth/',
      '/packages/ui/src/lite/auth.ts',
      '/packages/ui/src/lite-auth.ts'
    ]
  },
  {
    name: 'one-ui-table',
    patterns: ['/packages/ui/src/components/table/', '/packages/ui/src/components/upload/']
  },
  {
    name: 'one-tag',
    patterns: ['/packages/tag/src/']
  },
  {
    name: 'portal-engine',
    patterns: ['/packages/portal-engine/src/']
  },
  {
    name: 'one-adapters',
    patterns: ['/packages/adapters/src/']
  },
  {
    name: 'one-utils',
    patterns: ['/packages/utils/src/']
  }
];

const ADMIN_SHELL_APP_NAMES = new Set(['admin', 'admin-lite', 'zfw-system-sfss']);

function isAdminShellAppName(appName: string) {
  return ADMIN_SHELL_APP_NAMES.has(appName);
}

function resolveAdminShellAppAliases(appName: string) {
  if (appName === 'admin' || appName === 'admin-lite') {
    return [appName];
  }

  // admin-lite 派生 app 可能仍沿用 admin-lite 历史 chunk 前缀。
  return ['admin-lite', appName];
}

function createAdminShellPreloadBlockedPrefixes(appName: string) {
  const aliases = resolveAdminShellAppAliases(appName);

  return [
    // 兼容“admin-xxx”与“路由文件名直出 chunk”两种命名，避免路由页被误加入启动预加载队列。
    ...aliases.map((name) => `assets/${name}-entry-`),
    ...aliases.map((name) => `assets/${name}-app-shell-`),
    ...aliases.map((name) => `assets/${name}-home-`),
    'assets/home-',
    ...aliases.map((name) => `assets/${name}-log-management-`),
    'assets/LogManagement-',
    ...aliases.map((name) => `assets/${name}-system-management-`),
    'assets/SystemManagement-',
    'assets/admin-management-',
    'assets/adminManagement-',
    'assets/admin-document-form-',
    'assets/DocumentFormManagement-',
    'assets/UniverDocumentCanvas-',
    ...aliases.map((name) => `assets/${name}-portal-`),
    'assets/PortalManagement-',
    'assets/portal-engine-',
    'assets/DocumentFormDesignerPage-',
    'assets/DocumentFormPreviewPage-',
    'assets/SsoCallbackPage-',
    'assets/list-',
    'assets/extensions-',
    'assets/sortable-grid-',
    'assets/univer-presets-vendor-',
    'assets/univer-sheets-vendor-',
    'assets/univer-runtime-vendor-',
    'assets/vue-office-pdf-vendor-',
    'assets/vue-office-docx-vendor-',
    'assets/vue-office-excel-vendor-',
    'assets/vue-office-pptx-vendor-',
    'assets/ofd-viewer-vendor-',
    'assets/ofd-parser-vendor-',
    'assets/one-ui-shell-',
    'assets/one-ui-table-',
    'assets/iconify-ri-',
    'assets/wangeditor-',
    'assets/vxe-'
  ];
}

function createAdminRuntimePreloadBlockedPrefixes(appName: string) {
  const aliases = resolveAdminShellAppAliases(appName);

  return [
    ...createAdminShellPreloadBlockedPrefixes(appName),
    ...aliases.map((name) => `assets/${name}-auth-`),
    'assets/LoginPage-',
    'assets/one-ui-auth-',
    'assets/element-plus-',
    'assets/iconify-runtime-',
    'assets/arrow-left-s-line-',
    'assets/dist-web-',
    'assets/module-'
  ];
}

function createAdminLoginPagePreloadBlockedPrefixes(appName: string) {
  const aliases = resolveAdminShellAppAliases(appName);

  return [
    ...aliases.map((name) => `assets/${name}-app-shell-`),
    'assets/one-ui-shell-',
    'assets/one-ui-table-',
    'assets/iconify-ri-',
    'assets/wangeditor-',
    'assets/vxe-'
  ];
}

function createAdminIndexHtmlBlockedStylePrefixes(appName: string) {
  const aliases = resolveAdminShellAppAliases(appName);

  return [
    ...aliases.map((name) => `assets/${name}-entry-`),
    'assets/admin-management-',
    'assets/admin-document-form-',
    ...aliases.map((name) => `assets/${name}-system-management-`),
    'assets/portal-engine-',
    ...aliases.map((name) => `assets/${name}-portal-`),
    'assets/univer-presets-vendor-',
    'assets/univer-sheets-vendor-',
    'assets/univer-runtime-vendor-',
    'assets/vue-office-pdf-vendor-',
    'assets/vue-office-docx-vendor-',
    'assets/vue-office-excel-vendor-',
    'assets/vue-office-pptx-vendor-',
    'assets/ofd-viewer-vendor-',
    'assets/ofd-parser-vendor-',
    'assets/wangeditor-',
    'assets/vxe-',
    'assets/one-ui-table-',
    'assets/one-ui-shell-'
  ];
}

export function createOneAppManualChunks(options: OneAppManualChunkOptions) {
  const appSegment = `/apps/${options.appName}/src/`;
  const featureChunks = options.featureChunks ?? [];
  const adminRuntimePatterns = isAdminShellAppName(options.appName)
    ? [
        `${appSegment}bootstrap/http.ts`,
        `${appSegment}bootstrap/adapter.ts`,
        `${appSegment}bootstrap/core.ts`,
        `${appSegment}bootstrap/router.ts`,
        `${appSegment}config/`,
        `${appSegment}services/`,
        `${appSegment}types/`,
        `${appSegment}router/constants.ts`
      ]
    : [];
  const adminAuthPatterns = isAdminShellAppName(options.appName)
    ? [`${appSegment}pages/login/`, `${appSegment}pages/sso/`, `${appSegment}services/auth/auth-`]
    : [];

  return function manualChunks(rawId: string) {
    const id = normalizeModuleId(rawId);

    if (id.startsWith('\0') || id.includes('?worker') || id.includes('&worker')) {
      return undefined;
    }

    const vendorRule = VENDOR_CHUNK_RULES.find((rule) => includesAny(id, rule.patterns));
    if (vendorRule) {
      return vendorRule.name;
    }

    const workspaceRule = WORKSPACE_CHUNK_RULES.find((rule) => includesAny(id, rule.patterns));
    if (workspaceRule) {
      return workspaceRule.name;
    }

    if (!id.includes(appSegment)) {
      return undefined;
    }

    const featureRule = featureChunks.find((rule) => includesAny(id, rule.patterns));
    if (featureRule) {
      return featureRule.name;
    }

    if (adminRuntimePatterns.length > 0 && includesAny(id, adminRuntimePatterns)) {
      return `${options.appName}-runtime`;
    }

    if (adminAuthPatterns.length > 0 && includesAny(id, adminAuthPatterns)) {
      return `${options.appName}-auth`;
    }

    if (includesAny(id, [`${appSegment}pages/login/`, `${appSegment}pages/sso/`])) {
      return `${options.appName}-auth`;
    }

    if (
      includesAny(id, [
        `${appSegment}bootstrap/`,
        `${appSegment}router/`,
        `${appSegment}config/`,
        `${appSegment}services/`,
        `${appSegment}types/`
      ])
    ) {
      return `${options.appName}-app-shell`;
    }

    return undefined;
  };
}

export function createOneAppCodeSplitting(
  options: OneAppManualChunkOptions
): OneAppCodeSplittingOptions {
  const appSegment = `/apps/${options.appName}/src/`;
  const featureChunks = options.featureChunks ?? [];
  const codeSplittingGroups: CodeSplittingGroupDefinition[] = [
    ...VENDOR_CHUNK_RULES.map((rule, index) => ({
      chunkName: rule.name,
      patterns: rule.patterns,
      priority: 1000 - index
    })),
    ...WORKSPACE_CHUNK_RULES.map((rule, index) => ({
      chunkName: rule.name,
      patterns: rule.patterns,
      priority:
        {
          'one-core': 940,
          'one-ui-auth': 930,
          'one-ui-table': 920,
          'one-ui-shell': 910,
          'one-tag': 900,
          'portal-engine': 890,
          'one-adapters': 880,
          'one-utils': 870
        }[rule.name] ?? 860 - index
    })),
    ...featureChunks.map((rule, index) => ({
      chunkName: rule.name,
      patterns: rule.patterns,
      priority: 500 - index
    })),
    ...(isAdminShellAppName(options.appName)
      ? [
          {
            chunkName: `${options.appName}-runtime`,
            patterns: [
              `${appSegment}bootstrap/http.ts`,
              `${appSegment}bootstrap/adapter.ts`,
              `${appSegment}bootstrap/core.ts`,
              `${appSegment}bootstrap/router.ts`,
              `${appSegment}config/`,
              `${appSegment}services/`,
              `${appSegment}types/`,
              `${appSegment}router/constants.ts`
            ],
            priority: 620
          },
          {
            chunkName: `${options.appName}-auth`,
            patterns: [
              `${appSegment}pages/login/`,
              `${appSegment}pages/sso/`,
              `${appSegment}services/auth/auth-`
            ],
            priority: 610
          },
          {
            chunkName: `${options.appName}-app-shell`,
            patterns: [
              `${appSegment}bootstrap/`,
              `${appSegment}router/`,
              `${appSegment}config/`,
              `${appSegment}services/`,
              `${appSegment}types/`
            ],
            priority: 100
          }
        ]
      : [
          {
            chunkName: `${options.appName}-app-shell`,
            patterns: [
              `${appSegment}bootstrap/`,
              `${appSegment}router/`,
              `${appSegment}infra/`,
              `${appSegment}config/`,
              `${appSegment}services/`,
              `${appSegment}types/`
            ],
            priority: 100
          }
        ])
  ];

  return {
    // 让命名 chunk 递归吸纳其依赖，避免 vendor 的共享依赖被回落到 admin-entry 等业务入口 chunk。
    includeDependenciesRecursively: true,
    minSize: 0,
    minShareCount: 1,
    groups: codeSplittingGroups.map((group) => ({
      name(moduleId) {
        return includesAny(normalizeModuleId(moduleId), group.patterns) ? group.chunkName : null;
      },
      test(moduleId) {
        return includesAny(normalizeModuleId(moduleId), group.patterns);
      },
      priority: group.priority
    }))
  };
}

export function createOneAppPreloadDependenciesResolver(options: OneAppManualChunkOptions) {
  if (!isAdminShellAppName(options.appName)) {
    return (_filename: string, deps: string[]) => deps;
  }

  const adminRuntimeBlockedPrefixes = createAdminRuntimePreloadBlockedPrefixes(options.appName);
  const adminShellBlockedPrefixes = createAdminShellPreloadBlockedPrefixes(options.appName);
  const adminLoginBlockedPrefixes = createAdminLoginPagePreloadBlockedPrefixes(options.appName);

  return (filename: string, deps: string[], context: PreloadDependencyContext) => {
    if (context.hostType === 'html' && matchesOutputPrefix(filename, ['assets/index-'])) {
      return filterPreloadDependencies(deps, adminRuntimeBlockedPrefixes);
    }

    if (
      matchesOutputPrefix(filename, [
        `assets/${options.appName}-runtime-`,
        `assets/${options.appName}-app-shell-`
      ])
    ) {
      return filterPreloadDependencies(deps, adminRuntimeBlockedPrefixes);
    }

    if (matchesOutputPrefix(filename, [`assets/${options.appName}-auth-`, 'assets/lite-'])) {
      return filterPreloadDependencies(deps, adminShellBlockedPrefixes);
    }

    if (matchesOutputPrefix(filename, ['assets/LoginPage-'])) {
      return filterPreloadDependencies(deps, adminLoginBlockedPrefixes);
    }

    return deps;
  };
}

export function stripIndexHtmlUnusedStylesheets(html: string, options: OneAppManualChunkOptions) {
  if (!isAdminShellAppName(options.appName)) {
    return html;
  }

  const adminIndexHtmlBlockedStylePrefixes = createAdminIndexHtmlBlockedStylePrefixes(
    options.appName
  );

  return html.replace(
    /^[ \t]*<link rel="stylesheet" crossorigin href="\/([^"]+)">\n?/gm,
    (match, href: string) => {
      return matchesOutputPrefix(href, adminIndexHtmlBlockedStylePrefixes) ? '' : match;
    }
  );
}

function rewriteChunkPreloadMap(code: string, blockedPrefixes: string[]) {
  const preloadMapSignature = '=>i.map(i=>d[i]);';
  if (!code.includes(preloadMapSignature)) {
    return code;
  }

  return code.replace(
    preloadMapSignature,
    `=>i.map(i=>d[i]).filter(dep=>dep&&!${JSON.stringify(blockedPrefixes)}.some(prefix=>dep.startsWith(prefix)));`
  );
}

export function pruneBuiltChunkPreloadMaps(
  code: string,
  filename: string,
  options: OneAppManualChunkOptions
) {
  if (!isAdminShellAppName(options.appName)) {
    return code;
  }

  const adminRuntimeBlockedPrefixes = createAdminRuntimePreloadBlockedPrefixes(options.appName);
  const adminShellBlockedPrefixes = createAdminShellPreloadBlockedPrefixes(options.appName);

  if (
    matchesOutputPrefix(filename, [
      'assets/index-',
      `assets/${options.appName}-runtime-`,
      `assets/${options.appName}-app-shell-`
    ])
  ) {
    return rewriteChunkPreloadMap(code, adminRuntimeBlockedPrefixes);
  }

  if (
    matchesOutputPrefix(filename, [
      `assets/${options.appName}-auth-`,
      'assets/LoginPage-',
      'assets/lite-'
    ])
  ) {
    return rewriteChunkPreloadMap(code, adminShellBlockedPrefixes);
  }

  return code;
}
