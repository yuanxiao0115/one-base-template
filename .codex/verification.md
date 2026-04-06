# 验证结果索引（verification）

> 说明：该文件改为“索引 + 最新结论”，详细记录按日期写入 `.codex/verification/YYYY-MM-DD.md`。

## 最新记录

- 日期：2026-04-04
- 文件：`.codex/verification/2026-04-04.md`
- 补充：新增“ObFilePreview 文档化到组件库”、“ObFilePreview 构建阻断修复（@vue-office 路径）”、“packages/ui 单元测试补充 + 覆盖率链路收口”、“packages/ui 第二轮覆盖率提升（table/lite/iconify/auth-utils）”、“packages/ui 第三轮覆盖率提升（verify-slide + layout + row-drag + lite-async）”与“packages/ui 第四轮覆盖率提升（LoginBox 运行时单测）”验证记录。

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

## 2026-04-03（三端 config 二次收口：ui/theme 拆分 + 类型下沉 + externalSsoEndpoints）

- 影响范围：
  - `packages/core/src/config/app-config.ts`、`packages/core/src/index.ts`
  - `apps/{admin,admin-lite,zfw-system-sfss}/src/config/{app,auth,request,ui,theme,index}.ts`
  - `apps/{admin,admin-lite,zfw-system-sfss}/src/bootstrap/core.ts`
  - `apps/{admin,admin-lite,zfw-system-sfss}/src/services/auth/auth-remote-service.ts`
  - 文档与规则：`apps/*/AGENTS.md`、`apps/*/README.md`、`apps/docs/docs/guide/{architecture-runtime-deep-dive,theme-system}.md`
- 结论：
  - `ui` 与 `theme` 已拆分；
  - config 内自定义类型已清空并统一迁移到 core 包；
  - `zhxt/ydbg/desktop` 端点已收口进 `externalSsoEndpoints`；
  - 三端 `lint:arch`、admin/admin-lite `typecheck` 与三端定向单测通过；
  - `zfw-system-sfss typecheck` 仍有既有历史类型债务（非本次引入）。

## 2026-04-03（core typecheck 修复：移除失效 @ts-expect-error）

- 影响范围：`packages/core/src/config/platform-config.test.ts`
- 结论：移除 3 处已失效 `@ts-expect-error` 后，`pnpm -C packages/core typecheck` 通过。

## 2026-04-03（docs 组件库入口 + Ob 组件 API 文档）

- 影响范围：
  - `apps/docs/docs/.vitepress/config.ts`
  - `apps/docs/docs/guide/index.md`
  - `apps/docs/docs/components/*.md`
- 结论：
  - 顶部导航已新增“组件库”入口并可进入 `/components/`。
  - 左侧 sidebar 已显示组件库名称与组件列表。
  - `ObPageContainer/ObCrudContainer/ObTableBox/ObTable/ObCardTable/ObActionButtons/ObTree/ObImportUpload/ObCard/ObColorField` 已补齐属性、事件 API 与示例文档。
  - `pnpm -C apps/docs lint`、`pnpm -C apps/docs build` 通过。

## 2026-04-03（docs 组件库分类化 + 第二批架构壳层组件）

- 影响范围：
  - `apps/docs/docs/.vitepress/config.ts`
  - `apps/docs/docs/components/index.md`
  - `apps/docs/docs/components/{ob-admin-layout,ob-sidebar-menu,ob-top-bar,ob-tabs-bar,ob-keep-alive-view,ob-theme-switcher,ob-menu-icon,ob-font-icon}.md`
- 结论：
  - 组件库左侧菜单已支持分类展示。
  - 已新增第二批架构壳层组件文档，并在页面中标注“通常不直接用于业务”。
  - docs lint/build 均通过。

## 2026-04-03（packages/ui：ObTable 文档增强 + PersonnelSelector / RichText 沉淀）

- 影响范围：
  - `packages/ui/src/components/personnel-selector/**`
  - `packages/ui/src/components/rich-text/**`
  - `packages/ui/src/{index.ts,plugin.ts,plugin-obtable.ts}`
  - `apps/docs/docs/components/{ob-table,ob-personnel-selector,ob-rich-text,index}.md`
  - `apps/docs/docs/.vitepress/config.ts`
  - `apps/docs/docs/guide/built-in-components.md`
