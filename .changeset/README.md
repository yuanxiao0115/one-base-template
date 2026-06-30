# Changesets 使用说明

本目录用于管理 monorepo 子包的版本与发布元信息。

## 常用命令

```bash
# 1) 发布前构建公共包并做本地 pack/install 冒烟
pnpm release:validate

# CLI / 模板改动时补跑仓库外生成项目验证
pnpm validate:admin-lite-cli

# 2) 记录本次变更要发布的包与版本级别（patch/minor/major）
pnpm changeset

# 3) 根据 changeset 文件更新各子包版本号
pnpm version:packages

# 4) 发布（按 package publishConfig / 当前 npm registry）
pnpm release:packages
```

## 约定

- `.changeset/*.md`：每次变更对应一条发布说明
- 当前公共运行时包范围为 `@one-base-template/core`、`@one-base-template/utils`、`@one-base-template/tag`、`@one-base-template/ui`、`@one-base-template/adapters`、`@one-base-template/app-starter`
- 当前公共 CLI 包范围为 `@one-base-template/create-admin-lite`
- 私有 app 与延期包已在 `.changeset/config.json` 的 `ignore` 中排除，不应被当前发版误升级
- `pnpm version:packages` 会消费这些文件并更新包版本
- 发布完成后，消费过的 changeset 文件会被自动删除
- 凭证只允许写入发布环境或开发者本机临时 npm 配置，禁止把 `_auth` / token 写入仓库
- 真实 publish 成功后，每个发布成功的 package 必须打版本 tag，格式为 `<package-name>@<version>`

## 版本级别

- `patch`：兼容修复、文档和发布脚本小修
- `minor`：新增兼容能力、首发公共包基线、新增导出
- `major`：导出路径、运行时行为、peer 依赖范围等不兼容变更
