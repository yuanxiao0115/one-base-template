# 快速开始（可执行版）

<div class="doc-tldr">
  <strong>TL;DR：</strong>在 `one-base-template` 根目录完成依赖安装后，按需启动 `admin`、`portal`、`admin-lite`、`docs`，最后运行基础校验命令确认环境可用。
</div>

## 适用范围

- 适用目录：`/Users/haoqiuzhi/code/one-base-template`
- 适用人群：首次接入仓库的开发同学
- 文档目标：10-30 分钟内完成一次“安装 -> 启动 -> 验收”闭环

## 1. 前置条件

| 项目     | 要求           | 验证命令                |
| -------- | -------------- | ----------------------- |
| Node.js  | `>= 20.19.0`   | `node -v`               |
| pnpm     | `>= 10.32.1`   | `pnpm -v`               |
| 仓库权限 | 可读写本地仓库 | `git status` 能正常输出 |

## 2. 操作步骤

### 2.1 安装依赖

在仓库根目录执行：

```bash
pnpm install
```

预期结果：依赖安装完成，无阻断错误。

### 2.2 启动后台应用（admin）

```bash
pnpm dev
```

等价命令：

```bash
vp run --filter admin dev
```

预期结果：本地 admin 服务启动成功。

### 2.3 启动门户消费者（portal）

```bash
pnpm dev:portal
```

等价命令：

```bash
vp run --filter portal dev
```

预期结果：portal 服务启动成功。

### 2.4 启动后台基座（admin-lite）

```bash
pnpm dev:admin-lite
```

等价命令：

```bash
vp run --filter admin-lite dev
```

预期结果：admin-lite 服务启动成功。

### 2.5 启动文档站（VitePress）

```bash
pnpm -C apps/docs dev
```

预期结果：docs 服务启动成功，默认端口 `5174`。

### 2.6 可选：10 分钟起一个新后台

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

## 3. 验证与验收

### 3.1 最小验证命令

```bash
pnpm typecheck
pnpm lint
pnpm build
pnpm -C apps/docs lint
pnpm -C apps/docs build
```

### 3.2 通过标准

1. 命令执行成功，无阻断错误。
2. 至少一个应用可正常启动并访问。
3. docs 构建通过，文档页面可访问。

## 4. 常见失败与处理

| 现象                    | 原因                   | 处理方式                                        |
| ----------------------- | ---------------------- | ----------------------------------------------- |
| `pnpm install` 失败     | Node/pnpm 版本不匹配   | 先升级到文档要求版本                            |
| 启动端口被占用          | 本地已有同端口服务     | 结束占用进程或改端口                            |
| `pnpm build` 报跨包错误 | 某个子包依赖未安装完整 | 重新执行 `pnpm install` 后重试                  |
| docs 页面 404           | 页面新增后未同步导航   | 更新 `.vitepress/config.ts` 和 `guide/index.md` |

## 5. 相关阅读

- [开发规范与维护](/guide/development)
- [目录结构与边界](/guide/architecture)
- [文档总览](/guide/)
