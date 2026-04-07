# 目录结构与边界（执行版）

<div class="doc-tldr">
  <strong>TL;DR：</strong>先把仓库看成“应用组装层（apps）+ 共享能力层（packages）”，按边界开发可避免大部分返工；涉及跨层修改时，优先回查本页和对应子目录 `AGENTS.md`。
</div>

## 适用范围

- 适用目录：`/Users/haoqiuzhi/code/one-base-template/**`
- 适用场景：跨应用改动、跨包联动、模块拆分与路由装配
- 适用读者：新接手开发者、模块维护者、架构治理负责人

## 1. 先看 4 条结论

1. 仓库按“应用组装（`apps`）+ 共享能力（`packages`）”分层，禁止反向依赖。
2. `packages/core` 只做逻辑契约，`packages/ui` 只做壳层交互，`packages/adapters` 只做协议适配。
3. `admin / admin-lite / portal` 共享启动思想，但必须维持各自应用边界。
4. 路由与菜单装配统一走 `moduleMeta + module 声明` 约束链路。

## 2. 仓库地图（按职责）

![Monorepo 架构总览（SVG）](/diagrams/monorepo-overview.svg)

### 2.1 apps（应用层）

- `apps/admin`：主后台应用（路由装配、业务页面、管理端样式）。
- `apps/portal`：前台门户消费者应用（独立渲染入口，不接后台菜单接口）。
- `apps/admin-lite`：后台基座（模块契约 + 架构门禁 + 默认管理模块）。
- `apps/docs`：文档站（规则、架构、实践沉淀）。

### 2.2 packages（共享层）

- `packages/app-starter`：跨应用启动编排与运行时配置加载器。
- `packages/core`：鉴权、菜单、主题、HTTP、store 等纯逻辑能力。
- `packages/ui`：布局壳、导航壳、页面容器、错误页等 UI 壳。
- `packages/tag`：标签栏能力包（tag store + route guard 协作）。
- `packages/document-form-engine`：公文表单设计/渲染共享引擎。
- `packages/portal-engine`：门户编辑/渲染共享引擎。
- `packages/adapters`：后端接口协议适配与字段映射。
- `packages/utils`：通用工具函数与 hooks。

## 3. 边界铁律（必须遵守）

| 目录                | 必须做                   | 禁止做                         |
| ------------------- | ------------------------ | ------------------------------ |
| `packages/core`     | 维护逻辑契约与状态模型   | 引入 `element-plus` 等 UI 库   |
| `packages/ui`       | 基于 core 契约组织 UI 壳 | 反向依赖 `apps/*`              |
| `packages/adapters` | 处理协议与字段映射       | 承载页面交互逻辑               |
| `apps/*`            | 组装业务与页面           | 复制 core/ui/adapters 已有能力 |

## 4. 启动链路摘要

- admin：`main.ts -> startAdminApp() -> bootstrap/startup.ts -> bootstrap/index.ts -> mount`
- admin-lite：沿用 admin 骨架，默认 `remote-single + token + backend=basic`
- portal：保持前台独立边界，登录后做前台分流

深度说明：

- [启动链路细节（深度）](/guide/architecture-runtime-deep-dive)

## 5. 路由与模块摘要

- 模块入口：`meta.ts + index.ts + routes.ts`（`meta.ts` 内声明 `moduleMeta`）。
- 菜单模式：`remote`（后端菜单树）或 `static`（静态路由生成）。
- 权限判定：`allowedPaths` 由菜单树推导，非菜单页通过 `meta.activePath` / `meta.access='auth'` 处理。

推荐继续阅读：

- [模块系统与切割](/guide/module-system)
- [菜单与路由规范（Schema）](/guide/menu-route-spec)
- [布局与菜单](/guide/layout-menu)

## 6. 主题与样式摘要

- 主题引擎下沉到 `packages/core`，应用层负责注册业务主题。
- 运行时 token 统一映射到 `--one-*` / `--el-*`，避免页面硬编码色值。
- 样式入口建议收敛为“bootstrap 基础样式 + main 团队覆写样式”。

深度说明：

- [主题系统](/guide/theme-system)

## 7. 最小可运行路径（定位边界）

在仓库根目录执行：

```bash
find apps packages -maxdepth 2 -name AGENTS.md | sort
pnpm -C apps/docs build
```

预期结果：

1. 能快速定位各子项目规则文件。
2. docs 构建通过，确认本页与站点结构一致。

## 8. 常见问题

| 问题                   | 原因                                  | 解决方案                                         |
| ---------------------- | ------------------------------------- | ------------------------------------------------ |
| 改动后影响了不相关应用 | 跨层修改未遵守边界                    | 回到“边界铁律”表，按目录职责收敛改动             |
| 菜单与路由行为不一致   | `moduleMeta` / `meta.access` 理解偏差 | 先读 `module-system` 与 `menu-route-spec` 再调整 |
| 文档与代码不一致       | 修改后未同步 docs                     | 改动完成后执行 docs lint/build 并回写文档        |

## 9. 推荐阅读顺序

1. 本页（边界总览）
2. [启动链路细节（深度）](/guide/architecture-runtime-deep-dive)
3. [模块系统与切割](/guide/module-system)
4. [菜单与路由规范（Schema）](/guide/menu-route-spec)
5. [开发规范与维护](/guide/development)
