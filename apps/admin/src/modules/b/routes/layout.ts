import BDemoPage1 from '../pages/BDemoPage1.vue';
import BDemoPage2 from '../pages/BDemoPage2.vue';
import BHomePage from '../pages/BHomePage.vue';
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
        component: BHomePage as RouteRecordRaw['component'],
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
            component: BDemoPage1 as RouteRecordRaw['component'],
            meta: {
              title: '页面 1',
              keepAlive: true
            }
          },
          {
            path: 'page-2',
            name: 'BDemoPage2',
            component: BDemoPage2 as RouteRecordRaw['component'],
            meta: {
              title: '页面 2',
              keepAlive: true
            }
          }
        ]
      }
    ]
  }
] as RouteRecordRaw[];
