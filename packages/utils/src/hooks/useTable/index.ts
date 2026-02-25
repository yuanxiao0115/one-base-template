/**
 * 表格数据管理 Hook
 * @description 提供通用的表格数据管理功能，包括分页、搜索、选择等
 */

import { ref, reactive, onMounted, type Ref } from 'vue'

/**
 * 分页配置接口
 */
export interface PaginationConfig {
  /** 总条数 */
  total: number
  /** 每页条数 */
  pageSize: number
  /** 当前页码 */
  currentPage: number
  /** 是否显示背景 */
  background?: boolean
  /** 每页条数选项 */
  pageSizes?: number[]
  /** 布局 */
  layout?: string
}

/**
 * 表格配置选项
 */
export interface UseTableOptions {
  /** 搜索API函数 */
  searchApi: (params: any) => Promise<any>
  /** 搜索表单数据 */
  searchForm?: Record<string, any>
  /** 删除API函数 */
  deleteApi?: (id: string | number) => Promise<any>
  /** 批量删除API函数 */
  batchDeleteApi?: (ids: (string | number)[]) => Promise<any>
  /** 是否启用分页 */
  paginationFlag?: boolean
  /** 初始分页配置 */
  pagination?: Partial<PaginationConfig>
  /** 搜索成功回调 */
  onSearchSuccess?: (data: any) => void
  /** 搜索失败回调 */
  onSearchError?: (error: any) => void
  /** 删除成功回调 */
  onDeleteSuccess?: () => void
  /** 删除失败回调 */
  onDeleteError?: (error: any) => void
  /** 自动加载数据 */
  autoLoad?: boolean
}

/**
 * 表格管理返回值
 */
export interface UseTableReturn {
  /** 表格数据 */
  dataList: Ref<any[]>
  /** 加载状态 */
  loading: Ref<boolean>
  /** 选中的数据 */
  selectedList: Ref<any[]>
  /** 选中的数量 */
  selectedNum: Ref<number>
  /** 分页配置 */
  pagination: PaginationConfig
  /** 搜索数据 */
  onSearch: (resetPage?: boolean) => Promise<void>
  /** 重置搜索表单 */
  resetForm: (formRef?: any, clearKey?: string) => void
  /** 处理选择变化 */
  handleSelectionChange: (selection: any[]) => void
  /** 取消选择 */
  onSelectionCancel: (tableRef?: any) => void
  /** 删除单条数据 */
  deleteRow: (id: string | number) => Promise<void>
  /** 批量删除 */
  batchDelete: (ids?: (string | number)[]) => Promise<void>
  /** 处理分页大小变化 */
  handleSizeChange: (size: number) => void
  /** 处理当前页变化 */
  handleCurrentChange: (page: number) => void
  /** 刷新数据 */
  refresh: () => Promise<void>
}

/**
 * 表格数据管理 Hook
 * @param options - 配置选项
 * @param tableRef - 表格引用
 * @returns 表格管理对象
 * 
 * @example
 * ```typescript
 * const tableOptions = {
 *   searchApi: api.getList,
 *   deleteApi: api.delete,
 *   batchDeleteApi: api.batchDelete,
 *   searchForm: searchForm,
 *   paginationFlag: true,
 *   autoLoad: true
 * }
 * 
 * const {
 *   dataList,
 *   loading,
 *   selectedList,
 *   pagination,
 *   onSearch,
 *   resetForm,
 *   handleSelectionChange,
 *   deleteRow,
 *   batchDelete
 * } = useTable(tableOptions, tableRef)
 * ```
 */
