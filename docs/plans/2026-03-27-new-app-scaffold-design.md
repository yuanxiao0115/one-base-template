# New App Scaffold 设计稿

> 状态：已确认，进入实施
> 决策日期：2026-03-27
> 适用范围：`scripts/**`、`package.json`、`apps/docs/**`、`README.md`、`.codex/**`

## 1. 背景

当前仓库已经把 `apps/template` 收敛成“与 admin 同构的子项目基座”，用于后续新子项目孵化与老项目迁移承接；但仓库仍缺少一个稳定入口，把这套基座快速派生成新的业务应用。

现状问题：

1. 只有 `pnpm new:module`，没有 `pnpm new:app`。
2. `apps/docs/docs/guide/template-static-app.md` 仍明确写着“本轮不实现 `new:app` 脚手架命令”。
3. `template` 的启动骨架、模块契约、测试与架构门禁已经齐备，但如果靠手工复制目录，极易漏改 `appcode`、`storageNamespace`、`vite` chunk 名称、测试快照常量与 AGENTS 路径。
4. 根 `lint:arch` 仅显式覆盖 `admin` 与 `template`，未来新增子项目无法自动继承 template 同层门禁。

因此需要在仓库内新增一个 repo-local 的 `new:app` 脚手架入口，让“以 `template` 为母版起新项目”成为标准流程，而不是口头约定。

## 2. 目标

本次新增一个新的根命令：

```bash
pnpm new:app <app-id>
pnpm new:app <app-id> --with-crud-starter
pnpm new:app <app-id> --dry-run
```

目标：

1. 以 `apps/template` 为唯一母版，生成一个 **最小可运行新 app**。
2. 默认生成结果可直接执行 `typecheck / lint / test:run / build`。
3. 可选附带一套 **中性 CRUD starter 模块**，用于后续老项目 CRUD 模块迁移起点。
4. 新 app 自动继承 template 的启动骨架、模块契约、AGENTS 红线与架构门禁。
5. 文档与 README 同步收敛，避免“代码已支持、文档仍说不支持”的漂移。

## 3. 范围冻结

### 3.1 本期必须做

1. 新增脚本：`scripts/new-app.mjs`
2. 根 `package.json` 注册 `new:app`
3. 将 `scripts/check-template-arch.mjs` 收敛为可复用的“派生 app 架构门禁脚本”能力，供 template 与新 app 复用
4. 更新文档：
   - `README.md`
   - `apps/docs/docs/guide/template-static-app.md`
5. 更新 `.codex/operations-log.md`、`.codex/testing.md`、`.codex/verification/2026-03-27.md`
6. 提供 `--with-crud-starter` 可选能力，并保证生成代码可运行

### 3.2 本期不做

1. 不生成根级 `dev:<app-id>`、`build:<app-id>` 等无限增长脚本；新 app 统一通过 `vp run --filter <app-id> ...` 运行
2. 不引入仓库外脚手架工具，不创建全局 CLI
3. 不把 `apps/template` 改成“直接承接具体业务迁移”的落点
4. 不在首版加入复杂交互式问答流程（如多轮命令行 prompt）
5. 不自动迁移真实业务代码，只负责起盘与可选 starter

## 4. 方案对比

### 方案 A：直接复制 `apps/template` 后做定向重写（采用）

- 优点：
  - 最大化复用当前 template 已验证结构
  - 首版实现快，和现有规则最一致
  - 风险集中在“替换矩阵”和“门禁复用”，易验证
- 缺点：
  - 需要维护一份容易遗漏的关键替换点清单

### 方案 B：完全不复制目录，逐文件代码生成

- 优点：
  - 最终结构最干净，可精细控制输出
- 缺点：
  - 首版工作量大，最容易漏文件和规则
  - 一旦 template 继续演进，生成器要长期双维护

### 方案 C：只做 shell 级 `cp/rsync` 包装

- 优点：
  - 上手最快
- 缺点：
  - 无法稳定处理命名替换、可选 CRUD starter、dry-run、门禁与文档同步
  - 复制后仍需要手工大量收尾，不满足标准化目标

## 5. 采用方案

采用 **方案 A**：以 `apps/template` 为母版复制到 `apps/<app-id>`，再对关键文件执行元数据驱动的定向替换；可选追加 CRUD starter 模块。

### 5.1 命令接口

```bash
pnpm new:app <app-id>
pnpm new:app <app-id> --with-crud-starter
pnpm new:app <app-id> --dry-run
```

参数约束：

- `app-id` 采用与 `new:module` 一致的 kebab-case 规则：字母开头，仅允许小写字母、数字、短横线
- `--dry-run`：只输出将创建的目录、关键替换点与可选 starter 信息，不落盘
- `--with-crud-starter`：在最小可运行 app 基础上，再生成一套本地可运行的 CRUD starter 模块

### 5.2 复制与替换策略

脚本流程：

1. 校验 `app-id`
2. 目标目录 `apps/<app-id>` 不存在时继续；存在则退出
3. 递归复制 `apps/template`，排除 `dist/` 与 `node_modules/`
4. 对复制后的文本文件执行定向替换
5. 可选生成 CRUD starter，并把 starter 模块加入新 app 的 `enabledModules`
6. 输出后续验证命令

首版明确处理的关键替换点：

- `apps/template` -> `apps/<app-id>`（文档、AGENTS、提示文案、命令示例）
- `package.json` 的 `name: "template"` -> `name: "<app-id>"`
- `index.html` 标题 `template` -> `<app-id>`
- `src/config/platform-config.ts`
  - `appcode: 'template'` -> `'<app-id>'`
  - `storageNamespace: 'one-base-template-template'` -> `'one-base-template-<app-id>'`
