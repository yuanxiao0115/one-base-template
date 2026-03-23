# Rollout Workflow

## 适用范围

- 仅处理 `apps/admin/src/modules/*Management/**`
- 仅覆盖列表 / 搜索 / 弹窗 / CRUD 横向标准化
- 默认目标是“直接推进整改”，不是只出审查报告

## 读取顺序

进入目标模块前，至少确认以下规则源：

1. 根 `AGENTS.md`
2. `apps/admin/AGENTS.md`
3. `apps/docs/docs/guide/agents-scope.md`
4. `apps/docs/docs/guide/admin-agent-redlines.md`
5. `apps/docs/docs/guide/crud-module-best-practice.md`
6. 目标模块最近相关的 `docs/plans/*.md`

## 七步执行流

### 1. 命中范围

确认目标模块是否满足：

- 路径在 `apps/admin/src/modules/*Management/**`
- 需求目标是标准化列表 / 弹窗 / CRUD 实现
- 当前任务不要求跨 `packages/*` 的大规模联动重构

如果任一条件不满足，停止套用本 skill，并改走更合适的流程。

### 2. 完成作用域判断

先判断“哪些规则可以横向推广”，再看“这些规则最初来自哪里”。
不要因为规则在 `UserManagement` 中被验证过，就把它继续限制为 `UserManagement` 私有经验。

### 3. 扫描差异

至少从以下维度盘点差异：

- 精简：页面是否只保留编排，是否存在无意义中转层
- 性能：是否有首屏双请求、重复 watch、过量阻塞数据
- 稳定性：是否有竞态、错误提示错位、旧响应回写
- 可维护性：状态分组是否清楚，命名是否短而稳定
- 团队接受度：是否过度抽象，是否把业务私货伪装成通用模式

### 4. 落计划

使用 `assets/rollout-plan-template.md` 在 `docs/plans/` 新建计划文件。
计划必须写清：

- 目标模块
- 问题列表
- 拟修改文件
- 验证命令
- 文档同步项

### 5. 直接推进改造

默认不是“只做 review”。
如果没有用户明确要求停在审查阶段，就直接按计划推进改造。

### 6. 跑固定门禁

至少执行：

```bash
pnpm -C apps/admin lint:arch
pnpm -C apps/admin typecheck
pnpm -C apps/admin lint
pnpm -C apps/admin build
```

如涉及目标模块测试，补跑对应定向测试。
如变更了文档或规则，再补：

```bash
pnpm -C apps/docs lint
pnpm -C apps/docs build
```

### 7. 上提新规则

若本轮发现的新结论满足“可横向复用 + 语义稳定 + 维护收益明确”，应上提到：

- 根 `AGENTS.md`（全仓规则）
- `apps/admin/AGENTS.md`（admin 范围）
- `apps/docs/docs/guide/*`（长文档说明）

不要继续把它挂在来源模块私有语境下。
