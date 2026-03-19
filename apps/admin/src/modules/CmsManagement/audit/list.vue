<script setup lang="ts">
import { ref } from 'vue';
import ArticleAuditPanel from './components/ArticleAuditPanel.vue';
import CommentAuditPanel from './components/CommentAuditPanel.vue';

type AuditTabName = 'article' | 'comment';

defineOptions({
  name: 'CmsAuditManagementPage'
});

const activeTab = ref<AuditTabName>('article');
</script>

<template>
  <ObPageContainer padding="0" overflow="hidden">
    <el-tabs v-model="activeTab" class="cms-audit-page__tabs">
      <el-tab-pane label="文章" name="article" lazy>
        <ArticleAuditPanel class="cms-audit-page__panel" />
      </el-tab-pane>
      <el-tab-pane label="评论" name="comment" lazy>
        <CommentAuditPanel class="cms-audit-page__panel" />
      </el-tab-pane>
    </el-tabs>
  </ObPageContainer>
</template>

<style scoped>
.cms-audit-page__tabs {
  display: flex;
  flex: 1;
  min-height: 0;
  flex-direction: column;
  background: var(--el-bg-color);
}

.cms-audit-page__tabs :deep(.el-tabs__header) {
  margin-bottom: 0;
  padding: 0 16px;
  background: #fff;
}

.cms-audit-page__tabs :deep(.el-tabs__content) {
  display: flex;
  flex: 1;
  min-height: 0;
}

.cms-audit-page__tabs :deep(.el-tab-pane) {
  display: flex;
  flex: 1;
  min-height: 0;
}

.cms-audit-page__panel {
  flex: 1;
  min-height: 0;
}
</style>
