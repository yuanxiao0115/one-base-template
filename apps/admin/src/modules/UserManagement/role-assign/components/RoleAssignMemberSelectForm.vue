<script setup lang="ts">
import { computed, ref } from 'vue';
import type { FormInstance, FormRules } from 'element-plus';
import PersonnelSelector from '@/components/PersonnelSelector/PersonnelSelector.vue';
import type {
  PersonnelFetchNodes,
  PersonnelNode,
  PersonnelSearchNodes,
  PersonnelSelectedUser
} from '@/components/PersonnelSelector/types';
import type { RoleAssignContactNode, RoleAssignContactUserNode } from '../api';

export type RoleAssignUserOption = PersonnelSelectedUser

type PersonnelSelectorExpose = {
  loadRootNodes?: () => Promise<void>
  setSelectedUsers?: (users: PersonnelSelectedUser[]) => void
}

const props = defineProps<{
  disabled: boolean
  fetchContactNodes:(parentId?: string) => Promise<RoleAssignContactNode[]>
  searchContactUsers: (keyword: string) => Promise<RoleAssignContactUserNode[]>
}>();

const model = defineModel<{
  userIds: string[]
}>({ required: true });

const formRef = ref<FormInstance>();
const selectorRef = ref<PersonnelSelectorExpose>();

const formRules = computed<FormRules<{ userIds: string[] }>>(() => ({
  userIds: [
    {
      trigger: ['change', 'blur'],
      validator: (_, value, callback) => {
        if (Array.isArray(value) && value.length > 0) {
          callback();
          return;
        }
        callback(new Error('请至少选择一个人员'));
      }
    }
  ]
}));

function toPersonnelNode (row: RoleAssignContactNode): PersonnelNode {
  if (row.nodeType === 'org') {
    return {
      id: row.id,
      parentId: row.parentId,
      companyId: row.companyId,
      title: row.title,
      orgName: row.orgName,
      orgType: row.orgType,
      nodeType: 'org'
    };
  }

  return {
    id: row.id,
    parentId: row.parentId,
    companyId: row.companyId,
    title: row.title,
    userId: row.userId,
    nickName: row.nickName,
    userAccount: row.userAccount,
    phone: row.phone,
    nodeType: 'user'
  };
}

const fetchNodes: PersonnelFetchNodes = async ({ parentId }) => {
  const rows = await props.fetchContactNodes(parentId);
  return rows.map(toPersonnelNode);
};

const searchNodes: PersonnelSearchNodes = async ({ keyword }) => {
  const rows = await props.searchContactUsers(keyword);
  return rows.map((row) => ({
    id: row.id,
    parentId: row.parentId,
    companyId: row.companyId,
    title: row.title,
    userId: row.userId,
    nickName: row.nickName,
    userAccount: row.userAccount,
    phone: row.phone,
    nodeType: 'user'
  }));
};

defineExpose({
  validate: (...args: Parameters<NonNullable<FormInstance['validate']>>) => {
    const [callback] = args;
    if (callback) {
      return formRef.value?.validate?.(callback);
    }
    return formRef.value?.validate?.();
  },
  clearValidate: (...args: Parameters<NonNullable<FormInstance['clearValidate']>>) => formRef.value?.clearValidate?.(...args),
  resetFields: (...args: Parameters<NonNullable<FormInstance['resetFields']>>) => formRef.value?.resetFields?.(...args),
  loadRootNodes: () => selectorRef.value?.loadRootNodes?.(),
  setSelectedUsers: (users: RoleAssignUserOption[]) => {
    selectorRef.value?.setSelectedUsers?.(users.map((item) => ({
      id: item.id,
      nodeType: 'user',
      title: item.nickName,
      subTitle: item.phone || item.userAccount || '--',
      nickName: item.nickName,
      userAccount: item.userAccount,
      phone: item.phone
    })));
  }
});
</script>

<template>
  <el-form ref="formRef" :model :rules="formRules" :disabled="props.disabled" label-position="top">
    <el-form-item class="role-assign-member-select-form__form-item" prop="userIds">
      <PersonnelSelector
        ref="selectorRef"
        v-model="model"
        mode="person"
        :disabled="props.disabled"
        :fetch-nodes
        :search-nodes
      />
    </el-form-item>
  </el-form>
</template>

<style scoped>
.role-assign-member-select-form__form-item {
  margin-bottom: 0;
}

.role-assign-member-select-form__form-item :deep(.el-form-item__content) {
  display: block;
  width: 100%;
  line-height: normal;
}

.role-assign-member-select-form__form-item :deep(.el-form-item__error) {
  position: static;
  padding-top: 8px;
}
</style>
