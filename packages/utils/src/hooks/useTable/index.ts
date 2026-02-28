/**
 * 表格数据管理 Hook
 * @description 同时兼容旧版 `UseTableOptions` 与新版 `UseTableConfig`，用于 puretable -> VXE 迁移期平滑过渡
 */

import { computed, isRef, onMounted, onUnmounted, reactive, ref, type Ref } from 'vue'

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
  /** 小尺寸分页 */
  small?: boolean
}

export interface UseTablePaginationKey {
  current?: string
  size?: string
}

export interface UseTablePaginationAlias {
  current?: string[]
  size?: string[]
}

export interface UseTableDefaults {
  /**
   * 全局默认分页主键（适用于 legacy 与 modern 两种模式）。
   */
  paginationKey?: UseTablePaginationKey
  /**
   * 全局默认分页别名，用于兼容后端参数字段差异。
   */
  paginationAlias?: UseTablePaginationAlias
  /**
   * 全局默认响应适配器，用于统一解析 records/total 结构。
   */
  responseAdapter?: (response: any) => UseTableStandardResponse
}

export type CacheInvalidationStrategy = 'clear_all' | 'clear_current' | 'clear_pagination' | 'keep_all'

export interface UseTableStandardResponse<T = any> {
  records: T[]
  total: number
  currentPage?: number
  pageSize?: number
  raw?: unknown
}

/**
 * 旧版参数（兼容历史 puretable 页面）
 */
export interface UseTableOptions {
  /** 搜索 API */
  searchApi: (params: any) => Promise<any>
  /** 搜索表单 */
  searchForm?: Record<string, any>
  /** 删除 API */
  deleteApi?: (payload: any) => Promise<any>
  /** 批量删除 API */
  batchDeleteApi?: (payload: any) => Promise<any>
  /** 分页主键（legacy 模式） */
  paginationKey?: UseTablePaginationKey
  /** 分页别名（legacy 模式） */
  paginationAlias?: UseTablePaginationAlias
  /** 响应结构适配器（legacy 模式） */
  responseAdapter?: (response: any) => UseTableStandardResponse
  /** 单删请求参数构造器 */
  deletePayloadBuilder?: (input: any) => any
  /** 批删请求参数构造器 */
  batchDeletePayloadBuilder?: (ids: (string | number)[], rows: any[]) => any
  /** 删除主键字段（用于从 row 提取 id） */
  deleteIdKey?: string
  /** 是否分页 */
  paginationFlag?: boolean
  /** 分页配置 */
  pagination?: Partial<PaginationConfig>
  /** 搜索成功回调 */
  onSearchSuccess?: (data: any) => void
  /** 搜索失败回调 */
  onSearchError?: (error: any) => void
  /** 删除成功回调 */
  onDeleteSuccess?: () => void
  /** 删除失败回调 */
  onDeleteError?: (error: any) => void
  /** 自动加载 */
  autoLoad?: boolean
}

export interface UseTableConfig {
  core: {
    /** 新版 API 函数 */
    apiFn: (params: Record<string, any>) => Promise<any>
    /** 默认请求参数 */
    apiParams?: Record<string, any>
    /** 排除字段 */
    excludeParams?: string[]
    /** 立即加载 */
    immediate?: boolean
    /** 是否分页 */
    paginationFlag?: boolean
    /** 分页字段映射（主键） */
    paginationKey?: UseTablePaginationKey
    /** 分页字段别名映射（附加写入，兼容后端差异） */
    paginationAlias?: UseTablePaginationAlias
    /** 初始分页 */
    pagination?: Partial<PaginationConfig>
  }
  transform?: {
    /** 统一响应适配器 */
    responseAdapter?: (response: any) => UseTableStandardResponse
    /** 数据转换 */
    dataTransformer?: (rows: any[]) => any[]
  }
  performance?: {
    /** 启用缓存 */
    enableCache?: boolean
    /** 缓存时长（ms） */
    cacheTime?: number
    /** 防抖时长（ms） */
    debounceTime?: number
  }
  hooks?: {
    onSuccess?: (rows: any[], response: UseTableStandardResponse) => void
    onError?: (error: any) => void
    onCacheHit?: (rows: any[], response: UseTableStandardResponse) => void
    resetFormCallback?: () => void | Promise<void>
  }
}

export interface UseTableCacheInfo {
  total: number
  size: string
  hitRate: string
}

