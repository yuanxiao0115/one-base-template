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
      { text: '快速开始', link: '/guide/quick-start' },
      { text: '架构', link: '/guide/architecture' },
      { text: '布局与菜单', link: '/guide/layout-menu' },
      { text: 'sczfw Adapter', link: '/guide/adapter-sczfw' },
      { text: '开发规范', link: '/guide/development' }
    ],
    sidebar: {
      '/guide/': [
        {
          text: '开始',
          items: [
            { text: '快速开始', link: '/guide/quick-start' },
            { text: '环境变量', link: '/guide/env' }
          ]
        },
        {
          text: '核心',
          items: [
            { text: '目录结构与边界', link: '/guide/architecture' },
            { text: '布局与菜单', link: '/guide/layout-menu' },
            { text: 'sczfw Adapter', link: '/guide/adapter-sczfw' }
          ]
        },
        {
          text: '协作',
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

