# **PROJECT_NAME**

基于 `@one-base-template/create-admin-lite` 生成的最小后台项目。

```bash
pnpm install
pnpm dev
```

项目内置 `.npmrc`：公共依赖走 `https://registry.npmmirror.com`，`@one-base-template/*` 走企业 npm。
认证信息请写入本机或 CI 的 npm 配置，不要提交 `_auth`、token 或账号密码。

## 项目自检

```bash
pnpm dlx @one-base-template/create-admin-lite@latest doctor
```

自检会检查模板元信息、Node/pnpm 版本、项目级 registry、企业 npm 认证、依赖协议、基础脚本和样式入口。它只报告认证状态，不打印认证值。

## 新增模块

```bash
pnpm new:module demo-management --title "Demo 管理" --route demo/management
pnpm new:module:item user --module demo-management --title "用户管理" --route /demo/management/user
```

生成后建议执行：

```bash
pnpm test:run
pnpm typecheck
pnpm build
```

## 模板升级

本项目根目录包含 `.admin-lite-template.json`，用于记录生成时的模板来源和版本。

后续 CLI 发布模板修复后，可在项目根目录执行：

```bash
pnpm dlx @one-base-template/create-admin-lite@latest upgrade
```

预检但不写文件：

```bash
pnpm dlx @one-base-template/create-admin-lite@latest upgrade --dry-run
```

如果升级报告提示冲突，说明对应模板文件疑似被业务改过，需要人工合并后再重新执行 upgrade。
