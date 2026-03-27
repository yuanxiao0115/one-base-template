# Admin Legacy Migration Workflow

## 适用范围

本页适用于仓库内的本地 skill：`admin-legacy-migration-workflow`。

它处理的是“老项目能力迁移到 one-base-template”的主流程，覆盖：

- `apps/admin` 模块 / 页面迁移
- 必要时的 `packages/adapters`、`packages/core`、`packages/ui` 配套收口
- 命中 `*Management` 模块时的标准化与 CRUD 基线接入

默认不处理：

- `apps/portal/**`
- 与用户当前目标无关的全局运行时或 `~/.codex` 配置
- 仅页内横向整改但没有老项目迁移来源的任务

## 这个 skill 解决什么问题

旧版迁移流程被拆成了“最佳实践”和“执行器”两份，真正做迁移时经常还要再补 `admin-management-standardizer`、CRUD 基线和 admin 自己的 AGENTS 规则。

这个新 skill 的职责是把这些入口串成一条主线：

1. 冻结迁移范围与来源路径
2. 做分层落点判断
3. 命中管理模块时切到标准化 + CRUD 桥接流
4. 同步计划、docs 和 `.codex` 证据
5. 跑固定验证再收口

## 与其他 skill 的关系

必须区分三类 skill：

- **`admin-legacy-migration-workflow`**：老项目迁移主入口
- **`admin-management-standardizer`**：只负责 `*Management` 页内标准化
- **`crud-module-best-practice`**：只负责 CRUD 文件结构与页面编排基线

也就是说：

- 如果任务是“从老项目迁一个管理模块进来”，先从本页对应的 skill 进入
- 如果任务已经是仓库内现有管理模块横向整改，直接用 `admin-management-standardizer`
- 如果只是新建或重构 CRUD 模块而不是老项目迁移，直接用 `crud-module-best-practice`

## 默认来源路径

用户未明确指定时，老项目来源固定为：

`/Users/haoqiuzhi/code/basic/standard-oa-web-basic`

## 执行流

### 1. 冻结范围

先写清：

- 来源仓库路径
- 目标目录
- 必须迁移项
- 不迁移项
- 验收口径

### 2. 读取规则源

至少读取：

1. 根 `AGENTS.md`
2. `apps/admin/AGENTS.md`
3. `guide/agents-scope`
4. `guide/admin-agent-redlines`
5. `guide/crud-module-best-practice`
6. 最近相关的 `docs/plans/*.md`

### 3. 做分层落点判断

按当前仓库边界把代码放到正确层：

- `packages/adapters`：后端路径与字段映射
- `packages/core`：通用逻辑与状态契约
- `packages/ui`：共享壳与交互
- `apps/admin`：页面编排与模块装配

### 4. 命中管理模块时走桥接流

当目标位于 `apps/admin/src/modules/*Management/**` 且包含 CRUD 时，必须补用：

- `admin-management-standardizer`
- `crud-module-best-practice`

这里有一条当前仓库必须显式处理的优先级：

> CRUD skill 中的 `page.vue` 编排原则只继承“页面只负责编排”的思想；当前 admin 仓库的编排页文件名以 `apps/admin/AGENTS.md` 为准，统一使用 `list.vue`。

### 5. 分批实施

每批只交付一个可验证变化，先做契约与路由，再接页面和交互。

### 6. 同步 docs 与 `.codex`

迁移计划写入 `docs/plans/`，过程证据写入：

- `.codex/operations-log.md`
- `.codex/testing.md`
- `.codex/verification.md`

### 7. 跑验证并收口

至少执行：

```bash
pnpm -C apps/admin typecheck
pnpm -C apps/admin lint
pnpm -C apps/admin build
pnpm -C apps/docs lint
pnpm -C apps/docs build
```

## 硬限制

- 不把老项目动态路由和页面层字段清洗原样搬进来
- 不把 `UserManagement` 当唯一模板
- 不跳过 docs 和验证
- 不在只需页内标准化时扩大成跨包重构

## 相关入口

- [Admin Management Standardizer](/guide/admin-management-standardizer)
- [CRUD 模块最佳实践](/guide/crud-module-best-practice)
- [Admin Agent 红线](/guide/admin-agent-redlines)
- [AGENTS 规则分层](/guide/agents-scope)
