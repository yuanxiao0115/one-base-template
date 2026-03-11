<script setup lang="ts">
  import { ArrowLeft, Operation, RefreshRight } from "@element-plus/icons-vue";

  const props = defineProps<{
    title: string;
    templateId: string;
    loading?: boolean;
  }>();

  const emit = defineEmits<(e: "back" | "refresh" | "shell-settings") => void>();
</script>

<template>
  <header class="headbar">
    <el-button class="head-btn" size="small" :icon="ArrowLeft" @click="emit('back')">返回</el-button>
    <div class="head-title-wrap">
      <div class="head-title">{{ props.title || "门户配置工作台" }}</div>
      <div class="head-meta">ID {{ props.templateId || "-" }}</div>
    </div>
    <el-button
      class="head-btn"
      size="small"
      :icon="Operation"
      :disabled="!props.templateId"
      @click="emit('shell-settings')"
    >
      页眉页脚配置
    </el-button>
    <el-button class="head-btn" size="small" :icon="RefreshRight" :loading="Boolean(props.loading)" @click="emit('refresh')">
      刷新
    </el-button>
  </header>
</template>

<style scoped>
  .headbar {
    flex: none;
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 7px 14px;
    border-bottom: 1px solid #d8e0ea;
    background: #f2f5f9;
  }

  .head-title-wrap {
    flex: 1;
    min-width: 0;
  }

  .head-title {
    font-size: 14px;
    font-weight: 700;
    color: #1f2937;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .head-meta {
    margin-top: 1px;
    font-size: 11px;
    color: #6b7280;
  }

  .head-btn {
    flex: none;
    border-radius: 0;
  }

  @media (max-width: 640px) {
    .headbar {
      padding-left: 10px;
      padding-right: 10px;
    }

    .head-title {
      font-size: 13px;
    }
  }
</style>
