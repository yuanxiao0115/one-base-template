import DictPage from './dict/page.vue';
import MenuPage from './menu/page.vue';
import type { RouteRecordRaw } from 'vue-router';

export default [
  {
    path: '/system/permission',
    name: 'SystemMenuManagement',
    component: MenuPage as RouteRecordRaw['component'],
    meta: {
      title: '菜单管理',
      keepAlive: true
    }
  },
  {
    path: '/system/dict',
    name: 'SystemDictManagement',
    component: DictPage as RouteRecordRaw['component'],
    meta: {
      title: '字典管理',
      keepAlive: true
    }
  }
] satisfies RouteRecordRaw[];
