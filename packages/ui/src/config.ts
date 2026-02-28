import type { InjectionKey } from 'vue'

export type CrudContainerType = 'dialog' | 'drawer'

export interface CrudContainerGlobalConfig {
  /**
   * CrudContainer 默认容器形态。
   * 当组件 props.container 传值时，props 优先级更高。
   */
  defaultContainer?: CrudContainerType
}

export interface OneUiGlobalConfig {
  crudContainer?: CrudContainerGlobalConfig
}

const DEFAULT_CRUD_CONTAINER_CONFIG: CrudContainerGlobalConfig = {
  defaultContainer: 'drawer'
}

export const ONE_UI_GLOBAL_CONFIG_KEY: InjectionKey<Readonly<OneUiGlobalConfig>> = Symbol('ONE_UI_GLOBAL_CONFIG')

export const DEFAULT_ONE_UI_GLOBAL_CONFIG: Readonly<OneUiGlobalConfig> = Object.freeze({
  crudContainer: DEFAULT_CRUD_CONTAINER_CONFIG
})

export function createOneUiGlobalConfig(config?: OneUiGlobalConfig): Readonly<OneUiGlobalConfig> {
  return {
    crudContainer: {
      defaultContainer: config?.crudContainer?.defaultContainer || DEFAULT_CRUD_CONTAINER_CONFIG.defaultContainer
    }
  }
}
