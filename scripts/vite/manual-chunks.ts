interface AppFeatureChunk {
  name: string
  patterns: string[]
}

interface OneAppManualChunkOptions {
  appName: 'admin' | 'portal' | 'template'
  featureChunks?: AppFeatureChunk[]
}

interface OneAppCodeSplittingOptions {
  groups: Array<{
    name: (moduleId: string) => string | null | undefined
    test: (moduleId: string) => boolean
    priority: number
  }>
  includeDependenciesRecursively: boolean
  minSize: number
  minShareCount: number
}

interface PreloadDependencyContext {
  hostId: string
  hostType: 'html' | 'js'
}

function normalizeModuleId(id: string) {
  return id.replaceAll('\\', '/')
}

function includesAny(id: string, patterns: string[]) {
  return patterns.some(pattern => id.includes(pattern))
}

function normalizeOutputFileName(fileName: string) {
  return normalizeModuleId(fileName).split('?')[0] ?? normalizeModuleId(fileName)
}

function matchesOutputPrefix(fileName: string, prefixes: string[]) {
  const normalized = normalizeOutputFileName(fileName)
  return prefixes.some(prefix => normalized.startsWith(prefix))
}

function filterPreloadDependencies(deps: string[], blockedPrefixes: string[]) {
  return deps.filter(dep => !matchesOutputPrefix(dep, blockedPrefixes))
}

const VENDOR_CHUNK_RULES: AppFeatureChunk[] = [
  {
    name: 'vue-vendor',
    patterns: ['/node_modules/vue/', '/node_modules/vue-router/', '/node_modules/pinia/']
  },
  {
    name: 'element-plus',
    patterns: ['/node_modules/element-plus/', '/node_modules/@element-plus/']
  },
  {
    name: 'vxe',
    patterns: ['/node_modules/vxe-table/', '/node_modules/vxe-pc-ui/']
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
    name: 'crypto',
    patterns: ['/node_modules/gm-crypto/', '/node_modules/crypto-js/', '/node_modules/sm-crypto/']
  },
  {
    name: 'sortable-grid',
    patterns: ['/node_modules/sortablejs/', '/node_modules/grid-layout-plus/']
  }
]

