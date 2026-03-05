<script setup lang="ts">
import { computed, ref } from 'vue';
import {
  ElMessage,
  type FormInstance,
  type FormItemRule,
  type FormRules,
  type UploadProps
} from 'element-plus';
import { Delete, Plus } from '@element-plus/icons-vue';
import type { CrudFormLike } from '@one-base-template/ui';
import type { OrgTreeNode, PositionItem, RoleItem } from '../api';
import {
  createDefaultUserOrg,
  createDefaultUserOrgPost,
  type UserForm
} from '../form';
import { genderOptions, orgRankTypeOptions, userTypeOptions } from '../const';
import { tryConfirmWarn } from '../../shared/confirm';

const props = defineProps<{
  mode: 'create' | 'detail' | 'edit'
  rules: FormRules<UserForm>
  disabled: boolean
  orgTreeOptions: OrgTreeNode[]
  positionOptions: PositionItem[]
  roleOptions: RoleItem[]
  checkUnique:(params: { userId?: string; userAccount?: string; phone?: string; mail?: string }) => Promise<boolean>
  uploadAvatar: (file: File, userId: string) => Promise<boolean>
}>();

const model = defineModel<UserForm>({ required: true });

const formRef = ref<FormInstance>();
const uploadLoading = ref(false);
const avatarTimestamp = ref(Date.now());

const isCreateMode = computed(() => props.mode === 'create');
const avatarSrc = computed(() => {
  if (!model.value.id) {
    return '';
  }
  return `/cmict/file/user/avatar/${model.value.id}?timestamp=${avatarTimestamp.value}`;
});

const uniqueAccountRule: FormItemRule = {
  trigger: 'blur',
  validator: (_, value, callback) => {
    const account = String(value || '').trim();
    if (!account || props.mode === 'detail') {
      callback();
      return;
    }

    void props.checkUnique({
      userId: model.value.id,
      userAccount: account,
      phone: model.value.phone,
      mail: model.value.mail
    }).then((isUnique) => {
      if (!isUnique) {
        callback(new Error('已存在相同登录账号'));
        return;
      }
      callback();
    })
      .catch((error: unknown) => {
        const errorMessage = error instanceof Error ? error.message : '登录账号校验失败';
        callback(new Error(errorMessage));
      });
  }
};

const uniquePhoneRule: FormItemRule = {
  trigger: 'blur',
  validator: (_, value, callback) => {
    const phone = String(value || '').trim();
    if (!phone || props.mode === 'detail') {
      callback();
      return;
    }

    void props.checkUnique({
      userId: model.value.id,
      userAccount: model.value.userAccount,
      phone,
      mail: model.value.mail
    }).then((isUnique) => {
      if (!isUnique) {
        callback(new Error('已存在相同手机号'));
        return;
      }
      callback();
    })
      .catch((error: unknown) => {
        const errorMessage = error instanceof Error ? error.message : '手机号校验失败';
        callback(new Error(errorMessage));
      });
  }
};

const uniqueMailRule: FormItemRule = {
  trigger: 'blur',
  validator: (_, value, callback) => {
    const mail = String(value || '').trim();
    if (!mail || props.mode === 'detail') {
      callback();
      return;
    }

    void props.checkUnique({
      userId: model.value.id,
      userAccount: model.value.userAccount,
      phone: model.value.phone,
      mail
    }).then((isUnique) => {
      if (!isUnique) {
        callback(new Error('已存在相同邮箱'));
        return;
      }
      callback();
    })
      .catch((error: unknown) => {
        const errorMessage = error instanceof Error ? error.message : '邮箱校验失败';
        callback(new Error(errorMessage));
      });
  }
};

const mergedRules = computed<FormRules<UserForm>>(() => {
  const baseRules = props.rules || {};
  const accountRules = Array.isArray(baseRules.userAccount)
    ? [...baseRules.userAccount]
    : baseRules.userAccount
      ? [baseRules.userAccount]
      : [];

  const phoneRules = Array.isArray(baseRules.phone)
    ? [...baseRules.phone]
    : baseRules.phone
      ? [baseRules.phone]
      : [];

  const mailRules = Array.isArray(baseRules.mail)
    ? [...baseRules.mail]
    : baseRules.mail
      ? [baseRules.mail]
      : [];

  return {
    ...baseRules,
    userAccount: [...accountRules, uniqueAccountRule],
    phone: [...phoneRules, uniquePhoneRule],
    mail: [...mailRules, uniqueMailRule]
  };
});

