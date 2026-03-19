<script setup lang="ts">
import { computed, reactive, ref } from 'vue';
import { Delete } from '@element-plus/icons-vue';
import { useTable } from '@one-base-template/core';
import type { FormInstance, FormRules } from 'element-plus';
import { message } from '@one-base-template/ui';
import {
  REVIEW_STATUS_OPTIONS,
  commentAuditColumns,
  formatReviewStatus,
  resolveReviewStatusTagType
} from '../columns';
import { auditApi } from '../api';
import type { CommentAuditRecord, CommentDetail, CommentListParams, ReviewStatus } from '../types';

interface SearchRefExpose {
  resetFields?: () => void;
}

interface CommentSearchForm extends Omit<CommentListParams, 'currentPage' | 'pageSize'> {
  reviewStatus?: ReviewStatus | '';
}

interface CommentReviewForm {
  reviewOpinion: string;
}

type CommentDialogMode = 'review' | 'detail';

const tableRef = ref<unknown>(null);
const searchRef = ref<SearchRefExpose>();
const reviewFormRef = ref<FormInstance>();
const selectedRows = ref<CommentAuditRecord[]>([]);

const dialogVisible = ref(false);
const dialogLoading = ref(false);
const dialogSubmitting = ref(false);
const dialogMode = ref<CommentDialogMode>('detail');
const currentCommentDetail = ref<CommentDetail | null>(null);

const searchForm = reactive<CommentSearchForm>({
  articleTitle: '',
  commentatorName: '',
  reviewStatus: ''
});

const reviewForm = reactive<CommentReviewForm>({
  reviewOpinion: ''
});

const reviewFormRules: FormRules<CommentReviewForm> = {
  reviewOpinion: [
    {
      required: true,
      message: '请输入审核意见',
      trigger: 'blur'
    }
  ]
};

const tableOpt = reactive({
  query: {
    api: auditApi.listComments,
    params: searchForm,
    pagination: true
  }
});

const {
  loading,
  dataList,
  pagination,
  selectedNum,
  onSearch,
  resetForm,
  onSelectionCancel,
  handleSelectionChange,
  handleSizeChange,
  handleCurrentChange
} = useTable(tableOpt, tableRef);

const isReviewMode = computed(() => dialogMode.value === 'review');
const dialogTitle = computed(() => (isReviewMode.value ? '评论审核' : '评论详情'));

function isConfirmCanceled(error: unknown): boolean {
  return error === 'cancel' || error === 'close';
}

function tableSearch(keyword: string) {
  searchForm.articleTitle = keyword;
  void onSearch();
}

function onKeywordUpdate(keyword: string) {
  searchForm.articleTitle = keyword;
}

function onResetSearch() {
  resetForm(searchRef, 'articleTitle');
}

function onSelectionChange(selection: unknown[]) {
  handleSelectionChange(selection);
  selectedRows.value = selection as CommentAuditRecord[];
}

function clearSelection() {
  onSelectionCancel();
  selectedRows.value = [];
}

async function openCommentDialog(row: CommentAuditRecord, mode: CommentDialogMode) {
  if (mode === 'review' && Number(row.reviewStatus) !== 0) {
    message.warning('仅待审核评论可执行审核操作');
    return;
  }

  dialogMode.value = mode;
  dialogVisible.value = true;
  dialogLoading.value = true;
  currentCommentDetail.value = null;
  reviewForm.reviewOpinion = '';
  reviewFormRef.value?.clearValidate();

  try {
    const response = await auditApi.getCommentDetail(row.id);
    if (response.code !== 200) {
      throw new Error(response.message || '获取评论详情失败');
    }

    currentCommentDetail.value = response.data;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '获取评论详情失败';
    message.error(errorMessage);
    dialogVisible.value = false;
  } finally {
    dialogLoading.value = false;
  }
}

function closeDialog() {
  dialogVisible.value = false;
  dialogMode.value = 'detail';
  currentCommentDetail.value = null;
  reviewForm.reviewOpinion = '';
  reviewFormRef.value?.clearValidate();
}

