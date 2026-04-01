# Checklists

## 进入前自检

- [ ] 目标路径位于 `apps/admin/src/modules/*Management/**`
- [ ] 当前任务确实是管理模块横向标准化，而不是跨包基建改造
- [ ] 已读取根 `AGENTS.md` 与 `apps/admin/AGENTS.md`
- [ ] 已读取 `agents-scope`、`admin-agent-redlines`、`crud-module-best-practice`
- [ ] 已确认工作区中是否存在无关脏改动，并避免混入提交范围
- [ ] 已确认是否存在目标模块相关的历史 `docs/plans/*.md`

## 差异扫描清单

### 精简

- [ ] `list.vue` 是否只保留编排与事件路由
- [ ] 字段映射是否收敛到 `form.ts` 或语义明确的 composable
- [ ] 是否存在无意义 helper / mapper / wrapper 中转层
- [ ] 命名是否短、清楚、通用
- [ ] `apps/admin/src/modules/**` 列表页是否已切到 `ObTable`，是否仍残留 `<ObVxeTable>`

### 性能

- [ ] 是否存在首屏双请求或重复初始化
- [ ] 是否把非关键数据错误地放进首屏阻塞链路
- [ ] watch / computed / remote search 是否存在重复触发
- [ ] 列表 / 弹窗是否有可避免的全量刷新

### 稳定性

- [ ] 是否有旧请求回写新状态的竞态风险
- [ ] 远程搜索与弹窗初始化是否有过期响应保护
- [ ] 错误提示是否会被旧请求误触发
- [ ] 保存、批量操作、删除是否有失败补偿或回滚语义

### 可维护性

- [ ] 状态是否按 `table / editor / options / actions` 等语义分组
- [ ] 页面是否避免堆叠超长脚本和混杂职责
- [ ] 抽象是否有稳定复用价值，而不是单点炫技封装
- [ ] 规则来源与生效作用域是否已经区分清楚

### 团队接受度

- [ ] 同事是否可以把这套写法当默认基线继续开发
- [ ] 是否依赖来源模块的业务私货才能成立
- [ ] 是否需要额外心智负担才能看懂页面主流程
- [ ] 是否为“架构好看”牺牲了直接可读性

## 收口清单

- [ ] 变更已同步到 `docs/plans/` 或相关 guide 页面
- [ ] 新规则如需横向复用，已上提到正确作用域
- [ ] 已执行 `pnpm -C apps/admin lint:arch`
- [ ] 已执行 `pnpm -C apps/admin typecheck`
- [ ] 已执行 `pnpm -C apps/admin lint`
- [ ] 已执行 `pnpm -C apps/admin build`
- [ ] 如改动 docs，已执行 `pnpm -C apps/docs lint`
- [ ] 如改动 docs，已执行 `pnpm -C apps/docs build`
- [ ] 已复核提交范围，未混入无关 `UserManagement` 脏改动
