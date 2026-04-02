# zfw-system-sfss 快速使用手册

> 适用范围：`/Users/haoqiuzhi/code/one-base-template/apps/zfw-system-sfss`
> 面向人群：接手该项目的业务同事（含迁移新模块）

## TL;DR

- 这是从 `admin-lite` 派生的新 app，并已带 `starter-crud` 默认业务骨架。
- 一分钟启动命令：`vp run --filter zfw-system-sfss dev`。
- 关键配置入口：`apps/zfw-system-sfss/src/config/platform-config.ts`。
- 提交前至少执行：`typecheck/lint/lint:arch/test:run/build`。

## 1. 背景与目标

`zfw-system-sfss` 用于承载新业务迁移，底层沿用 `admin-lite` 与 `admin` 的同构分层。
这份手册只解决一件事：让同事**最快跑起来并开始做业务模块开发**。

## 2. 范围与非范围

### 范围

- 本地启动与日常开发命令
- 默认模块与入口说明
- 基于 `starter-crud` 开新业务模块的最短路径

### 非范围

- 不覆盖完整架构设计说明
- 不覆盖后端部署与账号权限申请流程

## 3. 前置条件

```bash
node -v
pnpm -v
pnpm install
```

- Node 与 pnpm 版本建议与仓库根 `package.json` 的 `engines` 保持一致。
- 以上命令都在仓库根目录执行：`/Users/haoqiuzhi/code/one-base-template`。

## 4. 一分钟启动

在仓库根目录执行：

```bash
vp run --filter zfw-system-sfss dev
```

等价命令：

```bash
pnpm -C apps/zfw-system-sfss dev
```

如果需要走后端代理（`vite.config.ts` 已支持 `/api` 与 `/cmict`）：

```bash
VITE_API_BASE_URL=http://<你的后端地址> vp run --filter zfw-system-sfss dev
```

## 5. 默认业务骨架

当前 `enabledModules` 默认包含：`home`、`demo`、`starter-crud`。

| 模块           | 主要路由        | 作用                             |
| -------------- | --------------- | -------------------------------- |
| `home`         | `/home/index`   | 首页基座与项目说明               |
| `demo`         | `/demo/about`   | 模板改造说明与关键入口提示       |
| `starter-crud` | `/starter/crud` | 列表/查询/新增/编辑/删除闭环示例 |

说明：模块开关统一在 `apps/zfw-system-sfss/src/config/platform-config.ts` 的 `enabledModules` 维护。

## 6. 常用命令（直接复制）

```bash
pnpm -C apps/zfw-system-sfss typecheck
pnpm -C apps/zfw-system-sfss lint
pnpm -C apps/zfw-system-sfss lint:arch
pnpm -C apps/zfw-system-sfss test:run
pnpm -C apps/zfw-system-sfss build
```

## 7. 新业务模块最快落地方式

1. 复制 `apps/zfw-system-sfss/src/modules/starter-crud` 为你的业务模块目录。
2. 按模块契约改名与改配置：`module.ts（含 moduleMeta） + routes.ts`。
3. 在 `apps/zfw-system-sfss/src/config/platform-config.ts` 把新模块加入 `enabledModules`。
4. 把 `api.ts` 从本地内存数据替换为真实接口。
5. 跑完第 6 节命令后再提测。

建议配合阅读：[CRUD 模块最佳实践](/guide/crud-module-best-practice)。

## 8. 常见问题（FAQ）

### 启动后接口报错 / 登录失败

优先确认是否传入 `VITE_API_BASE_URL`，以及后端是否放通 `/api` 或 `/cmict`。

### 菜单或模块入口不符合预期

先检查 `apps/zfw-system-sfss/src/config/platform-config.ts` 的 `enabledModules` 与 `menuMode` 是否符合当前联调口径。

### 提交前要过哪些门禁

最少执行第 6 节 5 条命令；若本次改动了文档，再额外执行：

```bash
pnpm -C apps/docs lint
pnpm -C apps/docs build
```

## 9. 相关文档

- [admin-lite 后台基座](/guide/admin-lite-base-app)
- [admin-lite Agent 红线](/guide/admin-lite-agent-redlines)
- [框架使用者阅读入口](/guide/for-users)