async function submitCommentReview(reviewStatus: 1 | 2) {
  if (!currentCommentDetail.value) {
    return;
  }

  const valid = await reviewFormRef.value?.validate().catch(() => false);
  if (!valid) {
    return;
  }

  dialogSubmitting.value = true;
  try {
    const response = await auditApi.reviewComment({
      id: currentCommentDetail.value.id,
      reviewStatus,
      reviewOpinion: reviewForm.reviewOpinion.trim()
    });

    if (response.code !== 200) {
      throw new Error(response.message || '评论审核提交失败');
    }

    message.success(reviewStatus === 1 ? '评论审核通过成功' : '评论驳回成功');
    closeDialog();
    await onSearch(false);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '评论审核提交失败';
    message.error(errorMessage);
  } finally {
    dialogSubmitting.value = false;
  }
}

async function deleteComment(row: CommentAuditRecord) {
  try {
    await obConfirm.warn('确认删除该条评论吗？', '删除确认');

    const response = await auditApi.removeComment({
      id: row.id,
      cmsArticleId: row.cmsArticleId
    });

    if (response.code !== 200) {
      throw new Error(response.message || '删除评论失败');
    }

    message.success('删除评论成功');
    await onSearch(false);
  } catch (error) {
    if (isConfirmCanceled(error)) {
      return;
    }
    const errorMessage = error instanceof Error ? error.message : '删除评论失败';
    message.error(errorMessage);
  }
}

async function batchDeleteComments() {
  if (selectedRows.value.length === 0) {
    message.warning('请先选择评论');
    return;
  }

  try {
    await obConfirm.warn(`确认删除选中的 ${selectedRows.value.length} 条评论吗？`, '批量删除确认');

    const response = await auditApi.removeComment({
      ids: selectedRows.value.map((item) => item.id)
    });

    if (response.code !== 200) {
      throw new Error(response.message || '批量删除评论失败');
    }

    message.success('批量删除评论成功');
    clearSelection();
    await onSearch(false);
  } catch (error) {
    if (isConfirmCanceled(error)) {
      return;
    }
    const errorMessage = error instanceof Error ? error.message : '批量删除评论失败';
    message.error(errorMessage);
  }
}
</script>

