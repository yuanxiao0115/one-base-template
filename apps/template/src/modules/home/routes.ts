import type { RouteRecordRaw } from 'vue-router';
import HomePage from './pages/HomePage.vue';

export default [
  {
    path: 'home/index',
    name: 'TemplateHome',
    component: HomePage,
    meta: {
      title: '首页',
      icon: 'ep:house',
      order: 1,
      keepAlive: true,
      affix: true
    }
  }
] as RouteRecordRaw[];
