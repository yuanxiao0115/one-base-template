<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { FormInstance, FormItemRule, FormRules } from 'element-plus'
import type { CrudFormLike } from '@one-base-template/ui'
import type { DictItem, OrgLevelItem } from '../api'
import type { OrgForm, OrgTreeOption } from '../form'

const props = defineProps<{
  disabled: boolean
  rules: FormRules<OrgForm>
  orgTreeOptions: OrgTreeOption[]
  orgCategoryOptions: DictItem[]
  institutionalTypeOptions: DictItem[]
  orgLevelOptions: OrgLevelItem[]
  rootParentId: string
  checkOrgNameUnique: (params: { orgName: string; parentId?: string; orgId?: string }) => Promise<boolean>
}>()

const model = defineModel<OrgForm>({ required: true })

const formRef = ref<FormInstance>()

const uniqueNameRule: FormItemRule = {
  trigger: 'blur',
  validator: (_, value, callback) => {
    const orgName = (value || '').trim()
    if (!orgName) {
      callback()
      return
    }

    void props.checkOrgNameUnique({
      orgName,
      parentId: model.value.parentId || props.rootParentId,
      orgId: model.value.id
    }).then((unique) => {
      if (!unique) {
        callback(new Error('已存在相同组织名称'))
        return
      }
      callback()
    }).catch((error: unknown) => {
      const errorMessage = error instanceof Error ? error.message : '组织名称校验失败'
      callback(new Error(errorMessage))
    })
  }
}

const mergedRules = computed<FormRules<OrgForm>>(() => {
  const baseRules = props.rules || {}
  const rawOrgNameRules = baseRules.orgName
  const orgNameRules = Array.isArray(rawOrgNameRules)
    ? [...rawOrgNameRules]
    : rawOrgNameRules
      ? [rawOrgNameRules]
      : []

  return {
    ...baseRules,
    orgName: [
      ...orgNameRules,
      uniqueNameRule
    ]
  }
})

function syncLevelMeta(level: number | null) {
  if (level == null) {
    model.value.orgLevelName = ''
    model.value.orgLevelId = ''
    return
  }

  const target = props.orgLevelOptions.find((item) => Number(item.orgLevel) === Number(level))
  model.value.orgLevelName = target?.orgLevelName || ''
  model.value.orgLevelId = target?.id || ''
}

watch(
  () => model.value.orgLevel,
  (level) => {
    syncLevelMeta(level)
  }
)

watch(
  () => props.orgLevelOptions,
  () => {
    syncLevelMeta(model.value.orgLevel)
  }
)

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
    :rules="mergedRules"
    label-position="top"
    :disabled="props.disabled"
  >
    <el-form-item label="上级组织" prop="parentId" class="ob-crud-container__item--full">
      <el-tree-select
        v-model="model.parentId"
        class="w-full"
        :data="props.orgTreeOptions"
        :props="{ label: 'label', children: 'children', disabled: 'disabled' }"
        value-key="value"
        node-key="value"
        check-strictly
        default-expand-all
        placeholder="请选择上级组织"
      />
    </el-form-item>

    <el-form-item label="组织全称" prop="orgName">
      <el-input v-model.trim="model.orgName" maxlength="30" show-word-limit placeholder="请输入组织全称" />
    </el-form-item>

    <el-form-item label="组织简称" prop="briefName">
      <el-input v-model.trim="model.briefName" maxlength="30" show-word-limit placeholder="请输入组织简称" />
    </el-form-item>

    <el-form-item label="创建类型" prop="orgType">
      <el-select v-model="model.orgType" placeholder="请选择创建类型" class="w-full">
        <el-option label="部门" :value="0" />
        <el-option label="单位" :value="1" />
      </el-select>
    </el-form-item>

    <el-form-item label="是否外部组织" prop="isExternal">
      <el-switch
        v-model="model.isExternal"
        inline-prompt
        active-text="是"
        inactive-text="否"
      />
    </el-form-item>

    <el-form-item label="组织类型" prop="orgCategory">
      <el-select v-model="model.orgCategory" placeholder="请选择组织类型" class="w-full" clearable>
        <el-option
          v-for="item in props.orgCategoryOptions"
          :key="item.itemValue"
          :label="item.itemName"
          :value="item.itemValue"
        />
      </el-select>
    </el-form-item>

    <el-form-item label="等级" prop="orgLevel">
      <el-select v-model="model.orgLevel" placeholder="请选择等级" class="w-full" clearable>
        <el-option
          v-for="item in props.orgLevelOptions"
          :key="item.id"
          :label="item.orgLevelName"
          :value="item.orgLevel"
        />
      </el-select>
    </el-form-item>

    <el-form-item label="机构类别" prop="institutionalType">
      <el-select v-model="model.institutionalType" placeholder="请选择机构类别" class="w-full" clearable>
        <el-option
          v-for="item in props.institutionalTypeOptions"
          :key="item.itemValue"
          :label="item.itemName"
          :value="item.itemValue"
        />
      </el-select>
    </el-form-item>

    <el-form-item label="统一社会信用代码" prop="uscc">
      <el-input v-model.trim="model.uscc" maxlength="30" show-word-limit placeholder="请输入统一社会信用代码" />
    </el-form-item>

    <el-form-item label="显示排序" prop="sort">
      <el-input-number v-model="model.sort" class="w-full" :min="0" :max="9999" />
    </el-form-item>

    <el-form-item label="组织描述" prop="remark" class="ob-crud-container__item--full">
      <el-input
        v-model.trim="model.remark"
        type="textarea"
        :rows="4"
        maxlength="200"
        show-word-limit
        placeholder="请输入组织描述"
      />
    </el-form-item>
  </el-form>
</template>