<template>
  <ObTableBox
    title="评论审核"
    :columns="commentAuditColumns"
    :selected-num="selectedNum"
    placeholder="请输入文章标题搜索"
    :keyword="searchForm.articleTitle"
    @search="tableSearch"
    @update:keyword="onKeywordUpdate"
    @reset-form="onResetSearch"
    @selection-cancel="clearSelection"
  >
    <template #buttons>
      <el-button :icon="Delete" :disabled="selectedRows.length === 0" @click="batchDeleteComments"
        >批量删除</el-button
      >
    </template>

    <template #default="{ size, dynamicColumns }">
      <ObVxeTable
        :ref="tableRef"
        :loading
        :size
        :data="dataList"
        :columns="dynamicColumns"
        :pagination
        row-key="id"
        @selection-change="onSelectionChange"
        @page-size-change="handleSizeChange"
        @page-current-change="handleCurrentChange"
      >
        <template #reviewStatus="{ row }">
          <el-tag :type="resolveReviewStatusTagType(row.reviewStatus)">
            {{ formatReviewStatus(row.reviewStatus) }}
          </el-tag>
        </template>

        <template #operation="{ row, size: actionSize }">
          <ObActionButtons>
            <el-button
              link
              type="primary"
              :size="actionSize"
              :disabled="Number(row.reviewStatus) !== 0"
              @click="() => openCommentDialog(row as CommentAuditRecord, 'review')"
            >
              审核
            </el-button>
            <el-button
              link
              type="primary"
              :size="actionSize"
              @click="() => openCommentDialog(row as CommentAuditRecord, 'detail')"
            >
              详情
            </el-button>
            <el-button
              link
              type="danger"
              :size="actionSize"
              @click="() => deleteComment(row as CommentAuditRecord)"
            >
              删除
            </el-button>
          </ObActionButtons>
        </template>
      </ObVxeTable>
    </template>

    <template #drawer>
      <el-form
        ref="searchRef"
        :model="searchForm"
        label-position="top"
        class="comment-audit-panel__search-form"
      >
        <el-form-item label="文章标题" prop="articleTitle">
          <el-input v-model="searchForm.articleTitle" placeholder="请输入文章标题" clearable />
        </el-form-item>

        <el-form-item label="评论人" prop="commentatorName">
          <el-input v-model="searchForm.commentatorName" placeholder="请输入评论人" clearable />
        </el-form-item>

        <el-form-item label="审核状态" prop="reviewStatus">
          <el-select
            v-model="searchForm.reviewStatus"
            class="w-full"
            placeholder="请选择审核状态"
            clearable
          >
            <el-option
              v-for="item in REVIEW_STATUS_OPTIONS"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
      </el-form>
    </template>
  </ObTableBox>

  <el-dialog
    v-model="dialogVisible"
    :title="dialogTitle"
    width="780px"
    append-to-body
    destroy-on-close
    @closed="closeDialog"
  >
    <div v-loading="dialogLoading" class="comment-audit-panel__dialog-body">
      <el-empty
        v-if="!(currentCommentDetail || dialogLoading)"
        description="未获取到评论详情"
        :image-size="88"
      />

      <template v-else-if="currentCommentDetail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="文章标题" :span="2">{{
            currentCommentDetail.articleTitle || '-'
          }}</el-descriptions-item>
          <el-descriptions-item label="评论人">{{
            currentCommentDetail.commentatorName || '-'
          }}</el-descriptions-item>
          <el-descriptions-item label="评论时间">{{
            currentCommentDetail.commentTime || '-'
          }}</el-descriptions-item>
          <el-descriptions-item label="审核状态" :span="2">
            <el-tag :type="resolveReviewStatusTagType(currentCommentDetail.reviewStatus)">
              {{ formatReviewStatus(currentCommentDetail.reviewStatus) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item v-if="!isReviewMode" label="审核人">
            {{ currentCommentDetail.reviewerName || '-' }}
          </el-descriptions-item>
          <el-descriptions-item v-if="!isReviewMode" label="审核意见">
            {{ currentCommentDetail.reviewOpinion || '-' }}
          </el-descriptions-item>
        </el-descriptions>

        <section class="comment-audit-panel__dialog-section">
          <h4 class="comment-audit-panel__dialog-section-title">评论内容</h4>
          <div class="comment-audit-panel__comment-content">
            {{ currentCommentDetail.commentContent || '-' }}
          </div>
        </section>

        <el-form
          v-if="isReviewMode"
          ref="reviewFormRef"
          :model="reviewForm"
          :rules="reviewFormRules"
          label-position="top"
        >
          <el-form-item label="审核意见" prop="reviewOpinion">
            <el-input
              v-model.trim="reviewForm.reviewOpinion"
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
      <div class="comment-audit-panel__dialog-footer">
        <template v-if="isReviewMode">
          <el-button @click="closeDialog">取消</el-button>
          <el-button type="danger" :loading="dialogSubmitting" @click="submitCommentReview(2)"
            >驳回</el-button
          >
          <el-button type="success" :loading="dialogSubmitting" @click="submitCommentReview(1)"
            >通过</el-button
          >
        </template>
        <el-button v-else type="primary" @click="closeDialog">关闭</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<style scoped>
.comment-audit-panel__search-form {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.comment-audit-panel__dialog-body {
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-height: 220px;
}

.comment-audit-panel__dialog-section-title {
  margin: 0 0 8px;
  font-size: 14px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.comment-audit-panel__comment-content {
  max-height: 220px;
  overflow: auto;
  white-space: pre-wrap;
  word-break: break-word;
  line-height: 1.6;
  border: 1px solid var(--el-border-color-light);
  padding: 12px;
  border-radius: 4px;
  background: var(--el-fill-color-blank);
}

.comment-audit-panel__dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
</style>
