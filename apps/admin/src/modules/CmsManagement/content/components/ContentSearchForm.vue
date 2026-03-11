<script setup lang="ts">
  import { ref } from "vue";
  import type { FormInstance } from "element-plus";
  import type { ContentCategoryRecord } from "../types";

  const props = defineProps<{
    categoryTreeOptions: ContentCategoryRecord[];
    categoryTreeLoading: boolean;
  }>();

  const model = defineModel<{
    articleTitle: string;
    cmsCategoryId: string;
    articleType: number | "";
  }>({ required: true });

  const formRef = ref<FormInstance>();

  const treeProps = {
    children: "children",
    label: "categoryName",
    value: "id",
  } as const;

  defineExpose({
    resetFields: () => formRef.value?.resetFields?.(),
  });
</script>

<template>
  <el-form ref="formRef" label-position="top" :model>
    <el-form-item label="标题" prop="articleTitle">
      <el-input v-model.trim="model.articleTitle" clearable maxlength="100" placeholder="请输入标题" class="w-full" />
    </el-form-item>

    <el-form-item label="所属栏目" prop="cmsCategoryId">
      <el-tree-select
        v-model="model.cmsCategoryId"
        class="w-full"
        :data="props.categoryTreeOptions"
        :props="treeProps"
        :loading="props.categoryTreeLoading"
        clearable
        check-strictly
        node-key="id"
        value-key="id"
        placeholder="请选择所属栏目"
      />
    </el-form-item>

    <el-form-item label="文章类型" prop="articleType">
      <el-select v-model="model.articleType" clearable placeholder="请选择文章类型" class="w-full">
        <el-option label="原创" :value="1" />
        <el-option label="转载" :value="2" />
      </el-select>
    </el-form-item>
  </el-form>
</template>