export interface UseTableReturn {
  /** 旧字段：表格数据 */
  dataList: Ref<any[]>
  /** 新字段：与 dataList 同步 */
  data: Ref<any[]>
  /** 加载状态 */
  loading: Ref<boolean>
  /** 错误状态 */
  error: Ref<any>
  /** 搜索参数 */
  searchParams: Record<string, any>
  /** 选中数据 */
  selectedList: Ref<any[]>
  /** 选中数量 */
  selectedNum: Ref<number>
  /** 分页 */
  pagination: PaginationConfig

  /** 旧 API：搜索（默认重置页码） */
  onSearch: (resetPage?: boolean) => Promise<void>
  /** 旧 API：首页搜索 */
  onSearchFirst: () => Promise<void>
  /** 新 API：保持当前分页获取 */
  fetchData: (params?: Record<string, any>) => Promise<UseTableStandardResponse | void>
  /** 新 API：重置到第一页获取 */
  getData: (params?: Record<string, any>) => Promise<UseTableStandardResponse | void>
  /** 新 API：防抖查询 */
  getDataDebounced: (params?: Record<string, any>) => void
  /** 取消防抖查询 */
  cancelDebouncedSearch: () => void

  /** 旧 API：重置表单 */
  resetForm: (formRef?: any, clearKey?: string) => void
  /** 新 API：重置搜索参数 */
  resetSearchParams: () => Promise<void>

  /** 选择相关 */
  handleSelectionChange: (selection: any[]) => void
  onSelectionCancel: (tableRef?: any) => void

  /** 删除相关 */
  deleteRow: (input: any) => Promise<void>
  batchDelete: (ids?: (string | number)[]) => Promise<void>
  /** 旧 API 兼容：单条删除 */
  onDelete: (payload: any) => Promise<void>

  /** 分页变更 */
  handleSizeChange: (size: number) => void
  handleCurrentChange: (page: number) => void

  /** 旧 API：刷新 */
  refresh: () => Promise<void>

  /** 新版刷新策略 */
  refreshCreate: () => Promise<void>
  refreshUpdate: () => Promise<void>
  refreshRemove: () => Promise<void>
  refreshData: () => Promise<void>
  refreshSoft: () => Promise<void>

  /** 缓存信息 */
  cacheInfo: Ref<UseTableCacheInfo>
  clearCache: (strategy?: CacheInvalidationStrategy) => number
  clearExpiredCache: () => number

  /** 取消请求（软取消） */
  cancelRequest: () => void
  /** 清空数据 */
  clearData: () => void
}

interface CacheEntry {
  data: any[]
  response: UseTableStandardResponse
  expiresAt: number
  byteSize: number
  hitCount: number
  querySignature: string
}

interface UseTableInternalConfig {
  mode: 'legacy' | 'modern'
  apiFn: (params: Record<string, any>) => Promise<any>
  apiParams: Record<string, any>
  excludeParams: string[]
  immediate: boolean
  paginationFlag: boolean
  responseAdapter: (response: any) => UseTableStandardResponse
  dataTransformer?: (rows: any[]) => any[]
  requestCurrentKey: string
  requestSizeKey: string
  currentAliases: string[]
  sizeAliases: string[]
  enableCache: boolean
  cacheTime: number
  debounceTime: number
  initialPagination: Partial<PaginationConfig>
  onSuccess?: (rows: any[], response: UseTableStandardResponse) => void
  onError?: (error: any) => void
  onCacheHit?: (rows: any[], response: UseTableStandardResponse) => void
  resetFormCallback?: () => void | Promise<void>
  deleteApi?: (payload: any) => Promise<any>
  batchDeleteApi?: (payload: any) => Promise<any>
  deletePayloadBuilder: (input: any) => any
  batchDeletePayloadBuilder: (ids: (string | number)[], rows: any[]) => any
  deleteIdKey: string
  onDeleteSuccess?: () => void
  onDeleteError?: (error: any) => void
  onLegacySearchSuccess?: (data: any) => void
  onLegacySearchError?: (error: any) => void
  legacySearchForm?: Record<string, any>
}

const DEFAULT_CURRENT_ALIASES = ['current', 'page', 'currentPage']
const DEFAULT_SIZE_ALIASES = ['size', 'pageSize']

const tableDefaultsState: UseTableDefaults = {}

function cloneArray(value?: string[]): string[] | undefined {
  return Array.isArray(value) ? [...value] : undefined
}

