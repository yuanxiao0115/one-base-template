import type { App, Component } from 'vue'

import { LoginBox, LoginBoxV2 } from './auth'
import { PageContainer } from './container'

export type LiteOneUiComponentName = 'LoginBox' | 'LoginBoxV2' | 'PageContainer'

const LITE_UI_COMPONENTS: Record<LiteOneUiComponentName, Component> = {
  LoginBox,
  LoginBoxV2,
  PageContainer
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

export function registerOneLiteUiComponents(app: App, options: LiteOneUiComponentOptions = {}) {
  const prefix = options.prefix?.trim() || 'Ob'
  const aliases = options.aliases ?? false

  ;(Object.keys(LITE_UI_COMPONENTS) as LiteOneUiComponentName[]).forEach((name) => {
    if (!shouldRegister(options, name)) {
      return
    }

    const component = LITE_UI_COMPONENTS[name]
    registerComponent(app, `${prefix}${name}`, component)
    if (aliases) {
      registerComponent(app, name, component)
    }
  })
}
