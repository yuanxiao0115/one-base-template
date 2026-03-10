# Template 最小静态菜单项目

> 项目路径：`apps/template`
> 目标：提供“开箱可跑、配置最少”的静态菜单后台示例。

## 1. 启动方式

在仓库根目录执行：

```bash
pnpm dev:template
```

等价命令：

```bash
pnpm -C apps/template dev
```

## 2. 配置位置

运行时配置文件：`apps/template/public/platform-config.json`

推荐最简写法：

```json
{
  "preset": "static-single",
  "appcode": "template"
}
```

说明：

- `preset=static-single` 会自动补齐 `backend/auth/token/menu/system` 默认值。
- 菜单模式固定为 `static`（禁止与 `remote` 混配）。

## 3. 静态菜单放置规则

静态菜单不单独维护 JSON，直接从路由生成：

- `apps/template/src/modules/**/routes.ts`
- 关键字段：`meta.title`、`meta.icon`、`meta.order`、`meta.keepAlive`

示例：

```ts
{
  path: "demo/about",
  name: "TemplateAbout",
  component: AboutPage,
  meta: {
    title: "关于模板",
    icon: "ep:info-filled",
    order: 2,
  },
}
```

## 4. 启动链路（最小）

1. `src/main.ts`：先加载 `platform-config.json`
2. `src/infra/env.ts`：解析运行时配置
3. `src/bootstrap/index.ts`：安装 router + core + UI
4. `src/router/routes.ts`：声明静态路由并生成静态菜单

## 5. 鉴权策略（模板默认）

- 登录页：`/login`
- 鉴权来源：本地鉴权适配器（local adapter，无后端依赖；仅 `template` 示例）
- 登录成功后执行 `finalizeAuthSession()`，统一加载用户态与菜单态

## 6. 最低验证

```bash
pnpm -C apps/template typecheck
pnpm -C apps/template lint
pnpm -C apps/template build
```
