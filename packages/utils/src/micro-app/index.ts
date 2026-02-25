/**
 * 微应用相关工具函数
 * @description 提供微前端应用的数据传递和管理功能
 */

/**
 * 微应用数据接口
 */
export interface MicroAppData {
  token: string
  userInfo: any
  logOutFn: () => void
  closeActiveTag?: () => void
  [key: string]: any
}

/**
 * 微应用依赖接口
 */
export interface MicroAppDependencies {
  getToken: () => string
  getUserInfo: () => any
  getLogoutFn: () => () => void
  closeActiveTag?: () => void
}

/**
 * 获取微应用数据
 * @param otherParams - 其他参数
 * @param dependencies - 依赖对象
 * @returns 微应用数据对象
 * 
 * @example
 * ```typescript
 * const microData = getMicroData(
 *   { customParam: 'value' },
 *   {
 *     getToken: () => localStorage.getItem('token') || '',
 *     getUserInfo: () => JSON.parse(localStorage.getItem('userInfo') || '{}'),
 *     getLogoutFn: () => () => {
 *       localStorage.clear()
 *       window.location.href = '/login'
 *     },
 *     closeActiveTag: () => {
 *       // 关闭当前标签页的逻辑
 *     }
 *   }
 * )
 * ```
 */
export function getMicroData(
  otherParams: Record<string, any> = {},
  dependencies: MicroAppDependencies
): MicroAppData {
  return {
    token: dependencies.getToken(),
    userInfo: dependencies.getUserInfo(),
    logOutFn: dependencies.getLogoutFn(),
    closeActiveTag: dependencies.closeActiveTag,
    ...otherParams
  }
}

/**
 * 根据URL生成应用名称
 * @param url - 应用URL
 * @returns 应用名称
 * 
 * @example
 * ```typescript
 * getAppName('https://crm.example.com')
 * // => 'appcrmexamplecom'
 * 
 * getAppName('http://localhost:3000')
 * // => 'applocalhost'
 * 
 * getAppName('') // 空URL
 * // => 'app'
 * ```
 */
export function getAppName(url: string): string {
  const defaultAppName = 'app'
  if (!url) {
    console.warn('未知url')
    return defaultAppName
  }
  
  try {
    const cUrl = new URL(url)
    const hostname = cUrl?.hostname?.replace?.(/\./g, '') || ''
    return `${defaultAppName}${hostname}`
  } catch {
    return defaultAppName
  }
}

/**
 * 关闭当前活跃标签页
 * @description 通过DOM操作关闭当前活跃的标签页
 * 
 * @example
 * ```typescript
 * closeActiveTag()
 * ```
 */
export function closeActiveTag(): void {
  try {
    const activeTag = document.getElementsByClassName(
      'scroll-item is-closable is-active'
    )[0]
    if (activeTag) {
      const closeBtn = activeTag.getElementsByClassName('el-icon-close')[0] as HTMLElement
      if (closeBtn) {
        closeBtn.click()
      }
    }
  } catch (e) {
    console.log(e)
  }
}

/**
 * iframe数据接口
 */
export interface IframeData {
  token: string
  userInfo: any
  href: string
  frontAllMenu?: any[]
  [key: string]: any
}

/**
 * iframe依赖接口
 */
export interface IframeDependencies {
  getToken: () => string
  getUserInfo: () => any
  getFrontAllMenu?: () => Promise<any[]>
}

/**
 * 获取iframe数据
 * @param otherParams - 其他参数
 * @param dependencies - 依赖对象
 * @returns iframe数据对象
 * 
 * @example
 * ```typescript
 * const iframeData = getIframeData(
 *   { customParam: 'value' },
 *   {
 *     getToken: () => localStorage.getItem('token') || '',
 *     getUserInfo: () => JSON.parse(localStorage.getItem('userInfo') || '{}'),
 *     getFrontAllMenu: () => api.getFrontAllMenu()
 *   }
 * )
 * ```
 */
