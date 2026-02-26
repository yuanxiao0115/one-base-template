# 布局与菜单

## 布局模式

布局由 `packages/core` 的 layout store 驱动，app 在启动时从 `apps/admin/src/config/layout.ts` 注入默认值：

- `side`：顶部栏 + 左侧菜单（可折叠）
- `top`：顶部横向菜单

配置项：
- `apps/admin/src/config/layout.ts`：`appLayoutMode=side|top`
- `apps/admin/src/config/layout.ts`：`appSystemSwitchStyle=dropdown|menu`（决定系统切换使用下拉或菜单样式）
- `apps/admin/src/config/layout.ts`：`appTopbarHeight`（`ob-topbar` 高度，默认 `64px`）
- `apps/admin/src/config/layout.ts`：`appSidebarWidth`（左侧菜单展开宽度，默认 `256px`）
- `apps/admin/src/config/layout.ts`：`appSidebarCollapsedWidth`（左侧菜单折叠宽度，默认 `64px`）

示例：

```ts
// apps/admin/src/config/layout.ts
export const appLayoutMode = 'side';
export const appSystemSwitchStyle = 'menu';
export const appTopbarHeight = '64px';
export const appSidebarWidth = '256px';
export const appSidebarCollapsedWidth = '64px';
```

## 页面容器（PageContainer）

当业务页面需要“**撑满可用区域** + **内容超高后内部滚动**”时，推荐直接使用 `@one-base-template/ui` 提供的 `PageContainer`：

- 组件位置：`packages/ui/src/components/container/PageContainer.vue`
- 插件全局组件名：`ObPageContainer`（默认 `OneUiPlugin` 前缀为 `Ob`）
- 命名导出：`import { PageContainer } from '@one-base-template/ui'`

能力约定：

- 根容器固定 `height: 100%` + `min-height: 0`，可贴合父级剩余高度。
- 默认插槽位于内部滚动区，内容超出时由组件自身滚动（`overflow: auto`）。
- 支持 `header` / `footer` 插槽，头尾固定，主体滚动。

可用 props：

- `padding?: string`：滚动内容区内边距，默认 `0`
- `overflow?: 'auto' | 'scroll' | 'hidden'`：滚动策略，默认 `auto`

示例：

```vue
<script setup lang="ts">
defineOptions({ name: 'UserListPage' });
</script>

<template>
  <ObPageContainer padding="16px">
    <template #header>
      <el-card class="mb-4">筛选条件</el-card>
    </template>

    <el-card v-for="item in 30" :key="item" class="mb-4">
      第 {{ item }} 行业务内容
    </el-card>
  </ObPageContainer>
</template>
```

使用提示：

- 该组件依赖“父容器可计算高度”，在本模板默认布局（`SideLayout`/`TopLayout`）下可直接使用。
- 若页面开启 `meta.fullScreen=true`，可结合 `ObPageContainer` 管理页面内部滚动，避免整页滚动串联。
- 管理端已提供可访问示例页：`/demo/page-container`（路由名 `DemoPageContainer`）。

## 表格布局组合（OneTableBar + ObVxeTable）

为了降低旧 puretable 页面迁移成本，模板提供了 **OneTableBar + ObVxeTable** 组合：

- `OneTableBar`：保留旧工具条交互（快捷搜索、抽屉筛选、已选条、按钮区）。
- `ObVxeTable`：承接表格渲染与分页，多数旧列定义可直接复用。
- `useTable`：继续支持旧调用方式，同时可按需切换到新版缓存/防抖/刷新策略。

推荐用法（与旧页面结构基本一致）：

```vue
<ObPageContainer padding="0">
  <OneTableBar
    title="登录日志"
    :columns="columns"
    :keyword="searchForm.nickName"
    @search="tableSearch"
  >
    <template #default="{ size, dynamicColumns }">
      <ObVxeTable
        ref="tableRef"
        :size="size"
        :data="dataList"
        :columns="dynamicColumns"
        :pagination="pagination"
        @page-size-change="handleSizeChange"
        @page-current-change="handleCurrentChange"
      />
    </template>
  </OneTableBar>
</ObPageContainer>
```

视觉默认值已对齐旧 puretable 登录日志风格：工具条默认筛选图标按钮、表头浅灰、分页左总数右操作；表格内容超高时仅主体滚动，分页器固定在底部（表体与分页拆分渲染）。默认视觉基线为：表头 `#F8F8F8`、行背景 `#fff`、行高 `56px`、行分割线 `1px rgba(25, 31, 37, 0.08)`、无左右边框；表格默认 `min-width: 100%` 铺满内容区并使用窄轨道纵向滚动条样式。

完整迁移清单与映射关系请查看：[VXE 表格迁移](/guide/table-vxe-migration)。

## 多系统菜单（permissionCode）

适配 sczfw 时，`/cmict/admin/permission/my-tree` 可能一次返回多个根节点（每个根代表一个系统）。

本模板约定：
- 系统 code：根节点 `permissionCode`
- 系统 name：优先用根节点 `title`，无则兜底 `resourceName/permissionCode`

