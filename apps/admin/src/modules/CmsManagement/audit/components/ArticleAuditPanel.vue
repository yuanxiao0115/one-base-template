<script setup lang="ts">
  import { reactive, ref } from "vue";
  import { useTable } from "@one-base-template/core";
  import { message } from "@one-base-template/ui";
  import {
    ARTICLE_TYPE_OPTIONS,
    REVIEW_STATUS_OPTIONS,
    articleAuditColumns,
    formatReviewStatus,
    resolveReviewStatusTagType,
  } from "../columns";
  import { auditApi } from "../api";
  import type { ArticleAuditRecord, ArticleDetail, ArticleListParams, ReviewStatus } from "../types";
  import AuditReviewDialog from "./AuditReviewDialog.vue";

  interface SearchRefExpose {
    resetFields?: () => void;
  }

  interface ArticleSearchForm extends Omit<ArticleListParams, "currentPage" | "pageSize"> {
    reviewStatus?: ReviewStatus | "";
    articleType?: number | "";
  }

  const tableRef = ref<unknown>(null);
  const searchRef = ref<SearchRefExpose>();
  const reviewArticle = ref<ArticleAuditRecord | null>(null);
  const reviewDetail = ref<ArticleDetail | null>(null);
  const reviewDialogVisible = ref(false);
  const reviewDialogLoading = ref(false);
  const reviewSubmitting = ref(false);

  const searchForm = reactive<ArticleSearchForm>({
    articleTitle: "",
    articleType: "",
    reviewStatus: "",
  });

  const tableOpt = reactive({
    query: {
      api: auditApi.listArticles,
      params: searchForm,
      pagination: true,
    },
  });

  const { loading, dataList, pagination, onSearch, resetForm, handleSizeChange, handleCurrentChange } = useTable(
    tableOpt,
    tableRef
  );

  function tableSearch(keyword: string) {
    searchForm.articleTitle = keyword;
    void onSearch();
  }

  function onKeywordUpdate(keyword: string) {
    searchForm.articleTitle = keyword;
  }

  function onResetSearch() {
    resetForm(searchRef, "articleTitle");
  }

  async function openReviewDialog(row: ArticleAuditRecord) {
    if (Number(row.reviewStatus) !== 0) {
      message.warning("仅待审核文章可执行审核操作");
      return;
    }

    reviewArticle.value = row;
    reviewDialogVisible.value = true;
    reviewDialogLoading.value = true;
    reviewDetail.value = null;

    try {
      const response = await auditApi.getArticleDetail(row.id);
      if (response.code !== 200) {
        throw new Error(response.message || "获取文章详情失败");
      }

      reviewDetail.value = response.data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "获取文章详情失败";
      message.error(errorMessage);
      reviewDialogVisible.value = false;
    } finally {
      reviewDialogLoading.value = false;
    }
  }

  function closeReviewDialog() {
    reviewDialogVisible.value = false;
    reviewArticle.value = null;
    reviewDetail.value = null;
  }

  async function handleReviewSubmit(payload: { reviewStatus: 1 | 2; reviewOpinion: string }) {
    if (!reviewArticle.value) {
      return;
    }

    reviewSubmitting.value = true;
    try {
      const response = await auditApi.reviewArticle({
        id: reviewArticle.value.id,
        reviewStatus: payload.reviewStatus,
        reviewOpinion: payload.reviewOpinion,
      });

      if (response.code !== 200) {
        throw new Error(response.message || "提交审核失败");
      }

      message.success(payload.reviewStatus === 1 ? "文章审核通过成功" : "文章驳回成功");
      closeReviewDialog();
      await onSearch(false);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "提交审核失败";
      message.error(errorMessage);
    } finally {
      reviewSubmitting.value = false;
    }
  }
</script>

<template>
  <ObTableBox
    title="文章审核"
    :columns="articleAuditColumns"
    placeholder="请输入标题搜索"
    :keyword="searchForm.articleTitle"
    @search="tableSearch"
    @update:keyword="onKeywordUpdate"
    @reset-form="onResetSearch"
  >
    <template #default="{ size, dynamicColumns }">
      <ObVxeTable
        :ref="tableRef"
        :loading
        :size
        :data="dataList"
        :columns="dynamicColumns"
        :pagination
        row-key="id"
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
              @click="() => openReviewDialog(row as ArticleAuditRecord)"
            >
              审核
            </el-button>
          </ObActionButtons>
        </template>
      </ObVxeTable>
    </template>

    <template #drawer>
      <el-form ref="searchRef" :model="searchForm" label-position="top" class="article-audit-panel__search-form">
        <el-form-item label="标题" prop="articleTitle">
          <el-input v-model="searchForm.articleTitle" placeholder="请输入标题" clearable />
        </el-form-item>

        <el-form-item label="文章类型" prop="articleType">
          <el-select v-model="searchForm.articleType" class="w-full" placeholder="请选择文章类型" clearable>
            <el-option v-for="item in ARTICLE_TYPE_OPTIONS" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>

        <el-form-item label="审核状态" prop="reviewStatus">
          <el-select v-model="searchForm.reviewStatus" class="w-full" placeholder="请选择审核状态" clearable>
            <el-option v-for="item in REVIEW_STATUS_OPTIONS" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
      </el-form>
    </template>
  </ObTableBox>

  <AuditReviewDialog
    v-model="reviewDialogVisible"
    :detail="reviewDetail"
    :loading="reviewDialogLoading"
    :submitting="reviewSubmitting"
    @submit="handleReviewSubmit"
  />
</template>

<style scoped>
  .article-audit-panel__search-form {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
</style>
