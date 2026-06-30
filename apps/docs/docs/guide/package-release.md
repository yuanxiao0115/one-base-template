# 子包发布与版本控制

本文给出 `one-base-template` 的推荐发布流程，目标是让后续子包上线时可复制、可追溯、可回滚。

## 适用范围

- monorepo 下 `packages/*` 的可发布子包
- npm 公网或企业私服发布场景
- 版本管理、发布说明、Tag 管理

## 当前状态

- 首批公共包：`@one-base-template/core`、`@one-base-template/utils`、`@one-base-template/tag`、`@one-base-template/ui`。
- 延期发布包：`@one-base-template/adapters`、`@one-base-template/app-starter`、`@one-base-template/document-form-engine`、`@one-base-template/portal-engine`。
- 首批公共包已使用 `dist` 产物作为默认导出；延期包仍保持 `private: true`，不进入首批发布。

如需让其他子包进入发布流程，先把对应 `package.json` 的 `private` 改为 `false`，补齐 `name/version/exports/files/publishConfig`，并从 `.changeset/config.json` 的 `ignore` 中移除。

## 版本策略（SemVer）

- `patch`：修复 bug、规则误报修正、文档或脚本小修
- `minor`：向后兼容的新能力（新增规则、增强配置）
- `major`：不兼容变更（默认规则大改、导出路径变更）

建议策略：

- 默认从 `0.x` 进入稳定期：允许快速迭代，但**每次不兼容变更必须显式标注**
- 达到团队稳定复用后，再升级到 `1.0.0`

## 发布流程（Changesets）

### 1) 开发完成后先做发布校验

```bash
pnpm release:validate
```

该命令会：

- 构建 `core/utils/tag/ui` 的 `dist` 产物。
- 检查首批包与延期包的发布元数据边界。
- 扫描 tracked files，阻断 `_auth` / token 被提交。
- 生成本地 tarball，并安装到临时 Vite 消费者中构建。

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
pnpm release:validate
```

该命令会：

- 更新子包 `package.json` 版本号
- 消费对应 `.changeset/*.md`
- 生成/更新变更日志
- 版本推进后必须重新执行 `pnpm release:validate`，确保 tarball 版本、内部依赖范围和消费者安装链路一致

### 5) 发布到 registry

发布凭证只放在发布环境或本机临时配置中，禁止写入仓库。

```bash
export NPM_CONFIG_REGISTRY=http://artifact.nc.rdcloud.4c.hq.cmcc/artifactory/api/npm/one-package/
export NPM_CONFIG_USERCONFIG=/tmp/one-base-template-npmrc
printf '%s\n' 'registry=http://artifact.nc.rdcloud.4c.hq.cmcc/artifactory/api/npm/one-package/' > "$NPM_CONFIG_USERCONFIG"
# 在发布环境把 auth 行写入 "$NPM_CONFIG_USERCONFIG"，不要写入仓库文件
pnpm release:packages
```

如果只发布单包，也可定向执行，但首批公共包建议一起发版，避免 `ui` 依赖的 `core/tag` 版本缺失：

```bash
pnpm -C packages/<pkg-name> publish --no-git-checks --registry=http://artifact.nc.rdcloud.4c.hq.cmcc/artifactory/api/npm/one-package/
```

注意：发布 pnpm workspace 子包时必须使用 `pnpm publish` 或 `changeset publish`，不要用 `npm publish .` 绕过 pnpm 的打包转换；否则包内可能残留 `workspace:*` / `workspace:^` 依赖，外部项目无法从 registry 安装。

### 6) 发布后安装冒烟

```bash
npm install @one-base-template/core @one-base-template/utils @one-base-template/tag @one-base-template/ui --registry=http://artifact.nc.rdcloud.4c.hq.cmcc/artifactory/api/npm/one-package/
```

业务项目只使用包名、版本号和 registry 安装，不直接依赖 Artifactory 里很长的 tgz 物理地址。类似 `.../artifactory/one-package/@one-base-template/core/-/@one-base-template/core-0.1.0.tgz` 的地址只是 registry 返回的 tarball 存储路径，不作为对外接入契约。

如果执行环境没有 registry 凭证，本地收口只能验证到 `pnpm release:validate`。真实 registry 安装冒烟必须在有权限的发布环境补跑。

## Tag 与回滚建议

- 发布后打 tag：`<pkg-name>@<version>`，例如 `@one-base-template/utils@1.2.0`
- 发现问题时不要覆盖旧版本，直接发修复版（`patch`）
- 严重回滚使用“版本回退 + 新版修复说明”，避免强制删除已发布版本

## CI 建议（最小门禁）

发布流水线至少包含：

1. `pnpm install --frozen-lockfile`
2. `pnpm release:validate`
3. `pnpm -C apps/docs lint`
4. `pnpm -C apps/docs build`
5. `pnpm version:packages`（发布窗口）
6. `pnpm release:validate`（版本推进后复验）
7. `pnpm release:packages`（仅在 release job 执行）

## 延伸治理（多版本并行）

当出现“A 项目继续用 `1.x`、B 项目接入 `2.x`”场景时，本页只负责“如何发包”，还需要配套：

- [子包版本治理 SOP（多主线）](/guide/package-version-governance)：定义 `main` 与 `release/<major>.x` 的维护策略。
- [业务接入版本矩阵与迁移模板](/guide/business-integration-version-matrix)：定义业务项目版本台账、升级窗口与迁移模板。

## 新子包接入发布清单

- [ ] `package.json` 不再设置 `private: true`
- [ ] `exports/files/publishConfig` 完整
- [ ] README 包含接入与升级说明
- [ ] 已加入 changeset 流程（PR 含 `.changeset/*.md`）
- [ ] 已从 `.changeset/config.json` 的 `ignore` 中移除
- [ ] 通过 `pnpm release:validate` 与文档构建
