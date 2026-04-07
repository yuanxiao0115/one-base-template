---
outline: [2, 3]
---

# 内置组件（Ob 系列）

## TL;DR

- 后台应用默认通过 `OneUiObTablePlugin`（`@one-base-template/ui/obtable`）注册 `Ob*` 组件。
- 日常列表页优先使用 `ObPageContainer + ObTableBox + ObTable + ObActionButtons`，弹层优先 `ObCrudContainer`。
- 写页面前先确认“插件已注册 + 组件清单匹配 + 验证命令可跑通”，避免出现页面能写但组件不可用。

## 适用范围

- 适用于：`apps/admin`、`apps/admin-lite` 的后台页面开发。
- 适用于：希望按仓库标准快速搭建列表页、编辑弹层、布局壳层的场景。
- 不适用于：需要 `VxeTable` 的页面（默认 `OneUiObTablePlugin` 不注册 `VxeTable`，见 FAQ）。

## 前置条件

1. 应用已安装 `@one-base-template/ui/obtable` 并在启动链路注册插件。
2. 页面使用的是 Vue 组件模板（`.vue`），且运行在本仓库应用内。
3. 你知道目标应用（`admin` 或 `admin-lite`）并能执行其验证命令。

插件注册参考（真实路径）：

- `apps/admin/src/bootstrap/plugins.ts`
- `apps/admin-lite/src/bootstrap/plugins.ts`

```ts
import { OneUiObTablePlugin } from '@one-base-template/ui/obtable';

app.use(OneUiObTablePlugin, {
  prefix: 'Ob',
  aliases: false
});
```

## 组件速查

### 页面与容器

| 组件名            | 用途                         | 典型场景           |
| ----------------- | ---------------------------- | ------------------ |
| `ObPageContainer` | 页面主容器（支持左栏、滚动） | 左树右表、整页编排 |
| `ObCrudContainer` | 新增/编辑/详情容器           | 统一弹窗/抽屉交互  |
| `ObCard`          | 卡片壳样式                   | 分区信息块         |

### 表格与操作

| 组件名                | 用途                | 典型场景                |
| --------------------- | ------------------- | ----------------------- |
| `ObTableBox`          | 搜索区 + 表格区编排 | 列表页标准骨架          |
| `ObTable`             | 默认表格组件        | 列表、树表              |
| `ObCardTable`         | 卡片式列表          | 素材管理、图文列表      |
| `ObActionButtons`     | 操作按钮折叠/排序   | 行操作列                |
| `ObUploadShell`       | 通用上传壳          | 表单附件、图片/文件上传 |
| `ObPersonnelSelector` | 组织/人员选择器     | 角色配置、权限成员选择  |
| `ObRichText`          | 富文本编辑器        | 公告、内容管理正文      |
| `ObMenuIconInput`     | 菜单图标输入壳      | 菜单配置图标选择        |

### 导航壳层与字段

| 组件名                 | 用途                                     |
| ---------------------- | ---------------------------------------- |
| `ObAdminLayout`        | 后台主布局                               |
| `ObSidebarMenu`        | 左侧菜单                                 |
| `ObTopBar`             | 顶栏壳                                   |
| `ObAccountCenterPanel` | 顶栏账号中心（头像、用户信息、修改密码） |
| `ObCommandPalette`     | 顶栏菜单搜索面板（Ctrl/Cmd+K）           |
| `ObTabsBar`            | 标签栏                                   |
| `ObKeepAliveView`      | 页面缓存渲染                             |
| `ObTree`               | 树组件封装                               |
| `ObImportUpload`       | 导入上传封装                             |
| `ObFilePreview`        | 文件在线预览                             |
| `ObColorField`         | 颜色字段封装                             |
| `ObFontIcon`           | 图标渲染封装                             |
| `ObMenuIcon`           | 菜单图标渲染                             |

## 文件预览（ObFilePreview）

- 支持格式：`pdf/doc/docx/xls/xlsx/ppt/pptx/ofd/png/jpg/jpeg/gif/bmp/webp/svg`。
- 输入源：`source` 支持 `{ url }` 或 `{ file }` 二选一；可通过 `fileName`、`mimeType` 覆盖推断。
- 交互：默认嵌入式预览，支持“全屏弹窗”与“下载”按钮开关。
- 降级：无法识别格式时显示“暂不支持在线预览”，并保留下载入口。
- 详细 API 与排障说明见：[ObFilePreview 组件文档](/components/ob-file-preview)。

```vue
<template>
  <ObFilePreview
    :source="{ url: fileUrl }"
    file-name="投标方案.docx"
    :height="560"
    :fullscreenable="true"
    :downloadable="true"
    fit="contain"
    @ready="onReady"
    @error="onError"
    @unsupported="onUnsupported"
  />
</template>
```

## 最短执行路径

### 1. 先确认插件注册

```bash
rg -n "OneUiObTablePlugin|prefix:\s*'Ob'" \
  apps/admin/src/bootstrap/plugins.ts \
  apps/admin-lite/src/bootstrap/plugins.ts
```

预期结果：能看到 `app.use(OneUiObTablePlugin, { prefix: 'Ob' ... })`。

### 2. 新页面先落标准骨架

```vue
<template>
  <ObPageContainer padding="0" overflow="hidden">
    <ObTableBox title="示例列表" :columns="columns" @search="onSearch">
      <template #default="{ size, dynamicColumns }">
        <ObTable
          :size="size"
          :columns="dynamicColumns"
          :data="rows"
          :pagination="pagination"
          @page-current-change="onPageCurrentChange"
        />
      </template>
    </ObTableBox>
  </ObPageContainer>
</template>
```

### 3. 操作列统一用 `ObActionButtons`

- 当按钮超过 2-3 个时，优先使用 `ObActionButtons` 管理顺序与折叠。
- 列表编辑/详情弹层优先接 `ObCrudContainer`，避免页面层重复维护弹窗状态。

### 4. 页面完成后跑最小验证

```bash
pnpm -C apps/admin-lite typecheck
pnpm -C apps/admin-lite lint
pnpm -C apps/admin-lite build
```

如果你改的是 `apps/admin`，将命令中的 `admin-lite` 换成 `admin`。

## 验证与验收

通过标准：

1. 页面能正常识别 `Ob*` 组件（无“未注册组件”警告）。
2. 列表页结构符合标准骨架（`ObPageContainer + ObTableBox + ObTable`）。
3. 目标应用 `typecheck/lint/build` 通过。

## FAQ

### 为什么页面里写了 `<ObTable>` 但不渲染？

优先检查插件是否注册在应用启动链路；其次检查组件名是否使用了 `Ob` 前缀。

### 默认为什么没有 `VxeTable`？

`apps/admin` 与 `apps/admin-lite` 默认使用 `OneUiObTablePlugin`（轻量注册集），不包含 `VxeTable`。如需完整插件能力，使用 `@one-base-template/ui/vxe` 的 `OneUiPlugin`。

### `message`、`obConfirm` 属于组件吗？

不是。它们是 `@one-base-template/ui` 的反馈方法，与 `Ob*` 组件配套使用。

### portal 应用也能直接用这一套吗？

`apps/portal` 走的是 `registerOneLiteUiComponents` 轻量注册，能力集合不同，按对应应用文档执行。

## 相关阅读

- [布局与菜单](/guide/layout-menu)
- [CRUD 开发规范](/guide/crud-module-best-practice)
- [CRUD 容器与 Hook（进阶）](/guide/crud-container)
- [表格开发规范](/guide/table-vxe-migration)
