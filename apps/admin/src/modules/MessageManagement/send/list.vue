<!-- eslint-disable max-lines -->
<script setup lang="ts">
/* eslint-disable max-lines */
import { computed, getCurrentInstance, onMounted, reactive, ref, watch } from 'vue';
import { Plus } from '@element-plus/icons-vue';
import { openPersonnelSelection } from '@/components/PersonnelSelector';
import type {
  PersonnelSelectedOrg,
  PersonnelSelectedUser,
  PersonnelSelectMode
} from '@/components/PersonnelSelector/types';
import {
  fetchPersonnelTreeByLegacyApi,
  searchPersonnelUsersByStructure
} from '@/components/PersonnelSelector/contactDataSource';
import type { TableColumnList } from '@one-base-template/ui';
import { message, obConfirm } from '@one-base-template/ui';
import { messageCategoryApi, messageSendApi, messageTemplateApi } from './api';
import type {
  MessageCategoryRecord,
  MessageReceiverConfig,
  MessageReceiverItem,
  MessageSendPayload,
  MessageSendType,
  MessageTemplateRecord
} from './types';
import { SEND_TYPE } from './types';
import { createLatestRequestGuard } from '../shared/latestRequest';
import { getErrorMessage, isCancelled, normalizePageRecords } from '../shared/utils';

defineOptions({
  name: 'MessageManagementSendPage'
});

interface SendPreviewRow {
  id: string;
  type: string;
  name: string;
  subTitle: string;
}

interface SendPreviewExpose {
  validate?: () => Promise<boolean> | boolean;
}

const instance = getCurrentInstance();
const formRef = ref<SendPreviewExpose>();

const categoryLoading = ref(false);
const templateLoading = ref(false);
const sending = ref(false);
const previewVisible = ref(false);
const previewSubmitting = ref(false);
const templateId = ref('');
const selectedCategories = ref<MessageCategoryRecord[]>([]);
const selectedTemplates = ref<MessageTemplateRecord[]>([]);
const selectedUsers = ref<PersonnelSelectedUser[]>([]);
const selectedOrgs = ref<PersonnelSelectedOrg[]>([]);

const form = reactive<MessageSendPayload>({
  title: '',
  cateId: '',
  sender: '',
  content: '',
  sendType: SEND_TYPE.immediate,
  sendTime: '',
  cron: '',
  receiverConfig: {
    containsChildren: false,
    userList: [],
    orgList: [],
    roleList: []
  }
});

const categoryGuard = createLatestRequestGuard();
const templateGuard = createLatestRequestGuard();
const templateDetailGuard = createLatestRequestGuard();

const sendTypeOptions: Array<{ label: string; value: MessageSendType }> = [
  {
    label: '立即发送',
    value: SEND_TYPE.immediate
  },
  {
    label: '定时发送',
    value: SEND_TYPE.scheduled
  },
  {
    label: '周期发送',
    value: SEND_TYPE.periodic
  }
];

const categoryOptions = computed(() =>
  selectedCategories.value.map((item) => ({
    label: item.name,
    value: item.id
  }))
);

const templateOptions = computed(() =>
  selectedTemplates.value.map((item) => ({
    label: item.title,
    value: item.id
  }))
);

const receiverPreviewRows = computed<SendPreviewRow[]>(() => {
  const rows: SendPreviewRow[] = [];

  selectedUsers.value.forEach((item) => {
    rows.push({
      id: `user:${item.id}`,
      type: '人员',
      name: item.nickName || item.title,
      subTitle: item.phone || item.userAccount || '--'
    });
  });

  selectedOrgs.value.forEach((item) => {
    rows.push({
      id: `org:${item.id}`,
      type: '组织',
      name: item.title,
      subTitle: item.subTitle || '--'
    });
  });

  return rows;
});

