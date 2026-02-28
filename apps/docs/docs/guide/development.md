# 开发规范与维护

## 工作流（建议）

仓库内常用验证命令：

```bash
pnpm typecheck
pnpm lint
pnpm build
pnpm check:naming
pnpm verify
pnpm doctor
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

## 命名规范校验

为保证“动词 + 名词”的通用命名约束，仓库提供命名白名单检查脚本：

```bash
pnpm check:naming
```

白名单来源：`apps/docs/public/cli-naming-whitelist.json`  
规则说明：`/guide/naming-whitelist`

## 一键验证与环境自检

- 一键验证（本地提测前推荐）：

```bash
pnpm verify
```

- 环境自检（新成员首次拉仓后推荐）：

```bash
pnpm doctor
```

## admin 启动与 env 约束

为减少隐性耦合与启动链路分散，本仓库增加了两条约束（由 ESLint 强制）：

- 环境变量：业务模块禁止直接读 `import.meta.env`，统一通过 `apps/admin/src/infra/env.ts` 的 `appEnv` 读取
- 启动安装：`createApp/createPinia/createRouter` 以及 `app.use/app.component/...` 只能在 `apps/admin/src/bootstrap/` 中进行

模块化阶段新增两条约束：

- 模块边界：`apps/admin/src/modules/**/*` 禁止直接 import `@/modules/*`（公共能力上移到 `shared/core/ui`）
- API 边界：页面/组件/store 禁止直接 import `@/infra/http`，必须经由 `services/*` 或 `shared/api/*`

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
