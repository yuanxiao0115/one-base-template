<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import type { FormInstance, FormRules } from 'element-plus';
import { message } from '@one-base-template/ui';
import PersonnelSelector from '@/components/PersonnelSelector/PersonnelSelector.vue';
import type {
  PersonnelFetchNodes,
  PersonnelSearchNodes,
  PersonnelSelectedUser
} from '@/components/PersonnelSelector/types';

interface PersonnelSelectorExpose {
  loadRootNodes?: () => Promise<void>;
  setSelectedUsers?: (users: PersonnelSelectedUser[]) => void;
}

const props = withDefaults(
  defineProps<{
    disabled: boolean;
    initialSelectedUsers?: PersonnelSelectedUser[];
    fetchNodes: PersonnelFetchNodes;
    searchNodes: PersonnelSearchNodes;
  }>(),
  {
    initialSelectedUsers: () => []
  }
);

const model = defineModel<{
  userIds: string[];
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

function getErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

async function syncRootNodes(selector?: PersonnelSelectorExpose) {
  if (!selector?.loadRootNodes) {
    return;
  }

  try {
    await selector.loadRootNodes();
  } catch (error) {
    message.error(getErrorMessage(error, '加载组织通讯录失败'));
  }
}

watch(
  selectorRef,
  (selector) => {
    void syncRootNodes(selector);
  },
  {
    immediate: true,
    flush: 'post'
  }
);

watch(
  [selectorRef, () => props.initialSelectedUsers],
  ([selector, users]) => {
    selector?.setSelectedUsers?.(Array.isArray(users) ? users : []);
  },
  {
    immediate: true,
    deep: true,
    flush: 'post'
  }
);

defineExpose({
  validate: (...args: Parameters<NonNullable<FormInstance['validate']>>) => {
    const [callback] = args;
    if (callback) {
      return formRef.value?.validate?.(callback);
    }
    return formRef.value?.validate?.();
  },
  clearValidate: (...args: Parameters<NonNullable<FormInstance['clearValidate']>>) =>
    formRef.value?.clearValidate?.(...args),
  resetFields: (...args: Parameters<NonNullable<FormInstance['resetFields']>>) =>
    formRef.value?.resetFields?.(...args)
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
        :fetch-nodes="props.fetchNodes"
        :search-nodes="props.searchNodes"
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
