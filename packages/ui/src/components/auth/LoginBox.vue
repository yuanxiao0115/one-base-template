<script setup lang="ts">
  import { computed, ref } from 'vue'
  import type { FormInstance, FormItemRule, FormRules } from 'element-plus'
  import { SM4 } from 'gm-crypto'

  defineOptions({
    name: 'LoginBox'
  })

  const DEFAULT_SM4_KEY_HEX = '6f889d54ad8c4ddb8c525fc96a185444'
  const DEFAULT_PASSWORD_PATTERN =
    /^(?![0-9]+$)(?![a-z]+$)(?![A-Z]+$)(?!([^(0-9a-zA-Z)]|[()])+$)(?!^.*[\u4E00-\u9FA5].*$)([^(0-9a-zA-Z)]|[()]|[a-z]|[A-Z]|[0-9]){8,18}$/

  export interface LoginBoxSubmitPayload {
    username: string
    password: string
  }

  interface LoginBoxProps {
    username: string
    password: string
    title?: string
    usernameLabel?: string
    passwordLabel?: string
    usernamePlaceholder?: string
    passwordPlaceholder?: string
    submitText?: string
    loading?: boolean
    size?: 'default' | 'large' | 'small'
    requireUsername?: boolean
    validatePassword?: boolean
    passwordPattern?: RegExp
    passwordRuleMessage?: string
    encrypt?: boolean
    sm4KeyHex?: string
  }

  const props = withDefaults(
    defineProps<LoginBoxProps>(),
    {
      title: '',
      usernameLabel: '账号',
      passwordLabel: '密码',
      usernamePlaceholder: '请输入账号',
      passwordPlaceholder: '请输入密码',
      submitText: '登录',
      loading: false,
      size: 'large',
      requireUsername: true,
      validatePassword: true,
      passwordPattern:
        () =>
          /^(?![0-9]+$)(?![a-z]+$)(?![A-Z]+$)(?!([^(0-9a-zA-Z)]|[()])+$)(?!^.*[\u4E00-\u9FA5].*$)([^(0-9a-zA-Z)]|[()]|[a-z]|[A-Z]|[0-9]){8,18}$/,
      passwordRuleMessage: '密码格式应为8-18位数字、字母、符号的任意两种组合',
      encrypt: false,
      sm4KeyHex: '6f889d54ad8c4ddb8c525fc96a185444'
    }
  )

  const emit = defineEmits<{
    'update:username': [value: string]
    'update:password': [value: string]
    submit: [payload: LoginBoxSubmitPayload]
  }>()

  const formRef = ref<FormInstance>()

  const usernameValue = computed({
    get: () => props.username,
    set: (value: string) => {
      emit('update:username', value)
    }
  })

  const passwordValue = computed({
    get: () => props.password,
    set: (value: string) => {
      emit('update:password', value)
    }
  })

  const formModel = computed(() => ({
    username: props.username,
    password: props.password
  }))

  const passwordPattern = computed(() => props.passwordPattern ?? DEFAULT_PASSWORD_PATTERN)
  const sm4KeyHex = computed(() => props.sm4KeyHex ?? DEFAULT_SM4_KEY_HEX)

  const rules = computed<FormRules>(() => ({
    username: props.requireUsername
      ? ([
          {
            required: true,
            message: '请输入账号',
            trigger: 'blur'
          },
        ] satisfies FormItemRule[])
      : [],
    password: [
      {
        validator: (_rule, value: string, callback) => {
          if (!value) {
            return callback(new Error('请输入密码'))
          }
          if (!props.validatePassword) {
            callback()
            return
          }

          passwordPattern.value.lastIndex = 0
          if (!passwordPattern.value.test(value)) {
            return callback(new Error(props.passwordRuleMessage))
          }
          callback()
        },
        trigger: 'blur'
      }
    ]
  }))

  async function validate() {
    if (!formRef.value) {
      return true
    }

    return await formRef.value
      .validate()
      .then(() => true)
      .catch(() => false)
  }

  function clearValidate() {
    formRef.value?.clearValidate()
  }

  function encryptValue(value: string) {
    return SM4.encrypt(value, sm4KeyHex.value, {
      inputEncoding: 'utf8',
      outputEncoding: 'base64'
    })
  }

  function buildSubmitPayload(): LoginBoxSubmitPayload {
    if (!props.encrypt) {
      return {
        username: props.username,
        password: props.password
      }
    }

    return {
      username: encryptValue(props.username),
      password: encryptValue(props.password)
    }
  }

  async function handleSubmit() {
    const valid = await validate()
    if (!valid) {
      return
    }

    emit('submit', buildSubmitPayload())
  }

  defineExpose({
    validate,
    clearValidate,
    buildSubmitPayload
  })
</script>

<template>
  <div class="login-box">
    <div v-if="title" class="login-box__title">{{ title }}</div>

    <el-form ref="formRef" :model="formModel" :rules="rules" :size="size" label-position="top">
      <el-form-item prop="username" :label="usernameLabel">
        <el-input v-model="usernameValue" autocomplete="username" :placeholder="usernamePlaceholder" @keyup.enter="handleSubmit" />
      </el-form-item>

      <el-form-item prop="password" :label="passwordLabel">
        <el-input
          v-model="passwordValue"
          type="password"
          autocomplete="current-password"
          show-password
          :placeholder="passwordPlaceholder"
          @keyup.enter="handleSubmit"
        />
      </el-form-item>

      <el-button class="login-box__button" type="primary" :loading="loading" @click="handleSubmit">
        {{ submitText }}
      </el-button>
    </el-form>
  </div>
</template>

<style scoped>
  .login-box {
    width: 100%;
  }

  .login-box__title {
    margin-bottom: 16px;
    color: var(--el-text-color-primary);
    font-size: 24px;
    font-weight: 600;
    line-height: 1.4;
  }

  .login-box__button {
    width: 100%;
  }
</style>
