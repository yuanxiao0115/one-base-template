<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';
import type { FormInstance, FormRules } from 'element-plus';
import type { ArticleDetail } from '../types';
import { formatReviewStatus, resolveReviewStatusTagType } from '../columns';

interface AuditReviewForm {
  reviewOpinion: string;
}

const props = withDefaults(
  defineProps<{
    modelValue: boolean;
    detail: ArticleDetail | null;
    loading?: boolean;
    submitting?: boolean;
  }>(),
  {
    loading: false,
    submitting: false
  }
);

const emit = defineEmits<{
  (event: 'update:modelValue', value: boolean): void;
  (event: 'submit', payload: { reviewStatus: 1 | 2; reviewOpinion: string }): void;
}>();

const formRef = ref<FormInstance>();
const formModel = reactive<AuditReviewForm>({
  reviewOpinion: ''
});

const rules: FormRules<AuditReviewForm> = {
  reviewOpinion: [
    {
      required: true,
      message: '请输入审核意见',
      trigger: 'blur'
    }
  ]
};

const visible = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit('update:modelValue', value)
});

const articleStatusText = computed(() => {
  if (!props.detail) {
    return '-';
  }
  return formatReviewStatus(props.detail.reviewStatus);
});

const articleStatusTagType = computed(() => {
  if (!props.detail) {
    return 'warning';
  }
  return resolveReviewStatusTagType(props.detail.reviewStatus);
});

watch(
  () => props.modelValue,
  (opened) => {
    if (!opened) {
      return;
    }
    formModel.reviewOpinion = '';
    formRef.value?.clearValidate();
  }
);

function closeDialog() {
  visible.value = false;
}

async function submitReview(reviewStatus: 1 | 2) {
  if (!props.detail) {
    return;
  }

  const valid = await formRef.value?.validate().catch(() => false);
  if (!valid) {
    return;
  }

  emit('submit', {
    reviewStatus,
    reviewOpinion: formModel.reviewOpinion.trim()
  });
}
</script>

<template>
  <el-dialog
    v-model="visible"
    title="文章审核"
    width="920px"
    append-to-body
    destroy-on-close
    class="audit-review-dialog"
  >
    <div v-loading="loading" class="audit-review-dialog__body">
      <el-empty v-if="!(detail || loading)" description="未获取到文章详情" :image-size="88" />

      <template v-else-if="detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="标题" :span="2">{{
            detail.articleTitle || '-'
          }}</el-descriptions-item>
          <el-descriptions-item label="作者">{{
            detail.articleAuthorName || '-'
          }}</el-descriptions-item>
          <el-descriptions-item label="发布时间">{{
            detail.publishTime || '-'
          }}</el-descriptions-item>
          <el-descriptions-item label="当前审核状态" :span="2">
            <el-tag :type="articleStatusTagType">{{ articleStatusText }}</el-tag>
          </el-descriptions-item>
        </el-descriptions>

        <section class="audit-review-dialog__section">
          <h4 class="audit-review-dialog__section-title">正文内容</h4>
          <div class="audit-review-dialog__content">{{ detail.articleContent || '-' }}</div>
        </section>

        <el-form ref="formRef" :model="formModel" :rules="rules" label-position="top">
          <el-form-item label="审核意见" prop="reviewOpinion">
            <el-input
              v-model.trim="formModel.reviewOpinion"
              type="textarea"
              :rows="4"
              maxlength="200"
              show-word-limit
              placeholder="请输入审核意见"
            />
          </el-form-item>
        </el-form>
      </template>
    </div>

    <template #footer>
      <div class="audit-review-dialog__footer">
        <el-button @click="closeDialog">取消</el-button>
        <el-button type="danger" :loading="submitting" @click="submitReview(2)">驳回</el-button>
        <el-button type="success" :loading="submitting" @click="submitReview(1)">通过</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<style scoped>
.audit-review-dialog__body {
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-height: 240px;
}

.audit-review-dialog__section-title {
  margin: 0 0 8px;
  font-size: 14px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.audit-review-dialog__content {
  max-height: 280px;
  overflow: auto;
  white-space: pre-wrap;
  word-break: break-word;
  line-height: 1.6;
  border: 1px solid var(--el-border-color-light);
  padding: 12px;
  border-radius: 4px;
  background: var(--el-fill-color-blank);
}

.audit-review-dialog__footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
</style>
