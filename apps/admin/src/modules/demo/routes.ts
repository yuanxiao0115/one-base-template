import type { RouteRecordRaw } from 'vue-router';

export default [
  {
    path: 'demo',
    meta: {
      title: '示例'
    },
    redirect: '/demo/page-a',
    children: [
      {
        path: 'page-a',
        name: 'DemoPageA',
        component: () => import('./pages/DemoPageA.vue'),
        meta: {
          title: '页面 A',
          keepAlive: true
        }
      },
      {
        path: '/gongshi/member',
        name: '/gongshi/member',
        component: () => import('./pages/DemoPageA.vue'),
        meta: {
          title: '页面 A',
          keepAlive: true
        }
      },
      {
        path: 'page-b',
        name: 'DemoPageB',
        component: () => import('./pages/DemoPageB.vue'),
        meta: {
          title: '页面 B',
          keepAlive: true
        }
      }
    ]
  }
] satisfies RouteRecordRaw[];
