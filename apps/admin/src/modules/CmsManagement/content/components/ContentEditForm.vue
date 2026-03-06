<script setup lang="ts">
  import { computed, ref } from "vue";
  import type { FormInstance, FormRules } from "element-plus";
  import type { CrudFormLike } from "@one-base-template/ui";
  import type { ContentCategoryRecord } from "../api";
  import type { ContentForm } from "../form";

  const props = defineProps<{
    rules: FormRules<ContentForm>;
    disabled: boolean;
    categoryTreeOptions: ContentCategoryRecord[];
    categoryTreeLoading: boolean;
  }>();

  const model = defineModel<ContentForm>({ required: true });
  const formRef = ref<FormInstance>();

  const treeProps = {
    children: "children",
    label: "categoryName",
    value: "id",
  } as const;

  const isRepost = computed(() => Number(model.value.articleType) === 2);

  const attachmentUrlText = computed({
    get: () =>
      (model.value.cmsArticleAttachmentList || [])
        .map((item) => String(item.attachmentUrl || "").trim())
        .filter(Boolean)
        .join("\n"),
    set: (value: string) => {
      model.value.cmsArticleAttachmentList = parseAttachmentLines(value);
    },
  });

  function buildAttachmentName(url: string, index: number): string {
    const rawPath = url.split("?")[0] || "";
    const pathSegments = rawPath.split("/");
    const fileName = decodeURIComponent(pathSegments.at(-1) || "").trim();
    if (fileName) {
      return fileName;
    }
    return `附件${index + 1}`;
  }

  function parseAttachmentLines(text: string) {
    return text
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)
      .map((attachmentUrl, index) => ({
        attachmentName: buildAttachmentName(attachmentUrl, index),
        attachmentUrl,
      }));
  }

  defineExpose<CrudFormLike>({
    validate: (...args) => {
      const [callback] = args;
      if (callback) {
        return formRef.value?.validate?.(callback);
      }
      return formRef.value?.validate?.();
    },
    clearValidate: (...args) => formRef.value?.clearValidate?.(...args),
    resetFields: (...args) => formRef.value?.resetFields?.(...args),
  });
</script>

<template>
  <el-form ref="formRef" :model :rules="props.rules" label-position="top" :disabled="props.disabled">
    <el-form-item label="标题" prop="articleTitle">
      <el-input v-model.trim="model.articleTitle" maxlength="100" show-word-limit placeholder="请输入标题" />
    </el-form-item>

    <el-form-item label="所属栏目" prop="cmsCategoryIdList">
      <el-tree-select
        v-model="model.cmsCategoryIdList"
        class="w-full"
        :data="props.categoryTreeOptions"
        :props="treeProps"
        :loading="props.categoryTreeLoading"
        clearable
        multiple
        check-strictly
        node-key="id"
        value-key="id"
        placeholder="请选择所属栏目"
      />
    </el-form-item>

    <el-form-item label="文章类型" prop="articleType">
      <el-select v-model="model.articleType" placeholder="请选择文章类型" class="w-full">
        <el-option label="原创" :value="1" />
        <el-option label="转载" :value="2" />
      </el-select>
    </el-form-item>

    <el-form-item label="作者" prop="articleAuthorName">
      <el-input v-model.trim="model.articleAuthorName" maxlength="50" show-word-limit placeholder="请输入作者" />
    </el-form-item>

    <el-form-item label="发布时间" prop="publishTime">
      <el-date-picker
        v-model="model.publishTime"
        type="datetime"
        format="YYYY-MM-DD HH:mm:ss"
        value-format="YYYY-MM-DD HH:mm:ss"
        placeholder="请选择发布时间"
        class="w-full"
      />
    </el-form-item>

    <el-form-item label="封面地址" prop="coverUrl">
      <el-input v-model.trim="model.coverUrl" placeholder="请输入封面图片 URL" />
    </el-form-item>

    <template v-if="isRepost">
      <el-form-item label="转载来源" prop="articleSource">
        <el-input v-model.trim="model.articleSource" maxlength="300" show-word-limit placeholder="请输入转载来源" />
      </el-form-item>

      <el-form-item label="转载链接" prop="outerHref">
        <el-input v-model.trim="model.outerHref" maxlength="500" show-word-limit placeholder="请输入转载链接" />
      </el-form-item>
    </template>

    <el-form-item label="正文内容" prop="articleContent">
      <el-input
        v-model="model.articleContent"
        type="textarea"
        :rows="10"
        maxlength="20000"
        show-word-limit
        placeholder="请输入正文内容"
      />
    </el-form-item>

    <el-form-item label="附件 URL（每行一个）" prop="cmsArticleAttachmentList">
      <el-input
        v-model="attachmentUrlText"
        type="textarea"
        :rows="5"
        placeholder="https://example.com/file-1.pdf\nhttps://example.com/file-2.doc"
      />
    </el-form-item>
  </el-form>
</template>
