interface AppFeatureChunk {
  name: string
  patterns: string[]
}

interface OneAppManualChunkOptions {
  appName: 'admin' | 'portal' | 'template'
  featureChunks?: AppFeatureChunk[]
}

function normalizeModuleId(id: string) {
  return id.replaceAll('\\', '/')
}

function includesAny(id: string, patterns: string[]) {
  return patterns.some(pattern => id.includes(pattern))
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

export function createOneAppManualChunks(options: OneAppManualChunkOptions) {
  const appSegment = `/apps/${options.appName}/src/`
  const featureChunks = options.featureChunks ?? []

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

    if (includesAny(id, [`${appSegment}pages/login/`, `${appSegment}pages/sso/`])) {
      return `${options.appName}-auth`
    }

    if (includesAny(id, [`${appSegment}bootstrap/`, `${appSegment}router/`, `${appSegment}infra/`, `${appSegment}config/`, `${appSegment}shared/`])) {
      return `${options.appName}-app-shell`
    }

    return undefined
  }
}
