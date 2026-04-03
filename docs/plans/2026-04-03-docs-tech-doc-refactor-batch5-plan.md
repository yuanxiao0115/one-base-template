# docs 技术文档改造计划（Batch 5）

> 日期：2026-04-03  
> 作用域：`apps/docs/docs/guide/**`（分层入口强化 + 角色入口互链 + utils/portal 执行化）  
> 执行顺序：`brainstorming -> technical-doc-collaboration -> write-markdown-tech-docs -> vitepress-doc-beauty`

## 背景

用户本轮明确选择“1+2”，即同时推进：

1. `levels/index + for-users + for-maintainers` 的互链强化，明确“分层优先、角色辅助”。
2. `utils.md + portal/index.md` 的执行化收口，统一为可执行技术文档模板。

前三批 + 第四批已完成核心入口/规范页改造，本轮聚焦“入口联动一致性”和“横向能力页可执行性”。

## 受众与任务

| 受众         | 当前痛点                   | 本轮目标                    | 成功标准                      |
| ------------ | -------------------------- | --------------------------- | ----------------------------- |
| 新接手开发者 | 不清楚先按层级还是按角色读 | 30 秒内做出正确阅读路径选择 | 能按层级页进入并完成最短闭环  |
| 业务开发者   | utils/portal 页面偏“说明”  | 页面内容可直接照做          | 有前置、步骤、验收与 FAQ      |
| 维护者       | 入口多，容易重复跳转       | 入口关系清晰且无冲突        | “分层主线 + 角色辅助”认知稳定 |

## 本轮目标

1. 将 `levels/index` 升级为“入口决策页”，补齐前置条件、最短路径、验收、FAQ。
2. 强化 `for-users` 与 `for-maintainers` 的分层互链，明确“先层级、后角色”的进入规则。
3. 将 `utils.md` 与 `portal/index.md` 收口为执行型结构（TL;DR、范围、前置、步骤、验证、FAQ）。

## 范围

### In Scope

- `apps/docs/docs/guide/levels/index.md`
- `apps/docs/docs/guide/for-users.md`
- `apps/docs/docs/guide/for-maintainers.md`
- `apps/docs/docs/guide/utils.md`
- `apps/docs/docs/guide/portal/index.md`

### Out of Scope

- 调整 `.vitepress/config.ts` 导航结构。
- 修改业务运行时代码。
- 全量改写 `guide` 其它页面。

## 执行步骤

1. **brainstorming**：梳理“入口决策链路”和页面职责，确保页面不重复承载同类信息。
2. **technical-doc-collaboration**：先写清适用范围、前置假设、非范围、维护触发条件。
3. **write-markdown-tech-docs**：将 5 页统一收口为执行型模板，补齐命令与通过标准。
4. **vitepress-doc-beauty**：统一标题层级、表格密度、信息块风格和跨页链接。
5. 跑 docs 校验并回写 `.codex` 证据。

## 验收口径

在仓库根目录执行：

```bash
pnpm -C apps/docs lint
pnpm -C apps/docs build
```

通过标准：

1. `lint` 0 warning / 0 error，`build` 成功。
2. 5 个目标页均具备执行型骨架。
3. 页面路径、命令、代码位置与仓库现状一致。

## 风险与控制

1. **风险**：入口页与角色页重复叙述，反而增加阅读负担。  
   **控制**：强制“层级页定主线、角色页做辅助跳转”，避免双主线。
2. **风险**：`utils`、`portal` 页面示例与真实代码路径不一致。  
   **控制**：以 `packages/utils/src/index.ts`、`apps/admin/src/modules/PortalManagement/**`、`apps/portal/src/modules/portal/**` 现状核对。
3. **风险**：文档改造证据不完整。  
   **控制**：同步更新 `.codex/operations-log.md`、`.codex/testing.md`、`.codex/verification.md`、`.codex/verification/2026-04-03.md`。

## 完成定义（DoD）

1. 5 个页面改造完成并通过 docs 构建。
2. `.codex` 四份记录已回写本轮证据。
3. 完成中文 commit，提交信息可表达本轮范围。
