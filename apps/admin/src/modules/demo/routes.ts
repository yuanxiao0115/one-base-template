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
        path: '/system/org',
        name: '/system/orgMenu',
        component: () => import('./pages/DemoOrgManagementMigrationPage.vue'),
        meta: {
          title: '组织管理迁移',
          keepAlive: true,
          // 组织管理迁移样板用于演示树形表格，不依赖后端菜单。
          skipMenuAuth: true
        }
      },
      {
        path: '/system/permission',
        name: '/system/permissionMenu',
        component: () => import('./pages/DemoMenuManagementMigrationPage.vue'),
        meta: {
          title: '权限管理迁移',
          keepAlive: true,
          // 权限管理迁移样板用于演示树/列表切换，不依赖后端菜单。
          skipMenuAuth: true
        }
      },
      {
        path: 'page-b',
        name: 'DemoPageB',
        component: () => import('./pages/DemoPageB.vue'),
        meta: {
          title: '页面 B',
          keepAlive: true,
          // Demo 图标页不依赖后端菜单，已登录后允许跳过菜单权限校验，避免直接访问 403。
          skipMenuAuth: true
        }
      },
      {
        path: 'login-log-vxe',
        name: 'DemoLoginLogMigration',
        component: () => import('./pages/DemoLoginLogMigrationPage.vue'),
        meta: {
          title: '登录日志迁移',
          keepAlive: true,
          // 迁移样板页用于演示 puretable -> VXE 兼容能力，不依赖后端菜单。
          skipMenuAuth: true
        }
      },
      {
        path: 'org-management-vxe',
        name: 'DemoOrgManagementMigration',
        component: () => import('./pages/DemoOrgManagementMigrationPage.vue'),
        meta: {
          title: '组织管理迁移',
          keepAlive: true,
          // 树形组织管理迁移样板用于演示 puretable -> VXE treeConfig 兼容能力。
          skipMenuAuth: true
        }
      },
      {
        path: 'menu-management-vxe',
        name: 'DemoMenuManagementMigration',
        component: () => import('./pages/DemoMenuManagementMigrationPage.vue'),
        meta: {
          title: '权限管理迁移',
          keepAlive: true,
          // 菜单权限迁移样板用于演示 puretable -> VXE 树/列表双模式能力。
          skipMenuAuth: true
        }
      },
      {
        path: 'page-container',
        name: 'DemoPageContainer',
        component: () => import('./pages/DemoPageContainer.vue'),
        meta: {
          title: '容器 Demo',
          keepAlive: true,
          // Demo 容器页用于能力演示，不依赖后端菜单。
          skipMenuAuth: true
        }
      }
    ]
  }
] satisfies RouteRecordRaw[];