function ensureOrgRow () {
  if (!Array.isArray(model.value.userOrgs) || model.value.userOrgs.length === 0) {
    model.value.userOrgs = [createDefaultUserOrg()];
  }
}

function addOrg () {
  ensureOrgRow();
  model.value.userOrgs.push(createDefaultUserOrg());
}

async function removeOrg (index: number) {
  if (!Array.isArray(model.value.userOrgs) || model.value.userOrgs.length <= 1) {
    ElMessage.warning('至少保留一个部门');
    return;
  }

  const row = model.value.userOrgs[index];
  if (!row) {
    return;
  }

  const hasData = Boolean(row.orgId) || (row.postVos || []).some((post) => Boolean(post.postId));
  if (!hasData) {
    model.value.userOrgs.splice(index, 1);
    return;
  }

  const confirmed = await tryConfirmWarn('是否删除此部门配置？', '提示');
  if (!confirmed) {
    return;
  }
  model.value.userOrgs.splice(index, 1);
}

function addPost (orgIndex: number) {
  const org = model.value.userOrgs[orgIndex];
  if (!org) {
    return;
  }
  org.postVos = Array.isArray(org.postVos) ? org.postVos : [];
  org.postVos.push(createDefaultUserOrgPost());
}

async function removePost (orgIndex: number, postIndex: number) {
  const org = model.value.userOrgs[orgIndex];
  if (!org) {
    return;
  }

  const posts = Array.isArray(org.postVos) ? org.postVos : [];
  if (posts.length <= 1) {
    ElMessage.warning('至少保留一个职位');
    return;
  }

  const row = posts[postIndex];
  if (!row) {
    return;
  }

  if (!row.postId && !row.sort) {
    posts.splice(postIndex, 1);
    return;
  }

  const confirmed = await tryConfirmWarn('是否删除此职位配置？', '提示');
  if (!confirmed) {
    return;
  }
  posts.splice(postIndex, 1);
}

