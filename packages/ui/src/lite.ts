import { defineAsyncComponent, type App, type Component } from 'vue'

export type LiteOneUiComponentName = 'LoginBox' | 'LoginBoxV2' | 'PageContainer'

const LITE_UI_COMPONENT_LOADERS: Record<LiteOneUiComponentName, () => Promise<{ default: Component }>> = {
  LoginBox: () => import('./components/auth/LoginBox.vue'),
  LoginBoxV2: () => import('./components/auth/LoginBoxV2.vue'),
  PageContainer: () => import('./components/container/PageContainer.vue')
}

export interface LiteOneUiComponentOptions {
  prefix?: string
  aliases?: boolean
  include?: Partial<Record<LiteOneUiComponentName, boolean>>
}

function shouldRegister(options: LiteOneUiComponentOptions, name: LiteOneUiComponentName): boolean {
  if (!options.include) {
    return true
  }

  return options.include[name] !== false
}

function registerComponent(app: App, name: string, component: Component) {
  if (!app.component(name)) {
    app.component(name, component)
  }
}

function createLiteUiComponent(name: LiteOneUiComponentName) {
  return defineAsyncComponent(LITE_UI_COMPONENT_LOADERS[name])
}

export function registerOneLiteUiComponents(app: App, options: LiteOneUiComponentOptions = {}) {
  const prefix = options.prefix?.trim() || 'Ob'
  const aliases = options.aliases ?? false

  ;(Object.keys(LITE_UI_COMPONENT_LOADERS) as LiteOneUiComponentName[]).forEach((name) => {
    if (!shouldRegister(options, name)) {
      return
    }

    const component = createLiteUiComponent(name)
    registerComponent(app, `${prefix}${name}`, component)
    if (aliases) {
      registerComponent(app, name, component)
    }
  })
}
