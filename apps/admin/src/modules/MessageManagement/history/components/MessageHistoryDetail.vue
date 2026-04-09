<script setup lang="ts">
import type { MessageHistoryRecord } from '../types';

const props = withDefaults(
  defineProps<{
    detail?: MessageHistoryRecord | null;
    loading?: boolean;
  }>(),
  {
    detail: null,
    loading: false
  }
);

function getSendTypeLabel(sendType?: number) {
  if (sendType === 0) {
    return '定时发送';
  }
  if (sendType === 2) {
    return '周期发送';
  }
  return '立即发送';
}
</script>

<template>
  <el-skeleton v-if="props.loading" animated :rows="8" />
  <div v-else class="message-history-detail">
    <el-descriptions :column="2" border>
      <el-descriptions-item label="消息标题">{{
        props.detail?.title || '--'
      }}</el-descriptions-item>
      <el-descriptions-item label="发送类型">{{
        getSendTypeLabel(props.detail?.sendType)
      }}</el-descriptions-item>
      <el-descriptions-item label="消息分类">{{
        props.detail?.cateName || '--'
      }}</el-descriptions-item>
      <el-descriptions-item label="发送人">{{ props.detail?.sender || '--' }}</el-descriptions-item>
      <el-descriptions-item label="创建时间">{{
        props.detail?.createTime || '--'
      }}</el-descriptions-item>
      <el-descriptions-item label="状态">{{
        props.detail?.status === 1 ? '已发送' : '未发送'
      }}</el-descriptions-item>
    </el-descriptions>

    <el-divider content-position="left">消息正文</el-divider>
    <div class="message-history-detail__content">{{ props.detail?.content || '--' }}</div>
  </div>
</template>

<style scoped>
.message-history-detail__content {
  min-height: 120px;
  padding: 12px 14px;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
  white-space: pre-wrap;
  line-height: 1.75;
}
</style>