- `vite.config.ts`
  - `appName: 'template'` -> `'<app-id>'`
  - chunk 名：`template-home/template-demo/template-app-shell/template-auth` 等前缀替换为 `<app-id>-*`
  - feature chunk 路径 `/apps/template/src/...` -> `/apps/<app-id>/src/...`
- 启动命名
  - `bootstrapTemplateApp` -> `bootstrap<AppPascal>App`
  - `startTemplateApp` -> `start<AppPascal>App`
  - `StartTemplateApp*` -> `Start<AppPascal>App*`
- 测试与路由中的 `/template/`、`template-test` 等字面量改为新 app 口径
- `src/bootstrap/template-styles.ts` 重命名为 `src/bootstrap/<app-id>-styles.ts`，并同步更新 import

说明：

- `@one-base-template/*` workspace 包名 **不替换**
- `one-base-template` 仓库名 **不替换**
- 替换目标仅限新 app 自身的应用命名、路径、样式前缀、测试常量与文案

### 5.3 CRUD starter 设计

默认不生成业务模块，只保留 `home` + `demo` 示例模块。

当传入 `--with-crud-starter` 时，新增一个中性 starter 模块，例如 `starter-crud`，满足：

1. 文件结构贴近当前 CRUD 规范：
   - `api.ts`
   - `form.ts`
   - `columns.tsx`
   - `composables/useStarterCrudPageState.ts`
   - `list.vue`
   - `components/StarterCrudEditForm.vue`
   - `components/StarterCrudSearchForm.vue`
2. 页面可运行，不依赖真实后端，先用模块内本地内存数据演示 CRUD 流程
3. `list.vue` 遵守当前红线：
   - 不用 `el-table`
   - 不用 `el-dialog`
   - 不写模板内联箭头函数
4. 路由、模块声明与 `enabledModules` 在同一轮变更中补齐

这样可以保证：

- 默认场景仍是“最小壳子”
- 需要 CRUD 起盘时也有现成入口
- starter 不夹带真实业务领域假设（如 User/Role/Menu）

### 5.4 架构门禁复用

当前 `scripts/check-template-arch.mjs` 硬编码了 `apps/template/src` 与 `template` 文案，无法直接用于新 app。

本次将其收敛为“支持传入 app 目标”的脚本能力，原则：

1. template 继续沿用同一脚本，不破坏现有命令体验
2. 新 app 生成后能直接拥有自己的 `lint:arch`
3. 根 `lint:arch` 改为自动发现并执行带 `lint:arch` 的 app，避免未来继续手写追加 app 名

这样生成的新 app 在 `pnpm verify` 路径里才能真正继承 template 同层架构门禁，而不是只有代码复制、没有质量门禁。

## 6. 影响文件

### 新增

- `scripts/new-app.mjs`
- 可能新增：CRUD starter 相关模板/帮助文件（若代码内联过长则拆目录）
- `docs/plans/2026-03-27-new-app-scaffold-design.md`
- `docs/plans/2026-03-27-new-app-scaffold-plan.md`
- `.codex/verification/2026-03-27.md`

### 修改

- `package.json`
- `scripts/check-template-arch.mjs`
- `README.md`
- `apps/docs/docs/guide/template-static-app.md`
- 视实现需要，可能补一处 docs 导航入口说明
- `.codex/operations-log.md`
- `.codex/testing.md`
- `.codex/verification.md`

## 7. 验证口径

至少验证以下场景：

### 7.1 脚本 dry-run

```bash
pnpm new:app sample-app --dry-run
pnpm new:app sample-app --with-crud-starter --dry-run
```

预期：

- 不落盘
- 正确输出目标目录、关键替换点、是否附带 CRUD starter

### 7.2 实际生成最小 app

```bash
pnpm new:app sample-app
pnpm -C apps/sample-app typecheck
pnpm -C apps/sample-app lint
pnpm -C apps/sample-app lint:arch
pnpm -C apps/sample-app test:run
pnpm -C apps/sample-app build
```

预期：全部通过。

### 7.3 实际生成带 CRUD starter 的 app

```bash
pnpm new:app sample-crud-app --with-crud-starter
pnpm -C apps/sample-crud-app typecheck
pnpm -C apps/sample-crud-app lint
pnpm -C apps/sample-crud-app lint:arch
pnpm -C apps/sample-crud-app test:run
pnpm -C apps/sample-crud-app build
```

预期：全部通过。

### 7.4 文档同步

```bash
pnpm -C apps/docs lint
pnpm -C apps/docs build
```

预期：通过，且文档描述与实际脚本一致。

## 8. 风险与控制

1. 风险：复制成功但命名替换不完整，生成 app 中残留大量 `template` 语义  
   控制：维护明确替换矩阵，并加一轮 `rg` 扫描验证残留点

2. 风险：新 app 虽可运行，但根 `lint:arch` / `verify` 不覆盖它  
   控制：本次同步收敛 `lint:arch` 入口为自动发现机制

3. 风险：CRUD starter 夹带过强业务假设  
   控制：starter 仅使用中性命名与本地内存数据，不绑定真实业务领域

4. 风险：脚本误复制 `dist/`、`node_modules/` 等产物  
   控制：复制层显式排除构建产物与依赖目录

5. 风险：修改范围误触 `apps/template/**` 既有业务文件  
   控制：本轮只改脚本、文档、根入口与 `.codex` 记录，不直接改 template 业务实现
