import { mount } from '@vue/test-utils'
import { defineComponent, h } from 'vue'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { getUseTableDefaults, setUseTableDefaults, useTable, type UseTableOptions, type UseTableReturn } from './index'

function createRows(total: number): Array<{ id: number }> {
  return Array.from({ length: total }, (_, index) => ({ id: index + 1 }))
}

function createSearchApi(dataset: { rows: Array<{ id: number }> }) {
  return vi.fn(async (params: Record<string, any>) => {
    const current = Number(params.page ?? params.current ?? params.currentPage ?? 1)
    const pageSize = Number(params.size ?? params.pageSize ?? 10)
    const start = (current - 1) * pageSize
    const records = dataset.rows.slice(start, start + pageSize)

    return {
      code: 200,
      data: {
        records,
        total: dataset.rows.length,
        currentPage: current,
        pageSize
      }
    }
  })
}

function mountUseTable(options: UseTableOptions): { table: UseTableReturn; unmount: () => void } {
  let table: UseTableReturn | null = null

  const TestComponent = defineComponent({
    setup() {
      table = useTable(
        {
          autoLoad: false,
          paginationFlag: true,
          ...options
        },
        undefined
      )

      return () => h('div')
    }
  })

  const wrapper = mount(TestComponent)

  if (!table) {
    throw new Error('useTable 挂载失败')
  }

  return {
    table,
    unmount: () => {
      wrapper.unmount()
    }
  }
}

describe('useTable 删除能力', () => {
  it('单删支持 row 入参与 deletePayloadBuilder', async () => {
    const dataset = { rows: createRows(3) }
    const searchApi = createSearchApi(dataset)
    const deleteApi = vi.fn(async () => ({ code: 200 }))

    const { table, unmount } = mountUseTable({
      searchApi,
      deleteApi,
      deletePayloadBuilder: (input: { id: number }) => ({ id: input.id, hard: true })
    })

    await table.deleteRow({ id: 3 })

    expect(deleteApi).toHaveBeenCalledTimes(1)
    expect(deleteApi).toHaveBeenCalledWith({ id: 3, hard: true })

    unmount()
  })

  it('批删优先使用 batchDeleteApi 与参数构造器', async () => {
    const dataset = { rows: createRows(5) }
    const searchApi = createSearchApi(dataset)
    const batchDeleteApi = vi.fn(async () => ({ code: 200 }))

    const { table, unmount } = mountUseTable({
      searchApi,
      batchDeleteApi,
      batchDeletePayloadBuilder: (ids, rows) => ({
        ids,
        rowCount: rows.length
      })
    })

    table.handleSelectionChange([{ id: 2 }, { id: 3 }])
    await table.batchDelete()

    expect(batchDeleteApi).toHaveBeenCalledTimes(1)
    expect(batchDeleteApi).toHaveBeenCalledWith({ ids: [2, 3], rowCount: 2 })
    expect(table.selectedNum.value).toBe(0)

    unmount()
  })

  it('批删在缺少 batchDeleteApi 时回退到 deleteApi 循环单删', async () => {
    const dataset = { rows: createRows(5) }
    const searchApi = createSearchApi(dataset)
    const deleteApi = vi.fn(async () => ({ code: 200 }))

    const { table, unmount } = mountUseTable({
      searchApi,
      deleteApi,
      deleteIdKey: 'postId',
      deletePayloadBuilder: (input: number | { postId: number }) => ({
        id: typeof input === 'number' ? input : input.postId
      })
    })

    table.handleSelectionChange([{ postId: 101 }, { postId: 102 }])
    await table.batchDelete()

    expect(deleteApi).toHaveBeenCalledTimes(2)
    expect(deleteApi).toHaveBeenNthCalledWith(1, { id: 101 })
    expect(deleteApi).toHaveBeenNthCalledWith(2, { id: 102 })

    unmount()
  })

  it('删除当前页最后一条后会回退到上一有效页', async () => {
    const dataset = { rows: createRows(11) }
    const searchApi = createSearchApi(dataset)
    const deleteApi = vi.fn(async (payload: { id: number }) => {
      dataset.rows = dataset.rows.filter((item) => item.id !== payload.id)
      return { code: 200 }
    })

    const { table, unmount } = mountUseTable({
      searchApi,
      deleteApi,
      deletePayloadBuilder: (row: { id: number }) => ({ id: row.id })
    })

    table.pagination.pageSize = 10
    table.pagination.currentPage = 2
    await table.onSearch(false)

    expect(table.dataList.value).toHaveLength(1)
    expect(table.pagination.currentPage).toBe(2)

    await table.deleteRow({ id: 11 })

    expect(table.pagination.currentPage).toBe(1)
    expect(table.dataList.value).toHaveLength(10)
    expect(table.pagination.total).toBe(10)

    unmount()
  })

  it('批量删除后可跨级回退到最后有效页', async () => {
    const dataset = { rows: createRows(101) }
    const searchApi = createSearchApi(dataset)
    const batchDeleteApi = vi.fn(async (payload: { ids: number[] }) => {
      const removeSet = new Set(payload.ids)
      dataset.rows = dataset.rows.filter((item) => !removeSet.has(item.id))
      return { code: 200 }
    })

    const { table, unmount } = mountUseTable({
      searchApi,
      batchDeleteApi,
      batchDeletePayloadBuilder: (ids) => ({ ids })
    })

    table.pagination.pageSize = 10
    table.pagination.currentPage = 11
    await table.onSearch(false)

    const removeIds = Array.from({ length: 100 }, (_, index) => index + 2)
    await table.batchDelete(removeIds)

    expect(table.pagination.currentPage).toBe(1)
    expect(table.dataList.value).toEqual([{ id: 1 }])
    expect(table.pagination.total).toBe(1)

    unmount()
  })

  it('全量删除后停在第一页且列表为空', async () => {
    const dataset = { rows: createRows(3) }
    const searchApi = createSearchApi(dataset)
    const batchDeleteApi = vi.fn(async (payload: { ids: number[] }) => {
      const removeSet = new Set(payload.ids)
      dataset.rows = dataset.rows.filter((item) => !removeSet.has(item.id))
      return { code: 200 }
    })

    const { table, unmount } = mountUseTable({
      searchApi,
      batchDeleteApi,
      batchDeletePayloadBuilder: (ids) => ({ ids })
    })

    await table.onSearch(false)
    await table.batchDelete([1, 2, 3])

    expect(table.pagination.currentPage).toBe(1)
    expect(table.pagination.total).toBe(0)
    expect(table.dataList.value).toEqual([])

    unmount()
  })

  it('删除失败时触发 onDeleteError 且不刷新分页状态', async () => {
    const dataset = { rows: createRows(11) }
    const searchApi = createSearchApi(dataset)
    const onDeleteError = vi.fn()
    const deleteApi = vi.fn(async () => ({ code: 500, message: '删除失败' }))

    const { table, unmount } = mountUseTable({
      searchApi,
      deleteApi,
      onDeleteError
    })

    table.pagination.pageSize = 10
    table.pagination.currentPage = 2
    await table.onSearch(false)

    await table.deleteRow(11)

    expect(onDeleteError).toHaveBeenCalledTimes(1)
    expect(table.pagination.currentPage).toBe(2)
    expect(table.dataList.value).toEqual([{ id: 11 }])

    unmount()
  })
})

