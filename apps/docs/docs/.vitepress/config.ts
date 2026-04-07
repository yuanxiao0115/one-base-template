import { defineConfig } from 'vitepress';

const introItems = [
  { text: '快速开始', link: '/guide/quick-start' },
  { text: '环境变量', link: '/guide/env' },
  { text: 'admin-lite 后台基座', link: '/guide/admin-lite-base-app' },
  { text: 'zfw-system-sfss 快速手册', link: '/guide/zfw-system-sfss-quick-start' }
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

const practiceCrudItems = [
  { text: 'CRUD 开发规范', link: '/guide/crud-module-best-practice' },
  { text: 'CRUD 容器与 Hook（进阶）', link: '/guide/crud-container' }
];
const practiceTableItems = [{ text: '表格开发规范', link: '/guide/table-vxe-migration' }];
const practiceIconItems = [{ text: 'Iconfont 集成', link: '/guide/iconfont' }];
const practiceUtilsItems = [
  { text: 'Utils 工具包（总览）', link: '/guide/utils' },
  { text: 'Utils API 速查（按模块）', link: '/guide/utils-api' }
];
const practiceSidebarItems = [
  ...practiceCrudItems,
  ...practiceTableItems,
  ...practiceIconItems,
  ...practiceUtilsItems
];
const guideNavItems = [
  { text: '指南总览', link: '/guide/' },
  { text: '按水平进入', link: '/guide/levels/' },
  { text: '快速开始', link: '/guide/quick-start' },
  { text: '架构与运行时', link: '/guide/architecture' },
  { text: '开发实践总览', link: '/guide/practice' }
];

const componentLibraryOverviewItems = [{ text: '组件库总览', link: '/components/' }];

const componentBusinessItems = [
  { text: 'ObPageContainer（页面容器）', link: '/components/ob-page-container' },
  { text: 'ObCrudContainer（CRUD 容器）', link: '/components/ob-crud-container' },
  { text: 'ObTableBox（表格工具容器）', link: '/components/ob-table-box' },
  { text: 'ObTable（数据表格）', link: '/components/ob-table' },
  { text: 'ObCardTable（卡片表格）', link: '/components/ob-card-table' },
  { text: 'ObActionButtons（行操作按钮）', link: '/components/ob-action-buttons' },
  { text: 'ObTree（树组件）', link: '/components/ob-tree' },
  { text: 'ObImportUpload（导入上传）', link: '/components/ob-import-upload' },
  { text: 'ObUploadShell（上传壳）', link: '/components/ob-upload-shell' },
  { text: 'ObFilePreview（文件预览）', link: '/components/ob-file-preview' },
  { text: 'ObPersonnelSelector（人员选择器）', link: '/components/ob-personnel-selector' },
  { text: 'ObRichText（富文本编辑器）', link: '/components/ob-rich-text' },
  { text: 'ObAccountCenterPanel（账号中心面板）', link: '/components/ob-account-center-panel' },
  { text: 'ObCommandPalette（菜单搜索面板）', link: '/components/ob-command-palette' },
  { text: 'ObMenuIconInput（菜单图标输入）', link: '/components/ob-menu-icon-input' },
  { text: 'ObCard（卡片）', link: '/components/ob-card' },
  { text: 'ObColorField（颜色输入）', link: '/components/ob-color-field' }
];

const componentArchitectureItems = [
  { text: 'ObAdminLayout（后台布局壳）', link: '/components/ob-admin-layout' },
  { text: 'ObSidebarMenu（侧边菜单）', link: '/components/ob-sidebar-menu' },
  { text: 'ObTopBar（顶部栏）', link: '/components/ob-top-bar' },
  { text: 'ObTabsBar（标签栏）', link: '/components/ob-tabs-bar' },
  { text: 'ObKeepAliveView（缓存视图）', link: '/components/ob-keep-alive-view' }
];

const componentFoundationItems = [
  { text: 'ObThemeSwitcher（主题切换器）', link: '/components/ob-theme-switcher' },
  { text: 'ObMenuIcon（菜单图标）', link: '/components/ob-menu-icon' },
  { text: 'ObFontIcon（字体图标）', link: '/components/ob-font-icon' }
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
const extensionNavItems = [
  ...extensionDocumentItems,
  ...extensionPortalItems,
  ...extensionAdapterItems
];

const governanceOverviewItems = [{ text: '维护治理总览', link: '/guide/governance' }];
const governanceQualityItems = [
  { text: '开发规范与维护', link: '/guide/development' },
  { text: 'Harness 工程化落地', link: '/guide/harness-engineering' },
  { text: '测试与覆盖率门禁（组件库）', link: '/guide/testing-coverage-governance' }
];
const governanceRuleItems = [
  { text: 'AGENTS 规则分层', link: '/guide/agents-scope' },
  { text: 'Agent Harness 与仓库知识', link: '/guide/agent-harness' },
  { text: 'Admin Agent 红线', link: '/guide/admin-agent-redlines' },
  { text: 'admin-lite Agent 红线', link: '/guide/admin-lite-agent-redlines' },
  { text: '命名白名单（CLI）', link: '/guide/naming-whitelist' }
];
const governanceReleaseItems = [
  { text: '子包发布与版本控制', link: '/guide/package-release' },
  { text: '子包版本治理 SOP（多主线）', link: '/guide/package-version-governance' },
  { text: '业务接入版本矩阵与迁移模板', link: '/guide/business-integration-version-matrix' }
];
const governanceDocItems = [
  { text: '技术文档协作与改造', link: '/guide/tech-doc-collaboration' },
  { text: '迁移踩坑清单（monorepo-web）', link: '/guide/monorepo-web-migration-pitfalls' },
  { text: 'Markdown 技术文档规范', link: '/guide/markdown-doc-style' }
];
const governanceNavItems = [
  ...governanceOverviewItems,
  ...governanceQualityItems,
  { text: 'AGENTS 规则分层', link: '/guide/agents-scope' },
  { text: '子包发布与版本控制', link: '/guide/package-release' },
  { text: '子包版本治理 SOP（多主线）', link: '/guide/package-version-governance' }
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
const practiceSidebar = asSidebar('开发实践', practiceSidebarItems);
const componentLibrarySidebar = [
  {
    text: '组件库总览',
    items: [...componentLibraryOverviewItems]
  },
  {
    text: '业务高频组件',
    items: [...componentBusinessItems]
  },
  {
    text: '架构壳层组件（一般不直接用于业务）',
    items: [...componentArchitectureItems]
  },
  {
    text: '基础能力组件（图标 / 主题）',
    items: [...componentFoundationItems]
  }
];
const extensionSidebar = [
  {
    text: '扩展能力 / 公文表单',
    items: [...extensionDocumentItems]
  },
  {
    text: '扩展能力 / 门户设计器',
    items: [...extensionPortalItems]
  },
  {
    text: '扩展能力 / basic Adapter',
    items: [...extensionAdapterItems]
  }
];
const governanceSidebar = [
  {
    text: '维护治理 / 总览',
    items: [...governanceOverviewItems]
  },
  {
    text: '维护治理 / 质量门禁',
    items: [...governanceQualityItems]
  },
  {
    text: '维护治理 / 规则治理',
    items: [...governanceRuleItems]
  },
  {
    text: '维护治理 / 发布与版本',
    items: [...governanceReleaseItems]
  },
  {
    text: '维护治理 / 文档与协作',
    items: [...governanceDocItems]
  }
];
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
        text: '指南',
        items: guideNavItems
      },
      {
        text: '组件库',
        link: '/components/'
      },
      {
        text: '扩展能力',
        items: extensionNavItems
      },
      {
        text: '维护治理',
        items: governanceNavItems
      }
    ],
    sidebar: {
      '/components/': componentLibrarySidebar,

      '/guide/document-form-designer': extensionSidebar,
      '/guide/document-form-sheet-schema': extensionSidebar,
      '/guide/portal/': extensionSidebar,
      '/guide/adapter-basic': extensionSidebar,

      '/guide/quick-start': introSidebar,
      '/guide/env': introSidebar,
      '/guide/admin-lite-base-app': introSidebar,
      '/guide/zfw-system-sfss-quick-start': introSidebar,

      '/guide/levels/': levelSidebar,

      '/guide/architecture': architectureSidebar,
      '/guide/architecture-runtime-deep-dive': architectureSidebar,
      '/guide/module-system': architectureSidebar,
      '/guide/menu-route-spec': architectureSidebar,
      '/guide/layout-menu': architectureSidebar,
      '/guide/theme-system': architectureSidebar,

      '/guide/crud-container': practiceSidebar,
      '/guide/crud-module-best-practice': practiceSidebar,
      '/guide/practice': practiceSidebar,
      '/guide/table-vxe-migration': practiceSidebar,
      '/guide/iconfont': practiceSidebar,
      '/guide/utils': practiceSidebar,
      '/guide/utils-api': practiceSidebar,

      '/guide/governance': governanceSidebar,
      '/guide/development': governanceSidebar,
      '/guide/harness-engineering': governanceSidebar,
      '/guide/testing-coverage-governance': governanceSidebar,
      '/guide/tech-doc-collaboration': governanceSidebar,
      '/guide/monorepo-web-migration-pitfalls': governanceSidebar,
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
    outline: { level: 2, label: '本页导航' },
    docFooter: {
      prev: '上一页',
      next: '下一页'
    },
    footer: {
      message: 'one-base-template 项目文档（与代码同步维护）'
    }
  }
});
