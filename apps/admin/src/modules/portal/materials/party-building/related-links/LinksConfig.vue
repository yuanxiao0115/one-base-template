<template>
  <div class="links-config">
    <div
      v-for="(link, index) in modelValue?.links || []"
      :key="link.id || index"
      class="link-config"
    >
      <el-card class="link-item-card">
        <div class="link-header">
          <span>链接 #{{ index + 1 }}</span>
          <el-button
            type="danger"
            size="small"
            :icon="Delete"
            circle
            @click="removeLink(index)"
          />
        </div>
        <el-form-item label="标题">
          <el-input v-model="link.title" placeholder="请输入链接标题" />
        </el-form-item>
        <el-form-item label="URL">
          <el-input v-model="link.url" placeholder="请输入链接地址" />
        </el-form-item>
      </el-card>
    </div>

    <div v-if="(modelValue?.links?.length || 0) === 0" class="empty-links">
      <el-empty description="暂无链接" />
    </div>

    <el-button type="primary" :icon="Plus" class="add-link-btn" @click="addLink">
      添加链接
    </el-button>
  </div>
</template>

<script setup lang="ts">
import { Delete, Plus } from '@element-plus/icons-vue';

export interface LinkItem {
  title: string;
  url: string;
  id: string;
}

export interface LinksConfigModelType {
  links: LinkItem[];
}

// 使用defineModel
const modelValue = defineModel<LinksConfigModelType>({
  default: () => ({ links: [] }) // 提供默认值，确保modelValue.links始终是数组
});

// 生成随机ID
const generateId = () => {
  return Math.random().toString(36).substring(2, 15);
};

// 添加新链接 - 直接修改modelValue.links
const addLink = () => {
  if (!modelValue.value) {
    modelValue.value = { links: [] };
  }

  if (!modelValue.value.links) {
    modelValue.value.links = [];
  }

  // 使用解构创建新数组来触发响应式更新
  modelValue.value = {
    ...modelValue.value,
    links: [
      ...modelValue.value.links,
      {
        title: '',
        url: '',
        id: generateId()
      }
    ]
  };
};

// 删除链接 - 直接修改modelValue.links
const removeLink = (index: number) => {
  if (!modelValue.value || !modelValue.value.links) return;

  // 使用解构和filter创建新数组来触发响应式更新
  modelValue.value = {
    ...modelValue.value,
    links: modelValue.value.links.filter((_, i) => i !== index)
  };
};

defineOptions({
  name: 'pb-links-config'
});
</script>

<style scoped>
.links-config {
  --config-border: #e2e8f0;
  --config-surface: #f8fafc;
  --config-surface-strong: #fff;
  --config-text: #0f172a;
  --config-muted: #64748b;

  display: flex;
  flex-direction: column;
  gap: 12px;
}

.links-config :deep(.el-form-item__label) {
  font-weight: 500;
  color: var(--config-muted);
}

.link-config {
  margin-bottom: 0;
}

.link-item-card {
  margin-bottom: 0;
  border: 1px solid var(--config-border);
  border-radius: 8px;
  background: var(--config-surface-strong);
  box-shadow: none;
}

.link-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  font-weight: 600;
  color: var(--config-text);
}

.empty-links {
  margin: 20px 0;
  padding: 8px 0;
}

.add-link-btn {
  border-radius: 6px;
  width: 100%;
}
</style>
