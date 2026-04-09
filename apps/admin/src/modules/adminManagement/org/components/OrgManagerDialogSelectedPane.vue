<script setup lang="ts">
import type { SelectedUser } from './org-manager-dialog.types';

defineProps<{
  selectedUsers: SelectedUser[];
}>();

const emit = defineEmits<{
  (event: 'clear'): void;
  (event: 'remove', userId: string): void;
}>();

function onClear() {
  emit('clear');
}

function onRemove(userId: string) {
  emit('remove', userId);
}
</script>

<template>
  <div class="org-manager-dialog__right">
    <div class="org-manager-dialog__selected-head">
      <span>已选择 {{ selectedUsers.length }} 个联系人</span>
      <el-button link type="primary" @click="onClear">清空</el-button>
    </div>

    <div class="org-manager-dialog__selected-list">
      <div
        v-for="user in selectedUsers"
        :key="`${user.userId}-${user.uniqueId}`"
        class="org-manager-dialog__selected-item"
      >
        <div class="org-manager-dialog__selected-text">
          <span>{{ user.nickName }}</span>
          <span class="org-manager-dialog__selected-phone">{{
            user.phone ? `(${user.phone})` : ''
          }}</span>
        </div>
        <el-button link type="danger" @click="onRemove(user.userId)">移除</el-button>
      </div>

      <el-empty v-if="selectedUsers.length === 0" description="未选择人员" :image-size="80" />
    </div>
  </div>
</template>

<style scoped>
.org-manager-dialog__right {
  display: flex;
  flex-direction: column;
  min-height: 520px;
}

.org-manager-dialog__selected-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border-bottom: 1px solid var(--el-border-color-lighter);
  color: var(--el-text-color-secondary);
  font-size: 13px;
}

.org-manager-dialog__selected-list {
  flex: 1;
  overflow-y: auto;
}

.org-manager-dialog__selected-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 44px;
  padding: 0 16px;
  border-bottom: 1px solid var(--el-border-color-extra-light);
}

.org-manager-dialog__selected-text {
  display: flex;
  align-items: center;
  gap: 4px;
}

.org-manager-dialog__selected-phone {
  color: var(--el-text-color-secondary);
}
</style>
