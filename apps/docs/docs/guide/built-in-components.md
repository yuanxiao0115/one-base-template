---
outline: [2, 3]
---

# 内置组件（Ob 系列）

## TL;DR

- `@one-base-template/ui` 已内置一批可直接用的 `Ob*` 组件。
- 默认通过 `OneUiPlugin` 全局注册，页面里可直接写 `<ObXxx />`。
- 先掌握 3 类：容器、表格、反馈交互，就能覆盖大多数后台页面。

## 1) 注册与命名规则

默认注册方式（admin/admin-lite 已接入）：

```ts
app.use(OneUiPlugin, { prefix: 'Ob' });
```

命名规则：

1. 组件名由 `Ob + 组件名` 组成，例如 `ObTable`、`ObCrudContainer`。
2. 不需要在每个页面重复 import。
3. 登录框 `LoginBox/LoginBoxV2` 属于 `lite-auth`，通常按需引入。

## 2) 常用组件速查

### 2.1 页面与容器

| 全局组件名        | 用途                        | 建议场景           |
| ----------------- | --------------------------- | ------------------ |
| `ObPageContainer` | 页面主容器（支持左栏/滚动） | 左树右表、整页布局 |
| `ObCrudContainer` | 新增/编辑/详情容器          | 统一弹窗/抽屉交互  |
| `ObCard`          | 统一卡片壳样式              | 信息块、分区内容   |

### 2.2 表格与列表

| 全局组件名        | 用途                | 建议场景           |
| ----------------- | ------------------- | ------------------ |
| `ObTableBox`      | 搜索区 + 表格区编排 | 列表页标准骨架     |
| `ObTable`         | 默认表格组件        | 常规列表/树表      |
| `ObCardTable`     | 卡片式列表          | 素材管理、图文列表 |
| `ObActionButtons` | 操作按钮折叠/排序   | 行操作列           |

### 2.3 导航与壳层

| 全局组件名        | 用途         |
| ----------------- | ------------ |
| `ObAdminLayout`   | 后台主布局   |
| `ObSidebarMenu`   | 左侧菜单     |
| `ObTopBar`        | 顶栏壳       |
| `ObTabsBar`       | 标签栏       |
| `ObKeepAliveView` | 页面缓存渲染 |

### 2.4 字段与工具

| 全局组件名       | 用途             |
| ---------------- | ---------------- |
| `ObTree`         | 树组件封装       |
| `ObImportUpload` | 导入上传封装     |
| `ObColorField`   | 颜色字段封装     |
| `ObFontIcon`     | 项目图标封装     |
| `ObMenuIcon`     | 菜单图标统一渲染 |

## 3) 配套方法（不是组件）

这些能力同样来自 `@one-base-template/ui`，通常和 `Ob*` 组件一起使用：

1. `message`：统一消息提示。
2. `obConfirm`：统一确认弹窗。
3. `useEntityEditor`：CRUD 弹层状态机。

## 4) 最小使用示例

```vue
<template>
  <ObPageContainer padding="0">
    <ObTableBox title="用户列表" :columns="columns" @search="onSearch">
      <template #default="{ size, dynamicColumns }">
        <ObTable
          :size="size"
          :columns="dynamicColumns"
          :data="dataList"
          :pagination="pagination"
          @page-current-change="onPageChange"
        />
      </template>
    </ObTableBox>
  </ObPageContainer>
</template>
```

## 5) 相关阅读

- [布局与菜单](/guide/layout-menu)
- [CRUD 开发规范](/guide/crud-module-best-practice)
- [表格开发规范](/guide/table-vxe-migration)
