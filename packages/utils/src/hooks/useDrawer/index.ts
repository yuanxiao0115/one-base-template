/**
 * 抽屉管理 Hook
 * @description 提供通用的抽屉状态管理功能，支持新增、编辑、查看等模式
 */

import { ref, computed, toRaw, type Ref } from 'vue'

/**
 * 抽屉模式枚举
 */
export enum DrawerMode {
  Add = 'add',
  Update = 'update',
  View = 'view',
  Copy = 'copy',
}

/**
 * 抽屉配置选项
 */
export interface UseDrawerOptions {
  /** 抽屉标题 */
  title?: string
  /** 获取详情的API函数 */
  detailApi?: (params?: any) => Promise<any>
  /** 新增API函数 */
  addApi?: (data: any) => Promise<any>
  /** 更新API函数 */
  updateApi?: (data: any) => Promise<any>
  /** 刷新回调函数 */
  refresh?: () => void
  /** 提交表单数据引用 */
  submitForm?: any
  /** 获取详情后的回调函数 */
  getDetailCallback?: (data: any) => void
  /** 详情API参数 */
  detailParam?: any
  /** 提交前的数据处理函数 */
  beforeSubmit?: (data: any) => any | Promise<any>
  /** 提交成功后的回调 */
  onSuccess?: (mode: DrawerMode, data: any) => void
  /** 提交失败后的回调 */
  onError?: (error: any) => void
  /** 抽屉尺寸 */
  size?: string | number
  /** 抽屉方向 */
  direction?: 'rtl' | 'ltr' | 'ttb' | 'btt'
}

/**
 * 抽屉管理返回值
 */
export interface UseDrawerReturn {
  /** 抽屉可见性 */
  visible: Ref<boolean>
  /** 详情数据 */
  detailData: Ref<any>
  /** 当前模式 */
  mode: Ref<DrawerMode>
  /** 计算后的标题 */
  title: Ref<string>
  /** 是否为只读模式 */
  readonly: Ref<boolean>
  /** 抽屉尺寸 */
  size: Ref<string | number>
  /** 抽屉方向 */
  direction: Ref<string>
  /** 打开抽屉 */
  openDrawer: (mode: DrawerMode, row?: any, params?: any) => Promise<void>
  /** 关闭抽屉 */
  closeDrawer: () => void
  /** 提交表单 */
  submit: (formRef?: any) => Promise<void>
  /** 重置表单数据 */
  resetForm: () => void
}

/**
 * 抽屉管理 Hook
 * @param options - 配置选项
 * @returns 抽屉管理对象
 *
 * @example
 * ```typescript
 * const drawerOptions = {
 *   title: '用户',
 *   detailApi: api.getUserDetail,
 *   addApi: api.addUser,
 *   updateApi: api.updateUser,
 *   refresh: () => tableRef.value.refresh(),
 *   submitForm: formData,
 *   size: '50%',
 *   direction: 'rtl',
 *   getDetailCallback: (data) => {
 *     Object.assign(formData, data)
 *   }
 * }
 *
 * const {
 *   visible,
 *   mode,
 *   title,
 *   readonly,
 *   openDrawer,
 *   closeDrawer,
 *   submit
 * } = useDrawer(drawerOptions)
 *
 * // 打开新增抽屉
 * openDrawer(DrawerMode.Add)
 *
 * // 打开编辑抽屉
 * openDrawer(DrawerMode.Update, rowData)
 * ```
 */
export function useDrawer(options: UseDrawerOptions = {}): UseDrawerReturn {
  const {
    title: baseTitle = '',
    detailApi,
    addApi,
    updateApi,
    refresh,
    submitForm,
    getDetailCallback,
    detailParam,
    beforeSubmit,
    onSuccess,
    onError,
    size: defaultSize = '50%',
    direction: defaultDirection = 'rtl',
  } = options

  const visible: Ref<boolean> = ref(false)
  const detailData: Ref<any> = ref({})
  const mode: Ref<DrawerMode> = ref(DrawerMode.Add)
  const size: Ref<string | number> = ref(defaultSize)
  const direction: Ref<string> = ref(defaultDirection)

  /**
   * 计算后的标题
   */
  const title = computed(() => {
    const modeText = {
      [DrawerMode.Add]: '新增',
      [DrawerMode.Update]: '编辑',
      [DrawerMode.View]: '查看',
      [DrawerMode.Copy]: '复制',
    }
    return `${modeText[mode.value]}${baseTitle}`
  })

  /**
   * 是否为只读模式
   */
  const readonly = computed(() => mode.value === DrawerMode.View)

  /**
   * 打开抽屉
   * @param newMode - 抽屉模式
   * @param row - 行数据
   * @param params - 额外参数
   */
  const openDrawer = async (newMode: DrawerMode, row?: any, params?: any): Promise<void> => {
    mode.value = newMode
    visible.value = true

    // 重置详情数据
    detailData.value = {}

    if (
      newMode === DrawerMode.Update ||
      newMode === DrawerMode.View ||
      newMode === DrawerMode.Copy
    ) {
      try {
        if (detailApi) {
          // 使用API获取详情
          const response = await detailApi(params || detailParam)
          if (response && response.code === 200) {
            detailData.value = response.data
          }
        } else if (row) {
          // 直接使用行数据
          detailData.value = toRaw(row)
        }

        // 执行获取详情后的回调
        if (getDetailCallback) {
          getDetailCallback(detailData.value)
        }
      } catch (error) {
        console.error('获取详情失败:', error)
        if (onError) {
          onError(error)
        }
      }
    } else if (newMode === DrawerMode.Add) {
      // 新增模式，重置表单
      resetForm()
    }
  }

  /**
   * 关闭抽屉
   */
  const closeDrawer = (): void => {
    visible.value = false
    detailData.value = {}
  }

  /**
   * 提交表单
   * @param formRef - 表单引用
   */
  const submit = async (formRef?: any): Promise<void> => {
    try {
      // 表单验证
      if (formRef && formRef.validate) {
        const valid = await new Promise((resolve) => {
          formRef.validate((isValid: boolean) => resolve(isValid))
        })
        if (!valid) return
      }

      // 准备提交数据
      let submitData = submitForm ? toRaw(submitForm) : detailData.value

      // 提交前数据处理
      if (beforeSubmit) {
        submitData = await beforeSubmit(submitData)
      }

      // 根据模式调用对应API
      let response
      if (mode.value === DrawerMode.Add || mode.value === DrawerMode.Copy) {
        if (addApi) {
          response = await addApi(submitData)
        }
      } else if (mode.value === DrawerMode.Update) {
        if (updateApi) {
          response = await updateApi(submitData)
        }
      }

      // 处理响应
      if (response && response.code === 200) {
        if (onSuccess) {
          onSuccess(mode.value, response.data)
        }

        closeDrawer()

        // 刷新数据
        if (refresh) {
          refresh()
        }
      }
    } catch (error) {
      console.error('提交失败:', error)
      if (onError) {
        onError(error)
      }
    }
  }

  /**
   * 重置表单数据
   */
  const resetForm = (): void => {
    if (submitForm && typeof submitForm === 'object') {
      Object.keys(submitForm).forEach((key) => {
        submitForm[key] = undefined
      })
    }
  }

  return {
    visible,
    detailData,
    mode,
    title,
    readonly,
    size,
    direction,
    openDrawer,
    closeDrawer,
    submit,
    resetForm,
  }
}

export default useDrawer
