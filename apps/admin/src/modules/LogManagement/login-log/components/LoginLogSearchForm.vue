<script setup lang="ts">
  import { ref } from "vue";
  import type { FormInstance } from "element-plus";
  import type { ClientTypeOption } from "../types";

  const props = defineProps<{
    clientTypeList: ClientTypeOption[];
  }>();

  const model = defineModel<{
    nickName: string;
    clientType: string;
    time: string[];
  }>({ required: true });

  const formRef = ref<FormInstance>();

  defineExpose({
    resetFields: () => formRef.value?.resetFields?.(),
  });
</script>

<template>
  <el-form ref="formRef" label-position="top" :model>
    <el-form-item label="客户端类型" prop="clientType">
      <el-select v-model="model.clientType" class="w-full" clearable placeholder="请选择客户端类型">
        <el-option v-for="item in props.clientTypeList" :key="item.key" :label="item.value" :value="item.key" />
      </el-select>
    </el-form-item>

    <el-form-item label="时间范围" prop="time">
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