UI 行为：
- 顶部系统切换：支持 `dropdown`（下拉）与 `menu`（顶栏菜单）两种样式
- `menu` 样式使用 `el-menu(mode=horizontal)`，激活态背景 `#0955df`，字号 `14px`，并开启 `ellipsis` 以便宽度不足时自动折叠
- 左侧菜单：展示 `menuStore.menus`（当前系统菜单树）
- 左侧折叠按钮：固定在侧栏底部，使用 Iconify 图标（`ri:menu-fold-line` / `ri:menu-unfold-line`）
- 菜单文案：超长时单行省略，hover 自动显示 tooltip 全文
- 菜单状态（按设计稿）：默认 `--one-text-color-regular`；hover 与选中使用 `--one-color-primary-light-7` + `--one-color-primary-light-1`；禁用态使用 `--one-text-color-disabled`
- 菜单层级统一：一级/二级组/子菜单项高度均为 `48px`，默认字重 `400`
- 三级缩进：一级 `16px`、二级 `40px`、三级 `56px`（仅展开态生效）
- 切系统后跳系统首页：`systemStore.resolveHomePath(systemCode)`（受 `platform-config.json` 中 `systemHomeMap` 影响）
- 空系统过滤：若某系统映射后 `menus.length===0`（例如后端 `children=[]`），则不展示该系统名，也不写该系统菜单缓存
- 本地缓存策略：只要系统 `menus.length>0`（即使是纯叶子列表）就会写入该系统缓存；空系统会清理对应缓存 key

## 标签栏（Tabs）

- 组件：`packages/ui/src/components/tabs/TabsBar.vue`（UI 壳）+ `packages/tag/src/index.vue`（交互核心）
- 当前实现基于 `@one/tag`（workspace 包），并在 admin 启动时通过插件安装：
  - `app.use(OneTag, { pinia, router, ... })`
  - `packages/core/src/router/guards.ts` 对 admin 以 `enableTabSync=false` 关闭 core tabs 自动同步，避免双写冲突
- 保持的行为约定：
  - 点击切换、关闭当前、关闭左/右/其他/全部
  - 滚轮横向滚动标签区
  - KeepAlive include 按标签 `meta.keepAlive + route.name` 推导
  - 标签状态按 `storageKey=ob_tags` 写入 `sessionStorage`（全局共享，不按 systemCode 分桶）
- 隐藏规则：
  - `meta.hiddenTab=true` 或 `meta.noTag=true` 不进入标签栏
  - admin 默认忽略 `/login`、`/sso`、`/403`、`/404`、`/`、`/redirect*`、`/error*`

## 非菜单路由（详情/编辑）与 meta.activePath

详情/编辑类页面通常不出现在菜单里，但仍需要：
- 菜单高亮正确
- 权限校验“归属到某个菜单入口”

做法：在路由上补 `meta.activePath`，指向其所属菜单的 path。

```ts
// 示例（伪代码）
{
  path: '/demo/detail/:id',
  component: () => import('./DetailPage.vue'),
  meta: {
    activePath: '/demo/page-a'
  }
}
```

守卫逻辑会以 `menuKey = to.meta.activePath ?? to.path` 做系统识别与权限校验。

## 本地维护路由（未进菜单）与 meta.skipMenuAuth

有些页面可能由前端先行维护（或开发期联调临时页），暂时**不会出现在后端菜单**里。

默认策略下：`allowedPaths` 来自菜单树，不在集合内的路由会被拦截到 `403`。

如果你希望“**仍需要登录**，但不依赖菜单权限即可访问”，可以在路由上增加：

```ts
{
  path: '/local/page',
  component: () => import('./LocalPage.vue'),
  meta: {
    skipMenuAuth: true
  }
}
```

注意：
- `skipMenuAuth` 只会跳过“菜单 allowedPaths 校验”，不会跳过登录校验（仍会被重定向到 `/login`）。
- 该能力会放宽前端权限控制，应谨慎使用；**能用 `activePath` 归属到已有菜单时，优先用 `activePath`**。

## 菜单 icon：class / url / minio id

后端的 `menu.icon` 可能是：
- iconfont class（如 `i-icon-xxx` / `icon-xxx` / `dj-icon-xxx` / `iconfont-od icon-xxx`）
- url（http/https/data/blob）
- minio 资源 id（需要额外请求拿图片）

本模板做法：
- UI：`packages/ui/src/components/menu/MenuIcon.vue`
- core：`packages/core/src/stores/assets.ts`（IndexedDB 持久化 blob，刷新不重复拉取）
- adapter：实现 `assets.fetchImageBlob({ id })`

补充：
- `dj-icon-*` 会自动叠加 `dj-icons` 基类，避免与 CP 的 `icon-*` 冲突。
- legacy OD 菜单图标（如 `icon-huishouzhan`）会自动补齐 `iconfont-od` 基类。
- 图标组件化用法与三套字体 demo 预览见：`/guide/iconfont`。
