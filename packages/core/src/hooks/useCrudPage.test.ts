import { mount } from '@vue/test-utils'
import { defineComponent, h } from 'vue'
import { describe, expect, it, vi } from 'vitest'
import { useCrudPage, type UseCrudPageReturn } from './useCrudPage'

function mountUseCrudPage(
  options: Parameters<typeof useCrudPage<Record<string, unknown>, { id: number }, { id: number }>>[0]
): { crudPage: UseCrudPageReturn<Record<string, unknown>, { id: number }, { id: number }, unknown>; unmount: () => void } {
  let crudPage: UseCrudPageReturn<Record<string, unknown>, { id: number }, { id: number }, unknown> | null = null

  const TestComponent = defineComponent({
    setup() {
      crudPage = useCrudPage<Record<string, unknown>, { id: number }, { id: number }>(options)
      return () => h('div')
    }
  })

  const wrapper = mount(TestComponent)

  if (!crudPage) {
    throw new Error('useCrudPage 挂载失败')
  }

  return {
    crudPage,
    unmount: () => {
      wrapper.unmount()
    }
  }
}

describe('useCrudPage', () => {
  it('save 后默认刷新当前页（current）', async () => {
    const queryApi = vi.fn(async (params: Record<string, unknown>) => ({
      code: 200,
      data: {
        records: [{ id: 1 }],
        total: 1,
        currentPage: Number(params.page || 1),
        pageSize: Number(params.size || 10)
      }
    }))

    const { crudPage, unmount } = mountUseCrudPage({
      table: {
        query: {
          api: queryApi,
          immediate: false
        }
      },
      editor: {
        entity: {
          name: '岗位'
        },
        form: {
          create: () => ({ name: '' })
        },
        save: {
          request: async () => ({})
        }
      }
    })

    crudPage.table.pagination.currentPage = 3
    await crudPage.editor.openCreate()
    await crudPage.actions.confirm()

    expect(queryApi).toHaveBeenCalledTimes(1)
    expect(queryApi.mock.calls[0]?.[0]).toMatchObject({ page: 3 })

    unmount()
  })

  it('refreshAfterSave=first 时保存后回到第一页', async () => {
    const queryApi = vi.fn(async (params: Record<string, unknown>) => ({
      code: 200,
      data: {
        records: [{ id: 1 }],
        total: 1,
        currentPage: Number(params.page || 1),
        pageSize: Number(params.size || 10)
      }
    }))

    const { crudPage, unmount } = mountUseCrudPage({
      table: {
        query: {
          api: queryApi,
          immediate: false
        }
      },
      editor: {
        entity: {
          name: '岗位'
        },
        form: {
          create: () => ({ name: '' })
        },
        save: {
          request: async () => ({})
        }
      },
      behavior: {
        refreshAfterSave: 'first'
      }
    })

    crudPage.table.pagination.currentPage = 5
    await crudPage.editor.openCreate()
    await crudPage.actions.confirm()

    expect(queryApi).toHaveBeenCalledTimes(1)
    expect(queryApi.mock.calls[0]?.[0]).toMatchObject({ page: 1 })

    unmount()
  })

  it('refreshAfterSave=none 时保存后不触发列表刷新', async () => {
    const queryApi = vi.fn(async () => ({
      code: 200,
      data: {
        records: [{ id: 1 }],
        total: 1
      }
    }))

    const { crudPage, unmount } = mountUseCrudPage({
      table: {
        query: {
          api: queryApi,
          immediate: false
        }
      },
      editor: {
        entity: {
          name: '岗位'
        },
        form: {
          create: () => ({ name: '' })
        },
        save: {
          request: async () => ({})
        }
      },
      behavior: {
        refreshAfterSave: 'none'
      }
    })

    await crudPage.editor.openCreate()
    await crudPage.actions.confirm()

    expect(queryApi).not.toHaveBeenCalled()

    unmount()
  })

  it('actions.remove 会透传到 table.deleteRow', async () => {
    const deleteApi = vi.fn(async () => ({ code: 200 }))

    const { crudPage, unmount } = mountUseCrudPage({
      table: {
        query: {
          api: async () => ({ code: 200, data: { records: [], total: 0 } }),
          immediate: false
        },
        remove: {
          api: deleteApi
        }
      },
      editor: {
        entity: {
          name: '岗位'
        },
        form: {
          create: () => ({ name: '' })
        }
      }
    })

    await crudPage.actions.remove({ id: 9 })

    expect(deleteApi).toHaveBeenCalledTimes(1)
    expect(deleteApi).toHaveBeenCalledWith({ id: 9 })

    unmount()
  })
})
