import { defineConfig } from 'vitepress';

const introItems = [
  { text: '快速开始', link: '/guide/quick-start' },
  { text: '环境变量', link: '/guide/env' },
  { text: 'admin-lite 后台基座', link: '/guide/admin-lite-base-app' }
];

const levelItems = [
  { text: '按水平进入（总览）', link: '/guide/levels/' },
  { text: 'P2 路线（上手）', link: '/guide/levels/p2' },
  { text: 'P4 路线（独立开发）', link: '/guide/levels/p4' },
  { text: 'P6 路线（架构治理）', link: '/guide/levels/p6' }
];

const architectureItems = [
  { text: '目录结构与边界', link: '/guide/architecture' },
  { text: '启动链路细节（深度）', link: '/guide/architecture-runtime-deep-dive' },
  { text: '模块系统与切割', link: '/guide/module-system' },
  { text: '菜单与路由规范（Schema）', link: '/guide/menu-route-spec' },
  { text: '布局与菜单', link: '/guide/layout-menu' },
  { text: '主题系统', link: '/guide/theme-system' }
];

const practiceCrudItems = [{ text: 'CRUD 开发规范', link: '/guide/crud-module-best-practice' }];
const practiceTableItems = [{ text: '表格开发规范', link: '/guide/table-vxe-migration' }];
const practiceBuiltinItems = [{ text: '内置组件（Ob 系列）', link: '/guide/built-in-components' }];
const practiceIconItems = [{ text: 'Iconfont 集成', link: '/guide/iconfont' }];
const practiceUtilsItems = [
  { text: 'Utils 工具包（总览）', link: '/guide/utils' },
  { text: 'Utils API 速查（按模块）', link: '/guide/utils-api' }
];

const extensionDocumentItems = [
  { text: '公文表单设计引擎', link: '/guide/document-form-designer' },
  { text: '公文表单 Sheet Schema', link: '/guide/document-form-sheet-schema' }
];
const extensionPortalItems = [
  { text: '门户体系总览', link: '/guide/portal/' },
  { text: 'PortalManagement 管理端接入', link: '/guide/portal/admin-designer' },
  { text: 'portal-engine 边界与导出层', link: '/guide/portal/engine-boundary' },
  { text: '门户物料扩展与注册', link: '/guide/portal/material-extension' }
];
const extensionAdapterItems = [{ text: 'basic Adapter', link: '/guide/adapter-basic' }];

const governanceItems = [
  { text: '开发规范与维护', link: '/guide/development' },
  { text: 'AGENTS 规则分层', link: '/guide/agents-scope' },
  { text: 'Agent Harness 与仓库知识', link: '/guide/agent-harness' },
  { text: 'Admin Agent 红线', link: '/guide/admin-agent-redlines' },
  { text: 'admin-lite Agent 红线', link: '/guide/admin-lite-agent-redlines' },
  { text: '命名白名单（CLI）', link: '/guide/naming-whitelist' },
  { text: '子包发布与版本控制', link: '/guide/package-release' },
  { text: '子包版本治理 SOP（多主线）', link: '/guide/package-version-governance' },
  { text: '业务接入版本矩阵与迁移模板', link: '/guide/business-integration-version-matrix' },
  { text: 'Markdown 技术文档规范', link: '/guide/markdown-doc-style' }
];

const roleItems = [
  { text: '框架使用者阅读入口', link: '/guide/for-users' },
  { text: '仓库维护者阅读入口', link: '/guide/for-maintainers' }
];

const asSidebar = (moduleText: string, items: ReadonlyArray<{ text: string; link: string }>) => [
  {
    text: moduleText,
    items: [...items]
  }
];

const introSidebar = asSidebar('入门', introItems);
const levelSidebar = asSidebar('按水平进入', levelItems);
const architectureSidebar = asSidebar('架构与运行时', architectureItems);
const practiceCrudSidebar = asSidebar('开发实践 / CRUD', practiceCrudItems);
const practiceTableSidebar = asSidebar('开发实践 / 表格', practiceTableItems);
const practiceBuiltinSidebar = asSidebar('开发实践 / 内置组件', practiceBuiltinItems);
const practiceIconSidebar = asSidebar('开发实践 / 图标', practiceIconItems);
const practiceUtilsSidebar = asSidebar('开发实践 / Utils', practiceUtilsItems);
const extensionDocumentSidebar = asSidebar('扩展能力 / 公文表单', extensionDocumentItems);
const extensionPortalSidebar = asSidebar('扩展能力 / 门户设计器', extensionPortalItems);
const extensionAdapterSidebar = asSidebar('扩展能力 / basic Adapter', extensionAdapterItems);
const governanceSidebar = asSidebar('维护治理', governanceItems);
const roleSidebar = asSidebar('角色入口', roleItems);

