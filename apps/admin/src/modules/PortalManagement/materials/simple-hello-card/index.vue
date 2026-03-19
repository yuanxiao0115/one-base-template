<script setup lang="ts">
defineOptions({
  name: 'portal-simple-hello-card-index'
});
</script>

<template>
  <section class="portal-simple-hello-card">
    <h3 class="portal-simple-hello-card__title">简易欢迎卡片</h3>
    <p class="portal-simple-hello-card__desc">
      这是一个最小注册示例物料，可直接拖拽到画布查看效果。
    </p>
  </section>
</template>

<style scoped>
.portal-simple-hello-card {
  width: 100%;
  min-height: 120px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  background: linear-gradient(135deg, #eff6ff 0%, #f8fafc 100%);
  padding: 16px;
  box-sizing: border-box;
}

.portal-simple-hello-card__title {
  margin: 0 0 8px;
  font-size: 16px;
  line-height: 24px;
  color: #1e293b;
}

.portal-simple-hello-card__desc {
  margin: 0;
  font-size: 13px;
  line-height: 20px;
  color: #475569;
}
</style>
