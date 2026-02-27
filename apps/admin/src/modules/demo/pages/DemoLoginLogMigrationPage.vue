<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { OneTableBar } from '@/components/OneTableBar'
import { useTable } from '@/hooks/table'
import { confirm } from '@/infra/confirm'
import { PageContainer, VxeTable as ObVxeTable } from '@one-base-template/ui'
import type { TablePagination } from '@one-base-template/ui'
import { columns } from '../login-log/columns'
import { loginLogApi, type ClientTypeOption, type LoginLogRecord } from '../login-log/api'

defineOptions({
  name: 'DemoLoginLogMigrationPage'
})

const tableRef = ref<unknown>(null)
const searchRef = ref()

const clientTypeList = ref<ClientTypeOption[]>([])

const detailVisible = ref(false)
const detailLoading = ref(false)
const detailData = ref<LoginLogRecord | null>(null)

const searchForm = reactive({
  nickName: '',
  clientType: '',
  startTime: '',
  endTime: '',
  time: [] as string[]
})

const tableOpt = reactive({
  searchApi: loginLogApi.list,
  searchForm,
  paginationFlag: true
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

const tablePagination = computed<TablePagination>(() => ({
  total: pagination.total,
  pageSize: pagination.pageSize,
  currentPage: pagination.currentPage,
  background: pagination.background,
  pageSizes: pagination.pageSizes,
  layout: pagination.layout,
  small: pagination.small
}))

function syncRangeToParams() {
  if (Array.isArray(searchForm.time) && searchForm.time.length === 2) {
    searchForm.startTime = searchForm.time[0] || ''
    searchForm.endTime = searchForm.time[1] || ''
    return
  }

  searchForm.startTime = ''
  searchForm.endTime = ''
}

function tableSearch(keyword: string) {
  searchForm.nickName = keyword
  syncRangeToParams()
  void onSearch()
}

function onKeywordUpdate(keyword: string) {
  searchForm.nickName = keyword
}

function onResetSearch() {
  resetForm(searchRef, 'nickName')
}

async function handleOperate(row: LoginLogRecord) {
  detailVisible.value = true
  detailLoading.value = true

  try {
    const response = await loginLogApi.detail({ id: row.id })
    if (response.code === 200) {
      detailData.value = response.data
      return
    }

    throw new Error(response.message || '获取详情失败')
  } catch (error) {
    const message = error instanceof Error ? error.message : '获取详情失败'
    ElMessage.error(message)
    detailVisible.value = false
  } finally {
    detailLoading.value = false
  }
}

async function handleDelete(row: LoginLogRecord) {
  try {
    await confirm.warn(`是否确认删除登录账号为 ${row.userAccount} 的这条数据？`, '删除确认')

    const response = await loginLogApi.delete({ idList: [row.id] })
    if (response.code === 200) {
      ElMessage.success('删除成功')
      await onSearch(false)
      return
    }

    throw new Error(response.message || '删除失败')
  } catch (error) {
    if (error === 'cancel') return

    const message = error instanceof Error ? error.message : '删除失败'
    ElMessage.error(message)
  }
}

onMounted(async () => {
  try {
    const response = await loginLogApi.getEnum()
    if (response.code === 200 && Array.isArray(response.data)) {
      clientTypeList.value = response.data
    }
  } catch {
    clientTypeList.value = []
  }
})
</script>

<template>
  <div class="demo-login-log-page">
    <PageContainer padding="0" overflow="hidden">
      <OneTableBar
        title="登录日志"
        :columns="columns"
        placeholder="请输入登录人姓名"
        :keyword="searchForm.nickName"
        @search="tableSearch"
        @update:keyword="onKeywordUpdate"
        @reset-form="onResetSearch"
      >
        <template #default="{ size, dynamicColumns }">
          <ObVxeTable
            ref="tableRef"
            :loading="loading"
            :size="size"
            :data="dataList"
            :columns="dynamicColumns"
            :pagination="tablePagination"
            @page-size-change="handleSizeChange"
            @page-current-change="handleCurrentChange"
          >
            <template #action="{ row }">
              <div class="flex items-center gap-3">
                <el-button link type="primary" :size="size" @click="handleOperate(row)">
                  查看
                </el-button>
                <el-button link type="danger" :size="size" @click="handleDelete(row)">
                  删除
                </el-button>
              </div>
            </template>
          </ObVxeTable>
        </template>

        <template #drawer>
          <el-form ref="searchRef" label-position="top" :model="searchForm" class="demo-login-log-page__drawer">
            <el-form-item label="客户端类型" prop="clientType">
              <el-select
                v-model="searchForm.clientType"
                placeholder="请选择客户端类型"
                clearable
                class="w-full"
              >
                <el-option
                  v-for="item in clientTypeList"
                  :key="item.key"
                  :label="item.value"
                  :value="item.key"
                />
              </el-select>
            </el-form-item>

            <el-form-item label="时间范围" prop="time">
              <el-date-picker
                v-model="searchForm.time"
                type="daterange"
                value-format="YYYY-MM-DD"
                range-separator="至"
                start-placeholder="开始时间"
                end-placeholder="结束时间"
                class="w-full"
              />
            </el-form-item>
          </el-form>
        </template>
      </OneTableBar>
    </PageContainer>

    <el-drawer v-model="detailVisible" title="日志详情" :size="520" append-to-body>
      <el-skeleton v-if="detailLoading" :rows="6" animated />
      <el-descriptions v-else-if="detailData" :column="1" border>
        <el-descriptions-item label="登录账号">{{ detailData.userAccount }}</el-descriptions-item>
        <el-descriptions-item label="用户姓名">{{ detailData.nickName }}</el-descriptions-item>
        <el-descriptions-item label="客户端类型">{{ detailData.clientTypeLabel }}</el-descriptions-item>
        <el-descriptions-item label="客户端 IP">{{ detailData.clientIp }}</el-descriptions-item>
        <el-descriptions-item label="登录地点">{{ detailData.location }}</el-descriptions-item>
        <el-descriptions-item label="浏览器">{{ detailData.browserName }}</el-descriptions-item>
        <el-descriptions-item label="浏览器版本">{{ detailData.browserVersion }}</el-descriptions-item>
        <el-descriptions-item label="客户端系统">{{ detailData.clientOS }}</el-descriptions-item>
        <el-descriptions-item label="登录时间">{{ detailData.createTime }}</el-descriptions-item>
      </el-descriptions>
      <el-empty v-else description="暂无详情" />
    </el-drawer>
  </div>
</template>

<style scoped>
.demo-login-log-page {
  height: 100%;
}

.demo-login-log-page__drawer {
  width: 100%;
}
</style>
