import { defineAsyncComponent, type Component } from 'vue';

export { default as LoginBox } from '../components/auth/LoginBox.vue';
export const LoginBoxV2: Component = /*#__PURE__*/ defineAsyncComponent(
  () => import('../components/auth/LoginBoxV2.vue')
);
