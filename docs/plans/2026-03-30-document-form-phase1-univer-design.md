# Document Form Phase 1 Univer 画布 MVP 设计

## 目标

先把公文设计器收敛成一个稳定的 `Univer` 画布编辑器，不再同时推进预览、发布、回滚、结构视图和真实运行态组件接入。

本期验收只看设计态主链是否稳定：

- 能进入 `/document-form/design`
- 能看到默认 sheet
- 能选区
- 能插入字段且画布可见
- 能拖动 placement
- 能使用 `Univer` 原生工具栏修改表格样式
- 修改样式后不会被回滚
- 刷新后草稿仍能恢复

## 问题归因

当前设计器不稳定，不是单点 bug，而是职责混杂导致：

1. 页面层同时承担草稿、发布、回滚、预览跳转和设计器承载，超出 Phase 1 范围。
2. `template.sheet.*` 与 `designer.univerSnapshot` 同时影响画布，形成双数据源。
3. `UniverDocumentCanvas.vue` 同时承担实例生命周期、快照回写、结构渲染、选区联动、拖拽回写，状态回路太长。
4. 外部 `activeRange` 没有稳定同步回 `Univer` 选区，导致“选中了但画布没跟上”“插入位置漂移”。
5. 快照加载、worksheet 引用更新和销毁时机稍有偏差，就会落到 `getConfig/getSheetId` 这一类已失效对象访问错误。

## 本期范围

### 保留

- 设计页草稿加载与自动保存
- 顶部字段插入按钮
- `Univer` 原生 toolbar / context menu
- placement 选中、移动、删除
- 基础画布设置：网格线、缩放

### 暂停

- 预览页
- 发布 / 回滚 / 历史版本
- 结构视图主入口
- 打印态 / 填写态双预览
- 真实 Vue 业务组件接入
- 历史复杂快照兼容策略

## 设计原则

### 1. 设计态只有一条写入主链

所有模板变更统一通过 `useDocumentDesignerController.ts` 提交。页面、Workbench、Inspector、Canvas 都不能绕过 controller 直接回写模板。

### 2. 区分“业务字段语义”和“画布编辑结果”

- `template.fields + template.placements`：字段语义与放置关系
- `template.sheet.*`：网格结构与视口配置
- `designer.univerSnapshot`：`Univer` 画布编辑持久化载体

`snapshot` 只负责恢复画布编辑结果，不参与字段语义判断。

### 3. Canvas 只做四件事

- 初始化 / 销毁 `Univer`
- 渲染 sheet 与 placement 标签
- 向外抛出选区与拖拽事件
- 输出清洗后的 snapshot

### 4. Phase 1 页面只保留草稿壳

设计页只保留：

- `ensureDraft`
- `updateDraft`
- 返回列表

其余操作全部先降级移除，避免继续把页面层变成状态中枢。

## 改造点

### 页面层

`DocumentFormDesignerPage.vue` 改为“草稿编辑壳”，顶部只保留草稿信息和返回，不再展示发布、预览、回滚控件。

### Workbench / Inspector

- Workbench 继续做编排层，不新增状态。
- Inspector 在 Phase 1 只保留：
  - 画布设置
  - 组件设置
- 结构视图先移除，不进入本期主链。

### Canvas

`UniverDocumentCanvas.vue` 本期重点修正：

- 增加外部 `activeRange` 到 `Univer` 选区的安全同步
- 区分“结构变更重绘”和“仅选区变更”
- 只在 runtime 有效时访问 workbook / worksheet
- 拖拽 placement 时只回写有效移动
- 快照保存继续做清洗，但不让 snapshot 回流覆盖字段插入结果

## 验收口径

1. 打开设计页无 `getConfig/getSheetId`
2. 选中单元格后点击字段按钮，字段能插入到当前选区
3. 修改底色 / 字体 / 边框后，再插入字段、切换选区、刷新页面，样式仍保留
4. 拖动 placement 后位置正确保存
5. 删除 placement 后不会触发递归更新或画布崩溃
