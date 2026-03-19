import { defineAsyncComponent } from 'vue';

export const PageContainer = /*#__PURE__*/ defineAsyncComponent(
  () => import('../components/container/PageContainer.vue')
);
