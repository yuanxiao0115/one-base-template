# SystemManagement + CmsManagement Second Rollout Plan (Dict + Column)

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在首轮规则基础上，继续并行推广到 `SystemManagement/dict` 与 `CmsManagement/column`，并把“模板事件内联箭头”固化为 `lint:arch` 自动门禁。

**Architecture:** 保持模块现有结构不变，执行最小改造：列表页事件收口为显式 handler，打开动作增加 busy 短路，脚本门禁新增 `list.vue` 模板事件内联箭头检测。

**Tech Stack:** Vue 3、TypeScript、Vite Plus Lint、VitePress。

---

## Chunk 1: 范围冻结

### Task 1: 确认第二轮并行范围

**Files:**

- Create: `docs/plans/2026-03-23-system-cms-second-rollout-dict-column-plan.md`

- [ ] **Step 1: 模块命中确认**

本轮仅覆盖：

- `apps/admin/src/modules/SystemManagement/dict/**`
- `apps/admin/src/modules/CmsManagement/column/**`
- `scripts/check-admin-arch.mjs`

- [ ] **Step 2: 问题清单冻结**

- `dict/list.vue` 与 `column/list.vue` 存在模板内联箭头事件。
- 打开动作仍有模板直连 `editor.openXxx`，可读性与可维护性偏弱。
- 缺少可阻断回退的脚本门禁（内联箭头可被再次引入）。

## Chunk 2: 并行代码改造

### Task 2: SystemManagement/dict 收口

**Files:**

- Modify: `apps/admin/src/modules/SystemManagement/dict/list.vue`
- Modify: `apps/admin/src/modules/SystemManagement/dict/composables/useDictPageState.ts`

- [ ] **Step 1: 去模板内联箭头**

主表与字典项表操作列全部改为直接调用显式 handler。

- [ ] **Step 2: 打开动作显式收口**

字典与字典项的 `openCreate/openEdit/openDetail` 不再在模板直连 editor API。

- [ ] **Step 3: busy 短路防并发**

字典编辑器与字典项编辑器在 `opening/submitting` 态短路返回。

### Task 3: CmsManagement/column 收口

**Files:**

- Modify: `apps/admin/src/modules/CmsManagement/column/list.vue`

- [ ] **Step 1: 去模板内联箭头**

操作列事件移除 `() => ...` 写法。

- [ ] **Step 2: 打开与删除动作显式收口**

新增显式 handler（create/edit/detail/createChild/remove），模板仅调用 handler。

- [ ] **Step 3: busy 短路防并发**

`openCreate/openEdit/openDetail/openCreateChild` 在 `opening/submitting` 场景短路返回。

## Chunk 3: 门禁与文档同步

### Task 4: lint:arch 新增内联箭头检测

**Files:**

- Modify: `scripts/check-admin-arch.mjs`
- Modify: `apps/admin/AGENTS.md`
- Modify: `apps/docs/docs/guide/admin-agent-redlines.md`

- [ ] **Step 1: 脚本门禁新增规则**

`isCrudListPage` 分支新增模板事件内联箭头检测（`@click/@command/...`）。

- [ ] **Step 2: 规则文档同步**

同步 `AGENTS.md` 与 docs 红线可读版，确保“规则 + 门禁”一致。

## Chunk 4: 验证收口与提交

### Task 5: 运行门禁并提交

**Files:**

- Modify: `.codex/operations-log.md`
- Modify: `.codex/testing.md`
- Modify: `.codex/verification.md`

- [ ] **Step 1: admin 验证**

```bash
pnpm -C apps/admin typecheck
pnpm -C apps/admin lint:arch
pnpm -C apps/admin lint
pnpm -C apps/admin build
pnpm check:admin:bundle
```

- [ ] **Step 2: docs 验证**

```bash
pnpm -C apps/docs lint
pnpm -C apps/docs build
```

- [ ] **Step 3: 提交策略**

按模块拆分中文提交，并确保工作区清洁。