const guideHomeSidebar = [
  {
    text: '文档总览',
    items: [{ text: '总览页', link: '/guide/' }]
  },
  {
    text: '按水平进入',
    items: levelItems
  },
  {
    text: '按角色进入（辅助）',
    items: roleItems
  }
];

export default defineConfig({
  lang: 'zh-CN',
  title: 'one-base-template',
  description: 'one-base-template 文档站：架构、模块与协作规范',
  outDir: '../dist',
  lastUpdated: true,
  appearance: true,

  themeConfig: {
    nav: [
      { text: '首页', link: '/' },
      {
        text: '按水平',
        items: levelItems
      },
      {
        text: '入门',
        items: [{ text: '文档总览', link: '/guide/' }, ...introItems]
      },
      {
        text: '架构',
        items: architectureItems
      },
      {
        text: '开发实践',
        items: [
          {
            text: 'CRUD',
            items: practiceCrudItems
          },
          {
            text: '表格',
            items: practiceTableItems
          },
          {
            text: '内置组件',
            items: practiceBuiltinItems
          },
          {
            text: '图标',
            items: practiceIconItems
          },
          {
            text: 'Utils',
            items: practiceUtilsItems
          }
        ]
      },
      {
        text: '扩展能力',
        items: [
          {
            text: '公文表单',
            items: extensionDocumentItems
          },
          {
            text: '门户设计器',
            items: extensionPortalItems
          },
          {
            text: 'basic Adapter',
            items: extensionAdapterItems
          }
        ]
      },
      {
        text: '维护治理',
        items: governanceItems
      }
    ],
    sidebar: {
      '/guide/document-form-designer': extensionDocumentSidebar,
      '/guide/document-form-sheet-schema': extensionDocumentSidebar,
      '/guide/portal/': extensionPortalSidebar,
      '/guide/adapter-basic': extensionAdapterSidebar,

      '/guide/quick-start': introSidebar,
      '/guide/env': introSidebar,
      '/guide/admin-lite-base-app': introSidebar,

      '/guide/levels/': levelSidebar,

      '/guide/architecture': architectureSidebar,
      '/guide/architecture-runtime-deep-dive': architectureSidebar,
      '/guide/module-system': architectureSidebar,
      '/guide/menu-route-spec': architectureSidebar,
      '/guide/layout-menu': architectureSidebar,
      '/guide/theme-system': architectureSidebar,

      '/guide/crud-container': practiceCrudSidebar,
      '/guide/crud-module-best-practice': practiceCrudSidebar,
      '/guide/table-vxe-migration': practiceTableSidebar,
      '/guide/built-in-components': practiceBuiltinSidebar,
      '/guide/iconfont': practiceIconSidebar,
      '/guide/utils': practiceUtilsSidebar,
      '/guide/utils-api': practiceUtilsSidebar,

      '/guide/development': governanceSidebar,
      '/guide/agents-scope': governanceSidebar,
      '/guide/agent-harness': governanceSidebar,
      '/guide/admin-agent-redlines': governanceSidebar,
      '/guide/admin-lite-agent-redlines': governanceSidebar,
      '/guide/naming-whitelist': governanceSidebar,
      '/guide/package-release': governanceSidebar,
      '/guide/package-version-governance': governanceSidebar,
      '/guide/business-integration-version-matrix': governanceSidebar,
      '/guide/markdown-doc-style': governanceSidebar,

      '/guide/for-users': roleSidebar,
      '/guide/for-maintainers': roleSidebar,

      '/guide/': guideHomeSidebar
    },
    search: { provider: 'local' },
    outline: { level: [2, 3], label: '本页导航' },
    docFooter: {
      prev: '上一页',
      next: '下一页'
    },
    footer: {
      message: 'one-base-template 项目文档（与代码同步维护）'
    }
  }
});
