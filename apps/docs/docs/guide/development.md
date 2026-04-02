# 开发规范与维护（精简版）

> 目标：给开发同学一页可执行清单。先做什么、改完跑什么、出问题看哪里。

## TL;DR

1. 开发前：确认目标目录的 `AGENTS.md`。
2. 开发中：优先复用 `Ob*` 组件和既有模块范式。
3. 提交前：至少跑 `typecheck + lint + build`。
4. 改了规则或行为：必须同步更新 `apps/docs`。

## 1) 最小工作流

### 日常开发（本地）

```bash
pnpm typecheck
pnpm lint
pnpm build
```

### 提测前（推荐）

```bash
pnpm verify
```

`verify` 会串行执行：命名检查、架构门禁、测试、类型检查、lint、构建和 bundle 预算检查。

### 只改 docs 时

```bash
pnpm -C apps/docs lint
pnpm -C apps/docs build
```

## 2) app 级常用命令

### admin

```bash
pnpm -C apps/admin dev
pnpm -C apps/admin typecheck
pnpm -C apps/admin lint
pnpm -C apps/admin lint:arch
pnpm -C apps/admin build
```

### admin-lite

```bash
pnpm -C apps/admin-lite dev
pnpm -C apps/admin-lite typecheck
pnpm -C apps/admin-lite lint
pnpm -C apps/admin-lite lint:arch
pnpm -C apps/admin-lite test:run
pnpm -C apps/admin-lite build
```

## 3) 文档同步规则

以下变更必须同步文档：

1. 路由、菜单、权限策略。
2. 配置项（env、platform-config、layout、ui）。
3. 组件基线或页面编排范式。
4. 验证命令与门禁策略。

最小要求：

```bash
pnpm -C apps/docs lint
pnpm -C apps/docs build
```

## 4) 质量门禁（记住这 5 条）

1. 代码优先可读，不做无收益抽象。
2. 模块内优先就近实现，跨模块复用再下沉。
3. 列表页基线统一：`ObPageContainer + ObTableBox + ObTable`。
4. CRUD 容器统一：`ObCrudContainer`。
5. 消息与确认统一：`message`、`obConfirm`。

## 5) 性能与体积基线

如果改动影响 admin/admin-lite 首屏或依赖图，提交前补跑：

```bash
pnpm check:admin:bundle
pnpm check:admin-lite:bundle
```

## 6) 新同学常见问题

1. `lint` 和 `lint:arch` 区别？
   : `lint` 查语法与风格，`lint:arch` 查架构边界与项目红线。
2. 为什么我只改了代码还要改 docs？
   : 本仓库把 docs 作为团队共识入口，不同步会导致规则漂移。
3. 只改一个页面也要跑全量吗？
   : 至少跑当前 app 的 `typecheck + lint + build`；大改动再跑 `verify`。

## 7) 相关阅读

- [模块系统（最终版）](/guide/module-system)
- [菜单与路由规范（Schema）](/guide/menu-route-spec)
- [admin-lite 后台基座](/guide/admin-lite-base-app)
- [AGENTS 规则分层](/guide/agents-scope)