const receiverPreviewColumns: TableColumnList = [
  {
    label: '类型',
    prop: 'type',
    width: 96
  },
  {
    label: '名称',
    prop: 'name',
    minWidth: 200
  },
  {
    label: '补充信息',
    prop: 'subTitle',
    minWidth: 180
  },
  {
    label: '操作',
    width: 110,
    fixed: 'right',
    align: 'right',
    slot: 'operation'
  }
];

const receiverConfig = computed<MessageReceiverConfig>(() => ({
  containsChildren: Boolean(form.receiverConfig.containsChildren),
  userList: selectedUsers.value.map((item) => ({
    id: item.id,
    name: item.nickName || item.title
  })),
  orgList: selectedOrgs.value.map((item) => ({
    id: item.id,
    name: item.title
  })),
  roleList: []
}));

function getSendTypeLabel(sendType: MessageSendType): string {
  if (sendType === SEND_TYPE.scheduled) {
    return '定时发送';
  }
  if (sendType === SEND_TYPE.periodic) {
    return '周期发送';
  }
  return '立即发送';
}

function getSelectedItemsPayload() {
  return [
    ...selectedUsers.value.map((item) => ({
      id: item.id,
      title: item.nickName || item.title,
      subTitle: item.phone || item.userAccount || '--',
      nodeType: 'user' as const
    })),
    ...selectedOrgs.value.map((item) => ({
      id: item.id,
      title: item.title,
      subTitle: item.subTitle,
      nodeType: 'org' as const
    }))
  ];
}

function applySelectionResult(result: {
  users: PersonnelSelectedUser[];
  orgs: PersonnelSelectedOrg[];
}) {
  const userMap = new Map<string, PersonnelSelectedUser>();
  selectedUsers.value.forEach((item) => {
    userMap.set(item.id, item);
  });
  result.users.forEach((item) => {
    userMap.set(item.id, item);
  });

  const orgMap = new Map<string, PersonnelSelectedOrg>();
  selectedOrgs.value.forEach((item) => {
    orgMap.set(item.id, item);
  });
  result.orgs.forEach((item) => {
    orgMap.set(item.id, item);
  });

  selectedUsers.value = Array.from(userMap.values());
  selectedOrgs.value = Array.from(orgMap.values());
}

function resetRecipients() {
  selectedUsers.value = [];
  selectedOrgs.value = [];
  form.receiverConfig.containsChildren = false;
}

function resetForm() {
  form.title = '';
  form.cateId = '';
  form.sender = '';
  form.content = '';
  form.sendType = SEND_TYPE.immediate;
  form.sendTime = '';
  form.cron = '';
  templateId.value = '';
  resetRecipients();
}

async function loadCategories() {
  const token = categoryGuard.next();
  categoryLoading.value = true;

  try {
    const response = await messageCategoryApi.list({
      currentPage: 1,
      pageSize: 99
    });

    if (!categoryGuard.isLatest(token)) {
      return;
    }

    if (response.code !== 200) {
      throw new Error(response.message || '加载消息分类失败');
    }

    selectedCategories.value = normalizePageRecords<MessageCategoryRecord>(response.data);
  } catch (error) {
    if (categoryGuard.isLatest(token)) {
      message.error(getErrorMessage(error, '加载消息分类失败'));
    }
  } finally {
    if (categoryGuard.isLatest(token)) {
      categoryLoading.value = false;
    }
  }
}

async function loadTemplates() {
  const token = templateGuard.next();
  templateLoading.value = true;

  try {
    const response = await messageTemplateApi.list({
      currentPage: 1,
      pageSize: 100
    });

    if (!templateGuard.isLatest(token)) {
      return;
    }

    if (response.code !== 200) {
      throw new Error(response.message || '加载消息模板失败');
    }

    selectedTemplates.value = normalizePageRecords<MessageTemplateRecord>(response.data);
  } catch (error) {
    if (templateGuard.isLatest(token)) {
      message.error(getErrorMessage(error, '加载消息模板失败'));
    }
  } finally {
    if (templateGuard.isLatest(token)) {
      templateLoading.value = false;
    }
  }
}

