# Admin Management Standardizer

## 适用范围

本页适用于仓库内的本地 skill：`admin-management-standardizer`。

如果需求是“把老项目模块迁进 one-base-template”，先走 [Admin Legacy Migration Workflow](/guide/admin-legacy-migration-workflow)；本页只负责命中 `*Management` 模块之后的页内标准化与规则推广。

首版只覆盖：

- `apps/admin/src/modules/*Management/**`
- 列表 / 搜索 / 弹窗 / CRUD 横向标准化
- 基于既有规则的直接整改执行

首版不覆盖：

- `apps/portal/**`
- `packages/core/**`
- `packages/ui/**`
- `packages/adapters/**`
- 启动链路、主题系统、适配器协议等跨包基建改造

## 这个 skill 解决什么问题

`UserManagement` 已经沉淀出一批高价值规则，但这些规则如果只停留在单模块语境里，横向推广时很容易变成“继续照抄 UserManagement”。

这个 skill 的职责不是把 `UserManagement` 变成唯一模板，而是把已经验证过的规则变成一套可重复执行的推广流程：

1. 判断目标模块是否命中范围
2. 读取正确的规则源
3. 扫描差异并落计划
4. 默认直接推进整改
5. 跑固定门禁并上提新规则

## 与老项目迁移主入口的关系

- `admin-legacy-migration-workflow`：处理“老项目迁移进仓库”的主流程
- `admin-management-standardizer`：处理“已经进入 admin 范围后”的管理模块标准化

也就是说，迁移流程命中 `apps/admin/src/modules/*Management/**` 时，会把本 skill 作为子流程接入；如果没有老项目来源、只是页内横向整改，则可以直接从本 skill 开始。

## 规则源与 skill 的关系

必须区分两件事：

- **规则主版本**：仍然在 `AGENTS.md` 与 `apps/docs/docs/guide/*`
- **skill**：只负责读取这些规则并执行推广流程

因此，这个 skill 不复制长规则正文，只保留：

- 触发条件
- 执行步骤
- 硬限制
- references 导航

这样可以避免规则漂移，也能保证后续规则上提时仍然只有一个主版本。

## 使用时机

当需求类似以下表达时，应该优先使用这个 skill：

- “按 UserManagement 的规则推广到 RoleManagement”
- “横向改造这个管理模块”
- “检查并直接修这个 `*Management` 模块的 CRUD 红线问题”

如果目标已经超出管理模块页内标准化，例如要改 `packages/core`、改启动链路、改 adapter 协议，就不要继续让这个 skill 主导方案。

## 执行流

### 1. 范围命中

先确认目标路径位于 `apps/admin/src/modules/*Management/**`，且目标是列表 / 弹窗 / CRUD 标准化。

### 2. 读取规则源

优先读取：

1. 根 `AGENTS.md`
2. `apps/admin/AGENTS.md`
3. `/guide/agents-scope`
4. `/guide/admin-agent-redlines`
5. `/guide/crud-module-best-practice`

### 3. 做作用域判断

必须先判断规则是否应横向推广，再看规则最初来自哪里。

这里要明确一条核心原则：

> **规则来源不等于规则作用域。**

也就是说，某条规则即使最初在 `UserManagement` 中总结出来，只要会推广到其他 `*Management` 模块，就不应继续当作 `UserManagement` 私有经验维护。

### 4. 扫描差异

差异盘点至少覆盖以下维度：

- 精简
- 性能
- 稳定性
- 可维护性
- 团队是否愿意把它作为默认基线继续开发

### 5. 落计划并直接推进

将差异写入 `docs/plans/YYYY-MM-DD-<module>-standardization-plan.md`，默认直接推进整改，而不是只停在 review 结论。

### 6. 跑固定门禁

至少执行：

```bash
pnpm -C apps/admin lint:arch
pnpm -C apps/admin typecheck
pnpm -C apps/admin lint
pnpm -C apps/admin build
```

如改动 docs，再补：

```bash
pnpm -C apps/docs lint
pnpm -C apps/docs build
```

### 7. 上提新规则

若某条新规则具备横向复用价值，应回写到更高作用域规则源，而不是继续挂在来源模块私有说明里。

## 硬限制

- 不把 `UserManagement` 当唯一模板
- 不把范围外目录强行纳入整改
- 不只改代码不改文档 / 不做验证
- 不在 skill 内复制长规则正文

## 相关入口

- [Admin Legacy Migration Workflow](/guide/admin-legacy-migration-workflow)
- [AGENTS 规则分层](/guide/agents-scope)
- [Admin Agent 红线](/guide/admin-agent-redlines)
- [CRUD 模块最佳实践](/guide/crud-module-best-practice)
- [Agent Harness 与仓库知识](/guide/agent-harness)
