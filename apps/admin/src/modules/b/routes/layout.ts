import type { RouteRecordRaw } from 'vue-router';

export default [
  {
    path: 'b',
    meta: {
      title: '系统 B'
    },
    children: [
      {
        path: 'home',
        name: 'BHome',
        component: () => import('../pages/BHomePage.vue'),
        meta: {
          title: 'B 首页',
          keepAlive: true
        }
      },
      {
        path: 'demo',
        meta: {
          title: 'B 示例'
        },
        redirect: '/b/demo/page-1',
        children: [
          {
            path: 'page-1',
            name: 'BDemoPage1',
            component: () => import('../pages/BDemoPage1.vue'),
            meta: {
              title: '页面 1',
              keepAlive: true
            }
          },
          {
            path: 'page-2',
            name: 'BDemoPage2',
            component: () => import('../pages/BDemoPage2.vue'),
            meta: {
              title: '页面 2',
              keepAlive: true
            }
          }
        ]
      }
    ]
  }
] satisfies RouteRecordRaw[];