async function applyTemplate(templateIdValue: string) {
  if (!templateIdValue) {
    return;
  }

  const template = selectedTemplates.value.find((item) => item.id === templateIdValue);
  if (!template) {
    return;
  }

  if (form.content.trim()) {
    try {
      await obConfirm.warn('当前已有正文内容，应用模板会覆盖正文，是否继续？', '应用模板');
    } catch (error) {
      if (isCancelled(error)) {
        templateId.value = '';
        return;
      }
      throw error;
    }
  }

  const token = templateDetailGuard.next();
  try {
    const response = await messageTemplateApi.detail(templateIdValue);
    if (!templateDetailGuard.isLatest(token)) {
      return;
    }

    if (response.code !== 200) {
      throw new Error(response.message || '加载模板详情失败');
    }

    form.content = response.data.content || '';
    form.cateId = response.data.cateId || form.cateId;
    message.success('模板内容已应用');
  } catch (error) {
    if (templateDetailGuard.isLatest(token)) {
      message.error(getErrorMessage(error, '加载模板详情失败'));
      templateId.value = '';
    }
  }
}

async function openReceiverSelector(mode: PersonnelSelectMode) {
  try {
    const result = await openPersonnelSelection({
      title: mode === 'org' ? '选择组织' : '选择人员',
      mode,
      selectionField: mode === 'org' ? 'orgIds' : 'userIds',
      allowSelectOrg: mode === 'person',
      required: false,
      selectedItems: getSelectedItemsPayload(),
      model: {
        userIds: selectedUsers.value.map((item) => item.id),
        orgIds: selectedOrgs.value.map((item) => item.id),
        roleIds: [],
        positionIds: []
      },
      fetchNodes: async ({ parentId }) => {
        const response = await fetchPersonnelTreeByLegacyApi({
          parentId
        });
        if (response.code !== 200) {
          throw new Error(response.message || '加载通讯录失败');
        }
        return response.data;
      },
      searchNodes: async ({ keyword }) => {
        const response = await searchPersonnelUsersByStructure({
          search: keyword
        });
        if (response.code !== 200) {
          throw new Error(response.message || '搜索人员失败');
        }
        return response.data;
      },
      appContext: instance?.appContext
    });

    applySelectionResult({
      users: result.users,
      orgs: result.orgs
    });
  } catch (error) {
    if (!isCancelled(error)) {
      message.error(getErrorMessage(error, '选择收件人失败'));
    }
  }
}

function removeReceiver(rowId: string) {
  const [scope, id] = rowId.split(':');
  if (scope === 'user') {
    selectedUsers.value = selectedUsers.value.filter((item) => item.id !== id);
  }
  if (scope === 'org') {
    selectedOrgs.value = selectedOrgs.value.filter((item) => item.id !== id);
  }
}

function buildSendPayload(): MessageSendPayload {
  return {
    title: form.title.trim(),
    cateId: form.cateId,
    sender: form.sender.trim(),
    content: form.content.trim(),
    sendType: form.sendType,
    receiverConfig: receiverConfig.value,
    sendTime: form.sendType === SEND_TYPE.scheduled ? form.sendTime : undefined,
    cron: form.sendType === SEND_TYPE.periodic ? (form.cron || '').trim() : undefined
  };
}

async function validateSendForm() {
  if (!form.title.trim()) {
    throw new Error('请输入消息标题');
  }
  if (!form.cateId) {
    throw new Error('请选择消息分类');
  }
  if (!form.sender.trim()) {
    throw new Error('请输入发件人');
  }
  if (!form.content.trim()) {
    throw new Error('请输入消息正文');
  }
  if (receiverPreviewRows.value.length === 0) {
    throw new Error('请至少选择一个收件人');
  }
  if (form.sendType === SEND_TYPE.scheduled && !form.sendTime) {
    throw new Error('定时发送请设置发送时间');
  }
  if (form.sendType === SEND_TYPE.periodic && !(form.cron || '').trim()) {
    throw new Error('周期发送请设置 CRON 表达式');
  }
}

