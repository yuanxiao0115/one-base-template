# Harness 工程化落地（one-base-template）

<div class="doc-tldr">
  <strong>TL;DR：</strong>优先执行 <code>pnpm verify:changed</code> 做范围路由；需要留证据时使用 <code>pnpm verify:evidence</code> 自动写入 <code>.codex/testing.md</code> 与 <code>.codex/verification/YYYY-MM-DD.md</code>。
</div>

## 适用范围

- 适用目录：`/Users/haoqiuzhi/code/one-base-template/**`
- 适用场景：日常开发自测、提交前验证、CI 全量门禁与证据留存
- 目标读者：业务开发者、模块维护者、仓库治理负责人

## 1. 为什么要做 Harness 工程化

目标不是新增规则，而是把“验证行为”脚本化：

1. 减少人工判断误差（按改动自动选命令）。
2. 提高反馈速度（小范围改动不必直接跑全量）。
3. 固化证据链（命令、退出码、关键输出自动落盘）。
4. 保持本地与 CI 口径一致（Node / pnpm / verify 链路一致）。

## 2. 命令入口（仓库根目录）

```bash
# 1) 按改动范围自动选择验证命令
pnpm verify:changed

# 2) 仅查看路由结果，不执行命令
pnpm verify:changed -- --dry-run

# 3) 执行验证并自动写入 .codex 证据文件
pnpm verify:evidence -- \
  --title "Harness 首轮验证" \
  --scope "harness 工程化脚本 + docs" \
  --cmd "pnpm verify:changed"
```

## 3. verify:changed 路由规则

| 改动范围                                                  | 路由策略   | 默认命令                                            |
| --------------------------------------------------------- | ---------- | --------------------------------------------------- |
| 仅 `apps/docs/**`、`docs/**`、`.codex/**`、根 `AGENTS.md` | 文档路由   | `pnpm -C apps/docs lint && pnpm -C apps/docs build` |
| 仅单个 `apps/<app>/**`                                    | 单应用路由 | `typecheck + lint + lint:arch(若存在) + build`      |
| 涉及 `packages/**`                                        | 全量路由   | `pnpm verify`                                       |
| 涉及根脚本、CI、锁文件、根 `package.json`                 | 全量路由   | `pnpm verify`                                       |
| 涉及多个 app                                              | 全量路由   | `pnpm verify`                                       |

说明：当前根级 `pnpm verify` 链路中的 `typecheck/lint/build/test:run` 默认排除 `apps/zfw-system-sfss`（迁移遗留代码）。若改动 zfw，请追加定向验证命令。

实现入口：`scripts/harness/verify-changed.mjs`

## 4. verify:evidence 证据落盘规则

`verify:evidence` 的执行顺序：

1. 按顺序执行 `--cmd` 命令（遇到失败即停止）。
2. 无论成功/失败，都将记录追加到 `.codex/testing.md`。
3. 当全部命令通过时，追加记录到 `.codex/verification/YYYY-MM-DD.md`。
4. 全通过时同步刷新 `.codex/verification.md` 的“最新记录”索引。

实现入口：`scripts/harness/record-evidence.mjs`

## 5. 推荐工作流（最小闭环）

1. 开发完成后先执行：`pnpm verify:changed`。
2. 准备提交前执行：`pnpm verify:evidence -- --title "...本次主题..." --cmd "pnpm verify:changed"`。
3. 若 `verify:changed` 自动路由为 `pnpm verify`，可直接沿用全量结果，不重复跑同一链路。
4. 改动涉及规则/文档时，确保 `pnpm -C apps/docs lint` 与 `pnpm -C apps/docs build` 通过。

## 6. 常见问题

| 问题                              | 原因                              | 处理方式                             |
| --------------------------------- | --------------------------------- | ------------------------------------ |
| 为什么没走单应用路由              | 触发了 `packages/` 或根级文件变更 | 预期行为，直接执行全量 `pnpm verify` |
| 为什么只写入 `testing.md`         | 某个命令失败，未满足“全通过”条件  | 修复后重新执行 `verify:evidence`     |
| 可以直接跳过 `verify:evidence` 吗 | 可以，但缺少标准化证据            | 关键任务建议保留证据命令             |

## 7. 相关阅读

- [开发规范与维护](/guide/development)
- [Agent Harness 与仓库知识](/guide/agent-harness)
- [AGENTS 规则分层](/guide/agents-scope)
