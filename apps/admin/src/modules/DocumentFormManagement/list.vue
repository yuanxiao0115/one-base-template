<script setup lang="ts">
import { useRouter } from 'vue-router';

defineOptions({
  name: 'DocumentFormTemplateList'
});

const router = useRouter();

function openDesigner() {
  void router.push({
    name: 'DocumentFormDesigner'
  });
}

function openPreview() {
  void router.push({
    name: 'DocumentFormPreview'
  });
}
</script>

<template>
  <ObPageContainer title="公文表单">
    <el-row :gutter="16">
      <el-col :span="16">
        <el-card shadow="never">
          <template #header>
            <div class="flex items-center justify-between gap-4">
              <span class="text-base font-semibold">独立包接入工作台</span>
              <div class="flex items-center gap-2">
                <el-button type="primary" @click="openDesigner">打开设计器</el-button>
                <el-button @click="openPreview">打开预览</el-button>
              </div>
            </div>
          </template>
          <div class="space-y-4 text-sm leading-6 text-[var(--el-text-color-regular)]">
            <p>当前模块只保留 admin 侧薄壳，设计器、运行态和物料协议统一由共享包提供。</p>
            <p>
              第一阶段先用发文单示例模板打通设计页与预览页，后续保存、加载和权限由 API 注入扩展。
            </p>
          </div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="never">
          <template #header>
            <span class="text-sm font-semibold">接入边界</span>
          </template>
          <ul class="m-0 list-disc space-y-2 pl-5 text-sm text-[var(--el-text-color-regular)]">
            <li>设计页只消费 `@one-base-template/document-form-engine/designer`。</li>
            <li>预览页只消费根出口与 admin 注入入口。</li>
            <li>人员、附件、富文本组件统一从 `setupDocumentFormEngineForAdmin()` 注入。</li>
          </ul>
        </el-card>
      </el-col>
    </el-row>
  </ObPageContainer>
</template>
