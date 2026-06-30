# Changesets 使用说明

本目录用于管理 monorepo 子包的版本与发布元信息。

## 常用命令

```bash
# 1) 发布前构建首批公共包并做本地 pack/install 冒烟
pnpm release:validate

# 2) 记录本次变更要发布的包与版本级别（patch/minor/major）
pnpm changeset

# 3) 根据 changeset 文件更新各子包版本号
pnpm version:packages

# 4) 发布（按 package publishConfig / 当前 npm registry）
pnpm release:packages
```

## 约定

- `.changeset/*.md`：每次变更对应一条发布说明
- 首批公共包范围固定为 `@one-base-template/core`、`@one-base-template/utils`、`@one-base-template/tag`、`@one-base-template/ui`
- 非首批包与私有 app 已在 `.changeset/config.json` 的 `ignore` 中排除，不应被首批发版误升级
- `pnpm version:packages` 会消费这些文件并更新包版本
- 发布完成后，消费过的 changeset 文件会被自动删除
- 凭证只允许写入发布环境或开发者本机临时 npm 配置，禁止把 `_auth` / token 写入仓库

## 版本级别

- `patch`：兼容修复、文档和发布脚本小修
- `minor`：新增兼容能力、首发公共包基线、新增导出
- `major`：导出路径、运行时行为、peer 依赖范围等不兼容变更
