# docs 技术文档改造计划（Batch 6）

> 日期：2026-04-03  
> 作用域：`apps/docs/docs/guide/**`（portal 子页执行化 + 总览与 levels 升级信号互链）  
> 执行顺序：`brainstorming -> technical-doc-collaboration -> write-markdown-tech-docs -> vitepress-doc-beauty`

## 背景

用户在上一轮明确选择“1+2”，本轮继续执行：

1. 收口 `portal/admin-designer.md`、`portal/engine-boundary.md` 为统一执行型文档。
2. 收口 `guide/index.md` 与 `levels/p2|p4|p6` 的升级信号互链，强化分层成长路径。

## 本轮目标

1. 让 portal 子页从“说明型”转为“任务可执行型”。
2. 让总览页与 levels 页形成“进入 -> 执行 -> 升级”的闭环导航。
3. 继续保持最小差异，不改导航配置，仅优化页面内容结构。

## 范围

### In Scope

- `apps/docs/docs/guide/portal/admin-designer.md`
- `apps/docs/docs/guide/portal/engine-boundary.md`
- `apps/docs/docs/guide/index.md`
- `apps/docs/docs/guide/levels/p2.md`
- `apps/docs/docs/guide/levels/p4.md`
- `apps/docs/docs/guide/levels/p6.md`

### Out of Scope

- 调整 `apps/docs/docs/.vitepress/config.ts` 导航/侧边栏结构。
- 修改 `apps/admin`、`apps/portal`、`packages/portal-engine` 业务实现。
- 全量改造其它 guide 页面。

## 执行步骤

1. **brainstorming**：梳理 portal 子页读者任务和 levels 升级信号链路。
2. **technical-doc-collaboration**：补齐适用范围、前置条件、任务入口与验收口径。
3. **write-markdown-tech-docs**：按执行型模板改造 6 个目标页面。
4. **vitepress-doc-beauty**：统一标题层级、表格风格、互链入口与术语。
5. 执行 docs 校验并回写 `.codex` 证据。

## 验收口径

在仓库根目录执行：

```bash
pnpm -C apps/docs lint
pnpm -C apps/docs build
```

通过标准：

1. `lint` 0 warning / 0 error，`build` 成功。
2. portal 两页具备执行型结构（TL;DR、范围、前置、步骤、验证、FAQ）。
3. 总览页与 levels 页存在清晰升级信号互链（P2 -> P4 -> P6）。

## 风险与控制

1. **风险**：portal 子页内容过长，执行路径不突出。  
   **控制**：优先保留任务路径、入口文件、验收命令；把历史背景降级为“已落地收口”。
2. **风险**：levels 互链过密导致跳转噪音。  
   **控制**：仅保留“升级信号 + 回看路径”两类核心链接。
3. **风险**：文档与代码路径口径偏差。  
   **控制**：以 `apps/admin/src/modules/PortalManagement/**`、`packages/portal-engine/**`、`apps/portal/src/modules/portal/**` 实际目录复核。

## 完成定义（DoD）

1. 6 个页面改造完成并通过 docs lint/build。
2. `.codex` 记录同步更新（operations/testing/verification）。
3. 完成中文 commit，提交信息体现第六批改造范围。