- 结论：
  - `ObPersonnelSelector` 与 `openPersonnelSelection` 已下沉到 `@one-base-template/ui`。
  - `ObRichText` 与富文本安全工具方法已下沉到 `@one-base-template/ui`。
  - `ObTable` 文档已补齐勾选、树形懒加载、插槽懒加载、行拖拽完整示例。
  - `pnpm -C packages/ui typecheck`、`pnpm -C packages/ui lint`、`pnpm -C apps/docs lint`、`pnpm -C apps/docs build` 全部通过。

## 2026-04-03（ObFilePreview 统一预览组件）

- 影响范围：
  - `packages/ui/src/components/preview/**`
  - `packages/ui/src/{index.ts,plugin.ts,plugin-obtable.ts,env.d.ts}`
  - `packages/ui/src/{index.test.ts,plugin.test.ts}`
  - `apps/admin/tsconfig.json`
  - `apps/admin-lite/tsconfig.json`
  - `apps/docs/docs/guide/built-in-components.md`
- 验证结论：
  - 计划要求的 6 条验收命令已全部通过。
  - `file-meta` 格式识别与 `FilePreview` 导出/插件注册相关单测通过（`3 files / 11 tests`）。
  - `ObFilePreview` 在公共层可导出并全局注册，`admin/admin-lite` 类型检查可通过。
- 备注：
  - `apps/docs build` 保留 chunk size 非阻断提示，不影响构建成功。

## 2026-04-03（packages/ui：MenuIconInput + UploadShell）

- 影响范围：
  - `packages/ui/src/components/menu/{MenuIconInput.vue,MenuIconInput.css,menu-iconfont-sources.ts}`
  - `packages/ui/src/components/upload/UploadShell.vue`
  - `packages/ui/src/{index.ts,plugin.ts,plugin-obtable.ts}`
  - `apps/{admin,admin-lite,zfw-system-sfss}/src/modules/adminManagement/menu/components/{MenuPermissionEditForm,SystemPermissionEditForm}.vue`
  - `apps/docs/docs/components/{ob-menu-icon-input,ob-upload-shell,index}.md`
  - `apps/docs/docs/.vitepress/config.ts`
  - `apps/docs/docs/guide/built-in-components.md`
- 结论：
  - `ObMenuIconInput` 已完成组件沉淀并对三端菜单表单生效。
  - `ObUploadShell` 已补齐通用上传壳能力（校验、统一事件、拖拽模式、Expose 方法）。
  - `packages/ui`、`apps/docs`、`apps/admin`、`apps/admin-lite` 验证通过。
  - `apps/zfw-system-sfss build` 存在既有依赖解析阻断（`@vue-office/pdf`），与本次改动无直接耦合。

## 2026-04-04（ObFilePreview 文档化到组件库）

- 影响范围：
  - `apps/docs/docs/components/ob-file-preview.md`
  - `apps/docs/docs/.vitepress/config.ts`
  - `apps/docs/docs/components/index.md`
  - `apps/docs/docs/guide/built-in-components.md`
- 结论：
  - `ObFilePreview` 已在组件库形成独立详细文档页，并完成侧边栏接入与入口互链。
  - docs lint/build 均通过。

## 2026-04-04（ObFilePreview 构建阻断修复：@vue-office/\* 导入路径）

- 影响范围：
  - `packages/ui/src/components/preview/engines/OfficePreviewEngine.vue`
  - `packages/ui/src/components/preview/engines/PdfPreviewEngine.vue`
  - `packages/ui/src/env.d.ts`
- 结论：
  - `@vue-office/pdf` 的 Rolldown 解析失败已修复，`apps/zfw-system-sfss build` 成功。
  - `packages/ui typecheck/lint` 均通过，类型与代码质量门禁正常。
  - `apps/admin` 与 `apps/admin-lite` 的 `typecheck` 均通过，未引入跨端类型回归。
  - 当前仍存在构建体积告警（非阻断），与本次修复目标无冲突。
