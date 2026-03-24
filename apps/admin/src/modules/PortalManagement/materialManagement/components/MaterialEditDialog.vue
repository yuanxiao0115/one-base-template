<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';
import { message } from '@one-base-template/ui';
import { materialApi } from '../api';
import type { MaterialCategoryRecord, MaterialRecord } from '../types';
import {
  isBizSuccess,
  MATERIAL_NAME_MAX_LENGTH,
  normalizeMaterialRows,
  resolveResourceUrl,
  toIdLike,
  toSafeName
} from '../composables/material-helpers';

const props = defineProps<{
  modelValue: boolean;
  materialId: string;
  fodderType: number;
  categories: MaterialCategoryRecord[];
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
  (e: 'updated'): void;
}>();

const visible = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit('update:modelValue', value)
});

const loading = ref(false);
const submitting = ref(false);
const detail = ref<MaterialRecord | null>(null);

const form = reactive({
  fodderName: '',
  fodderLabelIds: [] as string[]
});

const previewUrl = computed(() => {
  if (!detail.value) {
    return '';
  }
  return resolveResourceUrl(toIdLike(detail.value.fileId));
});

function parseLabelIds(row: MaterialRecord | null): string[] {
  if (!row) {
    return [];
  }
  return String(row.fodderLabelId || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

async function loadDetail() {
  const id = props.materialId.trim();
  if (!id) {
    return;
  }

  loading.value = true;
  try {
    const response = await materialApi.getMaterialDetail({ id });
    if (!isBizSuccess(response)) {
      message.error(response?.message || '加载素材详情失败');
      return;
    }

    const row = normalizeMaterialRows({ records: [response?.data || {}] })[0] || null;
    detail.value = row;
    form.fodderName = toSafeName(row?.fodderName);
    form.fodderLabelIds = parseLabelIds(row);
  } catch (error) {
    message.error(error instanceof Error ? error.message : '加载素材详情失败');
  } finally {
    loading.value = false;
  }
}

async function onConfirm() {
  const id = props.materialId.trim();
  if (!id) {
    return;
  }

  const fodderName = form.fodderName.trim();
  if (!fodderName) {
    message.warning('请输入素材名称');
    return;
  }

  if (fodderName.length > MATERIAL_NAME_MAX_LENGTH) {
    message.warning(`素材名称不能超过 ${MATERIAL_NAME_MAX_LENGTH} 个字符`);
    return;
  }

  submitting.value = true;
  try {
    const response = await materialApi.updateMaterial({
      id,
      fodderName,
      fodderType: props.fodderType,
      fileId: toIdLike(detail.value?.fileId),
      fileLength: toSafeName(detail.value?.fileLength),
      fileSize: toSafeName(detail.value?.fileSize),
      fileType: toSafeName(detail.value?.fileType),
      dpi: toSafeName(detail.value?.dpi),
      fodderLabelList:
        form.fodderLabelIds.length > 0
          ? form.fodderLabelIds.map((item) => ({ fodderLabelId: item }))
          : [{ fodderLabelId: 0 }]
    });

    if (!isBizSuccess(response)) {
      message.error(response?.message || '保存素材失败');
      return;
    }

    message.success('保存素材成功');
    visible.value = false;
    emit('updated');
  } catch (error) {
    message.error(error instanceof Error ? error.message : '保存素材失败');
  } finally {
    submitting.value = false;
  }
}

watch(
  () => visible.value,
  (value) => {
    if (!value) {
      return;
    }
    void loadDetail();
  }
);
</script>

<template>
  <ObCrudContainer
    v-model="visible"
    container="dialog"
    mode="edit"
    title="编辑素材"
    :loading="submitting"
    confirm-text="保存"
    :dialog-width="760"
    :close-on-click-modal="false"
    @confirm="onConfirm"
  >
    <div v-loading="loading" class="material-edit-dialog">
      <div class="preview-box">
        <el-image v-if="previewUrl" :src="previewUrl" fit="contain" class="preview-image" />
        <div v-else class="preview-image preview-empty">无预览图</div>
      </div>

      <el-form label-position="top" class="form-box">
        <el-form-item label="素材名称">
          <el-input
            v-model.trim="form.fodderName"
            maxlength="32"
            show-word-limit
            placeholder="请输入素材名称"
            @keydown.enter.prevent="onConfirm"
          />
        </el-form-item>

        <el-form-item label="所属分类">
          <el-select
            v-model="form.fodderLabelIds"
            multiple
            filterable
            clearable
            collapse-tags
            collapse-tags-tooltip
            placeholder="请选择分类"
            class="w-full"
          >
            <el-option
              v-for="item in props.categories"
              :key="String(item.id || '')"
              :label="String(item.labelName || '')"
              :value="String(item.id || '')"
            />
          </el-select>
        </el-form-item>
      </el-form>
    </div>
  </ObCrudContainer>
</template>

<style scoped>
.material-edit-dialog {
  --edit-border: #e5e7eb;
  --edit-text: #0f172a;
  --edit-sub: #52637a;
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 16px;
  padding: 2px;
}

.preview-box {
  border: 1px solid var(--edit-border);
  border-radius: 12px;
  overflow: hidden;
  background: #f8fafc;
}

.preview-image {
  width: 100%;
  height: 260px;
  display: block;
}

.preview-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--edit-sub);
  background: var(--el-fill-color-light);
}

.form-box {
  border: 1px solid var(--edit-border);
  border-radius: 12px;
  padding: 14px;
  background: #fff;
  min-width: 0;
}

.form-box :deep(.el-form-item__label) {
  color: var(--edit-sub);
  font-size: 13px;
  font-weight: 500;
}

.form-box :deep(.el-input__wrapper),
.form-box :deep(.el-select__wrapper) {
  border-radius: 10px;
}

@media (width <= 900px) {
  .material-edit-dialog {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .preview-image {
    height: 200px;
  }
}
</style>
