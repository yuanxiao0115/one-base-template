# 子包版本治理 SOP（多主线）

> TL;DR：从“仓库内 `workspace:*` 联调”升级为“可发布包 + 多主线维护”，支持 **A 项目锁定 1.x**、**B 项目锁定 2.x** 并行运行。
> 适用范围：`one-base-template` 的 `packages/*` 可发布子包与下游业务项目。
> 最后更新：2026-04-02。

## 1. 背景与目标

- 背景：当前仓库内部应用依赖多为 `workspace:*`，适合联调，不适合多业务长期并行版本治理。
- 目标：建立统一的版本与分支治理口径，让不同业务项目可长期使用不同 major 版本并可持续维护。

## 2. 范围与非范围

### 2.1 In Scope

- 可发布子包的 SemVer 策略（`major/minor/patch`）。
- 多主线分支治理（`main` 与 `release/<major>.x`）。
- Changesets 驱动的发版流程。
- LTS 维护与回补（backport）策略。

### 2.2 Out of Scope

- 业务项目内部功能开发流程。
- 生产环境发布平台（Jenkins/GitHub Actions）实现细节。

## 3. 前置条件

- 已启用 Changesets：参考 [子包发布与版本控制](/guide/package-release)。
- 计划进入发布流程的包已满足：`private: false` + 完整 `exports/files/publishConfig`。
- 下游业务项目不再使用 `workspace:*`，改为 registry 版本依赖。

## 4. 治理模型

### 4.1 分支策略

- `main`：当前主线（例如 `2.x`）持续演进。
- `release/1.x`：上一代稳定线，只接收 bugfix/安全修复，不接功能增强。
- 后续同理：进入 `3.x` 后新增 `release/2.x`。

### 4.2 版本策略

- `patch`：修复缺陷，不改变已有行为契约。
- `minor`：向后兼容的新能力。
- `major`：不兼容变更（导出路径变更、默认行为调整、协议重构等）。

### 4.3 支持策略（建议）

| 版本线             | 状态   | 允许变更    | 维护周期  |
| ------------------ | ------ | ----------- | --------- |
| 当前主线（如 2.x） | ACTIVE | 功能 + 修复 | 持续      |
| 上一主线（如 1.x） | LTS    | 仅 patch    | 6-12 个月 |
| 更老主线（如 0.x） | EOL    | 不再维护    | 停止      |

## 5. 实施步骤

### 5.1 新增变更时（开发阶段）

在功能分支执行：

```bash
pnpm verify
pnpm changeset
```

要求：PR 必须带 `.changeset/*.md`，写明影响包与版本级别。

### 5.2 主线发布（以 2.x 为例）

在 `main` 的发布窗口执行：

```bash
pnpm verify
pnpm version:packages
pnpm release:packages
```

预期结果：

- 版本号推进并发布到 registry。
- 已消费的 `.changeset/*.md` 自动移除。

### 5.3 LTS 发布（以 1.x 为例）

在 `release/1.x` 执行：

```bash
git checkout release/1.x
pnpm verify
pnpm version:packages
pnpm release:packages
```

规则：

- `release/1.x` 只允许 `patch`。
- 如修复先落在 `main`，再 `cherry-pick` 回补到 `release/1.x`。

### 5.4 下游业务接入

- A 项目锁定：`^1.0.0`（仅接受 1.x 内升级）。
- B 项目锁定：`^2.0.0`（仅接受 2.x 内升级）。

示例：

```json
{
  "dependencies": {
    "@one-base-template/ui": "^1.0.0",
    "@one-base-template/core": "^1.0.0"
  }
}
```

## 6. 验证与验收

```bash
pnpm verify
pnpm -C apps/docs lint
pnpm -C apps/docs build
```

通过标准：

- 文档与代码口径一致（分支、命令、版本策略无冲突）。
- docs lint/build 全通过。

## 7. 回滚方案（如适用）

- 触发条件：发布后出现严重兼容回归。
- 回滚步骤：
  1. 不覆盖已发布版本，不删除历史包。
  2. 在对应主线发一个新的 `patch` 修复版本。
  3. 在发布说明中明确“受影响版本区间 + 升级建议”。
- 回滚后验证：重复执行 `pnpm verify` 与关键业务回归用例。

## 8. FAQ

| 问题                                     | 原因                                               | 解决方案                                    |
| ---------------------------------------- | -------------------------------------------------- | ------------------------------------------- |
| 为什么业务项目不能继续用 `workspace:*`？ | `workspace:*` 只适合同仓联调，不能表达跨仓版本边界 | 业务项目统一改用 registry 版本号            |
| 1.x 和 2.x 都要发版会不会很重？          | 没有分支与策略会更重，修复难追溯                   | 维持“主线 + 1 个 LTS 线”，只对 LTS 发 patch |
| 什么时候可以关闭 1.x？                   | 无业务依赖或已完成迁移                             | 在版本矩阵中标记 EOL 并提前公告             |

## 9. 关联文档

- [子包发布与版本控制](/guide/package-release)
- [业务接入版本矩阵与迁移模板](/guide/business-integration-version-matrix)