async function openSendPreview() {
  try {
    await validateSendForm();
    previewVisible.value = true;
  } catch (error) {
    message.error(getErrorMessage(error, '请先完善发送信息'));
  }
}

async function submitSend() {
  if (previewSubmitting.value) {
    return;
  }

  previewSubmitting.value = true;
  sending.value = true;

  try {
    const response = await messageSendApi.send(buildSendPayload());
    if (response.code !== 200) {
      throw new Error(response.message || '发送失败');
    }

    message.success('消息发送成功');
    previewVisible.value = false;
    resetForm();
  } catch (error) {
    message.error(getErrorMessage(error, '消息发送失败'));
  } finally {
    previewSubmitting.value = false;
    sending.value = false;
  }
}

async function clearForm() {
  try {
    await obConfirm.warn('确定清空当前发送内容吗？', '清空确认');
    resetForm();
  } catch (error) {
    if (!isCancelled(error)) {
      message.error(getErrorMessage(error, '清空失败'));
    }
  }
}

watch(
  () => form.sendType,
  (nextType, prevType) => {
    if (nextType !== SEND_TYPE.scheduled) {
      form.sendTime = '';
    }
    if (nextType !== SEND_TYPE.periodic) {
      form.cron = '';
    }
    if (prevType !== nextType) {
      previewVisible.value = false;
    }
  }
);

onMounted(() => {
  void loadCategories();
  void loadTemplates();
});
</script>

