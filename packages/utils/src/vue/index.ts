/**
 * Vue框架相关工具函数
 * @description 提供Vue组件、插件等相关的工具函数
 */

import { reactive, toRaw, type App, type Component } from 'vue'

function cloneState<T>(value: T): T {
  if (typeof structuredClone === 'function') {
    return structuredClone(value)
  }
  return JSON.parse(JSON.stringify(value)) as T
}

/**
 * Vue组件安装工具
 * @param components - 组件对象
 * @returns 安装插件
 * 
 * @example
 * ```typescript
 * import { withInstall } from '@one/utils/vue'
 * import MyComponent from './MyComponent.vue'
 * 
 * const MyComponentWithInstall = withInstall({ MyComponent })
 * 
 * // 在Vue应用中使用
 * app.use(MyComponentWithInstall)
 * ```
 */
export function withInstall(components: Record<string, Component>) {
  return {
    install(app: App) {
      for (const key in components) {
        app.component(key, components[key])
      }
    },
  }
}

/**
 * 创建Vue插件
 * @param install - 安装函数
 * @returns Vue插件对象
 * 
 * @example
 * ```typescript
 * const myPlugin = createPlugin((app, options) => {
 *   app.config.globalProperties.$myMethod = () => {
 *     console.log('Hello from plugin!')
 *   }
 * })
 * 
 * app.use(myPlugin, { option1: 'value1' })
 * ```
 */
export function createPlugin<T = any>(
  install: (app: App, options?: T) => void
) {
  return {
    install
  }
}

/**
 * 组件属性验证器
 * @param validator - 验证函数
 * @param message - 错误信息
 * @returns 属性验证器
 * 
 * @example
 * ```typescript
 * const props = {
 *   size: {
 *     type: String,
 *     validator: createValidator(
 *       (value) => ['small', 'medium', 'large'].includes(value),
 *       'Size must be one of: small, medium, large'
 *     )
 *   }
 * }
 * ```
 */
export function createValidator<T>(
  validator: (value: T) => boolean,
  message?: string
) {
  return (value: T): boolean => {
    const isValid = validator(value)
    if (!isValid && message) {
      console.warn(message, value)
    }
    return isValid
  }
}

/**
 * 创建响应式状态管理
 * @param initialState - 初始状态
 * @returns 状态管理对象
 * 
 * @example
 * ```typescript
 * const { state, setState, getState } = createReactiveState({
 *   count: 0,
 *   name: 'test'
 * })
 * 
 * setState({ count: 1 })
 * console.log(getState().count) // => 1
 * ```
 */
export function createReactiveState<T extends Record<string, any>>(
  initialState: T
) {
  // 保存一份初始快照，避免 setState 后污染入参对象，导致 reset 失效。
  const initialSnapshot = cloneState(initialState)
  const state = reactive(cloneState(initialState))
  
  const setState = (newState: Partial<T>) => {
    Object.assign(state, newState)
  }
  
  const getState = (): T => {
    return toRaw(state) as T
  }
  
  const resetState = () => {
    Object.assign(state, cloneState(initialSnapshot))
  }
  
  return {
    state,
    setState,
    getState,
    resetState
  }
}

/**
 * 组件事件发射器
 * @param emit - Vue组件的emit函数
 * @returns 增强的事件发射器
 * 
 * @example
 * ```typescript
 * const emitter = createEmitter(emit)
 * 
 * emitter.success('操作成功')
 * emitter.error('操作失败')
 * emitter.change(newValue)
 * ```
 */
export function createEmitter(emit: (event: string, ...args: any[]) => void) {
  return {
    success: (message: string, data?: any) => emit('success', { message, data }),
    error: (message: string, error?: any) => emit('error', { message, error }),
    change: (value: any) => emit('change', value),
    update: (value: any) => emit('update:modelValue', value),
    click: (event: Event) => emit('click', event),
    custom: (eventName: string, ...args: any[]) => emit(eventName, ...args)
  }
}

/**
 * 创建可组合的功能函数
 * @param setup - 设置函数
 * @returns 可组合函数
 * 
 * @example
 * ```typescript
 * const useCounter = createComposable(() => {
 *   const count = ref(0)
 *   const increment = () => count.value++
 *   const decrement = () => count.value--
 *   
 *   return { count, increment, decrement }
 * })
 * 
 * // 在组件中使用
 * const { count, increment, decrement } = useCounter()
 * ```
 */
export function createComposable<T>(setup: () => T): () => T {
  return setup
}

/**
 * 组件生命周期钩子工具
 * @param hooks - 生命周期钩子对象
 * @returns 生命周期管理器
 * 
 * @example
 * ```typescript
 * const lifecycle = createLifecycle({
 *   onMounted: () => console.log('组件已挂载'),
 *   onUnmounted: () => console.log('组件已卸载')
 * })
 * 
 * lifecycle.mount()
 * lifecycle.unmount()
 * ```
 */
export function createLifecycle(hooks: {
  onMounted?: () => void
  onUnmounted?: () => void
  onUpdated?: () => void
  onBeforeMount?: () => void
  onBeforeUnmount?: () => void
  onBeforeUpdate?: () => void
}) {
  const { 
    onMounted, 
    onUnmounted, 
    onUpdated, 
    onBeforeMount, 
    onBeforeUnmount, 
    onBeforeUpdate 
  } = hooks
  
  return {
    mount: () => {
      onBeforeMount?.()
      onMounted?.()
    },
    unmount: () => {
      onBeforeUnmount?.()
      onUnmounted?.()
    },
    update: () => {
      onBeforeUpdate?.()
      onUpdated?.()
    }
  }
}

/**
 * 创建表单验证器
 * @param rules - 验证规则
 * @returns 表单验证器
 * 
 * @example
 * ```typescript
 * const validator = createFormValidator({
 *   name: [
 *     { required: true, message: '请输入姓名' },
 *     { min: 2, max: 10, message: '姓名长度在2-10个字符' }
 *   ],
 *   email: [
 *     { required: true, message: '请输入邮箱' },
 *     { type: 'email', message: '请输入正确的邮箱格式' }
 *   ]
 * })
 * 
 * const errors = validator.validate({ name: '', email: 'invalid' })
 * ```
 */
export function createFormValidator(rules: Record<string, any[]>) {
  const validate = (data: Record<string, any>) => {
    const errors: Record<string, string[]> = {}
    
    for (const field in rules) {
      const fieldRules = rules[field]
      const value = data[field]
      const fieldErrors: string[] = []
      
      for (const rule of fieldRules) {
        if (rule.required && (!value || value === '')) {
          fieldErrors.push(rule.message || `${field}是必填项`)
          continue
        }
        
        if (rule.min && value && value.length < rule.min) {
          fieldErrors.push(rule.message || `${field}最少${rule.min}个字符`)
        }
        
        if (rule.max && value && value.length > rule.max) {
          fieldErrors.push(rule.message || `${field}最多${rule.max}个字符`)
        }
        
        if (rule.type === 'email' && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          fieldErrors.push(rule.message || `${field}格式不正确`)
        }
        
        if (rule.validator && typeof rule.validator === 'function') {
          const result = rule.validator(value)
          if (result !== true) {
            fieldErrors.push(typeof result === 'string' ? result : rule.message)
          }
        }
      }
      
      if (fieldErrors.length > 0) {
        errors[field] = fieldErrors
      }
    }
    
    return {
      valid: Object.keys(errors).length === 0,
      errors
    }
  }
  
  return {
    validate,
    rules
  }
}
