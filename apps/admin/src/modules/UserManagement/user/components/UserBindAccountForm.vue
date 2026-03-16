<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import type { FormInstance, FormRules } from 'element-plus';

export interface UserBindOption {
  id: string;
  nickName: string;
  userAccount: string;
  phone: string;
}

const props = defineProps<{
  disabled: boolean;
  fetchUsers: (keyword: string) => Promise<UserBindOption[]>;
}>();

const model = defineModel<{
  userIds: string[];
}>({ required: true });

const formRef = ref<FormInstance>();
const loading = ref(false);
const options = ref<UserBindOption[]>([]);
const selectedMap = ref<Record<string, UserBindOption>>({});

const formRules = computed<FormRules<{ userIds: string[] }>>(() => ({
  userIds: [
    {
      trigger: ['change', 'blur'],
      validator: (_, value, callback) => {
        if (Array.isArray(value) && value.length > 0) {
          callback();
          return;
        }

        callback(new Error('请至少选择一个关联账号'));
      }
    }
  ]
}));

const selectedUsers = computed<UserBindOption[]>(() =>
  (model.value.userIds || [])
    .map((id) => selectedMap.value[id])
    .filter((item): item is UserBindOption => Boolean(item))
);

async function loadOptions(keyword = '') {
  loading.value = true;
  try {
    const rows = await props.fetchUsers(keyword);
    options.value = rows;

    const patch: Record<string, UserBindOption> = {
      ...selectedMap.value
    };

    rows.forEach((item) => {
      patch[item.id] = item;
    });

    selectedMap.value = patch;
  } finally {
    loading.value = false;
  }
}

function handleRemoteSearch(keyword: string) {
  void loadOptions(keyword.trim());
}

function onSelectionChange(ids: string[]) {
  const validIds = Array.isArray(ids) ? ids : [];

  const nextMap: Record<string, UserBindOption> = {};
  validIds.forEach((id) => {
    const fromSelected = selectedMap.value[id];
    const fromOptions = options.value.find((item) => item.id === id);
    const target = fromSelected || fromOptions;
    if (target) {
      nextMap[id] = target;
    }
  });

  selectedMap.value = {
    ...selectedMap.value,
    ...nextMap
  };

  model.value.userIds = validIds;
}

function removeUser(id: string) {
  model.value.userIds = (model.value.userIds || []).filter((item) => item !== id);
  const nextMap = { ...selectedMap.value };
  delete nextMap[id];
  selectedMap.value = nextMap;
}

watch(
  () => model.value.userIds,
  (ids) => {
    if (!Array.isArray(ids)) {
      model.value.userIds = [];
      return;
    }

    const nextMap: Record<string, UserBindOption> = {};
    ids.forEach((id) => {
      const value = selectedMap.value[id];
      if (value) {
        nextMap[id] = value;
      }
    });
    selectedMap.value = {
      ...selectedMap.value,
      ...nextMap
    };
  },
  { immediate: true }
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
    formRef.value?.resetFields?.(...args),
  loadOptions,
  setSelectedUsers: (users: UserBindOption[]) => {
    const patch = { ...selectedMap.value };
    users.forEach((item) => {
      patch[item.id] = item;
    });
    selectedMap.value = patch;
  }
});
</script>

<template>
  <el-form ref="formRef" label-position="top" :model :rules="formRules" :disabled="props.disabled">
    <el-form-item label="关联账号" prop="userIds">
      <el-select
        v-model="model.userIds"
        class="w-full"
        multiple
        filterable
        remote
        reserve-keyword
        clearable
        collapse-tags
        collapse-tags-tooltip
        placeholder="输入姓名搜索并选择关联账号"
        :remote-method="handleRemoteSearch"
        :loading
        @change="onSelectionChange"
      >
        <el-option
          v-for="item in options"
          :key="item.id"
          :value="item.id"
          :label="`${item.nickName}（${item.userAccount || item.phone || '--'}）`"
        />
      </el-select>
    </el-form-item>

    <div v-if="selectedUsers.length > 0" class="user-bind-form__selected">
      <el-tag
        v-for="item in selectedUsers"
        :key="item.id"
        closable
        @close="() => removeUser(item.id)"
      >
        {{ item.nickName }}（{{ item.userAccount || item.phone || '--' }}）
      </el-tag>
    </div>
  </el-form>
</template>

<style scoped>
.user-bind-form__selected {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
</style>
