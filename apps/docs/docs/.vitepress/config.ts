import { defineConfig } from 'vitepress';

const introItems = [
  { text: '快速开始', link: '/guide/quick-start' },
  { text: '环境变量', link: '/guide/env' },
  { text: 'Template 迁移基座项目', link: '/guide/template-static-app' }
];

const architectureItems = [
  { text: '目录结构与边界', link: '/guide/architecture' },
  { text: '启动链路细节（深度）', link: '/guide/architecture-runtime-deep-dive' },
  { text: '模块系统与切割', link: '/guide/module-system' },
  { text: '菜单与路由规范（Schema）', link: '/guide/menu-route-spec' },
  { text: '布局与菜单', link: '/guide/layout-menu' },
  { text: '主题系统', link: '/guide/theme-system' }
];

const practiceItems = [
  { text: 'CRUD 容器与 Hook', link: '/guide/crud-container' },
  { text: 'CRUD 模块最佳实践', link: '/guide/crud-module-best-practice' },
  { text: 'VXE 表格迁移', link: '/guide/table-vxe-migration' },
  { text: '组件样式（按钮）', link: '/guide/button-styles' },
  { text: 'Iconfont 集成', link: '/guide/iconfont' },
  { text: 'Utils 工具包（总览）', link: '/guide/utils' },
  { text: 'Utils API 速查（按模块）', link: '/guide/utils-api' }
];

const extensionItems = [
  { text: '门户体系总览', link: '/guide/portal/' },
  { text: 'PortalManagement 管理端接入', link: '/guide/portal/admin-designer' },
  { text: 'portal-engine 边界与导出层', link: '/guide/portal/engine-boundary' },
  { text: '门户物料扩展与注册', link: '/guide/portal/material-extension' },
  { text: 'basic Adapter', link: '/guide/adapter-basic' }
];

const governanceItems = [
  { text: '开发规范与维护', link: '/guide/development' },
  { text: 'AGENTS 规则分层', link: '/guide/agents-scope' },
  { text: 'Agent Harness 与仓库知识', link: '/guide/agent-harness' },
  { text: 'Admin Agent 红线', link: '/guide/admin-agent-redlines' },
  { text: 'Template Agent 红线', link: '/guide/template-agent-redlines' },
  { text: 'Admin 老项目迁移工作流', link: '/guide/admin-legacy-migration-workflow' },
  { text: 'Admin Management Standardizer', link: '/guide/admin-management-standardizer' },
  { text: '命名白名单（CLI）', link: '/guide/naming-whitelist' },
  { text: '子包发布与版本控制', link: '/guide/package-release' },
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
const architectureSidebar = asSidebar('架构与运行时', architectureItems);
const practiceSidebar = asSidebar('开发实践', practiceItems);
const extensionSidebar = asSidebar('扩展能力', extensionItems);
const governanceSidebar = asSidebar('维护治理', governanceItems);
const roleSidebar = asSidebar('角色入口', roleItems);

const guideHomeSidebar = [
  {
    text: '文档总览',
    items: [{ text: '总览页', link: '/guide/' }]
  },
  {
    text: '按角色进入',
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
        text: '入门',
        items: [{ text: '文档总览', link: '/guide/' }, ...introItems]
      },
      {
        text: '架构',
        items: architectureItems
      },
      {
        text: '开发实践',
        items: practiceItems
      },
      {
        text: '扩展能力',
        items: extensionItems
      },
      {
        text: '维护治理',
        items: governanceItems
      }
    ],
    sidebar: {
      '/guide/portal/': extensionSidebar,
      '/guide/adapter-basic': extensionSidebar,

      '/guide/quick-start': introSidebar,
      '/guide/env': introSidebar,
      '/guide/template-static-app': introSidebar,

      '/guide/architecture': architectureSidebar,
      '/guide/architecture-runtime-deep-dive': architectureSidebar,
      '/guide/module-system': architectureSidebar,
      '/guide/menu-route-spec': architectureSidebar,
      '/guide/layout-menu': architectureSidebar,
      '/guide/theme-system': architectureSidebar,

      '/guide/crud-container': practiceSidebar,
      '/guide/crud-module-best-practice': practiceSidebar,
      '/guide/table-vxe-migration': practiceSidebar,
      '/guide/button-styles': practiceSidebar,
      '/guide/iconfont': practiceSidebar,
      '/guide/utils': practiceSidebar,
      '/guide/utils-api': practiceSidebar,

      '/guide/development': governanceSidebar,
      '/guide/agents-scope': governanceSidebar,
      '/guide/agent-harness': governanceSidebar,
      '/guide/admin-agent-redlines': governanceSidebar,
      '/guide/template-agent-redlines': governanceSidebar,
      '/guide/admin-legacy-migration-workflow': governanceSidebar,
      '/guide/admin-management-standardizer': governanceSidebar,
      '/guide/naming-whitelist': governanceSidebar,
      '/guide/package-release': governanceSidebar,
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
