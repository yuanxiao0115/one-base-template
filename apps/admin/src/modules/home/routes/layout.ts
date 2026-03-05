import HomePage from '../pages/HomePage.vue';
import type { RouteRecordRaw } from 'vue-router';

export default [
  {
    path: 'home/index',
    name: 'HomeIndex',
    component: HomePage as RouteRecordRaw['component'],
    meta: {
      title: '首页',
      keepAlive: true,
      affix: true
    }
  }
] as RouteRecordRaw[];