export function setUseTableDefaults(defaults: UseTableDefaults = {}): void {
  tableDefaultsState.paginationKey = defaults.paginationKey
    ? {
        current: defaults.paginationKey.current,
        size: defaults.paginationKey.size
      }
    : undefined

  tableDefaultsState.paginationAlias = defaults.paginationAlias
    ? {
        current: cloneArray(defaults.paginationAlias.current),
        size: cloneArray(defaults.paginationAlias.size)
      }
    : undefined

  tableDefaultsState.responseAdapter = defaults.responseAdapter
}

export function getUseTableDefaults(): Readonly<UseTableDefaults> {
  return {
    paginationKey: tableDefaultsState.paginationKey
      ? {
          current: tableDefaultsState.paginationKey.current,
          size: tableDefaultsState.paginationKey.size
        }
      : undefined,
    paginationAlias: tableDefaultsState.paginationAlias
      ? {
          current: cloneArray(tableDefaultsState.paginationAlias.current),
          size: cloneArray(tableDefaultsState.paginationAlias.size)
        }
      : undefined,
    responseAdapter: tableDefaultsState.responseAdapter
  }
}

function uniqueStrings(items: string[]): string[] {
  return Array.from(new Set(items.filter((item) => Boolean(item && item.trim()))))
}

function normalizeObject(input: any): any {
  if (Array.isArray(input)) {
    return input.map((item) => normalizeObject(item))
  }

  if (input && typeof input === 'object') {
    return Object.keys(input)
      .sort()
      .reduce<Record<string, unknown>>((acc, key) => {
        acc[key] = normalizeObject(input[key])
        return acc
      }, {})
  }

  return input
}

function getApproximateSize(value: unknown): number {
  try {
    return JSON.stringify(value).length
  } catch {
    return 0
  }
}

function createDebounce<TArgs extends unknown[]>(
  fn: (...args: TArgs) => void,
  delay: number
): { run: (...args: TArgs) => void; cancel: () => void } {
  let timer: number | null = null

  return {
    run: (...args: TArgs) => {
      if (timer) {
        clearTimeout(timer)
      }
      timer = window.setTimeout(() => {
        fn(...args)
        timer = null
      }, delay)
    },
    cancel: () => {
      if (timer) {
        clearTimeout(timer)
        timer = null
      }
    }
  }
}

function toRawRecord(value: unknown): Record<string, any> {
  if (!value || typeof value !== 'object') {
    return {}
  }
  return value as Record<string, any>
}

function defaultDeletePayloadBuilder(input: any): any {
  return input
}

function defaultBatchDeletePayloadBuilder(ids: (string | number)[]): (string | number)[] {
  return ids
}

function defaultResponseAdapter(response: any): UseTableStandardResponse {
  if (Array.isArray(response)) {
    return {
      records: response,
      total: response.length,
      raw: response
    }
  }

  const root = toRawRecord(response)
  const data = toRawRecord(root.data)

  // 常见分页字段优先级
  const recordsCandidate =
    data.records ?? data.list ?? data.rows ?? data.items ?? root.records ?? root.list ?? root.rows ?? root.items

  const records = Array.isArray(recordsCandidate)
    ? recordsCandidate
    : Array.isArray(data)
      ? data
      : []

  const totalCandidate =
    data.totalCount ?? data.total ?? data.count ?? root.totalCount ?? root.total ?? root.count ?? records.length

  const currentCandidate = data.currentPage ?? data.current ?? data.page ?? root.currentPage ?? root.current ?? root.page
  const pageSizeCandidate = data.pageSize ?? data.size ?? root.pageSize ?? root.size

  return {
    records,
    total: Number(totalCandidate ?? records.length),
    currentPage: currentCandidate == null ? undefined : Number(currentCandidate),
    pageSize: pageSizeCandidate == null ? undefined : Number(pageSizeCandidate),
    raw: response
  }
}

function isModernConfig(options: UseTableOptions | UseTableConfig): options is UseTableConfig {
  return typeof (options as UseTableConfig).core?.apiFn === 'function'
}

