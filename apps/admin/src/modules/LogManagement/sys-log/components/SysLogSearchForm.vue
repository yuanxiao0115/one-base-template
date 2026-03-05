<script setup lang="ts">
  import { ref } from "vue";
  import type { FormInstance } from "element-plus";

  const model = defineModel<{
    operator: string;
    clientIp: string;
    module: string;
    operationType: string;
    operationResult: number | string;
    userAccount: string;
    nickName: string;
    browserName: string;
    clientOS: string;
    tenantId: string;
    time: string[];
  }>({ required: true });

  const formRef = ref<FormInstance>();

  defineExpose({
    resetFields: () => formRef.value?.resetFields?.(),
  });
</script>

<template>
  <el-form ref="formRef" label-position="top" :model>
    <el-form-item label="客户端IP" prop="clientIp">
      <el-input v-model.trim="model.clientIp" clearable placeholder="请输入客户端IP" />
    </el-form-item>

    <el-form-item label="模块" prop="module">
      <el-input v-model.trim="model.module" clearable placeholder="请输入模块" />
    </el-form-item>

    <el-form-item label="操作类型" prop="operationType">
      <el-select v-model="model.operationType" class="w-full" clearable placeholder="请选择操作类型">
        <el-option label="新增" value="ADD" />
        <el-option label="修改" value="MODIFY" />
        <el-option label="删除" value="DELETE" />
        <el-option label="查询" value="QUERY" />
        <el-option label="导出" value="EXPORT" />
        <el-option label="导入" value="IMPORT" />
        <el-option label="登录" value="LOGIN" />
        <el-option label="登出" value="LOGOUT" />
        <el-option label="生成代码" value="GENCODE" />
        <el-option label="其他" value="OTHER" />
      </el-select>
    </el-form-item>

    <el-form-item label="操作结果" prop="operationResult">
      <el-select v-model="model.operationResult" class="w-full" clearable placeholder="请选择操作结果">
        <el-option label="成功" :value="0" />
        <el-option label="失败" :value="1" />
      </el-select>
    </el-form-item>

    <el-form-item label="操作人账号" prop="userAccount">
      <el-input v-model.trim="model.userAccount" clearable placeholder="请输入操作人账号" />
    </el-form-item>

    <el-form-item label="操作人姓名" prop="nickName">
      <el-input v-model.trim="model.nickName" clearable placeholder="请输入操作人姓名" />
    </el-form-item>

    <el-form-item label="客户端浏览器" prop="browserName">
      <el-input v-model.trim="model.browserName" clearable placeholder="请输入客户端浏览器" />
    </el-form-item>

    <el-form-item label="客户端操作系统" prop="clientOS">
      <el-input v-model.trim="model.clientOS" clearable placeholder="请输入客户端操作系统" />
    </el-form-item>

    <el-form-item label="所属租户ID" prop="tenantId">
      <el-input v-model.trim="model.tenantId" clearable placeholder="请输入租户ID" />
    </el-form-item>

    <el-form-item label="创建时间范围" prop="time">
      <el-date-picker
        v-model="model.time"
        class="w-full"
        type="daterange"
        value-format="YYYY-MM-DD"
        range-separator="至"
        start-placeholder="开始时间"
        end-placeholder="结束时间"
      />
    </el-form-item>
  </el-form>
</template>
