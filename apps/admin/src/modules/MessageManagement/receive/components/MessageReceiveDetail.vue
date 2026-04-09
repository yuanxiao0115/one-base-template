<script setup lang="ts">
import type { MessageReceiveRecord } from '../types';

const props = withDefaults(
  defineProps<{
    detail?: MessageReceiveRecord | null;
    loading?: boolean;
  }>(),
  {
    detail: null,
    loading: false
  }
);
</script>

<template>
  <el-skeleton v-if="props.loading" animated :rows="8" />
  <div v-else class="message-receive-detail">
    <el-descriptions :column="2" border>
      <el-descriptions-item label="消息标题">{{
        props.detail?.title || '--'
      }}</el-descriptions-item>
      <el-descriptions-item label="发送人">{{
        props.detail?.senderName || props.detail?.sender || '--'
      }}</el-descriptions-item>
      <el-descriptions-item label="消息分类">{{
        props.detail?.cateName || '--'
      }}</el-descriptions-item>
      <el-descriptions-item label="创建时间">{{
        props.detail?.createTime || '--'
      }}</el-descriptions-item>
      <el-descriptions-item label="阅读时间">{{
        props.detail?.readTime || '--'
      }}</el-descriptions-item>
      <el-descriptions-item label="重要标记">{{
        props.detail?.important === 1 ? '是' : '否'
      }}</el-descriptions-item>
    </el-descriptions>

    <el-divider content-position="left">消息正文</el-divider>
    <div class="message-receive-detail__content">{{ props.detail?.content || '--' }}</div>
  </div>
</template>

<style scoped>
.message-receive-detail__content {
  min-height: 120px;
  padding: 12px 14px;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
  white-space: pre-wrap;
  line-height: 1.75;
}
</style>
