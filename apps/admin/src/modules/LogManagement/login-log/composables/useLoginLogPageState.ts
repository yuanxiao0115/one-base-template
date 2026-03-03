import { onMounted, reactive, ref } from 'vue'
import { useTable } from '@one-base-template/core'
import { message } from '@/utils/message'
import loginLogColumns from '../columns'
import {
  loginLogApi,
  type ClientTypeOption,
  type LoginLogRecord
} from '../../api/login-log'

type SearchRefExpose = {
  resetFields?: () => void
}

export function useLoginLogPageState() {
  const tableRef = ref<unknown>(null)
  const searchRef = ref<SearchRefExpose>()

  const detailVisible = ref(false)
  const detailLoading = ref(false)
  const detailData = ref<LoginLogRecord | null>(null)

  const clientTypeList = ref<ClientTypeOption[]>([])

  const searchForm = reactive({
    nickName: '',
    clientType: '',
    time: [] as string[]
  })

  const tableOpt = reactive({
    query: {
      api: loginLogApi.list,
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
    searchForm.nickName = keyword
    void onSearch()
  }

  function onKeywordUpdate(keyword: string) {
    searchForm.nickName = keyword
  }

  function onResetSearch() {
    resetForm(searchRef, 'nickName')
  }

  async function openDetail(row: LoginLogRecord) {
    detailVisible.value = true
    detailLoading.value = true

    try {
      const response = await loginLogApi.detail({ id: row.id })
      if (response.code !== 200) {
        throw new Error(response.message || '获取登录日志详情失败')
      }

      detailData.value = response.data
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '获取登录日志详情失败'
      message.error(errorMessage)
      detailVisible.value = false
    } finally {
      detailLoading.value = false
    }
  }

  async function handleDelete(row: LoginLogRecord) {
    try {
      await obConfirm.warn(`是否确认删除登录账号为${row.userAccount}的这条数据`, '删除确认')

      const response = await loginLogApi.remove({ idList: [row.id] })
      if (response.code !== 200) {
        throw new Error(response.message || '删除登录日志失败')
      }

      message.success('删除登录日志成功')
      await onSearch(false)
    } catch (error) {
      if (error === 'cancel' || error === 'close') return

      const errorMessage = error instanceof Error ? error.message : '删除登录日志失败'
      message.error(errorMessage)
    }
  }

  async function loadClientTypes() {
    try {
      const response = await loginLogApi.getEnum()
      if (response.code !== 200) {
        throw new Error(response.message || '获取客户端类型失败')
      }

      clientTypeList.value = response.data
    } catch {
      clientTypeList.value = []
    }
  }

  onMounted(() => {
    void loadClientTypes()
  })

  return {
    refs: {
      tableRef,
      searchRef
    },
    table: {
      loading,
      dataList,
      pagination,
      tableColumns: loginLogColumns,
      searchForm,
      clientTypeList
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