function normalizeLegacyOptions(options: UseTableOptions): UseTableInternalConfig {
  const defaults = getUseTableDefaults()
  const currentKey = options.paginationKey?.current || defaults.paginationKey?.current || 'page'
  const sizeKey = options.paginationKey?.size || defaults.paginationKey?.size || 'size'
  const currentAliases = uniqueStrings([
    currentKey,
    ...(options.paginationAlias?.current || []),
    ...(defaults.paginationAlias?.current || []),
    ...DEFAULT_CURRENT_ALIASES
  ])
  const sizeAliases = uniqueStrings([
    sizeKey,
    ...(options.paginationAlias?.size || []),
    ...(defaults.paginationAlias?.size || []),
    ...DEFAULT_SIZE_ALIASES
  ])

  return {
    mode: 'legacy',
    apiFn: options.searchApi,
    apiParams: options.searchForm || {},
    excludeParams: [],
    immediate: options.autoLoad !== false,
    paginationFlag: options.paginationFlag !== false,
    responseAdapter: options.responseAdapter || defaults.responseAdapter || defaultResponseAdapter,
    dataTransformer: undefined,
    requestCurrentKey: currentKey,
    requestSizeKey: sizeKey,
    currentAliases,
    sizeAliases,
    enableCache: false,
    cacheTime: 5 * 60 * 1000,
    debounceTime: 200,
    initialPagination: options.pagination || {},
    onSuccess: undefined,
    onError: undefined,
    onCacheHit: undefined,
    resetFormCallback: undefined,
    deleteApi: options.deleteApi,
    batchDeleteApi: options.batchDeleteApi,
    deletePayloadBuilder: options.deletePayloadBuilder || defaultDeletePayloadBuilder,
    batchDeletePayloadBuilder: options.batchDeletePayloadBuilder || defaultBatchDeletePayloadBuilder,
    deleteIdKey: options.deleteIdKey || 'id',
    onDeleteSuccess: options.onDeleteSuccess,
    onDeleteError: options.onDeleteError,
    onLegacySearchSuccess: options.onSearchSuccess,
    onLegacySearchError: options.onSearchError,
    legacySearchForm: options.searchForm
  }
}

function normalizeModernConfig(config: UseTableConfig): UseTableInternalConfig {
  const defaults = getUseTableDefaults()
  const currentKey = config.core.paginationKey?.current || defaults.paginationKey?.current || 'current'
  const sizeKey = config.core.paginationKey?.size || defaults.paginationKey?.size || 'size'

  const currentAliases = uniqueStrings([
    currentKey,
    ...(config.core.paginationAlias?.current || []),
    ...(defaults.paginationAlias?.current || []),
    ...DEFAULT_CURRENT_ALIASES
  ])

  const sizeAliases = uniqueStrings([
    sizeKey,
    ...(config.core.paginationAlias?.size || []),
    ...(defaults.paginationAlias?.size || []),
    ...DEFAULT_SIZE_ALIASES
  ])

  return {
    mode: 'modern',
    apiFn: config.core.apiFn,
    apiParams: config.core.apiParams || {},
    excludeParams: config.core.excludeParams || [],
    immediate: config.core.immediate !== false,
    paginationFlag: config.core.paginationFlag !== false,
    responseAdapter: config.transform?.responseAdapter || defaults.responseAdapter || defaultResponseAdapter,
    dataTransformer: config.transform?.dataTransformer,
    requestCurrentKey: currentKey,
    requestSizeKey: sizeKey,
    currentAliases,
    sizeAliases,
    enableCache: config.performance?.enableCache ?? false,
    cacheTime: config.performance?.cacheTime ?? 5 * 60 * 1000,
    debounceTime: config.performance?.debounceTime ?? 300,
    initialPagination: config.core.pagination || {},
    onSuccess: config.hooks?.onSuccess,
    onError: config.hooks?.onError,
    onCacheHit: config.hooks?.onCacheHit,
    resetFormCallback: config.hooks?.resetFormCallback,
    deleteApi: undefined,
    batchDeleteApi: undefined,
    deletePayloadBuilder: defaultDeletePayloadBuilder,
    batchDeletePayloadBuilder: defaultBatchDeletePayloadBuilder,
    deleteIdKey: 'id',
    onDeleteSuccess: undefined,
    onDeleteError: undefined,
    onLegacySearchSuccess: undefined,
    onLegacySearchError: undefined,
    legacySearchForm: undefined
  }
}

function cloneValue<T>(value: T): T {
  try {
    return structuredClone(value)
  } catch {
    return JSON.parse(JSON.stringify(value)) as T
  }
}

