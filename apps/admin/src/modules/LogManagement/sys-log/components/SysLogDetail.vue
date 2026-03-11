<script setup lang="ts">
  import type { SysLogRecord } from "../types";

  const props = defineProps<{
    detail: SysLogRecord | null;
  }>();
</script>

<template>
  <el-descriptions v-if="props.detail" :column="1" border>
    <el-descriptions-item label="ID">{{ props.detail.id }}</el-descriptions-item>
    <el-descriptions-item label="客户端IP">{{ props.detail.clientIp }}</el-descriptions-item>
    <el-descriptions-item label="模块">{{ props.detail.module }}</el-descriptions-item>
    <el-descriptions-item label="操作类型">{{ props.detail.operationType }}</el-descriptions-item>
    <el-descriptions-item label="操作结果">
      <el-tag :type="props.detail.operationResult === 0 ? 'success' : 'danger'">
        {{ props.detail.operationResult === 0 ? '成功' : '失败' }}
      </el-tag>
    </el-descriptions-item>
    <el-descriptions-item label="请求状态码">{{ props.detail.httpStatus }}</el-descriptions-item>
    <el-descriptions-item label="请求接口地址">{{ props.detail.requestUrl }}</el-descriptions-item>
    <el-descriptions-item label="创建时间">{{ props.detail.createTime }}</el-descriptions-item>
    <el-descriptions-item label="操作人账号">{{ props.detail.userAccount }}</el-descriptions-item>
    <el-descriptions-item label="操作人姓名">{{ props.detail.nickName }}</el-descriptions-item>
    <el-descriptions-item label="客户端浏览器">{{ props.detail.browserName }}</el-descriptions-item>
    <el-descriptions-item label="浏览器版本">{{ props.detail.browserVersion }}</el-descriptions-item>
    <el-descriptions-item label="客户端操作系统">{{ props.detail.clientOS }}</el-descriptions-item>
    <el-descriptions-item label="客户端ID">{{ props.detail.clientId }}</el-descriptions-item>
    <el-descriptions-item label="所属租户ID">{{ props.detail.tenantId }}</el-descriptions-item>
  </el-descriptions>

  <el-empty v-else description="暂无详情" />
</template>
