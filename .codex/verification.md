# 验证结果索引（verification）

> 说明：该文件改为“索引 + 最新结论”，详细记录按日期写入 `.codex/verification/YYYY-MM-DD.md`。

## 最新记录

- 日期：2026-04-03
- 文件：`.codex/verification/2026-04-03.md`
- 补充：新增“platformConfig 模块化维护 + 切账号权限缓存防串号”、“system-sfss 列表页结构统一（ObPageContainer + ObTableBox + ObTable）”、“迁移策略文档增强（Ob 规范 + CRUD 收口）”、“admin-lite 可开关 starter-crud 示例模块”、“docs 技术文档分析与改造（四技能顺序）”、“docs 第二批结构化改造（env/theme/adapter/utils）”、“docs 第三批结构化改造（角色入口/图标/命名/按钮）”、“docs 第四批结构化改造（内置组件/分层路线）”、“docs 第五批结构化改造（分层入口强化 + utils/portal）”与“docs 第六批结构化改造（portal 子页执行化 + 总览/levels 互链）”、“docs 第七批结构化改造（table/crud/material/runtime）”与“new:app 规则同步补丁”专项验证记录。

## 历史归档

- `legacy-until-2026-03-24.md`（迁移前历史全量记录）

## 记录规范

- 新增验证结论时，不再向本文件追加大段内容。
- 按日期写入 `.codex/verification/YYYY-MM-DD.md`。
- 本文件仅维护索引与最近一次结论入口。

## 2026-03-24（role-assign 选人契约收口）

- 影响范围限定在 `PersonnelSelector` 与 `adminManagement/role-assign` 表单链路。
- 结论：`typecheck` 与 3 条定向单测通过；未处理工作区其它既有改动。

## 2026-04-03（迁移踩坑清单沉淀）

- 影响范围：`apps/docs` 文档页面与导航。
- 结论：新增“monorepo-web 迁移踩坑清单”页面，已在维护治理入口可见，文档构建通过。

## 2026-04-03（zfw 单系统顶部菜单修复）

- 影响范围：`apps/zfw-system-sfss/src/bootstrap/{index,adapter}.ts` 与新增 `tests/bootstrap/adapter.unit.test.ts`。
- 结论：`systemConfig.mode='single'` 已通过适配器过滤逻辑生效，行为由单测锁定。

## 2026-04-03（platformConfig 模块化维护 + 切账号权限缓存防串号）

- 影响范围：
  - `apps/{admin,admin-lite,zfw-system-sfss}/src/config/platform-config.ts`
  - `packages/core/src/stores/auth.ts`
  - `packages/core/src/router/guards.ts`
- 结论：
  - `platform-config.ts` 已改为分模块对象 + 展开合并，维护复杂度下降；
  - remote 菜单未同步前不再用缓存放行；
  - token/mixed 首次守卫强校验 `fetchMe`；
  - `packages/core` 与三应用配置定向单测全部通过。

## 2026-04-03（technical-doc-collaboration Skill）

- 影响范围：`.codex/skills/technical-doc-collaboration/**`。
- 结论：Skill 已创建并通过 `quick_validate.py` 校验，可用于技术文档协作场景。

## 2026-04-03（docs 第四批结构化改造）

- 影响范围：`apps/docs/docs/guide/built-in-components.md`、`apps/docs/docs/guide/levels/p2.md`、`apps/docs/docs/guide/levels/p4.md`、`apps/docs/docs/guide/levels/p6.md`。
- 结论：已完成执行型结构收口并通过 `pnpm -C apps/docs lint`、`pnpm -C apps/docs build`。

## 2026-04-03（docs 第五批结构化改造）

- 影响范围：`apps/docs/docs/guide/levels/index.md`、`apps/docs/docs/guide/for-users.md`、`apps/docs/docs/guide/for-maintainers.md`、`apps/docs/docs/guide/utils.md`、`apps/docs/docs/guide/portal/index.md`。
- 结论：已完成执行型收口并通过 `pnpm -C apps/docs lint`、`pnpm -C apps/docs build`。

## 2026-04-03（docs 第六批结构化改造）

- 影响范围：`apps/docs/docs/guide/portal/admin-designer.md`、`apps/docs/docs/guide/portal/engine-boundary.md`、`apps/docs/docs/guide/index.md`、`apps/docs/docs/guide/levels/p2.md`、`apps/docs/docs/guide/levels/p4.md`、`apps/docs/docs/guide/levels/p6.md`。
- 结论：已完成执行型收口并通过 `pnpm -C apps/docs lint`、`pnpm -C apps/docs build`。
