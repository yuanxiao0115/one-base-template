# Changesets 使用说明

本目录用于管理 monorepo 子包的版本与发布元信息。

## 常用命令

```bash
# 1) 记录本次变更要发布的包与版本级别（patch/minor/major）
pnpm changeset

# 2) 根据 changeset 文件更新各子包版本号
pnpm version:packages

# 3) 发布（按当前 npm registry）
pnpm release:packages
```

## 约定

- `.changeset/*.md`：每次变更对应一条发布说明
- `pnpm version:packages` 会消费这些文件并更新包版本
- 发布完成后，消费过的 changeset 文件会被自动删除
