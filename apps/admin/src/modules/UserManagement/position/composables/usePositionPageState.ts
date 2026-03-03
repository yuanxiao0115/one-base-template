import { computed, reactive, ref } from 'vue'
import { useCrudPage } from '@one-base-template/core'
import { message } from '@/utils/message'
import { positionColumns } from '../columns'
import {
  positionApi,
  type PositionRecord,
  type PositionSavePayload
} from '../api'
import {
  defaultPositionForm,
  toPositionForm,
  toPositionPayload,
  type PositionForm
} from '../form'
import {
  assertUniqueCheck,
  shouldCheckPositionUnique,
  toPositionUniqueSnapshot,
  type PositionUniqueSnapshot
} from '../../shared/unique'

type SearchRefExpose = {
  resetFields?: () => void
}

export function usePositionPageState() {
  const tableRef = ref<unknown>(null)
  const searchRef = ref<SearchRefExpose>()
  const editFormRef = ref()
  const positionUniqueSnapshot = ref<PositionUniqueSnapshot | null>(null)

  const searchForm = reactive({
    postName: ''
  })

  const tableOpt = reactive({
    query: {
      api: positionApi.page,
      params: searchForm,
      pagination: true
    },
    remove: {
      api: positionApi.removePost,
      deleteConfirm: {
        nameKey: 'postName',
        title: '删除确认',
        message: '是否确认删除职位「{name}」？'
      },
      onSuccess: () => {
        message.success('删除职位成功')
      },
      onError: (error: unknown) => {
        const errorMessage = error instanceof Error ? error.message : '删除职位失败'
        message.error(errorMessage)
      }
    }
  })

  const crudPage = useCrudPage<PositionForm, PositionRecord, PositionRecord, PositionSavePayload>({
    table: tableOpt,
    tableRef,
    editor: {
      entity: {
        name: '职位'
      },
      form: {
        create: () => ({ ...defaultPositionForm }),
        ref: editFormRef
      },
      detail: {
        beforeOpen: async ({ mode }) => {
          if (mode === 'create') {
            positionUniqueSnapshot.value = null
          }
        },
        load: async ({ row }) => row,
        mapToForm: ({ detail }) => {
          const mapped = toPositionForm(detail)
          positionUniqueSnapshot.value = toPositionUniqueSnapshot(mapped)
          return mapped
        }
      },
      save: {
        buildPayload: async ({ form }) => {
          const payload = toPositionPayload(form)
          const currentUnique = toPositionUniqueSnapshot(payload)

          if (shouldCheckPositionUnique(currentUnique, positionUniqueSnapshot.value)) {
            const response = await positionApi.checkUnique({
              id: payload.id,
              postName: payload.postName
            })
            const isUnique = assertUniqueCheck(response, '职位名称校验失败')
            if (!isUnique) {
              throw new Error('已存在相同职位名称')
            }
          }

          return payload
        },
        request: async ({ mode, payload }) => {
          const response = mode === 'create'
            ? await positionApi.addPost(payload)
            : await positionApi.updatePost(payload)

          if (response.code !== 200) {
            throw new Error(response.message || '保存职位失败')
          }
          return response
        },
        onSuccess: async ({ mode }) => {
          message.success(mode === 'create' ? '新增职位成功' : '更新职位成功')
        }
      }
    }
  })

  const {
    loading,
    dataList,
    pagination,
    onSearch,
    resetForm,
    handleSizeChange,
    handleCurrentChange
  } = crudPage.table

  const crud = crudPage.editor
  const { remove } = crudPage.actions

  const tableColumns = computed(() => positionColumns)
  const tablePagination = computed(() => ({
    ...pagination
  }))

  const crudVisible = crud.visible
  const crudMode = crud.mode
  const crudTitle = crud.title
  const crudReadonly = crud.readonly
  const crudSubmitting = crud.submitting
  const crudForm = crud.form

  function tableSearch(keyword: string) {
    searchForm.postName = keyword
    void onSearch()
  }

  function onKeywordUpdate(keyword: string) {
    searchForm.postName = keyword
  }

  function onResetSearch() {
    resetForm(searchRef, 'postName')
  }

  async function handleDelete(row: PositionRecord) {
    await remove(row)
  }

  return {
    refs: {
      tableRef,
      searchRef,
      editFormRef
    },
    table: {
      loading,
      dataList,
      tablePagination,
      tableColumns,
      searchForm
    },
    editor: {
      crud,
      crudVisible,
      crudMode,
      crudTitle,
      crudReadonly,
      crudSubmitting,
      crudForm
    },
    actions: {
      tableSearch,
      onKeywordUpdate,
      onResetSearch,
      handleSizeChange,
      handleCurrentChange,
      handleDelete
    }
  }
}
