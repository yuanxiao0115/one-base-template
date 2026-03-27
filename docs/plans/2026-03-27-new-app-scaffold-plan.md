# New App Scaffold Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 新增 `pnpm new:app`，基于 `apps/template` 生成最小可运行新 app，并可选附带本地可运行 CRUD starter。

**Architecture:** 采用“复制 `apps/template` + 元数据驱动定向替换”的方式实现脚手架首版，并把 template 架构门禁收敛为可供派生 app 复用的脚本能力。默认输出最小可运行新 app，可选追加中性 CRUD starter，同时同步 README、VitePress 文档与 `.codex` 验证证据。

**Tech Stack:** Node.js ESM 脚本、pnpm workspace、Vite Plus、Vue 3、VitePress、repo-local `.codex` 记录。

---

## Chunk 1: 设计与上下文落盘

### Task 1: 落设计稿并记录本轮上下文

**Files:**

- Create: `docs/plans/2026-03-27-new-app-scaffold-design.md`
- Modify: `.codex/operations-log.md`

- [ ] **Step 1: 写设计稿**

把目标、范围冻结、方案对比、替换矩阵、CRUD starter 设计、门禁复用方案与验证口径落到 `docs/plans/2026-03-27-new-app-scaffold-design.md`。

- [ ] **Step 2: 在操作日志登记本轮任务起点**

记录“新增 `new:app` 脚手架 + template 派生 app 门禁复用”的背景与约束，强调本轮不直接修改 `apps/template` 业务模块。

## Chunk 2: new:app 脚本实现

### Task 2: 实现最小可运行新 app 生成器

**Files:**

- Create: `scripts/new-app.mjs`
- Modify: `package.json`

- [ ] **Step 1: 复用 `new-module` 的参数风格与命名校验**

参考 `scripts/new-module.mjs`，为 `new:app` 实现：

- `app-id` 必填
- kebab-case 校验
- `--dry-run`
- `--with-crud-starter`

- [ ] **Step 2: 实现复制逻辑**

从 `apps/template` 复制到 `apps/<app-id>`，显式排除：

- `dist/**`
- `node_modules/**`

- [ ] **Step 3: 实现替换矩阵**

至少覆盖：

- `apps/template` 路径文案
- `package.json` 名称
- `index.html` 标题
- `src/config/platform-config.ts` 的 `appcode` 与 `storageNamespace`
- `src/main.ts` / `src/bootstrap/startup.ts` / `src/bootstrap/index.ts` 的启动命名
- `vite.config.ts` 中 `appName`、chunk 名称与 feature chunk 路径
- 测试中的 `/template/`、`template-test` 与存储命名空间

- [ ] **Step 4: 处理必要的文件重命名**

至少处理：

- `src/bootstrap/template-styles.ts` -> `src/bootstrap/<app-id>-styles.ts`

并同步修正 import。

- [ ] **Step 5: 注册根命令**

在根 `package.json` 新增：

```json
"new:app": "node ./scripts/new-app.mjs"
```

- [ ] **Step 6: dry-run 自检**

运行：

```bash
pnpm new:app sample-app --dry-run
pnpm new:app sample-app --with-crud-starter --dry-run
```

预期：输出目标目录与变更摘要，不落盘。

## Chunk 3: CRUD starter 落地

### Task 3: 为 `--with-crud-starter` 生成中性 CRUD 模块

**Files:**

- Modify: `scripts/new-app.mjs`
- Create: `apps/<generated-app>/src/modules/starter-crud/**`（由脚本生成，非手工长期文件）

- [ ] **Step 1: 定义 starter 模块目录结构**

生成以下文件：

- `manifest.ts`
- `module.ts`
- `routes.ts`
- `api.ts`
- `form.ts`
- `columns.tsx`
- `composables/useStarterCrudPageState.ts`
- `list.vue`
- `components/StarterCrudEditForm.vue`
- `components/StarterCrudSearchForm.vue`

- [ ] **Step 2: 让 starter 使用本地内存数据闭环**

保证新增/编辑/删除/筛选都能在本地运行，不依赖真实后端。

- [ ] **Step 3: 让 `list.vue` 遵守当前红线**

确保：

- 不使用 `el-table`
- 不使用 `el-dialog`
- 不在模板事件里写内联箭头函数

- [ ] **Step 4: 把 starter 模块接入启用列表**

当传入 `--with-crud-starter` 时，把 `starter-crud` 加入新 app 的 `enabledModules`。

## Chunk 4: 架构门禁复用与验证链路收口

### Task 4: 让 template 门禁可供派生 app 复用

**Files:**