const beforeUploadAvatar: UploadProps['beforeUpload'] = async (file) => {
  if (!model.value.id) {
    ElMessage.warning('请先保存用户后再上传头像');
    return false;
  }

  if (uploadLoading.value) {
    return false;
  }

  uploadLoading.value = true;
  try {
    const success = await props.uploadAvatar(file, model.value.id);
    if (success) {
      avatarTimestamp.value = Date.now();
      ElMessage.success('头像更新成功');
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '头像上传失败';
    ElMessage.error(errorMessage);
  } finally {
    uploadLoading.value = false;
  }

  return false;
};

defineExpose<CrudFormLike>({
  validate: (...args) => {
    const [callback] = args;
    if (callback) {
      return formRef.value?.validate?.(callback);
    }
    return formRef.value?.validate?.();
  },
  clearValidate: (...args) => formRef.value?.clearValidate?.(...args),
  resetFields: (...args) => formRef.value?.resetFields?.(...args)
});
</script>

<template>
  <el-form
    ref="formRef"
    :model
    :rules="mergedRules"
    label-position="top"
    :disabled="props.disabled"
  >
    <el-row v-if="!isCreateMode" :gutter="24" class="ob-crud-container__item--full">
      <el-col :span="4">
        <div class="user-edit-form__avatar">
          <el-avatar :size="64" shape="square" :src="avatarSrc" />
          <el-upload
            v-if="props.mode === 'edit'"
            :show-file-list="false"
            :before-upload="beforeUploadAvatar"
            class="user-edit-form__avatar-upload"
          >
            <el-button :loading="uploadLoading">修改头像</el-button>
          </el-upload>
        </div>
      </el-col>
      <el-col :span="20">
        <div class="user-edit-form__meta">用户 ID：{{ model.id }}</div>
        <div class="user-edit-form__meta">登录账号：{{ model.userAccount }}</div>
        <div class="user-edit-form__meta">创建时间：{{ model.createTime || '--' }}</div>
      </el-col>
    </el-row>

    <el-divider v-if="!isCreateMode" class="ob-crud-container__item--full" />

    <el-row :gutter="24" class="ob-crud-container__item--full">
      <el-col :span="12">
        <el-form-item label="姓名" prop="nickName">
          <el-input v-model.trim="model.nickName" maxlength="20" show-word-limit placeholder="请输入姓名" />
        </el-form-item>
      </el-col>

      <el-col v-if="isCreateMode" :span="12">
        <el-form-item label="登录账号" prop="userAccount">
          <el-input v-model.trim="model.userAccount" maxlength="20" show-word-limit placeholder="请输入登录账号" />
        </el-form-item>
      </el-col>
    </el-row>

    <template v-for="(orgItem, orgIndex) in model.userOrgs" :key="orgIndex">
      <div class="ob-crud-container__item--full user-edit-form__org-title">
        <span>部门{{ orgIndex + 1 }}</span>
        <el-button v-if="!props.disabled" link type="danger" @click="() => removeOrg(orgIndex)">删除部门</el-button>
      </div>

      <el-row :gutter="24" class="ob-crud-container__item--full">
        <el-col :span="8">
          <el-form-item
            label="部门"
            :prop="`userOrgs.${orgIndex}.orgId`"
            :rules="{
              required: true,
              message: '请选择部门',
              trigger: ['change', 'blur']
            }"
          >
            <el-tree-select
              v-model="orgItem.orgId"
              :data="props.orgTreeOptions"
              :props="{
                label: 'orgName',
                children: 'children'
              }"
              value-key="id"
              node-key="id"
              check-strictly
              filterable
              default-expand-all
              placeholder="请选择部门"
              class="w-full"
            />
          </el-form-item>
        </el-col>

        <el-col :span="8">
          <el-form-item label="岗位类型" :prop="`userOrgs.${orgIndex}.orgRankType`">
            <el-select v-model="orgItem.orgRankType" placeholder="请选择岗位类型" clearable class="w-full">
              <el-option
                v-for="option in orgRankTypeOptions"
                :key="option.value"
                :label="option.label"
                :value="option.value"
              />
            </el-select>
          </el-form-item>
        </el-col>

        <el-col :span="4">
          <el-form-item
            label="多职排序"
            :prop="`userOrgs.${orgIndex}.ownSort`"
            :rules="[{
              required: true,
              message: '请输入自然数排序',
              trigger: 'blur'
            }, {
              type: 'number',
              min: 0,
              message: '格式错误，请输入自然数',
              trigger: 'blur'
            }]"
          >
            <el-input-number v-model="orgItem.ownSort" :min="0" :max="9999" class="w-full" />
          </el-form-item>
        </el-col>

        <el-col :span="4">
          <el-form-item
            label="排序"
            :prop="`userOrgs.${orgIndex}.sort`"
            :rules="[{
              required: true,
              message: '请输入自然数排序',
              trigger: 'blur'
            }, {
              type: 'number',
              min: 0,
              message: '格式错误，请输入自然数',
              trigger: 'blur'
            }]"
          >
            <el-input-number v-model="orgItem.sort" :min="0" :max="9999" class="w-full" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item class="ob-crud-container__item--full">
        <el-button class="user-edit-form__add-btn" :icon="Plus" @click="() => addPost(orgIndex)">新增职位</el-button>
      </el-form-item>

      <el-row
        v-for="(postItem, postIndex) in orgItem.postVos"
        :key="`post-${orgIndex}-${postIndex}`"
        :gutter="24"
        class="ob-crud-container__item--full"
      >
        <el-col :span="16">
          <el-form-item
            :label="`职位${postIndex + 1}`"
            :prop="`userOrgs.${orgIndex}.postVos.${postIndex}.postId`"
            :rules="{
              required: true,
              message: '请选择职位',
              trigger: ['change', 'blur']
            }"
          >
            <el-select v-model="postItem.postId" placeholder="请选择职位" filterable clearable class="w-full">
              <el-option
                v-for="option in props.positionOptions"
                :key="option.id"
                :label="option.postName"
                :value="option.id"
              />
            </el-select>
          </el-form-item>
        </el-col>

        <el-col :span="8">
          <el-form-item
            label="职位排序"
            :prop="`userOrgs.${orgIndex}.postVos.${postIndex}.sort`"
            :rules="[{
              required: true,
              message: '请输入自然数排序',
              trigger: 'blur'
            }, {
              type: 'number',
              min: 0,
              message: '格式错误，请输入自然数',
              trigger: 'blur'
            }]"
          >
            <div class="user-edit-form__post-sort">
              <el-input-number v-model="postItem.sort" :min="0" :max="9999" class="w-full" />
              <el-button v-if="!props.disabled" link type="danger" :icon="Delete" @click="() => removePost(orgIndex, postIndex)" />
            </div>
          </el-form-item>
        </el-col>
      </el-row>
    </template>

    <el-form-item class="ob-crud-container__item--full">
      <el-button class="user-edit-form__add-btn" :icon="Plus" @click="addOrg">新增部门</el-button>
    </el-form-item>

    <el-row :gutter="24" class="ob-crud-container__item--full">
      <el-col :span="12">
        <el-form-item label="角色" prop="roleIds">
          <el-select v-model="model.roleIds" multiple clearable filterable placeholder="请选择角色" class="w-full">
            <el-option
              v-for="role in props.roleOptions"
              :key="role.id"
              :label="role.roleName"
              :value="role.id"
            />
          </el-select>
        </el-form-item>
      </el-col>

      <el-col :span="12">
        <el-form-item label="手机号" prop="phone">
          <div class="user-edit-form__phone-item">
            <el-input v-model.trim="model.phone" placeholder="请输入手机号" clearable />
            <el-switch
              v-model="model.phoneShow"
              inline-prompt
              active-text="显示"
              inactive-text="隐藏"
            />
          </div>
        </el-form-item>
      </el-col>

      <el-col :span="12">
        <el-form-item label="状态" prop="isEnable">
          <el-select v-model="model.isEnable" placeholder="请选择状态" class="w-full">
            <el-option label="停用" :value="false" />
            <el-option label="启用" :value="true" />
          </el-select>
        </el-form-item>
      </el-col>

      <el-col :span="12">
        <el-form-item label="性别" prop="gender">
          <el-select v-model="model.gender" placeholder="请选择性别" clearable class="w-full">
            <el-option
              v-for="option in genderOptions"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </el-select>
        </el-form-item>
      </el-col>

      <el-col :span="12">
        <el-form-item label="邮箱" prop="mail">
          <el-input v-model.trim="model.mail" placeholder="请输入邮箱" clearable />
        </el-form-item>
      </el-col>

      <el-col :span="12">
        <el-form-item label="用户类型" prop="userType">
          <el-select v-model="model.userType" placeholder="请选择用户类型" class="w-full">
            <el-option
              v-for="option in userTypeOptions"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </el-select>
        </el-form-item>
      </el-col>

      <el-col :span="12">
        <el-form-item label="是否外部人员" prop="isExternal">
          <el-switch
            v-model="model.isExternal"
            inline-prompt
            active-text="是"
            inactive-text="否"
          />
        </el-form-item>
      </el-col>

      <el-col :span="24">
        <el-form-item label="备注" prop="remark">
          <el-input
            v-model.trim="model.remark"
            type="textarea"
            :rows="4"
            maxlength="200"
            show-word-limit
            placeholder="请输入备注"
          />
        </el-form-item>
      </el-col>
    </el-row>
  </el-form>
</template>

<style scoped>
.user-edit-form__avatar {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
}

.user-edit-form__meta {
  color: var(--one-text-color-secondary, var(--el-text-color-secondary));
  line-height: 1.8;
}

.user-edit-form__org-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 40px;
  padding: 0 12px;
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 600;
  color: var(--one-text-color-primary, var(--el-text-color-primary));
  background: var(--el-fill-color-light);
}

.user-edit-form__add-btn {
  width: 100%;
  border-style: dashed;
}

.user-edit-form__post-sort {
  display: flex;
  align-items: center;
  gap: 8px;
}

.user-edit-form__phone-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.user-edit-form__phone-item .el-input {
  flex: 1;
}
</style>