function pickFormInstance(formRef?: any) {
  if (!formRef) return null
  if (isRef(formRef)) {
    return formRef.value || null
  }
  return formRef
}

export function useTable(options: UseTableOptions | UseTableConfig, tableRef?: Ref<any>): UseTableReturn {
  const config = isModernConfig(options) ? normalizeModernConfig(options) : normalizeLegacyOptions(options)

  const loading = ref(false)
  const error = ref<any>(null)

  const dataList: Ref<any[]> = ref([])
  const selectedList: Ref<any[]> = ref([])
  const selectedNum: Ref<number> = ref(0)

  const pagination = reactive<PaginationConfig>({
    total: 0,
    pageSize: 10,
    currentPage: 1,
    background: true,
    pageSizes: [10, 20, 50, 100],
    layout: 'total, sizes, prev, pager, next, jumper',
    ...config.initialPagination
  })

  // 旧模式优先沿用外部 searchForm 对象，避免迁移期业务代码改写
  const searchParams = config.legacySearchForm || reactive<Record<string, any>>({ ...config.apiParams })

  const initialSearchSnapshot = cloneValue(searchParams)

  const requestCache = new Map<string, CacheEntry>()
  const cacheStatsTrigger = ref(0)

  const cacheInfo = computed<UseTableCacheInfo>(() => {
    void cacheStatsTrigger.value

    let totalSize = 0
    let totalHits = 0

    requestCache.forEach((entry) => {
      totalSize += entry.byteSize
      totalHits += entry.hitCount
    })

    const count = requestCache.size

    return {
      total: count,
      size: `${(totalSize / 1024).toFixed(2)} KB`,
      hitRate: count === 0 ? '0 avg hits' : `${(totalHits / count).toFixed(2)} avg hits`
    }
  })

  let requestToken = 0
  let canceledToken = 0

  const currentAliasKeys = uniqueStrings([config.requestCurrentKey, ...config.currentAliases])
  const sizeAliasKeys = uniqueStrings([config.requestSizeKey, ...config.sizeAliases])

  function syncPaginationToSearchParams(target = searchParams) {
    if (!target || typeof target !== 'object') return

    currentAliasKeys.forEach((key) => {
      target[key] = pagination.currentPage
    })

    sizeAliasKeys.forEach((key) => {
      target[key] = pagination.pageSize
    })
  }

  function stripPaginationKeys(params: Record<string, any>) {
    const stripped = { ...params }

    currentAliasKeys.forEach((key) => {
      delete stripped[key]
    })

    sizeAliasKeys.forEach((key) => {
      delete stripped[key]
    })

    return stripped
  }

  function buildRequestParams(params?: Record<string, any>): Record<string, any> {
    const merged = {
      ...config.apiParams,
      ...(searchParams || {}),
      ...(params || {})
    }

    if (config.paginationFlag) {
      currentAliasKeys.forEach((key) => {
        merged[key] = pagination.currentPage
      })

      sizeAliasKeys.forEach((key) => {
        merged[key] = pagination.pageSize
      })
    }

    config.excludeParams.forEach((key) => {
      delete merged[key]
    })

    return merged
  }

  function makeCacheKey(params: Record<string, any>) {
    return JSON.stringify(normalizeObject(params))
  }

  function makeQuerySignature(params: Record<string, any>) {
    return JSON.stringify(normalizeObject(stripPaginationKeys(params)))
  }

  function setCache(key: string, response: UseTableStandardResponse, querySignature: string) {
    if (!config.enableCache) return

    const entry: CacheEntry = {
      data: [...response.records],
      response: {
        ...response,
        records: [...response.records]
      },
      expiresAt: Date.now() + config.cacheTime,
      byteSize: getApproximateSize(response),
      hitCount: 0,
      querySignature
    }

    requestCache.set(key, entry)
    cacheStatsTrigger.value += 1
  }

  function getCache(key: string): CacheEntry | null {
    const item = requestCache.get(key)
    if (!item) return null

    if (Date.now() > item.expiresAt) {
      requestCache.delete(key)
      cacheStatsTrigger.value += 1
      return null
    }

    item.hitCount += 1
    cacheStatsTrigger.value += 1
    return item
  }

  function clearCache(strategy: CacheInvalidationStrategy = 'clear_all'): number {
    if (strategy === 'keep_all') return 0

    const before = requestCache.size
    if (before === 0) return 0

    if (strategy === 'clear_all') {
      requestCache.clear()
      cacheStatsTrigger.value += 1
      return before
    }

    const currentParams = buildRequestParams()
    const currentKey = makeCacheKey(currentParams)

    if (strategy === 'clear_current') {
      const removed = requestCache.delete(currentKey) ? 1 : 0
      if (removed > 0) {
        cacheStatsTrigger.value += 1
      }
      return removed
    }

    const currentSignature = makeQuerySignature(currentParams)
    let removed = 0

    Array.from(requestCache.entries()).forEach(([key, entry]) => {
      if (entry.querySignature === currentSignature) {
        requestCache.delete(key)
        removed += 1
      }
    })

    if (removed > 0) {
      cacheStatsTrigger.value += 1
    }

    return removed
  }

  function clearExpiredCache(): number {
    const now = Date.now()
    let removed = 0

    Array.from(requestCache.entries()).forEach(([key, entry]) => {
      if (entry.expiresAt <= now) {
        requestCache.delete(key)
        removed += 1
      }
    })

    if (removed > 0) {
      cacheStatsTrigger.value += 1
    }

    return removed
  }

  function applyResponse(response: UseTableStandardResponse) {
    const transformed = config.dataTransformer
      ? config.dataTransformer([...response.records])
      : response.records

    dataList.value = Array.isArray(transformed) ? transformed : []

    if (config.paginationFlag) {
      pagination.total = Number(response.total ?? dataList.value.length)

      if (response.currentPage != null && Number.isFinite(Number(response.currentPage))) {
        pagination.currentPage = Number(response.currentPage)
      }

      if (response.pageSize != null && Number.isFinite(Number(response.pageSize))) {
        pagination.pageSize = Number(response.pageSize)
      }

      syncPaginationToSearchParams()
    }
  }

  async function executeRequest(
    params?: Record<string, any>,
    options: { useCache?: boolean } = {}
  ): Promise<UseTableStandardResponse> {
    const token = ++requestToken
    loading.value = true
    error.value = null

    const requestParams = buildRequestParams(params)
    const key = makeCacheKey(requestParams)
    const querySignature = makeQuerySignature(requestParams)
    const shouldUseCache = options.useCache ?? config.enableCache

    if (shouldUseCache) {
      const cached = getCache(key)
      if (cached) {
        const response = {
          ...cached.response,
          records: [...cached.data]
        }

        applyResponse(response)
        config.onCacheHit?.(response.records, response)

        if (token === requestToken) {
          loading.value = false
        }

        return response
      }
    }

    try {
      const raw = await config.apiFn(requestParams)

      // 软取消：后发请求已经接管时，丢弃旧响应
      if (token <= canceledToken || token !== requestToken) {
        return {
          records: [],
          total: pagination.total,
          currentPage: pagination.currentPage,
          pageSize: pagination.pageSize,
          raw
        }
      }

      const normalized = config.responseAdapter(raw)
      const response: UseTableStandardResponse = {
        records: Array.isArray(normalized.records) ? normalized.records : [],
        total: Number(normalized.total ?? 0),
        currentPage:
          normalized.currentPage == null ? pagination.currentPage : Number(normalized.currentPage),
        pageSize: normalized.pageSize == null ? pagination.pageSize : Number(normalized.pageSize),
        raw
      }

      applyResponse(response)
      config.onSuccess?.(response.records, response)
      config.onLegacySearchSuccess?.(toRawRecord(raw).data)

      if (shouldUseCache) {
        setCache(key, response, querySignature)
      }

      return response
    } catch (err) {
      error.value = err
      dataList.value = []
      config.onError?.(err)
      config.onLegacySearchError?.(err)
      throw err
    } finally {
      if (token === requestToken) {
        loading.value = false
      }
    }
  }

  async function fetchData(params?: Record<string, any>): Promise<UseTableStandardResponse | void> {
    try {
      return await executeRequest(params, { useCache: config.enableCache })
    } catch {
      return Promise.resolve()
    }
  }

  async function getData(params?: Record<string, any>): Promise<UseTableStandardResponse | void> {
    pagination.currentPage = 1
    syncPaginationToSearchParams()
    clearCache('clear_pagination')

    try {
      return await executeRequest(params, { useCache: false })
    } catch {
      return Promise.resolve()
    }
  }

  const debouncedGetData = createDebounce((params?: Record<string, any>) => {
    void getData(params)
  }, config.debounceTime)

  function cancelDebouncedSearch() {
    debouncedGetData.cancel()
  }

  async function onSearch(resetPage = true): Promise<void> {
    if (resetPage) {
      pagination.currentPage = 1
    }

    syncPaginationToSearchParams()

    try {
      await executeRequest(undefined, { useCache: config.enableCache && !resetPage })
    } catch {
      // 兼容旧行为：错误通过回调处理，不中断页面
    }
  }

  async function onSearchFirst(): Promise<void> {
    await onSearch(true)
  }

  async function resetSearchParams(): Promise<void> {
    cancelDebouncedSearch()

    const currentKeys = Object.keys(searchParams)
    const initialKeys = Object.keys(initialSearchSnapshot)

    currentKeys.forEach((key) => {
      if (!initialKeys.includes(key)) {
        delete searchParams[key]
      }
    })

    initialKeys.forEach((key) => {
      searchParams[key] = cloneValue(initialSearchSnapshot[key])
    })

    pagination.currentPage = Number(config.initialPagination.currentPage ?? 1)
    pagination.pageSize = Number(config.initialPagination.pageSize ?? 10)

    syncPaginationToSearchParams()
    clearCache('clear_all')
    await onSearch(false)

    if (config.resetFormCallback) {
      await config.resetFormCallback()
    }
  }

  function resetForm(formRef?: any, clearKey = ''): void {
    const formInstance = pickFormInstance(formRef)
    formInstance?.resetFields?.()

    if (clearKey) {
      searchParams[clearKey] = ''
    }

    pagination.currentPage = 1
    syncPaginationToSearchParams()

    clearCache('clear_current')
    void onSearch(false)
  }

  function handleSelectionChange(selection: any[]): void {
    selectedList.value = selection
    selectedNum.value = selection.length

    if (tableRef?.value?.setAdaptive) {
      tableRef.value.setAdaptive()
    }
  }

  function onSelectionCancel(tableRefParam?: any): void {
    selectedNum.value = 0
    selectedList.value = []

    const table = tableRefParam || tableRef?.value
    const tableInstance = table?.getTableRef ? table.getTableRef() : table

    if (tableInstance?.clearSelection) {
      void tableInstance.clearSelection()
    } else if (tableInstance?.clearCheckboxRow) {
      void tableInstance.clearCheckboxRow()
    }
  }

  function isDeleteSuccess(response: any): boolean {
    const raw = toRawRecord(response)
    const code = raw.code
    return code == null || Number(code) === 200 || raw.success === true
  }

  function getDeleteId(input: any): string | number | undefined {
    if (typeof input === 'string' || typeof input === 'number') {
      return input
    }

    if (!input || typeof input !== 'object') {
      return undefined
    }

    const value = toRawRecord(input)[config.deleteIdKey]
    if (typeof value === 'string' || typeof value === 'number') {
      return value
    }

    return undefined
  }

  function getSelectedIds(rows: any[]): (string | number)[] {
    return rows
      .map((row) => getDeleteId(row))
      .filter((id): id is string | number => typeof id === 'string' || typeof id === 'number')
  }

  function buildDeletePayload(input: any): any {
    const payload = config.deletePayloadBuilder(input)
    return payload === undefined ? input : payload
  }

  function buildBatchDeletePayload(ids: (string | number)[], rows: any[]): any {
    const payload = config.batchDeletePayloadBuilder(ids, rows)
    return payload === undefined ? ids : payload
  }

  async function refreshSoft(): Promise<void> {
    clearCache('clear_current')
    await onSearch(false)
  }

  async function refreshData(): Promise<void> {
    cancelDebouncedSearch()
    clearCache('clear_all')
    await onSearch(false)
  }

  async function refreshCreate(): Promise<void> {
    cancelDebouncedSearch()
    pagination.currentPage = 1
    syncPaginationToSearchParams()
    clearCache('clear_pagination')
    await onSearch(false)
  }

  async function refreshUpdate(): Promise<void> {
    clearCache('clear_current')
    await onSearch(false)
  }

  async function refreshRemove(): Promise<void> {
    const originPage = pagination.currentPage

    clearCache('clear_pagination')
    await onSearch(false)

    const pageSize = Number(pagination.pageSize) > 0 ? Number(pagination.pageSize) : 10
    const total = Math.max(0, Number(pagination.total) || 0)
    const lastPage = Math.max(1, Math.ceil(total / pageSize))

    if (pagination.currentPage > lastPage) {
      pagination.currentPage = lastPage
      syncPaginationToSearchParams()
      await onSearch(false)
    }

    let fallbackGuard = Math.max(1, originPage)
    while (pagination.currentPage > 1 && dataList.value.length === 0 && fallbackGuard > 0) {
      fallbackGuard -= 1
      pagination.currentPage = Math.max(1, pagination.currentPage - 1)
      syncPaginationToSearchParams()
      await onSearch(false)
    }
  }

  async function deleteRow(input: any): Promise<void> {
    if (!config.deleteApi) {
      console.warn('deleteApi 未配置')
      return
    }

    try {
      const payload = buildDeletePayload(input)
      const response = await config.deleteApi(payload)
      const success = isDeleteSuccess(response)

      if (!success) {
        throw new Error(toRawRecord(response).message || '删除失败')
      }

      config.onDeleteSuccess?.()
      await refreshRemove()
    } catch (err) {
      config.onDeleteError?.(err)
    }
  }

  async function onDelete(payload: any): Promise<void> {
    await deleteRow(payload)
  }

  async function batchDelete(ids?: (string | number)[]): Promise<void> {
    const selectedRows = selectedList.value
    const deleteIds = ids || getSelectedIds(selectedRows)

    if (deleteIds.length === 0) {
      console.warn('没有可删除的数据')
      return
    }

    try {
      if (config.batchDeleteApi) {
        const payload = buildBatchDeletePayload(deleteIds, selectedRows)
        const response = await config.batchDeleteApi(payload)
        const success = isDeleteSuccess(response)

        if (!success) {
          throw new Error(toRawRecord(response).message || '批量删除失败')
        }
      } else if (config.deleteApi) {
        for (const id of deleteIds) {
          const row = selectedRows.find((item) => getDeleteId(item) === id)
          const payload = buildDeletePayload(row || id)
          const response = await config.deleteApi(payload)
          const success = isDeleteSuccess(response)

          if (!success) {
            throw new Error(toRawRecord(response).message || '批量删除失败')
          }
        }
      } else {
        console.warn('deleteApi/batchDeleteApi 均未配置')
        return
      }

      config.onDeleteSuccess?.()
      onSelectionCancel()
      await refreshRemove()
    } catch (err) {
      config.onDeleteError?.(err)
    }
  }

  const debouncedPaginationSearch = createDebounce((resetPage: boolean) => {
    void onSearch(resetPage)
  }, config.debounceTime)

  function handleSizeChange(size: number): void {
    if (!Number.isFinite(size) || size <= 0) return

    pagination.pageSize = size
    pagination.currentPage = 1
    syncPaginationToSearchParams()

    debouncedPaginationSearch.run(false)
  }

  function handleCurrentChange(page: number): void {
    if (!Number.isFinite(page) || page <= 0) return

    pagination.currentPage = page
    syncPaginationToSearchParams()

    debouncedPaginationSearch.run(false)
  }

  function cancelRequest(): void {
    canceledToken = requestToken
  }

  function clearData(): void {
    dataList.value = []
    selectedList.value = []
    selectedNum.value = 0
    error.value = null
    clearCache('clear_all')
  }

  async function refresh(): Promise<void> {
    await refreshSoft()
  }

  onMounted(() => {
    syncPaginationToSearchParams()

    if (config.immediate) {
      void onSearch(false)
    }
  })

  onUnmounted(() => {
    cancelDebouncedSearch()
    debouncedPaginationSearch.cancel()
    requestCache.clear()
    cacheStatsTrigger.value += 1
  })

  return {
    dataList,
    data: dataList,
    loading,
    error,
    searchParams,
    selectedList,
    selectedNum,
    pagination,
    onSearch,
    onSearchFirst,
    fetchData,
    getData,
    getDataDebounced: debouncedGetData.run,
    cancelDebouncedSearch,
    resetForm,
    resetSearchParams,
    handleSelectionChange,
    onSelectionCancel,
    deleteRow,
    batchDelete,
    onDelete,
    handleSizeChange,
    handleCurrentChange,
    refresh,
    refreshCreate,
    refreshUpdate,
    refreshRemove,
    refreshData,
    refreshSoft,
    cacheInfo,
    clearCache,
    clearExpiredCache,
    cancelRequest,
    clearData
  }
}

export default useTable