const WORKSPACE_CHUNK_RULES: AppFeatureChunk[] = [
  {
    name: 'one-core',
    patterns: ['/packages/core/src/']
  },
  {
    name: 'one-ui-shell',
    patterns: [
      '/packages/ui/src/layouts/',
      '/packages/ui/src/components/menu/',
      '/packages/ui/src/components/top/',
      '/packages/ui/src/components/tabs/',
      '/packages/ui/src/components/theme/',
      '/packages/ui/src/components/view/',
      '/packages/ui/src/components/container/',
      '/packages/ui/src/components/tree/',
      '/packages/ui/src/pages/error/',
      '/packages/ui/src/plugin.ts',
      '/packages/ui/src/config.ts',
      '/packages/ui/src/index.ts'
    ]
  },
  {
    name: 'one-ui-auth',
    patterns: ['/packages/ui/src/components/auth/']
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
]

const ADMIN_SHELL_PRELOAD_BLOCKED_PREFIXES = [
  'assets/admin-entry-',
  'assets/bootstrap-',
  'assets/admin-app-shell-',
  'assets/admin-home-',
  'assets/admin-log-management-',
  'assets/admin-system-management-',
  'assets/admin-user-management-',
  'assets/admin-portal-',
  'assets/portal-engine-',
  'assets/sortable-grid-',
  'assets/one-ui-shell-',
  'assets/one-ui-table-',
  'assets/vxe-'
]

const ADMIN_RUNTIME_PRELOAD_BLOCKED_PREFIXES = [
  ...ADMIN_SHELL_PRELOAD_BLOCKED_PREFIXES,
  'assets/admin-auth-',
  'assets/LoginPage-',
  'assets/one-ui-auth-',
  'assets/iconify-runtime-',
  'assets/arrow-left-s-line-',
  'assets/dist-web-',
  'assets/module-'
]

const ADMIN_LOGIN_PAGE_PRELOAD_BLOCKED_PREFIXES = [
  'assets/bootstrap-',
  'assets/admin-app-shell-',
  'assets/one-ui-shell-',
  'assets/one-ui-table-',
  'assets/vxe-'
]

const ADMIN_INDEX_HTML_BLOCKED_STYLE_PREFIXES = [
  'assets/admin-entry-',
  'assets/admin-user-management-',
  'assets/admin-system-management-',
  'assets/portal-engine-',
  'assets/admin-portal-',
  'assets/vxe-',
  'assets/one-ui-table-',
  'assets/one-ui-shell-',
  'assets/bootstrap-'
]

export function createOneAppManualChunks(options: OneAppManualChunkOptions) {
  const appSegment = `/apps/${options.appName}/src/`
  const featureChunks = options.featureChunks ?? []
  const adminRuntimePatterns =
    options.appName === 'admin'
      ? [
          `${appSegment}bootstrap/entry.ts`,
          `${appSegment}bootstrap/switcher.ts`,
          `${appSegment}bootstrap/runtime.ts`,
          `${appSegment}bootstrap/http.ts`,
          `${appSegment}bootstrap/adapter.ts`,
          `${appSegment}bootstrap/core.ts`,
          `${appSegment}bootstrap/router.ts`,
          `${appSegment}config/`,
          `${appSegment}infra/`,
          `${appSegment}router/constants.ts`
        ]
      : []
  const adminAuthPatterns =
    options.appName === 'admin'
      ? [
          `${appSegment}bootstrap/public-entry.ts`,
          `${appSegment}bootstrap/public.ts`,
          `${appSegment}router/public-routes.ts`,
          `${appSegment}pages/login/`,
          `${appSegment}pages/sso/`,
          `${appSegment}shared/services/auth-`,
          `${appSegment}shared/api/http-client.ts`
        ]
      : []

  return function manualChunks(rawId: string) {
    const id = normalizeModuleId(rawId)

    if (id.startsWith('\0') || id.includes('?worker') || id.includes('&worker')) {
      return undefined
    }

    const vendorRule = VENDOR_CHUNK_RULES.find(rule => includesAny(id, rule.patterns))
    if (vendorRule) {
      return vendorRule.name
    }

    const workspaceRule = WORKSPACE_CHUNK_RULES.find(rule => includesAny(id, rule.patterns))
    if (workspaceRule) {
      return workspaceRule.name
    }

    if (!id.includes(appSegment)) {
      return undefined
    }

    const featureRule = featureChunks.find(rule => includesAny(id, rule.patterns))
    if (featureRule) {
      return featureRule.name
    }

    if (adminRuntimePatterns.length > 0 && includesAny(id, adminRuntimePatterns)) {
      return 'admin-runtime'
    }

    if (adminAuthPatterns.length > 0 && includesAny(id, adminAuthPatterns)) {
      return 'admin-auth'
    }

    if (includesAny(id, [`${appSegment}pages/login/`, `${appSegment}pages/sso/`])) {
      return `${options.appName}-auth`
    }

    if (includesAny(id, [`${appSegment}bootstrap/`, `${appSegment}router/`, `${appSegment}infra/`, `${appSegment}config/`, `${appSegment}shared/`])) {
      return `${options.appName}-app-shell`
    }

    return undefined
  }
}

export function createOneAppCodeSplitting(options: OneAppManualChunkOptions): OneAppCodeSplittingOptions {
  const resolveChunkName = createOneAppManualChunks(options)

  return {
    includeDependenciesRecursively: false,
    minSize: 0,
    minShareCount: 1,
    groups: [
      {
        name(moduleId) {
          return resolveChunkName(moduleId) ?? null
        },
        test(moduleId) {
          return resolveChunkName(moduleId) != null
        },
        priority: 100
      }
    ]
  }
}

export function createOneAppPreloadDependenciesResolver(options: OneAppManualChunkOptions) {
  if (options.appName !== 'admin') {
    return (_filename: string, deps: string[]) => deps
  }

  return (filename: string, deps: string[], context: PreloadDependencyContext) => {
    if (context.hostType === 'html' && matchesOutputPrefix(filename, ['assets/index-'])) {
      return filterPreloadDependencies(deps, ADMIN_RUNTIME_PRELOAD_BLOCKED_PREFIXES)
    }

    if (matchesOutputPrefix(filename, ['assets/admin-runtime-'])) {
      return filterPreloadDependencies(deps, ADMIN_RUNTIME_PRELOAD_BLOCKED_PREFIXES)
    }

    if (matchesOutputPrefix(filename, ['assets/admin-auth-'])) {
      return filterPreloadDependencies(deps, ADMIN_SHELL_PRELOAD_BLOCKED_PREFIXES)
    }

    if (matchesOutputPrefix(filename, ['assets/LoginPage-'])) {
      return filterPreloadDependencies(deps, ADMIN_LOGIN_PAGE_PRELOAD_BLOCKED_PREFIXES)
    }

    return deps
  }
}

export function stripIndexHtmlUnusedStylesheets(html: string, options: OneAppManualChunkOptions) {
  if (options.appName !== 'admin') {
    return html
  }

  return html.replace(/^[ \t]*<link rel="stylesheet" crossorigin href="\/([^"]+)">\n?/gm, (match, href: string) => {
    return matchesOutputPrefix(href, ADMIN_INDEX_HTML_BLOCKED_STYLE_PREFIXES) ? '' : match
  })
}

function rewriteChunkPreloadMap(code: string, blockedPrefixes: string[]) {
  const preloadMapSignature = '=>i.map(i=>d[i]);'
  if (!code.includes(preloadMapSignature)) {
    return code
  }

  return code.replace(
    preloadMapSignature,
    `=>i.map(i=>d[i]).filter(dep=>dep&&!${JSON.stringify(blockedPrefixes)}.some(prefix=>dep.startsWith(prefix)));`
  )
}

export function pruneBuiltChunkPreloadMaps(code: string, filename: string, options: OneAppManualChunkOptions) {
  if (options.appName !== 'admin') {
    return code
  }

  if (matchesOutputPrefix(filename, ['assets/index-', 'assets/admin-runtime-'])) {
    return rewriteChunkPreloadMap(code, ADMIN_RUNTIME_PRELOAD_BLOCKED_PREFIXES)
  }

  if (matchesOutputPrefix(filename, ['assets/admin-auth-', 'assets/LoginPage-'])) {
    return rewriteChunkPreloadMap(code, ADMIN_SHELL_PRELOAD_BLOCKED_PREFIXES)
  }

  return code
}
