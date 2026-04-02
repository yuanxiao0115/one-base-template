# 快速开始

## 环境要求

- Node.js: `>= 20.19.0`
- pnpm: `>= 10.32.1`

## 安装

在仓库根目录执行：

```bash
pnpm install
```

## 启动后台（admin）

```bash
pnpm dev
```

默认等价于：

```bash
vp run --filter admin dev
```

## 启动门户消费者（portal）

```bash
pnpm dev:portal
```

默认等价于：

```bash
vp run --filter portal dev
```

## 启动后台基座（admin-lite）

```bash
pnpm dev:admin-lite
```

默认等价于：

```bash
vp run --filter admin-lite dev
```

## 启动文档（VitePress）

```bash
pnpm -C apps/docs dev
```

默认端口：`5174`

## 10 分钟起新后台（admin-lite 脚手架）

```bash
pnpm new:app my-admin --preset standard
pnpm -C apps/my-admin typecheck
pnpm -C apps/my-admin lint
pnpm -C apps/my-admin build
```

`--preset` 可选值：

- `minimal`：只保留 `home` 模块，顶栏能力最小化。
- `standard`：默认四模块（`home/admin-management/system-management/log-management`）。
- `enterprise`：在 `standard` 基础上启用 `tenantSwitcher`。

## 常用验证命令

仓库根目录：

```bash
pnpm typecheck
pnpm lint
pnpm lint:arch
pnpm test:run
pnpm build
pnpm changeset
```

说明：

- `pnpm lint:arch` 会串联检查 admin + admin-lite 等应用的架构边界约束（模块边界、启动边界、env 读取边界等）。
- `pnpm test:run` 会执行工作区内已配置的单元测试任务。
- `pnpm build` 会通过 Vite Task 递归构建所有 workspace 应用与子包（含 `apps/portal` 与 `apps/docs`）。
- 子包发布与版本管理流程见：`/guide/package-release`。
