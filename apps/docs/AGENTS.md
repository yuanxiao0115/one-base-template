# AGENTS.MD（apps/docs）

> 适用范围：`/Users/haoqiuzhi/code/one-base-template/apps/docs/**`
>
> 先遵循根规则：`/Users/haoqiuzhi/code/one-base-template/AGENTS.md`

## 核心职责

- `apps/docs` 是仓库文档站（VitePress），用于沉淀架构约定、协作规范与模块指南。
- 文档内容必须与当前代码实现保持一致，禁止“代码已变、文档滞后”。

## 文档变更约束

- 新增/修改功能后，必须同步更新对应文档页面。
- 涉及导航入口的文档改动，必须同时更新：
  - `apps/docs/docs/.vitepress/config.ts`（nav + sidebar）
  - `apps/docs/docs/guide/index.md`（文档总览卡片）
- 导航必须按四级模型维护：顶部菜单（域）→ 顶部下拉（模块）→ 左侧菜单（域内横跳）→ 右侧锚点（页内定位）。
- 顶部下拉只放高频模块入口，避免与左侧菜单做“同层全量重复”。
- `指南` 顶部下拉默认采用“总览 + 高频入口”策略，细分分流放在总览页（如 `/guide/practice`、`/guide/governance`）与左侧菜单。
- 左侧菜单禁止“单页自循环”侧栏（只显示当前页自身）；同域页面应共享一组可横跳菜单。
- 组件相关入口统一收敛到 `组件库`（`/components/`），不在其他导航层重复铺设同义入口。
- 维护治理新增专题页时，优先同步到 `/guide/governance`（维护治理总览）对应分组，再决定是否进入顶部下拉高频入口。
- 文档中涉及路径、命令、统计数字时，必须与仓库现状一致，禁止复制过期信息。

## 写作与结构规范

- 优先使用中文，标题语义清晰，避免含糊命名。
- 说明“适用范围、前置条件、命令、风险/限制”四要素。
- 多步骤流程优先使用有序列表；命令统一使用代码块。
- 页面间保持互链，避免孤立文档。

## 本地验证命令（docs）

```bash
pnpm -C apps/docs lint
pnpm -C apps/docs build
```
