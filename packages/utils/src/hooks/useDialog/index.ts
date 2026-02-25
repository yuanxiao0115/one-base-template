/**
 * 对话框管理 Hook
 * @description 提供通用的对话框状态管理功能，支持新增、编辑、查看等模式
 */

import { ref, computed, toRaw, type Ref } from 'vue'

/**
 * 对话框模式枚举
 */
export enum DialogMode {
  Add = 'add',
  Update = 'update',
  View = 'view',
  Copy = 'copy',
}

/**
 * 对话框配置选项
 */
export interface UseDialogOptions {
  /** 对话框标题 */
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
  onSuccess?: (mode: DialogMode, data: any) => void
  /** 提交失败后的回调 */
  onError?: (error: any) => void
}

/**
 * 对话框管理返回值
 */
export interface UseDialogReturn {
  /** 对话框可见性 */
  visible: Ref<boolean>
  /** 详情数据 */
  detailData: Ref<any>
  /** 当前模式 */
  mode: Ref<DialogMode>
  /** 计算后的标题 */
  title: Ref<string>
  /** 是否为只读模式 */
  readonly: Ref<boolean>
  /** 打开对话框 */
  openDialog: (mode: DialogMode, row?: any, params?: any) => Promise<void>
  /** 关闭对话框 */
  closeDialog: () => void
  /** 提交表单 */
  submit: (formRef?: any) => Promise<void>
  /** 重置表单数据 */
  resetForm: () => void
}

/**
 * 对话框管理 Hook
 * @param options - 配置选项
 * @returns 对话框管理对象
 *
 * @example
 * ```typescript
 * const dialogOptions = {
 *   title: '用户',
 *   detailApi: api.getUserDetail,
 *   addApi: api.addUser,
 *   updateApi: api.updateUser,
 *   refresh: () => tableRef.value.refresh(),
 *   submitForm: formData,
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
 *   openDialog,
 *   closeDialog,
 *   submit
 * } = useDialog(dialogOptions)
 *
 * // 打开新增对话框
 * openDialog(DialogMode.Add)
 *
 * // 打开编辑对话框
 * openDialog(DialogMode.Update, rowData)
 * ```
 */
export function useDialog(options: UseDialogOptions = {}): UseDialogReturn {
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
  } = options

  const visible: Ref<boolean> = ref(false)
  const detailData: Ref<any> = ref({})
  const mode: Ref<DialogMode> = ref(DialogMode.Add)

  /**
   * 计算后的标题
   */
  const title = computed(() => {
    const modeText = {
      [DialogMode.Add]: '新增',
      [DialogMode.Update]: '编辑',
      [DialogMode.View]: '查看',
      [DialogMode.Copy]: '复制',
    }
    return `${modeText[mode.value]}${baseTitle}`
  })

  /**
   * 是否为只读模式
   */
  const readonly = computed(() => mode.value === DialogMode.View)

  /**
   * 打开对话框
   * @param newMode - 对话框模式
   * @param row - 行数据
   * @param params - 额外参数
   */
  const openDialog = async (newMode: DialogMode, row?: any, params?: any): Promise<void> => {
    mode.value = newMode
    visible.value = true

    // 重置详情数据
    detailData.value = {}

    if (
      newMode === DialogMode.Update ||
      newMode === DialogMode.View ||
      newMode === DialogMode.Copy
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
    } else if (newMode === DialogMode.Add) {
      // 新增模式，重置表单
      resetForm()
    }
  }

  /**
   * 关闭对话框
   */
  const closeDialog = (): void => {
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
      if (mode.value === DialogMode.Add || mode.value === DialogMode.Copy) {
        if (addApi) {
          response = await addApi(submitData)
        }
      } else if (mode.value === DialogMode.Update) {
        if (updateApi) {
          response = await updateApi(submitData)
        }
      }

      // 处理响应
      if (response && response.code === 200) {
        if (onSuccess) {
          onSuccess(mode.value, response.data)
        }

        closeDialog()

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
    openDialog,
    closeDialog,
    submit,
    resetForm,
  }
}

export default useDialog
