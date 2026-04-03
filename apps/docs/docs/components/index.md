---
outline: false
---

# 组件库（Ob 系列）

该目录用于沉淀 `@one-base-template/ui/obtable` 注册的核心 `Ob*` 组件文档，重点覆盖：**属性配置、事件 API、插槽、暴露方法和可直接复制的示例**。

## 前置条件

应用需先注册插件（通常在 `apps/*/src/bootstrap/plugins.ts`）：

```ts
import { OneUiObTablePlugin } from '@one-base-template/ui/obtable';

app.use(OneUiObTablePlugin, {
  prefix: 'Ob',
  aliases: false
});
```

## 组件目录

### 业务高频组件（优先看）

- [ObPageContainer](/components/ob-page-container)
- [ObCrudContainer](/components/ob-crud-container)
- [ObTableBox](/components/ob-table-box)
- [ObTable](/components/ob-table)
- [ObCardTable](/components/ob-card-table)
- [ObActionButtons](/components/ob-action-buttons)
- [ObTree](/components/ob-tree)
- [ObImportUpload](/components/ob-import-upload)
- [ObUploadShell](/components/ob-upload-shell)
- [ObFilePreview](/components/ob-file-preview)
- [ObPersonnelSelector](/components/ob-personnel-selector)
- [ObRichText](/components/ob-rich-text)
- [ObMenuIconInput](/components/ob-menu-icon-input)
- [ObCard](/components/ob-card)
- [ObColorField](/components/ob-color-field)

### 架构壳层组件（一般不直接用于业务页面）

- [ObAdminLayout](/components/ob-admin-layout)
- [ObSidebarMenu](/components/ob-sidebar-menu)
- [ObTopBar](/components/ob-top-bar)
- [ObTabsBar](/components/ob-tabs-bar)
- [ObKeepAliveView](/components/ob-keep-alive-view)

### 基础能力组件（图标 / 主题）

- [ObThemeSwitcher](/components/ob-theme-switcher)
- [ObMenuIcon](/components/ob-menu-icon)
- [ObFontIcon](/components/ob-font-icon)

## 使用建议

1. 后台列表页优先组合：`ObPageContainer + ObTableBox + ObTable`。
2. 行操作列优先使用 `ObActionButtons`，避免按钮过多导致布局抖动。
3. 新增/编辑/详情弹层优先 `ObCrudContainer`，统一交互口径。
4. 复杂表格优先在 `ObTable` 上扩展，不直接绕过封装写散装 `el-table`。
