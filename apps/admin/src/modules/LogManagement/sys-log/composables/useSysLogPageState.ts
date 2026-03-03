import { reactive, ref } from 'vue'
import { useTable } from '@one-base-template/core'
import { message } from '@/utils/message'
import sysLogColumns from '../columns'
import { sysLogApi, type SysLogRecord } from '../../api/sys-log'

type SearchRefExpose = {
  resetFields?: () => void
}

export function useSysLogPageState() {
  const tableRef = ref<unknown>(null)
  const searchRef = ref<SearchRefExpose>()

  const detailVisible = ref(false)
  const detailLoading = ref(false)
  const detailData = ref<SysLogRecord | null>(null)

  const searchForm = reactive({
    operator: '',
    clientIp: '',
    module: '',
    operationType: '',
    operationResult: '' as string | number,
    userAccount: '',
    nickName: '',
    browserName: '',
    clientOS: '',
    tenantId: '',
    time: [] as string[]
  })

  const tableOpt = reactive({
    query: {
      api: sysLogApi.list,
      params: searchForm,
      pagination: true
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
  } = useTable(tableOpt, tableRef)

  function tableSearch(keyword: string) {
    searchForm.operator = keyword
    void onSearch()
  }

  function onKeywordUpdate(keyword: string) {
    searchForm.operator = keyword
  }

  function onResetSearch() {
    resetForm(searchRef, 'operator')
  }

  async function openDetail(row: SysLogRecord) {
    detailVisible.value = true
    detailLoading.value = true

    try {
      const response = await sysLogApi.detail({ id: row.id })
      if (response.code !== 200) {
        throw new Error(response.message || '获取操作日志详情失败')
      }

      detailData.value = response.data
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '获取操作日志详情失败'
      message.error(errorMessage)
      detailVisible.value = false
    } finally {
      detailLoading.value = false
    }
  }

  async function handleDelete(row: SysLogRecord) {
    try {
      await obConfirm.warn(`是否确认删除操作人账号为${row.userAccount}的这条数据`, '删除确认')

      const response = await sysLogApi.remove({ idList: [row.id] })
      if (response.code !== 200) {
        throw new Error(response.message || '删除操作日志失败')
      }

      message.success('删除操作日志成功')
      await onSearch(false)
    } catch (error) {
      if (error === 'cancel' || error === 'close') return

      const errorMessage = error instanceof Error ? error.message : '删除操作日志失败'
      message.error(errorMessage)
    }
  }

  return {
    refs: {
      tableRef,
      searchRef
    },
    table: {
      loading,
      dataList,
      pagination,
      tableColumns: sysLogColumns,
      searchForm
    },
    detail: {
      detailVisible,
      detailLoading,
      detailData
    },
    actions: {
      tableSearch,
      onKeywordUpdate,
      onResetSearch,
      handleSizeChange,
      handleCurrentChange,
      openDetail,
      handleDelete
    }
  }
}
