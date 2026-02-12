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
pnpm -C apps/admin dev
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
pnpm build
```

说明：
- `pnpm build` 会通过 Turborepo 同时构建 `apps/admin` 与 `apps/docs`（文档构建需保持常绿）。

