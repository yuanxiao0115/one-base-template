# Migration Workflow

## 输入契约

开始前先写清：

- 来源仓库路径；用户未指定时默认 `/Users/haoqiuzhi/code/basic/standard-oa-web-basic`
- 目标路径
- 必须迁移项
- 不迁移项
- 验收口径
- 是否包含 `packages/adapters`、`packages/core`、`packages/ui` 级联改造

缺任一项时，先补范围，不要直接写代码。

## 七步执行流

### 1. 冻结范围

- 先判断任务是：
  - 老项目能力迁移
  - 已迁入模块的页内标准化
  - 跨包基建改造
- 不要把这三类任务混成一条线执行。
- 如果用户只要 review 或方案，停在计划与差异清单，不要假装已经落地。

### 2. 读取规则源

至少读取：

1. `/Users/haoqiuzhi/code/one-base-template/AGENTS.md`
2. `/Users/haoqiuzhi/code/one-base-template/apps/admin/AGENTS.md`
3. `/Users/haoqiuzhi/code/one-base-template/apps/docs/docs/guide/agents-scope.md`
4. `/Users/haoqiuzhi/code/one-base-template/apps/docs/docs/guide/admin-agent-redlines.md`
5. `/Users/haoqiuzhi/code/one-base-template/apps/docs/docs/guide/crud-module-best-practice.md`
6. 目标模块最近相关的 `docs/plans/*.md`

### 3. 审核老项目行为

- 记录旧页面入口、核心交互、权限规则、异常分支。
- 找出路由、菜单、鉴权、接口字段、布局壳依赖。
- 行为不清楚时，优先保留当前模板默认，不猜老项目隐藏约定。

### 4. 选择迁移分支

- 命中 `apps/admin/src/modules/*Management/**` 且有 CRUD：走 `management-module-bridge.md`
- 普通 admin 模块迁移：继续按本 skill 分层落地
- 真正需要共享能力下沉：先证明复用收益，再进入 `packages/*`

### 5. 计划落盘

使用 `../assets/migration-plan-template.md` 写入：

- `docs/plans/YYYY-MM-DD-<topic>-migration-plan.md`

计划必须写清：

- 来源与目标
- 架构落点
- 任务拆分
- 改动文件
- 验证命令
- 文档同步项

### 6. 分批实施

每批固定做四件事：

1. 交付一个最小可验证变化
2. 运行 1-2 条最小校验
3. 记录结果与风险
4. 再进入下一批

### 7. 收口与交付

- 同步 `apps/docs`
- 同步 `.codex/operations-log.md`
- 同步 `.codex/testing.md`
- 同步 `.codex/verification.md` 与当日验证文件
- 执行固定验证矩阵

## 停止条件

- 连续 3 次同类错误仍无新证据
- 出现严重权限回归、误 403、越权
- 用户明确把目标收缩到“只标准化，不迁移”
