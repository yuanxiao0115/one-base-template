import { defineConfig } from 'vitepress';

export default defineConfig({
  lang: 'zh-CN',
  title: 'one-base-template',
  description: 'Vue 3 + Vite + Element Plus 的 Monorepo 后台壳模板',

  // 让 Turborepo 的 build.outputs=dist/** 能正确缓存
  outDir: '../dist',

  lastUpdated: true,

  themeConfig: {
    nav: [
      { text: '文档总览', link: '/guide/' },
      {
        text: '核心指南',
        items: [
          { text: '目录结构与边界', link: '/guide/architecture' },
          { text: '模块系统与切割', link: '/guide/module-system' },
          { text: '命名白名单（CLI）', link: '/guide/naming-whitelist' },
          { text: '主题系统', link: '/guide/theme-system' },
          { text: '组件样式（按钮）', link: '/guide/button-styles' },
          { text: '布局与菜单', link: '/guide/layout-menu' },
          { text: 'VXE 表格迁移', link: '/guide/table-vxe-migration' },
          { text: 'Iconfont 集成', link: '/guide/iconfont' },
          { text: 'Utils 工具包', link: '/guide/utils' },
          { text: 'Utils API 速查', link: '/guide/utils-api' }
        ]
      },
      {
        text: '能力扩展',
        items: [
          { text: '门户设计器（PC）', link: '/guide/portal-designer' },
          { text: 'sczfw Adapter', link: '/guide/adapter-sczfw' }
        ]
      },
      { text: '开发协作', link: '/guide/development' }
    ],
    sidebar: {
      '/guide/': [
        {
          text: '开始使用',
          items: [
            { text: '文档总览', link: '/guide/' },
            { text: '快速开始', link: '/guide/quick-start' },
            { text: '环境变量', link: '/guide/env' }
          ]
        },
        {
          text: '核心能力',
          items: [
            { text: '目录结构与边界', link: '/guide/architecture' },
            { text: '模块系统与切割', link: '/guide/module-system' },
            { text: '命名白名单（CLI）', link: '/guide/naming-whitelist' },
            { text: '主题系统', link: '/guide/theme-system' },
            { text: '组件样式（按钮）', link: '/guide/button-styles' },
            { text: '布局与菜单', link: '/guide/layout-menu' },
            { text: 'VXE 表格迁移', link: '/guide/table-vxe-migration' },
            { text: 'Iconfont 集成', link: '/guide/iconfont' },
            { text: 'Utils 工具包（总览）', link: '/guide/utils' },
            { text: 'Utils API 速查（按模块）', link: '/guide/utils-api' }
          ]
        },
        {
          text: '扩展能力',
          items: [
            { text: '门户设计器（PC）', link: '/guide/portal-designer' },
            { text: 'sczfw Adapter', link: '/guide/adapter-sczfw' }
          ]
        },
        {
          text: '协作规范',
          items: [{ text: '开发规范与维护', link: '/guide/development' }]
        }
      ]
    },
    outline: { level: [2, 3] },
    search: { provider: 'local' },
    footer: {
      message: '内部项目模板文档（随代码演进同步维护）'
    }
  }
});
