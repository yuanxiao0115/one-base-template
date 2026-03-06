# Submit Remaining Changes Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 将当前仓库中剩余的有效源码、文档与工程配置改动按模块拆分提交，直到目标改动全部进入 git 历史。

**Architecture:** 先冻结提交边界，确保不把生成物与无关噪音混入 commit；再按“规则文档 → portal-engine/admin 门户迁移 → portal 独立应用 → 工程配置与文档收尾”的顺序提交，保证每个 commit 都可独立理解和验证。

**Tech Stack:** git、pnpm、Turborepo、Vue 3、Vite、VitePress、TypeScript

---

### Task 1: 冻结提交边界并排除生成物噪音

**Files:**
- Inspect: `.gitignore`
- Inspect: `apps/portal/**`
- Inspect: `packages/portal-engine/**`
- Inspect: `git status`

**Step 1: 确认生成物不会进入提交**

检查以下路径仅作为本地构建产物存在，不进入 commit：

- `apps/portal/dist/**`
- `apps/portal/node_modules/**`
- `apps/portal/.turbo/**`
- `packages/portal-engine/.turbo/**`

**Step 2: 验证工作区边界**

Run: `git status --short --untracked-files=all -- apps/portal packages/portal-engine`

Expected: `apps/portal` 只显示源码/配置文件；`.gitignore` 已屏蔽 `dist` / `node_modules` / `.turbo`。

### Task 2: 提交 Agent / Harness 规则与知识入口改动

**Files:**
- Modify: `AGENTS.md`
- Modify: `apps/admin/AGENTS.md`
- Create: `apps/docs/docs/guide/agent-harness.md`
- Modify: `apps/docs/docs/guide/agents-scope.md`
- Modify: `apps/docs/docs/guide/index.md`
- Modify: `apps/docs/docs/guide/development.md`（仅 Agent/Harness 相关段落）
- Modify: `apps/docs/docs/.vitepress/config.ts`
- Create: `docs/plans/2026-03-06-agent-harness-project-rules-design.md`
- Create: `docs/plans/2026-03-06-agent-harness-project-rules-implementation.md`

**Step 1: 选择性暂存本批文件**

Run:
```bash
git add AGENTS.md \
  apps/admin/AGENTS.md \
  apps/docs/docs/guide/agent-harness.md \
  apps/docs/docs/guide/agents-scope.md \
  apps/docs/docs/guide/index.md \
  apps/docs/docs/.vitepress/config.ts \
  docs/plans/2026-03-06-agent-harness-project-rules-design.md \
  docs/plans/2026-03-06-agent-harness-project-rules-implementation.md
```

**Step 2: 对混合文件做 hunk 级暂存**

- `apps/docs/docs/guide/development.md` 只暂存 Agent/Harness 协作实践相关片段，保留 chunk warning 片段给后续工程提交。

**Step 3: 验证 docs**

Run:
```bash
pnpm -C apps/docs lint
pnpm -C apps/docs build
```

Expected: PASS

**Step 4: 提交**

Run:
```bash
git commit -m "docs: 重构 agent harness 项目规则"
```

### Task 3: 提交 portal-engine 抽包与 admin 门户迁移

**Files:**
- Create: `packages/portal-engine/**`
- Modify/Delete: `apps/admin/src/modules/portal/**`
- Modify: `apps/admin/package.json`
- Modify: `tsconfig.base.json`
- Modify: `eslint.config.js`
- Create: `docs/plans/2026-03-05-portal-engine-split-design.md`
- Create: `docs/plans/2026-03-05-portal-engine-split-implementation.md`

**Step 1: 暂存引擎包与 admin 迁移文件**

重点覆盖：
- `packages/portal-engine/src/editor/**`
- `packages/portal-engine/src/renderer/**`
- `packages/portal-engine/src/materials/**`
- `packages/portal-engine/src/registry/**`
- `packages/portal-engine/src/stores/**`
- `packages/portal-engine/src/composables/**`
- `apps/admin/src/modules/portal/**`

