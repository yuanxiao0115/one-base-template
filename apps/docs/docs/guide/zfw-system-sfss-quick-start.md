# zfw-system-sfss 快速使用手册

> 适用范围：`/Users/haoqiuzhi/code/one-base-template/apps/zfw-system-sfss`
> 面向人群：接手 `zfw-system-sfss` 开发与迁移的同事

## TL;DR

- 启动命令：`pnpm -C apps/zfw-system-sfss dev`
- 配置入口：`apps/zfw-system-sfss/src/config/platform-config.ts`
- 当前系统默认编码：`judicial_petition_management_system`
- 当前默认模块：`home`、`admin-management`、`log-management`、`system-management`、`system-sfss`

## 1. 一分钟启动

```bash
pnpm install
pnpm -C apps/zfw-system-sfss dev
```

需要联调后端时：

```bash
VITE_API_BASE_URL=http://<你的后端地址> pnpm -C apps/zfw-system-sfss dev
```

## 2. 当前运行口径（重点）

`apps/zfw-system-sfss/src/config/platform-config.ts` 当前按以下口径维护：

1. `backend=basic`、`menuMode=remote`（走后端菜单）
2. `appcode=od`（对齐老项目默认请求头）
3. `defaultSystemCode=judicial_petition_management_system`
4. `systemHomeMap.judicial_petition_management_system=/law-supervison/sunshine-petition/shi`
5. `enabledModules` 已包含 `system-sfss`

## 3. System-sfss 模块说明

`system-sfss` 已先完成两件事：

1. 路由 URL 对齐老项目路径（便于直接命中后端菜单）。
2. 页面统一接入可运行占位页，保证新项目可启动、可联调、可逐页替换。

当前业务目录已按 legacy 结构落地到：

- `apps/zfw-system-sfss/src/modules/system-sfss/views/System-sfss`

并保持 6 个子模块结构：

1. `sunshine-petition`
2. `petition-supervision`
3. `petition-processing`
4. `special-petition-management`
5. `petition-query`
6. `litigation-related`

老项目原始迁移源保留在：

- `apps/zfw-system-sfss/migration/System-sfss-legacy-src.tar.gz`

## 4. 新增模块命令

```bash
pnpm new:module <module-id> --title 模块标题 --app zfw-system-sfss
```

示例：

```bash
pnpm new:module system-sfss --title "System-sfss" --app zfw-system-sfss
```

## 5. 提交前最小验证

```bash
pnpm -C apps/zfw-system-sfss typecheck
pnpm -C apps/zfw-system-sfss lint
pnpm -C apps/zfw-system-sfss lint:arch
pnpm -C apps/zfw-system-sfss test:run
pnpm -C apps/zfw-system-sfss build
```

改了 docs 时，再执行：

```bash
pnpm -C apps/docs lint
pnpm -C apps/docs build
```

## 6. 常见问题

### 登录后菜单为空

先检查是否连到正确后端，以及 `platform-config.ts` 中 `defaultSystemCode` 与后端系统编码是否一致。

### 菜单能看到但页面 404

优先检查该菜单 URL 是否已经在 `src/modules/system-sfss/routes.ts` 中声明。

## 7. 相关文档

- [模块系统（最终版）](/guide/module-system)
- [admin-lite 后台基座](/guide/admin-lite-base-app)
- [开发规范与维护](/guide/development)
