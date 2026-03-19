import { defineAsyncComponent } from 'vue';

export { default as LoginBox } from '../components/auth/LoginBox.vue';
export const LoginBoxV2 = /*#__PURE__*/ defineAsyncComponent(
  () => import('../components/auth/LoginBoxV2.vue')
);
