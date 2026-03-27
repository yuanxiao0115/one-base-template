# 快速开始

## 环境要求

- Node.js: `>= 20.11.1`
- pnpm: `>= 9.1.4`

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

## 启动模板基座（template，迁移承接）

```bash
pnpm dev:template
```

默认等价于：

```bash
vp run --filter template dev
```

## 启动文档（VitePress）

```bash
pnpm -C apps/docs dev
```

默认端口：`5174`

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

- `pnpm lint:arch` 会串联检查 admin + template 的架构边界约束（模块边界、启动边界、env 读取边界等）。
- `pnpm test:run` 会执行工作区内已配置的单元测试任务。
- `pnpm build` 会通过 Vite Task 递归构建所有 workspace 应用与子包（含 `apps/portal` 与 `apps/docs`）。
- 子包发布与版本管理流程见：`/guide/package-release`。
