<script setup lang="ts">
import { computed, ref } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import type { CrudFormLike } from '@one-base-template/ui'
import type { UserAccountForm } from '../form'

const props = defineProps<{
  disabled: boolean
  checkUserAccountUnique: (params: { userId: string; userAccount: string }) => Promise<boolean>
}>()

const model = defineModel<UserAccountForm>({ required: true })

const formRef = ref<FormInstance>()

const accountReg = /^[A-Za-z0-9_]{4,20}$/
const passwordReg = /^(?![A-Za-z]+$)(?![A-Z\d]+$)(?![A-Z\W_]+$)(?![a-z\d]+$)(?![a-z\W_]+$)(?![\d\W_]+$)\S{8,20}$/

const formRules = computed<FormRules<UserAccountForm>>(() => ({
  newUsername: [
    { required: true, message: '请输入登录账号', trigger: 'blur' },
    { pattern: accountReg, message: '账号长度4-20位，格式：字母、数字、_', trigger: 'blur' },
    {
      trigger: 'blur',
      validator: (_, value, callback) => {
        const account = String(value || '').trim()
        if (!account) {
          callback()
          return
        }

        if (account === String(model.value.userAccount || '').trim()) {
          callback()
          return
        }

        void props.checkUserAccountUnique({
          userId: model.value.userId,
          userAccount: account
        }).then((isUnique) => {
          if (!isUnique) {
            callback(new Error('已存在相同登录账号'))
            return
          }
          callback()
        }).catch((error: unknown) => {
          const errorMessage = error instanceof Error ? error.message : '登录账号校验失败'
          callback(new Error(errorMessage))
        })
      }
    }
  ],
  isReset: [{ required: true, message: '请选择是否重置密码', trigger: 'change' }],
  newPassword: [
    {
      trigger: 'blur',
      validator: (_, value, callback) => {
        if (model.value.isReset !== 1) {
          callback()
          return
        }

        const password = String(value || '')
        if (!password) {
          callback(new Error('请输入新密码'))
          return
        }

        if (!passwordReg.test(password)) {
          callback(new Error('长度8-20位，至少包含大小写字母、数字、特殊字符中的3种及以上。'))
          return
        }

        callback()
      }
    }
  ],
  newPasswordRepeat: [
    {
      trigger: 'blur',
      validator: (_, value, callback) => {
        if (model.value.isReset !== 1) {
          callback()
          return
        }

        const passwordRepeat = String(value || '')
        if (!passwordRepeat) {
          callback(new Error('请确认新密码'))
          return
        }

        if (passwordRepeat !== model.value.newPassword) {
          callback(new Error('两次密码不一致'))
          return
        }

        callback()
      }
    }
  ]
}))

defineExpose<CrudFormLike>({
  validate: (...args) => {
    const [callback] = args
    if (callback) {
      return formRef.value?.validate?.(callback)
    }
    return formRef.value?.validate?.()
  },
  clearValidate: (...args) => formRef.value?.clearValidate?.(...args),
  resetFields: (...args) => formRef.value?.resetFields?.(...args)
})
</script>

<template>
  <el-form
    ref="formRef"
    :model="model"
    :rules="formRules"
    label-position="top"
    :disabled="props.disabled"
  >
    <el-form-item label="当前用户名">
      <span>{{ model.nickName }}（{{ model.phone }}）</span>
    </el-form-item>

    <el-form-item label="当前登录账号">
      <span>{{ model.userAccount }}</span>
    </el-form-item>

    <el-form-item label="新登录账号" prop="newUsername">
      <el-input v-model.trim="model.newUsername" placeholder="请输入登录账号" clearable />
    </el-form-item>

    <el-form-item label="是否重置密码" prop="isReset">
      <el-radio-group v-model="model.isReset">
        <el-radio :value="0">否</el-radio>
        <el-radio :value="1">是</el-radio>
      </el-radio-group>
    </el-form-item>

    <el-form-item v-if="model.isReset === 1" label="新密码" prop="newPassword">
      <el-input v-model.trim="model.newPassword" type="password" show-password placeholder="请输入新密码" />
    </el-form-item>

    <el-form-item v-if="model.isReset === 1" label="确认密码" prop="newPasswordRepeat">
      <el-input
        v-model.trim="model.newPasswordRepeat"
        type="password"
        show-password
        placeholder="请输入确认密码"
      />
    </el-form-item>
  </el-form>
</template>