export function useTable(options: UseTableOptions, tableRef?: Ref<any>): UseTableReturn {
  const {
    searchApi,
    searchForm = {},
    deleteApi,
    batchDeleteApi,
    paginationFlag = true,
    pagination: paginationConfig = {},
    onSearchSuccess,
    onSearchError,
    onDeleteSuccess,
    onDeleteError,
    autoLoad = true
  } = options
  
  const dataList: Ref<any[]> = ref([])
  const loading: Ref<boolean> = ref(false)
  const selectedList: Ref<any[]> = ref([])
  const selectedNum: Ref<number> = ref(0)
  
  // 分页配置
  const pagination = reactive<PaginationConfig>({
    total: 0,
    pageSize: 10,
    currentPage: 1,
    background: true,
    pageSizes: [10, 20, 50, 100],
    layout: 'total, sizes, prev, pager, next, jumper',
    ...paginationConfig
  })
  
  /**
   * 搜索数据
   * @param resetPage - 是否重置页码
   */
  const onSearch = async (resetPage = true): Promise<void> => {
    try {
      loading.value = true
      
      if (resetPage) {
        pagination.currentPage = 1
      }
      
      const params = {
        ...searchForm,
        ...(paginationFlag ? {
          page: pagination.currentPage,
          size: pagination.pageSize
        } : {})
      }
      
      const response = await searchApi(params)
      
      if (response && response.code === 200) {
        const { data } = response
        
        if (paginationFlag && data.records) {
          dataList.value = data.records
          pagination.total = data.total || 0
        } else {
          dataList.value = Array.isArray(data) ? data : []
        }
        
        if (onSearchSuccess) {
          onSearchSuccess(data)
        }
      }
    } catch (error) {
      console.error('搜索失败:', error)
      if (onSearchError) {
        onSearchError(error)
      }
    } finally {
      loading.value = false
    }
  }
  
  /**
   * 重置搜索表单
   * @param formRef - 表单引用
   * @param clearKey - 需要清空的字段
   */
  const resetForm = (formRef?: any, clearKey = ''): void => {
    if (formRef && formRef.resetFields) {
      formRef.resetFields()
    }
    
    if (clearKey && searchForm[clearKey] !== undefined) {
      searchForm[clearKey] = ''
    }
    
    onSearch()
  }
  
  /**
   * 处理选择变化
   * @param selection - 选中的数据
   */
  const handleSelectionChange = (selection: any[]): void => {
    selectedList.value = selection
    selectedNum.value = selection.length
    
    // 重置表格高度（如果表格引用存在）
    if (tableRef?.value?.setAdaptive) {
      tableRef.value.setAdaptive()
    }
  }
  
  /**
   * 取消选择
   * @param tableRefParam - 表格引用
   */
  const onSelectionCancel = (tableRefParam?: any): void => {
    selectedNum.value = 0
    selectedList.value = []
    
    const table = tableRefParam || tableRef?.value
    if (table?.getTableRef) {
      table.getTableRef().clearSelection()
    } else if (table?.clearSelection) {
      table.clearSelection()
    }
  }
  
  /**
   * 删除单条数据
   * @param id - 数据ID
   */
  const deleteRow = async (id: string | number): Promise<void> => {
    if (!deleteApi) {
      console.warn('deleteApi 未配置')
      return
    }
    
    try {
      const response = await deleteApi(id)
      
      if (response && response.code === 200) {
        if (onDeleteSuccess) {
          onDeleteSuccess()
        }
        
        // 刷新数据
        await onSearch(false)
      }
    } catch (error) {
      console.error('删除失败:', error)
      if (onDeleteError) {
        onDeleteError(error)
      }
    }
  }
  
  /**
   * 批量删除
   * @param ids - 数据ID数组
   */
  const batchDelete = async (ids?: (string | number)[]): Promise<void> => {
    if (!batchDeleteApi) {
      console.warn('batchDeleteApi 未配置')
      return
    }
    
    const deleteIds = ids || selectedList.value.map(item => item.id)
    
    if (deleteIds.length === 0) {
      console.warn('没有选中的数据')
      return
    }
    
    try {
      const response = await batchDeleteApi(deleteIds)
      
      if (response && response.code === 200) {
        if (onDeleteSuccess) {
          onDeleteSuccess()
        }
        
        // 清空选择
        onSelectionCancel()
        
        // 刷新数据
        await onSearch(false)
      }
    } catch (error) {
      console.error('批量删除失败:', error)
      if (onDeleteError) {
        onDeleteError(error)
      }
    }
  }
  
  /**
   * 处理分页大小变化
   * @param size - 新的分页大小
   */
  const handleSizeChange = (size: number): void => {
    pagination.pageSize = size
    onSearch()
  }
  
  /**
   * 处理当前页变化
   * @param page - 新的页码
   */
  const handleCurrentChange = (page: number): void => {
    pagination.currentPage = page
    onSearch(false)
  }
  
  /**
   * 刷新数据
   */
  const refresh = async (): Promise<void> => {
    await onSearch(false)
  }
  
  // 自动加载数据
  if (autoLoad) {
    onMounted(() => {
      onSearch()
    })
  }
  
  return {
    dataList,
    loading,
    selectedList,
    selectedNum,
    pagination,
    onSearch,
    resetForm,
    handleSelectionChange,
    onSelectionCancel,
    deleteRow,
    batchDelete,
    handleSizeChange,
    handleCurrentChange,
    refresh
  }
}

export default useTable