describe('useTable 配置兼容', () => {
  afterEach(() => {
    setUseTableDefaults()
  })

  it('支持通过全局默认配置覆盖分页参数字段', async () => {
    setUseTableDefaults({
      paginationKey: {
        current: 'currentPage',
        size: 'pageSize'
      }
    })

    const searchApi = vi.fn(async (params: Record<string, any>) => {
      void params
      return {
        code: 200,
        data: {
          records: [{ id: 1 }],
          total: 1
        }
      }
    })

    const { table, unmount } = mountUseTable({
      searchApi
    })

    table.pagination.currentPage = 3
    table.pagination.pageSize = 50
    await table.onSearch(false)

    expect(searchApi).toHaveBeenCalledTimes(1)
    expect(searchApi.mock.calls[0]?.[0]).toMatchObject({
      currentPage: 3,
      pageSize: 50
    })

    unmount()
  })

  it('支持通过全局默认 responseAdapter 适配返回结构', async () => {
    setUseTableDefaults({
      responseAdapter: (response) => ({
        records: response?.payload?.rows || [],
        total: Number(response?.payload?.totalElements || 0)
      })
    })

    const { table, unmount } = mountUseTable({
      searchApi: async () => ({
        payload: {
          rows: [{ id: 7 }, { id: 8 }],
          totalElements: 2
        }
      })
    })

    await table.onSearch(false)

    expect(table.dataList.value).toEqual([{ id: 7 }, { id: 8 }])
    expect(table.pagination.total).toBe(2)

    unmount()
  })

  it('局部配置优先级高于全局默认配置', async () => {
    setUseTableDefaults({
      paginationKey: {
        current: 'currentPage',
        size: 'pageSize'
      }
    })

    const searchApi = vi.fn(async (params: Record<string, any>) => {
      void params
      return {
        code: 200,
        data: {
          list: [],
          totalCount: 0
        }
      }
    })

    const { table, unmount } = mountUseTable({
      searchApi,
      paginationKey: {
        current: 'pageNum',
        size: 'pageSizeNum'
      }
    })

    await table.onSearch(false)

    expect(searchApi.mock.calls[0]?.[0]).toMatchObject({
      pageNum: 1,
      pageSizeNum: 10
    })

    const defaults = getUseTableDefaults()
    expect(defaults.paginationKey?.current).toBe('currentPage')

    unmount()
  })
})