<template>
  <ObPageContainer padding="0" overflow="hidden">
    <ObTableBox title="消息发送" :columns="[]" :show-search-bar="false">
      <template #buttons>
        <el-button :loading="categoryLoading || templateLoading" @click="loadCategories">
          刷新分类
        </el-button>
        <el-button :loading="categoryLoading || templateLoading" @click="loadTemplates">
          刷新模板
        </el-button>
        <el-button @click="clearForm">清空</el-button>
        <el-button type="primary" :icon="Plus" :loading="sending" @click="openSendPreview">
          发送
        </el-button>
      </template>

      <template #default>
        <div class="message-send-page">
          <el-form label-position="top" :model="form" class="message-send-page__form">
            <el-row :gutter="16">
              <el-col :span="12">
                <el-form-item label="消息标题" required>
                  <el-input v-model="form.title" maxlength="80" show-word-limit />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="消息分类" required>
                  <el-select
                    v-model="form.cateId"
                    filterable
                    clearable
                    placeholder="请选择消息分类"
                  >
                    <el-option
                      v-for="item in categoryOptions"
                      :key="item.value"
                      :label="item.label"
                      :value="item.value"
                    />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>

            <el-row :gutter="16">
              <el-col :span="12">
                <el-form-item label="发件人" required>
                  <el-input v-model="form.sender" maxlength="40" show-word-limit />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="模板套用">
                  <el-select
                    v-model="templateId"
                    clearable
                    filterable
                    placeholder="选择模板后自动套用正文"
                    @change="applyTemplate"
                  >
                    <el-option
                      v-for="item in templateOptions"
                      :key="item.value"
                      :label="item.label"
                      :value="item.value"
                    />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>

            <el-form-item label="消息正文" required>
              <el-input
                v-model="form.content"
                type="textarea"
                :rows="8"
                placeholder="请输入消息正文"
                maxlength="2000"
                show-word-limit
              />
            </el-form-item>

            <el-row :gutter="16">
              <el-col :span="8">
                <el-form-item label="发送方式" required>
                  <el-radio-group v-model="form.sendType">
                    <el-radio v-for="item in sendTypeOptions" :key="item.value" :value="item.value">
                      {{ item.label }}
                    </el-radio>
                  </el-radio-group>
                </el-form-item>
              </el-col>
              <el-col v-if="form.sendType === SEND_TYPE.scheduled" :span="8">
                <el-form-item label="发送时间" required>
                  <el-date-picker
                    v-model="form.sendTime"
                    type="datetime"
                    value-format="YYYY-MM-DD HH:mm:ss"
                    placeholder="请选择发送时间"
                  />
                </el-form-item>
              </el-col>
              <el-col v-if="form.sendType === SEND_TYPE.periodic" :span="8">
                <el-form-item label="CRON 表达式" required>
                  <el-input v-model="form.cron" placeholder="例如：0 0 9 * * ?" />
                </el-form-item>
              </el-col>
            </el-row>

            <el-form-item label="接收规则">
              <el-checkbox v-model="form.receiverConfig.containsChildren">
                包含下级组织人员
              </el-checkbox>
            </el-form-item>

            <el-form-item label="收件人">
              <div class="message-send-page__receiver-actions">
                <el-button @click="openReceiverSelector('person')">选择人员</el-button>
                <el-button @click="openReceiverSelector('org')">选择组织</el-button>
                <el-button type="danger" plain @click="resetRecipients">清空收件人</el-button>
              </div>
            </el-form-item>

            <ObTableBox
              class="message-send-page__receiver-box"
              title="收件人预览"
              :columns="receiverPreviewColumns"
              :show-search-bar="false"
            >
              <template #default="{ size, dynamicColumns }">
                <ObTable
                  :size
                  :data="receiverPreviewRows"
                  :columns="dynamicColumns"
                  :pagination="false"
                  row-key="id"
                >
                  <template #operation="{ row, size: actionSize }">
                    <ObActionButtons>
                      <el-button
                        link
                        type="danger"
                        :size="actionSize"
                        @click="removeReceiver(row.id)"
                      >
                        移除
                      </el-button>
                    </ObActionButtons>
                  </template>
                </ObTable>
              </template>
            </ObTableBox>
          </el-form>
        </div>
      </template>
    </ObTableBox>
  </ObPageContainer>

  <ObCrudContainer
    v-model="previewVisible"
    container="dialog"
    mode="edit"
    title="发送确认"
    :loading="previewSubmitting"
    confirm-text="确认发送"
    :dialog-width="720"
    @confirm="submitSend"
    @cancel="previewVisible = false"
    @close="previewVisible = false"
  >
    <el-descriptions :column="2" border>
      <el-descriptions-item label="标题">{{ form.title || '--' }}</el-descriptions-item>
      <el-descriptions-item label="分类">{{ form.cateId || '--' }}</el-descriptions-item>
      <el-descriptions-item label="发件人">{{ form.sender || '--' }}</el-descriptions-item>
      <el-descriptions-item label="发送方式">{{
        getSendTypeLabel(form.sendType)
      }}</el-descriptions-item>
      <el-descriptions-item v-if="form.sendType === SEND_TYPE.scheduled" label="发送时间">
        {{ form.sendTime || '--' }}
      </el-descriptions-item>
      <el-descriptions-item v-if="form.sendType === SEND_TYPE.periodic" label="CRON">
        {{ form.cron || '--' }}
      </el-descriptions-item>
      <el-descriptions-item label="收件人数">{{ receiverPreviewRows.length }}</el-descriptions-item>
      <el-descriptions-item label="包含下级组织">
        {{ form.receiverConfig.containsChildren ? '是' : '否' }}
      </el-descriptions-item>
    </el-descriptions>

    <el-divider content-position="left">消息正文</el-divider>
    <div class="message-send-page__preview-content">{{ form.content || '--' }}</div>
  </ObCrudContainer>
</template>

<style scoped>
.message-send-page {
  padding: 16px;
}

.message-send-page__form {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.message-send-page__receiver-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.message-send-page__receiver-box {
  margin-top: 4px;
}

.message-send-page__preview-content {
  padding: 12px 14px;
  min-height: 96px;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
  background: var(--el-fill-color-blank);
  white-space: pre-wrap;
  line-height: 1.75;
}
</style>
