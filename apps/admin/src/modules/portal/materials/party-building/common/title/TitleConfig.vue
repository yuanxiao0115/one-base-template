<template>
  <div class="title-content-config">
    <el-form-item label="标题">
      <el-input v-model="titleData.title" placeholder="请输入标题" />
    </el-form-item>

    <el-form-item label="标题样式">
      <el-radio-group v-model="titleData.titleStyle">
        <el-radio label="simple">简单样式（左对齐，下划线）</el-radio>
        <el-radio label="blue-simple">蓝色简约风格（左对齐，条纹线）</el-radio>
        <el-radio label="decorated">装饰样式（居中，两侧线条）</el-radio>
      </el-radio-group>
    </el-form-item>

    <el-form-item label="显示'更多'按钮">
      <el-switch v-model="titleData.showMore" />
    </el-form-item>

    <el-form-item v-if="titleData.showMore" label="按钮跳转地址">
      <el-input v-model="titleData.moreLink" placeholder="请输入链接地址" />
    </el-form-item>
  </div>
</template>

<script setup lang="ts">
// 定义接口类型
export interface TitleConfigModelType {
  title: string;
  titleStyle: string;
  showMore: boolean;
  moreLink: string;
}
const titleData = defineModel<TitleConfigModelType>({
  default: () => ({
    title: '',
    titleStyle: 'simple',
    showMore: false,
    moreLink: ''
  })
});

defineOptions({
  name: 'pb-title-config'
});
</script>

<style scoped>
.title-content-config {
  --config-text: #0f172a;
  --config-muted: #64748b;

  width: 100%;
}

.title-content-config :deep(.el-form-item__label) {
  font-weight: 500;
  color: var(--config-muted);
}
</style>
