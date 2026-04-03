<script setup lang="ts">
import { ref } from 'vue';
import { Plus } from '@element-plus/icons-vue';
import demoUserColumns from './columns';
import type { DemoUserRecord } from './types';

defineOptions({
  name: 'DemoManagementUserListPage'
});

const keyword = ref('');
const loading = ref(false);
const dataList = ref<DemoUserRecord[]>([]);

function handleSearch(nextKeyword: string) {
  keyword.value = nextKeyword;
}

function handleCreate() {
  // 模板占位：后续按业务接入 ObCrudContainer + 表单提交流程。
}
</script>

<template>
  <ObPageContainer padding="0" overflow="hidden">
    <ObTableBox
      :columns="demoUserColumns"
      :keyword="keyword"
      placeholder="请输入关键字搜索"
      @search="handleSearch"
      @update:keyword="handleSearch"
    >
      <template #buttons>
        <el-button type="primary" :icon="Plus" @click="handleCreate">新增</el-button>
      </template>

      <template #default="{ size, dynamicColumns }">
        <ObTable
          :size="size"
          :loading="loading"
          :data="dataList"
          :columns="dynamicColumns"
          :pagination="false"
        />
      </template>
    </ObTableBox>
  </ObPageContainer>
</template>