- Modify: `scripts/check-template-arch.mjs`
- Modify: `package.json`
- Modify: `apps/template/package.json`

- [ ] **Step 1: 参数化门禁脚本目标 app**

让 `scripts/check-template-arch.mjs` 支持通过参数指定目标 app 目录与显示名称，默认仍指向 `template`。

- [ ] **Step 2: 保持 template 现有命令不变或等价**

确保：

```bash
pnpm -C apps/template lint:arch
```

行为保持稳定。

- [ ] **Step 3: 为新 app 输出可用的 `lint:arch`**

让新 app 生成后的 `package.json` 中包含：

```json
"lint:arch": "node ../../scripts/check-template-arch.mjs --app <app-id>"
```

或同等效果命令。

- [ ] **Step 4: 收敛根 `lint:arch`**

改为自动发现 `apps/*/package.json` 中声明了 `lint:arch` 的 app 并执行，避免未来继续手写追加 app。

- [ ] **Step 5: 验证根门禁未回归**

至少运行：

```bash
pnpm lint:arch
```

预期：现有 app 仍通过，且未来新 app 可被自动纳入。

## Chunk 5: 文档同步

### Task 5: 更新 README 与 docs 站点

**Files:**

- Modify: `README.md`
- Modify: `apps/docs/docs/guide/template-static-app.md`
- Optional Modify: `apps/docs/docs/guide/module-system.md`

- [ ] **Step 1: 更新 README 常用命令**

补充：

- `pnpm new:app <app-id>`
- `pnpm new:app <app-id> --with-crud-starter`
- 新 app 通过 `vp run --filter <app-id> dev` 启动

- [ ] **Step 2: 更新 template 文档页**

修正文档中“本轮不实现 new:app 脚手架命令”的旧表述，并补充“如何从 template 派生新 app”的标准流程。

- [ ] **Step 3: 如有必要补一处模块/脚手架入口说明**

若现有导航里容易误导开发者只知道 `new:module`，则补一处轻量说明，不额外开新页。

## Chunk 6: 生成结果验证与记录收口

### Task 6: 做真实生成验证并更新 `.codex` 证据

**Files:**

- Modify: `.codex/testing.md`
- Modify: `.codex/verification.md`
- Create: `.codex/verification/2026-03-27.md`
- Modify: `.codex/operations-log.md`

- [ ] **Step 1: 真实生成一个最小 app 并验证**

运行：

```bash
pnpm new:app sample-app
pnpm -C apps/sample-app typecheck
pnpm -C apps/sample-app lint
pnpm -C apps/sample-app lint:arch
pnpm -C apps/sample-app test:run
pnpm -C apps/sample-app build
```

- [ ] **Step 2: 真实生成一个带 CRUD starter 的 app 并验证**

运行：

```bash
pnpm new:app sample-crud-app --with-crud-starter
pnpm -C apps/sample-crud-app typecheck
pnpm -C apps/sample-crud-app lint
pnpm -C apps/sample-crud-app lint:arch
pnpm -C apps/sample-crud-app test:run
pnpm -C apps/sample-crud-app build
```

- [ ] **Step 3: 跑文档验证**

运行：

```bash
pnpm -C apps/docs lint
pnpm -C apps/docs build
```

- [ ] **Step 4: 记录测试与验证结论**

把 dry-run、真实生成、门禁、docs 构建结果写入：

- `.codex/testing.md`
- `.codex/verification/2026-03-27.md`
- `.codex/verification.md`
- `.codex/operations-log.md`

- [ ] **Step 5: 清理验证生成的临时 app（若不作为正式产物保留）**

确保最终 diff 只保留脚本、文档、计划与 `.codex` 记录，不误带 smoke 用 app。

## Chunk 7: 提交与交付

### Task 7: 复核 diff、提交并准备说明

**Files:**

- Modify: 本次实际改动文件（按实现结果）

- [ ] **Step 1: 复核 git diff 范围**

确认本次只包含：

- `scripts/new-app.mjs`
- 门禁脚本收敛
- 根命令与 docs 更新
- `docs/plans/*`
- `.codex/*`

- [ ] **Step 2: 运行最终验证**

至少运行：

```bash
pnpm lint:arch
pnpm -C apps/docs lint
pnpm -C apps/docs build
```

若时间允许，再补：

```bash
pnpm verify
```

- [ ] **Step 3: 提交**

按仓库规则使用中文提交信息，例如：

```bash
git add scripts/new-app.mjs scripts/check-template-arch.mjs package.json README.md apps/docs docs/plans .codex
git commit -m "feat: 新增 template 派生 app 脚手架"
```
