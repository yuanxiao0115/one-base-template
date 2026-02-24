# PC 门户配置 IDE：新建页面并直接进入编辑 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 在 `/portal/designer?templateId=...` 中完成“新建空白页(tabType=2) → 直接进入 `/portal/layout` 编辑器”的闭环，并在 IDE 内提供页面树导航与 iframe 预览。

**Architecture:**
- Designer 页负责：加载 template/detail、渲染 tab 树、创建 tab、跳转编辑器、驱动 iframe 预览刷新。
- 预览页复用既有顶层路由 `/portal/preview/:tabId?`，Designer 通过 `postMessage` 触发 iframe 刷新（同源）。
- 不引入“页面模板/历史模板/存为模板”能力（老项目相关逻辑全部不移植）。

**Tech Stack:** Vue 3 + Element Plus + Vue Router + Pinia + ObHttp（已封装 `portalApi`）+ grid-layout-plus（编辑器已落地）

---

### Task 1: 补齐 Portal 类型与 tabTree 工具函数

**Files:**
- Modify: `apps/admin/src/modules/portal/types.ts`
- Create: `apps/admin/src/modules/portal/utils/portalTree.ts`

**Step 1: 更新类型**
- `PortalTab` 增加：`tabType/tabUrl/tabIcon/tabUrlOpenMode/tabUrlSsoType/parentId/isHide/children/order/tabOrder` 等字段（允许扩展）。
- `PortalTemplate` 的 `tabList` 改为 `PortalTab[]`（可选字段，兼容后端缺失）。

**Step 2: 新增工具函数（纯函数，便于复用）**
- `walkTabs(tabs, visitor)`
- `findFirstPageTabId(tabs)`（找第一个 `tabType === 2` 的页面）
- `containsTabId(tabs, id)`（用于“创建后是否已挂到模板”校验）

**Step 3: 验证**
- Run: `pnpm -C apps/admin typecheck`
- Expected: PASS

**Step 4: Commit**
```bash
git add apps/admin/src/modules/portal/types.ts apps/admin/src/modules/portal/utils/portalTree.ts
git commit -m "feat(portal): refine types and add tab tree helpers"
```

---

### Task 2: 新增 Designer 预览 iframe 组件（可刷新）

**Files:**
- Create: `apps/admin/src/modules/portal/components/designer/PortalPreviewIframe.vue`

**Step 1: 实现 iframe**
- 入参：`templateId`、`tabId`
- 初次加载：`src` 指向 `/portal/preview/:tabId?templateId=...&isInIframe=true`
- 提供方法 `refresh(nextTabId)`：对 iframe `contentWindow.postMessage({ type:'refresh-portal', data:{ tabId: nextTabId } }, window.location.origin)`

**Step 2: 验证**
- Run: `pnpm -C apps/admin typecheck`
- Expected: PASS

**Step 3: Commit**
```bash
git add apps/admin/src/modules/portal/components/designer/PortalPreviewIframe.vue
git commit -m "feat(portal): add designer preview iframe component"
```

---

### Task 3: 新增 tab 树组件（页面导航 + 新建入口）

**Files:**
- Create: `apps/admin/src/modules/portal/components/designer/PortalTabTree.vue`

**Step 1: 实现 tab 树**
- 基于 Element Plus `el-tree`（非虚拟版本即可）
- `props`：`tabs`、`currentTabId`
- `emits`：
  - `select(tabId)`
  - `edit(tabId)`（仅 `tabType===2`）
  - `create-sibling(node)`
  - `create-child(node)`（仅 `tabType===1`）

**Step 2: 交互规则**
- 非 `tabType===2` 的节点在“选择”上禁用（仍可展开/折叠、仍可作为新建子级入口）

**Step 3: 验证**
- Run: `pnpm -C apps/admin typecheck`
- Expected: PASS

**Step 4: Commit**
```bash
git add apps/admin/src/modules/portal/components/designer/PortalTabTree.vue
git commit -m "feat(portal): add portal tab tree component"
```

---

### Task 4: 新增“新建空白页”对话框组件

**Files:**
- Create: `apps/admin/src/modules/portal/components/designer/CreateBlankPageDialog.vue`

**Step 1: 对话框表单**
- 字段：`tabName`（必填）
- 其他字段采用默认值（沿用老项目 `defaultPageForm` 思路）：`tabType=2`、`pageLayout='{\"component\":[]}'` 等

**Step 2: 验证**
- Run: `pnpm -C apps/admin typecheck`
- Expected: PASS

**Step 3: Commit**
```bash
git add apps/admin/src/modules/portal/components/designer/CreateBlankPageDialog.vue
git commit -m "feat(portal): add create blank page dialog"
```

---

### Task 5: 实现 `/portal/designer`（加载模板 + 新建页 + 直接进入编辑）

**Files:**
- Modify: `apps/admin/src/modules/portal/pages/PortalTemplateSettingPage.vue`

**Step 1: 加载 template 详情**
- 从 `route.query.templateId` 读取模板 id；缺失时展示错误提示
- 调 `portalApi.template.detail({ id })`
- 解析并保存：
  - `templateInfo`（后端原始对象，保持 `details/tabIds/tabList`）
  - `tabTree`（`templateInfo.tabList || []`）
  - `currentTabId`（`findFirstPageTabId(tabTree)`）

**Step 2: 渲染 UI**
- 顶部：模板名/模板ID、刷新按钮
- 左侧：`PortalTabTree`
- 中间：`PortalPreviewIframe`
- 空态：当没有任何页面（tabType=2）时，展示“新建空白页”按钮

**Step 3: 新建同级/子级/根页面**
- 打开 `CreateBlankPageDialog`，内部只输入 `tabName`
- 计算 parentId：
  - 根：`0`
  - 同级：`node.parentId || 0`
  - 子级：`node.id`（仅允许导航组）
- 调用 `portalApi.tab.add({ templateId, parentId, tabType:2, tabName, pageLayout:'{\"component\":[]}', ... })`
- 取得 `newTabId` 后：
  - 先 `portalApi.template.detail` 复拉一次确认是否已挂载；
  - 若未挂载：将 `newTabId` push 到 `templateInfo.tabIds` 并 `portalApi.template.update(templateInfo)`，再复拉确认；
  - 然后 `router.push({ path:'/portal/layout', query:{ templateId, tabId:newTabId } })`（直接进入编辑）

**Step 4: 编辑入口**
- 对 `tabType===2` 节点提供“编辑”按钮：跳转 `/portal/layout`

**Step 5: 验证**
- Run: `pnpm -w typecheck`
- Run: `pnpm -w lint`
- Expected: PASS

**Step 6: Commit**
```bash
git add apps/admin/src/modules/portal/pages/PortalTemplateSettingPage.vue
git commit -m "feat(portal): implement designer page create blank tab and jump to editor"
```

---

### Task 6: 同步文档站点（VitePress）

**Files:**
- Modify: `apps/docs/docs/guide/portal-designer.md`

**Step 1: 补充内容**
- 说明 `/portal/designer?templateId=...` 的新建页面流程
- 说明新建后会直接进入 `/portal/layout`
- 说明 iframe 预览刷新机制（同源 postMessage）

**Step 2: 验证**
- Run: `pnpm -C apps/docs build`
- Expected: PASS

**Step 3: Commit**
```bash
git add apps/docs/docs/guide/portal-designer.md
git commit -m "docs: update portal designer guide (create page flow)"
```

