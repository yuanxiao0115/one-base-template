# zfw-system-sfss 开发手册

> 适用目录：`apps/zfw-system-sfss/**`

## 快速开始

```bash
pnpm install
pnpm -C apps/zfw-system-sfss dev
```

联调后端时：

```bash
VITE_API_BASE_URL=http://<你的后端地址> pnpm -C apps/zfw-system-sfss dev
```

## 关键配置入口

- 平台配置：`apps/zfw-system-sfss/src/config/platform-config.ts`
- UI 配置：`apps/zfw-system-sfss/src/config/ui.ts`
- 布局配置：`apps/zfw-system-sfss/src/config/layout.ts`

当前平台配置已对齐 zfw 口径：

1. `backend=basic`、`menuMode=remote`
2. `appcode=od`
3. `defaultSystemCode=judicial_petition_management_system`
4. `enabledModules` 已包含 `system-sfss`

## System-sfss 迁移说明

- 新模块目录：`apps/zfw-system-sfss/src/modules/system-sfss`
- 老项目迁移源：`apps/zfw-system-sfss/migration/System-sfss-legacy-src.tar.gz`
- 当前策略：先对齐老 URL 路由保证可联调，再逐页替换占位页。

## 常用命令

```bash
pnpm -C apps/zfw-system-sfss typecheck
pnpm -C apps/zfw-system-sfss lint
pnpm -C apps/zfw-system-sfss lint:arch
pnpm -C apps/zfw-system-sfss test:run
pnpm -C apps/zfw-system-sfss build
```

## 文档入口

- `/guide/zfw-system-sfss-quick-start`
- `/guide/module-system`
- `/guide/development`
