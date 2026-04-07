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

- [ObPageContainer（页面容器）](/components/ob-page-container)
- [ObCrudContainer（CRUD 容器）](/components/ob-crud-container)
- [ObTableBox（表格工具容器）](/components/ob-table-box)
- [ObTable（数据表格）](/components/ob-table)
- [ObCardTable（卡片表格）](/components/ob-card-table)
- [ObActionButtons（行操作按钮）](/components/ob-action-buttons)
- [ObTree（树组件）](/components/ob-tree)
- [ObImportUpload（导入上传）](/components/ob-import-upload)
- [ObUploadShell（上传壳）](/components/ob-upload-shell)
- [ObFilePreview（文件预览）](/components/ob-file-preview)
- [ObPersonnelSelector（人员选择器）](/components/ob-personnel-selector)
- [ObRichText（富文本编辑器）](/components/ob-rich-text)
- [ObAccountCenterPanel（账号中心面板）](/components/ob-account-center-panel)
- [ObCommandPalette（菜单搜索面板）](/components/ob-command-palette)
- [ObMenuIconInput（菜单图标输入）](/components/ob-menu-icon-input)
- [ObCard（卡片）](/components/ob-card)
- [ObColorField（颜色输入）](/components/ob-color-field)

### 架构壳层组件（一般不直接用于业务页面）

- [ObAdminLayout（后台布局壳）](/components/ob-admin-layout)
- [ObSidebarMenu（侧边菜单）](/components/ob-sidebar-menu)
- [ObTopBar（顶部栏）](/components/ob-top-bar)
- [ObTabsBar（标签栏）](/components/ob-tabs-bar)
- [ObKeepAliveView（缓存视图）](/components/ob-keep-alive-view)

### 基础能力组件（图标 / 主题）

- [ObThemeSwitcher（主题切换器）](/components/ob-theme-switcher)
- [ObMenuIcon（菜单图标）](/components/ob-menu-icon)
- [ObFontIcon（字体图标）](/components/ob-font-icon)

## 使用建议

1. 后台列表页优先组合：`ObPageContainer + ObTableBox + ObTable`。
2. 行操作列优先使用 `ObActionButtons`，避免按钮过多导致布局抖动。
3. 新增/编辑/详情弹层优先 `ObCrudContainer`，统一交互口径。
4. 复杂表格优先在 `ObTable` 上扩展，不直接绕过封装写散装 `el-table`。
