# LogManagement First Rollout Standardization Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 按 `admin-management-standardizer` 首版规则完成 `LogManagement` 首轮横向推广，收敛可读性、稳定性与可维护性问题。

**Architecture:** 保持 `LogManagement` 现有目录结构不变，在模块内最小改造：详情请求加“最新请求守卫”避免旧响应回写、列表模板去掉内联箭头函数与冗余根包裹层，并把可复用结论上提到 admin 规则主版本。

**Tech Stack:** Vue 3、TypeScript、Vite Plus Test、VitePress。

---

## Chunk 1: 差异冻结

### Task 1: 冻结首轮范围与改造点

**Files:**

- Create: `docs/plans/2026-03-23-logmanagement-first-rollout-standardization-plan.md`

- [ ] **Step 1: 范围命中确认**

仅覆盖 `apps/admin/src/modules/LogManagement/**` 的 `login-log`、`sys-log` 两个列表模块。

- [ ] **Step 2: 问题清单冻结**

- 详情抽屉 `openDetail` 无最新请求守卫，快速连点时存在旧响应覆盖新状态风险。
- 打开详情前未清空旧详情数据，切换行时可能短暂显示旧内容。
- 列表模板操作列使用内联箭头函数，模板冗余且不利于统一基线。
- 列表模板最外层存在无业务意义包裹 `div`。

- [ ] **Step 3: 本轮不做项**

不调整 API 协议，不替换 `el-drawer`，不做跨包抽象重构。

## Chunk 2: 代码改造

### Task 2: 详情竞态保护与状态收敛

**Files:**

- Modify: `apps/admin/src/modules/LogManagement/login-log/composables/useLoginLogPageState.ts`
- Modify: `apps/admin/src/modules/LogManagement/sys-log/composables/useSysLogPageState.ts`

- [ ] **Step 1: 新增详情请求 token 守卫**

`openDetail` 为每次请求生成 token，仅最后一次请求允许回写 `detailData/detailLoading/detailVisible`。

- [ ] **Step 2: 打开详情前清空旧数据**

进入详情加载前先置空 `detailData`，避免旧内容闪现。

- [ ] **Step 3: 失败分支按 token 生效**

仅当前 token 仍为最新时提示错误并关闭抽屉，防止旧请求污染当前交互。

### Task 3: 列表模板可读性收敛

**Files:**

- Modify: `apps/admin/src/modules/LogManagement/login-log/list.vue`
- Modify: `apps/admin/src/modules/LogManagement/sys-log/list.vue`

- [ ] **Step 1: 去掉模板内箭头函数**

把 `@click="() => openDetail(row)"` 改为 `@click="openDetail(row)"`，删除同类写法。

- [ ] **Step 2: 去掉最外层无意义 `div`**

模板改为多根节点或片段编排，保持结构扁平。

### Task 4: 规则上提

**Files:**

- Modify: `apps/admin/AGENTS.md`

- [ ] **Step 1: 上提首轮可复用规则**

补充“日志/详情类抽屉加载必须带最新请求守卫”“列表模板操作列禁止内联箭头函数”两条通用规则。

## Chunk 3: 验证收口

### Task 5: 运行门禁并同步文档

**Files:**

- Modify: `.codex/operations-log.md`
- Modify: `.codex/testing.md`
- Modify: `.codex/verification.md`

- [ ] **Step 1: 定向验证**

```bash
pnpm -C apps/admin typecheck
pnpm -C apps/admin lint:arch
pnpm -C apps/admin lint
pnpm -C apps/admin build
```

- [ ] **Step 2: 文档验证（因规则文件变更）**

```bash
pnpm -C apps/docs lint
pnpm -C apps/docs build
```

- [ ] **Step 3: 按提交策略自动提交**

提交信息使用中文，按本轮模块范围单独提交。