**Step 2: 暂存配套工程配置**

Run:
```bash
git add apps/admin/package.json tsconfig.base.json eslint.config.js \
  docs/plans/2026-03-05-portal-engine-split-design.md \
  docs/plans/2026-03-05-portal-engine-split-implementation.md \
  packages/portal-engine
```

**Step 3: 验证 admin 与 portal-engine**

Run:
```bash
pnpm -C packages/portal-engine typecheck
pnpm -C apps/admin typecheck
pnpm -C apps/admin build
```

Expected: PASS

**Step 4: 提交**

Run:
```bash
git commit -m "feat: 抽离 portal-engine 并迁移 admin 门户模块"
```

### Task 4: 提交 apps/portal 独立消费者应用

**Files:**
- Create: `apps/portal/index.html`
- Create: `apps/portal/package.json`
- Create: `apps/portal/public/platform-config.json`
- Create: `apps/portal/src/**`
- Create: `apps/portal/tsconfig.json`
- Create: `apps/portal/vite.config.ts`
- Modify: `package.json`
- Modify: `README.md`

**Step 1: 选择性暂存 portal app 文件**

Run:
```bash
git add apps/portal/index.html \
  apps/portal/package.json \
  apps/portal/public/platform-config.json \
  apps/portal/src \
  apps/portal/tsconfig.json \
  apps/portal/vite.config.ts \
  package.json \
  README.md
```

**Step 2: 验证 portal**

Run:
```bash
pnpm -C apps/portal typecheck
pnpm -C apps/portal lint
pnpm -C apps/portal build
```

Expected: PASS

**Step 3: 提交**

Run:
```bash
git commit -m "feat: 新增 portal 独立消费者应用"
```

### Task 5: 提交工程配置收口与文档同步

**Files:**
- Create: `packages/adapters/turbo.json`
- Create: `packages/core/turbo.json`
- Create: `packages/tag/turbo.json`
- Create: `packages/ui/turbo.json`
- Create: `packages/utils/turbo.json`
- Modify: `pnpm-lock.yaml`
- Modify: `apps/docs/docs/guide/adapter-sczfw.md`
- Modify: `apps/docs/docs/guide/architecture.md`
- Modify: `apps/docs/docs/guide/development.md`（chunk warning / turbo outputs 片段）
- Modify: `apps/docs/docs/guide/portal-designer.md`
- Modify: `apps/docs/docs/guide/quick-start.md`
- Create: `docs/plans/2026-03-06-sczfw-infra-cleanup.md`

**Step 1: 暂存工程配置与文档**

Run:
```bash
git add packages/adapters/turbo.json packages/core/turbo.json packages/tag/turbo.json \
  packages/ui/turbo.json packages/utils/turbo.json pnpm-lock.yaml \
  apps/docs/docs/guide/adapter-sczfw.md apps/docs/docs/guide/architecture.md \
  apps/docs/docs/guide/development.md apps/docs/docs/guide/portal-designer.md \
  apps/docs/docs/guide/quick-start.md docs/plans/2026-03-06-sczfw-infra-cleanup.md
```

**Step 2: 验证全局工程链路**

Run:
```bash
pnpm -C apps/docs lint
pnpm -C apps/docs build
pnpm build
```

Expected: PASS

**Step 3: 提交**

Run:
```bash
git commit -m "chore: 收口 monorepo 配置并同步文档"
```

### Task 6: 全量验收并确认工作区归零

**Files:**
- Verify only

**Step 1: 运行全量验证**

Run:
```bash
pnpm typecheck
pnpm lint
pnpm build
pnpm -C apps/docs build
git status --short
```

**Step 2: 验证口径**

- 所有目标改动都已有 commit
- 工作区不再残留本轮目标文件
- 若仍有残余，明确列出是否属于用户未要求提交的其他改动
