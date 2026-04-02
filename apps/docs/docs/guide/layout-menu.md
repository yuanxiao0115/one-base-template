# 布局与菜单（精简版）

> 如果你主要关注路由和权限字段，请先看：[菜单与路由规范（Schema）](/guide/menu-route-spec)。

## TL;DR

1. 布局默认配置只看一个文件：`apps/admin/src/config/layout.ts`。
2. 页面编排默认三件套：`ObPageContainer + ObTableBox + ObTable`。
3. 菜单高亮异常先查 `meta.activePath`。

## 1) 布局模式

布局由 `layout.ts` 的常量控制，推荐直接在该文件查看注释后修改。

当前可配项：

1. `appLayoutMode`：`side | top`
2. `appSystemSwitchStyle`：`dropdown | menu`
3. `appTopbarHeight`：顶栏高度
4. `appSidebarWidth`：侧栏展开宽度
5. `appSidebarCollapsedWidth`：侧栏折叠宽度

## 2) 页面编排基线

后台列表页默认按以下结构落地：

```vue
<ObPageContainer padding="0">
  <ObTableBox ...>
    <template #default="{ size, dynamicColumns }">
      <ObTable ... />
    </template>
  </ObTableBox>
</ObPageContainer>
```

推荐原因：

1. 高度与滚动行为统一。
2. 搜索区、按钮区、表格区职责清晰。
3. 迁移和复用成本低。

## 3) 菜单与高亮

常见规则：

1. 菜单路由默认走 `meta.access='menu'`。
2. 非菜单但登录后可访问页面用 `meta.access='auth'`。
3. 匿名可访问页面用 `meta.access='open'`。
4. 页面在菜单中的高亮路径由 `meta.activePath` 或兼容映射提供。

## 4) 常见问题

1. 页面能进但左侧菜单不高亮。
   : 先检查该页面是否配置 `meta.activePath`。
2. 同一页面在不同系统切换后落点不一致。
   : 检查 `systemHomeMap` 与 `defaultSystemCode`。
3. 列表页出现双滚动。
   : 优先确认是否使用了 `ObPageContainer`，并避免额外包裹无意义容器。

## 5) 相关阅读

- [菜单与路由规范（Schema）](/guide/menu-route-spec)
- [表格开发规范](/guide/table-vxe-migration)
- [内置组件（Ob 系列）](/guide/built-in-components)
