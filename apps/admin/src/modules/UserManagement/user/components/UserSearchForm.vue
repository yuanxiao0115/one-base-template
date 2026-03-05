<script setup lang="ts">
import { ref } from 'vue';
import type { FormInstance } from 'element-plus';

const model = defineModel<{
  nickName: string
  phone: string
  userAccount: string
  isEnable: boolean | null
  mail: string
  date: string[]
}>({ required: true });

const formRef = ref<FormInstance>();

defineExpose({
  resetFields: () => {
    formRef.value?.resetFields?.();
  }
});
</script>

<template>
  <el-form ref="formRef" label-position="top" :model class="user-search-form">
    <el-form-item label="用户名" prop="nickName">
      <el-input v-model.trim="model.nickName" placeholder="请输入用户名" clearable class="w-full" />
    </el-form-item>

    <el-form-item label="手机号" prop="phone">
      <el-input v-model.trim="model.phone" placeholder="请输入手机号" clearable class="w-full" />
    </el-form-item>

    <el-form-item label="登录账号" prop="userAccount">
      <el-input v-model.trim="model.userAccount" placeholder="请输入登录账号" clearable class="w-full" />
    </el-form-item>

    <el-form-item label="状态" prop="isEnable">
      <el-select v-model="model.isEnable" placeholder="请选择状态" clearable class="w-full">
        <el-option label="启用" :value="true" />
        <el-option label="停用" :value="false" />
      </el-select>
    </el-form-item>

    <el-form-item label="邮箱" prop="mail">
      <el-input v-model.trim="model.mail" placeholder="请输入邮箱" clearable class="w-full" />
    </el-form-item>

    <el-form-item label="最后登录" prop="date">
      <el-date-picker
        v-model="model.date"
        type="datetimerange"
        start-placeholder="开始时间"
        end-placeholder="结束时间"
        value-format="YYYY-MM-DD HH:mm:ss"
        format="YYYY-MM-DD HH:mm:ss"
        class="w-full"
      />
    </el-form-item>
  </el-form>
</template>

<style scoped>
.user-search-form {
  width: 100%;
}
</style>
