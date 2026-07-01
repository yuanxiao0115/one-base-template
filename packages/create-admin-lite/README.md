# @one-base-template/create-admin-lite

最小后台项目初始化 CLI。

```bash
pnpm dlx @one-base-template/create-admin-lite my-admin
```

生成项目只包含登录、首页、应用壳、路由、运行时配置、HTTP、鉴权、菜单和主题启动闭环。

生成项目内置 `.npmrc`：公共依赖走 `https://registry.npmmirror.com`，`@one-base-template/*` 走企业 npm。CLI 不会写入 `_auth`、token 或账号密码，认证信息只放在用户环境或 CI 环境。

生成项目的 `src/styles/index.css` 会从 `node_modules/@one-base-template/ui/dist` 扫描 Tailwind 工具类，避免已发布 UI 包中的布局类在独立项目中缺失。

生成项目通过 `@one-base-template/tag/style` 引入页签组件完整样式，包含页签栏、右键菜单与下拉菜单选择器。

## 升级已生成项目

新生成项目会写入 `.admin-lite-template.json`，记录模板来源和版本。CLI 后续版本发布后，已生成项目可以在项目根目录执行：

```bash
pnpm dlx @one-base-template/create-admin-lite@latest upgrade
```

常用参数：

- `--dry-run`：只输出升级计划，不写入项目文件。
- `--to <version>`：升级到指定模板版本；目标版本不能高于当前运行的 CLI 版本。
- `--from <version>`：手动指定来源版本，用于没有模板元信息且无法可靠推断的旧项目。
- `--yes`：跳过确认，适合 CI 或脚本执行。

第一版 upgrade 采用保守迁移：同步 `@one-base-template/*` 依赖到当前模板声明版本，补齐已知样式入口，并写入升级报告 `.admin-lite-upgrade-report.md`。当目标文件疑似被业务改过时，CLI 会跳过自动修改并在报告中列出冲突，不会强行覆盖。
