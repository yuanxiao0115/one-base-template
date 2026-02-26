<script setup lang="ts">
import { computed, ref } from 'vue';
import { PageContainer } from '@one-base-template/ui';

defineOptions({
  name: 'DemoPageContainer'
});

type OverflowMode = 'auto' | 'scroll' | 'hidden';

const keyword = ref('');
const overflowMode = ref<OverflowMode>('auto');

const overflowOptions: Array<{ label: string; value: OverflowMode }> = [
  { label: 'auto（默认）', value: 'auto' },
  { label: 'scroll（总是滚动条）', value: 'scroll' },
  { label: 'hidden（禁用滚动）', value: 'hidden' }
];

const records = Array.from({ length: 48 }, (_, index) => {
  const id = index + 1;
  return {
    id,
    title: `业务卡片 ${id}`,
    description: `这是第 ${id} 条演示数据，用于观察 PageContainer 在内容超高时的内部滚动表现。`
  };
});

const filteredRecords = computed(() => {
  const term = keyword.value.trim();
  if (!term) return records;
  return records.filter((item) => item.title.includes(term) || item.description.includes(term));
});
</script>

<template>
  <PageContainer :overflow="overflowMode" padding="16px">
    <template #header>
      <div class="ob-page-demo__header">
        <el-card shadow="never">
          <div class="font-medium">PageContainer Demo</div>
          <p class="mt-2 text-sm text-[var(--el-text-color-regular)]">
            当前页面演示“外层撑满 + 内层滚动”能力：顶部筛选区与底部操作区固定，中间列表独立滚动。
          </p>
          <div class="mt-3 flex flex-wrap gap-3">
            <el-input
              v-model="keyword"
              clearable
              class="w-[280px]"
              placeholder="输入关键字过滤内容，例如：12"
            />
            <el-select v-model="overflowMode" class="w-[240px]">
              <el-option
                v-for="option in overflowOptions"
                :key="option.value"
                :label="option.label"
                :value="option.value"
              />
            </el-select>
          </div>
        </el-card>
      </div>
    </template>

    <div class="space-y-3">
      <el-card v-for="item in filteredRecords" :key="item.id" shadow="hover">
        <template #header>
          <div class="font-medium">{{ item.title }}</div>
        </template>
        <p class="text-sm text-[var(--el-text-color-regular)]">{{ item.description }}</p>
      </el-card>
    </div>

    <template #footer>
      <div class="ob-page-demo__footer">
        <span class="text-sm text-[var(--el-text-color-secondary)]">
          当前展示 {{ filteredRecords.length }} / {{ records.length }} 条
        </span>
        <el-tag size="small" type="info">容器滚动由 PageContainer 控制</el-tag>
      </div>
    </template>
  </PageContainer>
</template>

<style scoped>
.ob-page-demo__header {
  padding: 16px 16px 0;
}

.ob-page-demo__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 16px;
  border-top: 1px solid var(--el-border-color-light);
  background: var(--el-bg-color);
}
</style>
