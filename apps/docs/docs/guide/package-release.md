# 子包发布与版本控制

本文给出 `one-base-template` 的推荐发布流程，目标是让后续子包上线时可复制、可追溯、可回滚。

## 适用范围

- monorepo 下 `packages/*` 的可发布子包
- npm 公网或企业私服发布场景
- 版本管理、发布说明、Tag 管理

## 当前状态

- 当前 `packages/*` 默认为仓库内消费（`private: true`），如需发布请按本文流程启用。

如需让其他子包进入发布流程，先把对应 `package.json` 的 `private` 改为 `false`，并补齐 `name/version/exports/files/publishConfig`。

## 版本策略（SemVer）

- `patch`：修复 bug、规则误报修正、文档或脚本小修
- `minor`：向后兼容的新能力（新增规则、增强配置）
- `major`：不兼容变更（默认规则大改、导出路径变更）

建议策略：

- 默认从 `0.x` 进入稳定期：允许快速迭代，但**每次不兼容变更必须显式标注**
- 达到团队稳定复用后，再升级到 `1.0.0`

## 发布流程（Changesets）

### 1) 开发完成后先校验

```bash
pnpm verify
```

### 2) 记录版本变更意图

```bash
pnpm changeset
```

执行后会生成 `.changeset/*.md`，写明：

- 影响了哪些包
- 版本级别（patch/minor/major）
- 变更摘要（给使用方看的内容）

### 3) 合并前审阅 changeset

PR 里必须包含 `.changeset/*.md`，避免“改了包但忘了升版本”。

### 4) 发布窗口执行版本推进

```bash
pnpm version:packages
```

该命令会：

- 更新子包 `package.json` 版本号
- 消费对应 `.changeset/*.md`
- 生成/更新变更日志（若后续启用 changelog）

### 5) 发布到 registry

```bash
pnpm release:packages
```

如果只发布单包，也可定向执行：

```bash
pnpm -C packages/<pkg-name> publish --access public
```

## Tag 与回滚建议

- 发布后打 tag：`<pkg-name>@<version>`，例如 `@one-base-template/utils@1.2.0`
- 发现问题时不要覆盖旧版本，直接发修复版（`patch`）
- 严重回滚使用“版本回退 + 新版修复说明”，避免强制删除已发布版本

## CI 建议（最小门禁）

发布流水线至少包含：

1. `pnpm install --frozen-lockfile`
2. `pnpm verify`
3. `pnpm -C apps/docs build`
4. `pnpm release:packages`（仅在 release job 执行）

## 新子包接入发布清单

- [ ] `package.json` 已设置 `private: false`
- [ ] `exports/files/publishConfig` 完整
- [ ] README 包含接入与升级说明
- [ ] 已加入 changeset 流程（PR 含 `.changeset/*.md`）
- [ ] 通过 `pnpm verify` 与文档构建
