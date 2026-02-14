# 开发规范与维护

## 工作流（建议）

仓库内常用验证命令：

```bash
pnpm typecheck
pnpm lint
pnpm build
```

## 文档必须随功能演进同步更新

本仓库约定：**更新功能后，必须同步更新文档站点**（`apps/docs`）。

常见需要更新文档的场景：
- 新增/调整 env 变量
- 新增布局模式、菜单行为、权限拦截逻辑
- Adapter 接口变更（路径、字段映射、鉴权模式）
- 核心约定变更（例如路由/菜单/SSO 流程）

## 本地预览文档

```bash
pnpm -C apps/docs dev
```

## 构建文档

```bash
pnpm -C apps/docs build
```

## admin 启动与 env 约束

为减少隐性耦合与启动链路分散，本仓库增加了两条约束（由 ESLint 强制）：

- 环境变量：业务模块禁止直接读 `import.meta.env`，统一通过 `apps/admin/src/infra/env.ts` 的 `appEnv` 读取
- 启动安装：`createApp/createPinia/createRouter` 以及 `app.use/app.component/...` 只能在 `apps/admin/src/bootstrap/` 中进行

## Tailwind v4（Monorepo）注意事项

本仓库的 `apps/admin` 使用 Tailwind CSS v4（通过 `@tailwindcss/postcss` 编译）。

在 Monorepo 场景下，如果 Tailwind 没有扫描到 `packages/ui` 的 class，会出现“部分工具类不生效”的现象（例如 `flex-col` / `flex-1` 缺失，导致布局错乱）。

当前约定：

- Tailwind 的扫描范围通过 `apps/admin/src/styles/index.css` 的 `@config` / `@source` 显式声明
- PostCSS 插件通过 `apps/admin/postcss.config.js` 指定 `base`，避免由于 cwd 不一致而找不到配置文件

参考片段（简化）：

```css
/* apps/admin/src/styles/index.css */
@import "tailwindcss";
@config "../../tailwind.config.ts";
@source "../**/*.{vue,ts,tsx}";
@source "../../../../packages/ui/src/**/*.{vue,ts,tsx}";
```

```js
// apps/admin/postcss.config.js
tailwindcss({ base: path.dirname(fileURLToPath(import.meta.url)) })
```
