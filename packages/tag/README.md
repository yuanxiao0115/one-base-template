# @one/tag

Vue 3 标签页管理组件，支持自动标签管理、右键菜单、持久化存储等功能。

**当前版本**: v2.1.0

## ✨ 特性

- 🚀 **自动标签管理** - 路由变化时自动添加/激活标签
- 🎯 **智能菜单** - 根据标签位置动态显示右键菜单选项
- 💾 **会话缓存** - 基于 sessionStorage 的标签状态持久化
- 🔄 **页面刷新** - 支持单页面刷新功能
- 📱 **响应式设计** - 支持滚动和箭头导航
- 🎨 **主题适配** - 完美适配暗色/亮色主题
- 🔧 **TypeScript** - 完整的类型定义支持

## 📦 安装

```bash
# 从私服安装
pnpm add @one/tag --registry=http://package.onecode.cmict.cloud/repository/npm-hosted/
```

## 🚀 快速开始

### Vue 插件方式（推荐）

```typescript
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createRouter } from 'vue-router'
import OneTag from '@one/tag'
import '@one/tag/style'

const app = createApp(App)
const pinia = createPinia()
const router = createRouter({...})

app.use(pinia)
app.use(router)

// 完整配置安装
app.use(OneTag, {
  pinia,                    // 必需
  router,                   // 必需
  homePath: '/dashboard',   // 可选
  homeTitle: '控制台',      // 可选
  maxTags: 10              // 可选
})

app.mount('#app')
```

### 在模板中使用

```vue
<template>
  <div class="app">
    <!-- 标签页组件 -->
    <TagComponent />
    <!-- 或者 -->
    <OneTag />

    <!-- 路由视图 -->
    <router-view />
  </div>
</template>
```

## 📚 API 参考

### useTagAPI()

核心 API，提供 30+ 个标签页管理功能：

```typescript
import { useTagAPI } from '@one/tag'

const tagAPI = useTagAPI()

// 基础操作
tagAPI.tagOnClick(tag) // 切换标签
tagAPI.deleteDynamicTag(tag) // 删除标签
tagAPI.dynamicRouteTag('/path') // 动态路由跳转
tagAPI.refreshTag() // 刷新当前页

// 批量操作
tagAPI.deleteDynamicTag(tag, 'left') // 删除左侧标签
tagAPI.deleteDynamicTag(tag, 'right') // 删除右侧标签
tagAPI.deleteDynamicTag(tag, 'other') // 删除其他标签

// 状态访问
tagAPI.multiTags // 所有标签列表（响应式）
tagAPI.activeTag // 当前激活标签

// 配置管理
tagAPI.configure({
  homePath: '/dashboard',
  homeTitle: '控制台',
})
```

### 配置选项

```typescript
interface OneTagOptions {
  pinia: Pinia // 必需：Pinia 实例
  router: Router // 必需：Vue Router 实例
  homePath?: string // 首页路径，默认 '/'
  homeTitle?: string // 首页标题，默认 '首页'
  maxTags?: number // 最大标签数，默认 10
  storageKey?: string // 存储键名，默认 'one-tags'
}
```

### 常量

```typescript
import { HomeConfig } from '@one/tag'

HomeConfig.PATH // 获取首页路径
HomeConfig.TITLE // 获取首页标题
HomeConfig.ICON // 获取首页图标
```

## 📖 文档

- **[文档中心](./docs/README.md)** - 完整的文档导航和使用指南
- **[快速开始](./docs/quick-start.md)** - 5分钟快速集成指南
- **[配置文档](./docs/configuration.md)** - 详细的配置选项说明
- **[API 指南](./docs/api-guide.md)** - 核心 API 使用方法
- **[主题定制](./docs/theme-customization.md)** - CSS变量和主题定制指南
- **[常见问题](./docs/faq.md)** - 使用中的常见问题解答
- **[API 完整参考](./API_REFERENCE.md)** - 详细的 API 文档

## 📦 打包产物

打包后的文件结构：

```
dist/
├── index.js          # ES模块 (108K) - 现代构建工具使用
├── index.umd.cjs     # UMD模块 (48K) - 浏览器直接引用
├── index.css         # 样式文件 (13K) - 包含所有组件样式
├── index.d.ts        # 主类型定义文件
└── **/*.d.ts         # 完整的TypeScript类型定义
```

## 🔧 小白使用指南

### 1. 安装依赖

```bash
# 安装必需的依赖
pnpm add vue@^3.3.0 vue-router@^4.0.0 pinia@^2.1.0

# 安装标签组件
pnpm add @one/tag --registry=http://package.onecode.cmict.cloud/repository/npm-hosted/
```

### 2. 基础设置

```typescript
// main.ts
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createRouter, createWebHistory } from 'vue-router'
import OneTag from '@one/tag'
import '@one/tag/style' // 重要：引入样式文件

import App from './App.vue'

const app = createApp(App)

// 1. 创建 Pinia 实例
const pinia = createPinia()
app.use(pinia)

// 2. 创建路由实例
const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: () => import('./views/Home.vue') },
    { path: '/about', component: () => import('./views/About.vue') },
    // ... 其他路由
  ],
})
app.use(router)

// 3. 安装标签组件（必须在 pinia 和 router 之后）
app.use(OneTag, {
  pinia, // 必需
  router, // 必需
  homePath: '/', // 可选：首页路径
  homeTitle: '首页', // 可选：首页标题
  maxTags: 10, // 可选：最大标签数
})

app.mount('#app')
```

### 3. 在组件中使用

```vue
<!-- App.vue -->
<template>
  <div class="app">
    <!-- 标签页组件 -->
    <TagComponent />

    <!-- 主要内容区域 -->
    <div class="main-content">
      <router-view />
    </div>
  </div>
</template>

<script setup lang="ts">
  // 组件会自动注册，直接使用即可
</script>

<style>
  .app {
    height: 100vh;
    display: flex;
    flex-direction: column;
  }

  .main-content {
    flex: 1;
    overflow: auto;
  }
</style>
```

### 4. 高级用法

```typescript
// 在任意组件中使用 API
import { useTagAPI } from '@one/tag'

export default {
  setup() {
    const tagAPI = useTagAPI()

    // 编程式添加标签
    const addCustomTag = () => {
      tagAPI.dynamicRouteTag('/custom-page')
    }

    // 刷新当前页面
    const refreshPage = () => {
      tagAPI.refreshTag()
    }

    // 获取所有标签
    const allTags = tagAPI.multiTags

    return {
      addCustomTag,
      refreshPage,
      allTags,
    }
  },
}
```

## 🎨 主题定制

支持通过CSS变量进行完全的主题定制：

```css
/* 主色统一由 one 设计 token 控制 */
:root {
  --one-color-primary: #409eff;
  --one-color-primary-light-1: #ecf5ff;
}

/* 暗色主题 */
:root {
  --tag-text-color: #e5eaf3;
  --tag-bg-color: #363e4f;
  --tag-container-bg: #1d2129;
  --one-color-primary: #409eff;
  --one-color-primary-light-1: #2a4f78;
}
```

详细的主题定制指南请查看：**[主题定制文档](./docs/theme-customization.md)**

## ⚠️ 注意事项

1. **依赖顺序**: 必须先安装 `pinia` 和 `router`，再安装 `OneTag`
2. **样式引入**: 记得引入 `@one/tag/style` 样式文件
3. **版本要求**: Vue 3.3+, Vue Router 4.5+, Pinia 2.1+
4. **无Element Plus依赖**: v2.0+ 版本已移除Element Plus依赖，使用自定义组件
5. **TypeScript支持**: 包含完整的类型定义，支持智能提示