export function getIframeData(
  otherParams: Record<string, any> = {},
  dependencies: IframeDependencies
): IframeData {
  return {
    token: dependencies.getToken(),
    userInfo: dependencies.getUserInfo(),
    href: window.location.href,
    ...otherParams
  }
}

/**
 * 发送基础信息到iframe
 * @param dom - iframe DOM元素
 * @param dependencies - 依赖对象
 * 
 * @example
 * ```typescript
 * const iframe = document.getElementById('myIframe')
 * sendBaseInfo(iframe, {
 *   getToken: () => localStorage.getItem('token') || '',
 *   getUserInfo: () => JSON.parse(localStorage.getItem('userInfo') || '{}'),
 *   getFrontAllMenu: () => api.getFrontAllMenu()
 * })
 * ```
 */
export async function sendBaseInfo(
  dom: HTMLIFrameElement | null,
  dependencies: IframeDependencies
): Promise<void> {
  try {
    let frontAllMenu: any[] = []
    if (dependencies.getFrontAllMenu) {
      frontAllMenu = await dependencies.getFrontAllMenu()
    }
    
    dom?.contentWindow?.postMessage?.(
      getIframeData({ frontAllMenu }, dependencies),
      '*'
    )
  } catch (err) {
    console.error(err)
  }
}

/**
 * iframe消息处理器
 * @param e - 事件对象
 * @param dependencies - 依赖对象
 * 
 * @example
 * ```typescript
 * const iframe = document.getElementById('myIframe')
 * iframe.addEventListener('load', (e) => {
 *   iframeMessage(e, {
 *     getToken: () => localStorage.getItem('token') || '',
 *     getUserInfo: () => JSON.parse(localStorage.getItem('userInfo') || '{}'),
 *     getFrontAllMenu: () => api.getFrontAllMenu()
 *   })
 * })
 * ```
 */
export function iframeMessage(
  e: Event,
  dependencies: IframeDependencies
): void {
  const dom = e.target as HTMLIFrameElement
  sendBaseInfo(dom, dependencies)
}

/**
 * 系统列表配置
 */
export interface SystemConfig {
  name: string
  systemId: string
}

/**
 * 默认系统列表
 */
export const defaultSystemList: SystemConfig[] = [
  {
    name: '供应链',
    systemId: 'SUbV0ZhV'
  },
  {
    name: '区域净利润',
    systemId: 'G99MnQ1D'
  }
]

/**
 * 微应用管理器
 */
export class MicroAppManager {
  private apps = new Map<string, any>()
  private dependencies: MicroAppDependencies

  constructor(dependencies: MicroAppDependencies) {
    this.dependencies = dependencies
  }

  /**
   * 注册微应用
   * @param name - 应用名称
   * @param config - 应用配置
   */
  registerApp(name: string, config: any): void {
    this.apps.set(name, config)
  }

  /**
   * 获取微应用
   * @param name - 应用名称
   * @returns 应用配置
   */
  getApp(name: string): any {
    return this.apps.get(name)
  }

  /**
   * 获取所有微应用
   * @returns 所有应用配置
   */
  getAllApps(): Map<string, any> {
    return this.apps
  }

  /**
   * 为微应用设置数据
   * @param name - 应用名称
   * @param data - 数据对象
   */
  setAppData(name: string, data: Record<string, any> = {}): void {
    const microData = getMicroData(data, this.dependencies)
    
    // 如果是micro-app框架
    if ((window as any).microApp) {
      ;(window as any).microApp.setData(name, microData)
    }
    
    // 如果是qiankun框架
    if ((window as any).qiankunGlobalState) {
      ;(window as any).qiankunGlobalState.setGlobalState(microData)
    }
  }

  /**
   * 卸载微应用
   * @param name - 应用名称
   */
  unregisterApp(name: string): void {
    this.apps.delete(name)
  }
}
