<script setup lang="ts">
  import type { LoginLogRecord } from "../../api/login-log";

  const props = defineProps<{
    detail: LoginLogRecord | null;
  }>();
</script>

<template>
  <el-descriptions v-if="props.detail" :column="1" border>
    <el-descriptions-item label="登录账号">{{ props.detail.userAccount }}</el-descriptions-item>
    <el-descriptions-item label="用户姓名">{{ props.detail.nickName }}</el-descriptions-item>
    <el-descriptions-item label="客户端类型">{{ props.detail.clientTypeLabel }}</el-descriptions-item>
    <el-descriptions-item label="登录IP">{{ props.detail.clientIp }}</el-descriptions-item>
    <el-descriptions-item label="登录地点">{{ props.detail.location }}</el-descriptions-item>
    <el-descriptions-item label="浏览器">{{ props.detail.browserName }}</el-descriptions-item>
    <el-descriptions-item label="浏览器版本">{{ props.detail.browserVersion }}</el-descriptions-item>
    <el-descriptions-item label="客户端系统">{{ props.detail.clientOS }}</el-descriptions-item>
    <el-descriptions-item label="登录时间">{{ props.detail.createTime }}</el-descriptions-item>
  </el-descriptions>

  <el-empty v-else description="暂无详情" />
</template>
