# @one-base-template/create-admin-lite

最小后台项目初始化 CLI。

```bash
pnpm dlx @one-base-template/create-admin-lite my-admin
```

生成项目只包含登录、首页、应用壳、路由、运行时配置、HTTP、鉴权、菜单和主题启动闭环。

生成项目内置 `.npmrc`：公共依赖走 `https://registry.npmmirror.com`，`@one-base-template/*` 走企业 npm。CLI 不会写入 `_auth`、token 或账号密码，认证信息只放在用户环境或 CI 环境。
