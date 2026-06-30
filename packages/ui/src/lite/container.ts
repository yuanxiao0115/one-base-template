import { defineAsyncComponent, type Component } from 'vue';

export const PageContainer: Component = /*#__PURE__*/ defineAsyncComponent(
  () => import('../components/container/PageContainer.vue')
);
