# Verification And Evidence

## 批次内最小校验

每批至少跑 1-2 条最小命令，例如：

```bash
pnpm -C apps/admin typecheck
pnpm -C apps/admin lint
```

如果有定向测试，优先跑变更附近的测试。

## 阶段收口校验

默认至少执行：

```bash
pnpm -C apps/admin typecheck
pnpm -C apps/admin lint
pnpm -C apps/admin build
pnpm -C apps/docs lint
pnpm -C apps/docs build
```

如果变更触达共享包，再补：

```bash
pnpm -C packages/core typecheck
pnpm -C packages/ui typecheck
pnpm -C packages/adapters typecheck
```

## `.codex` 证据要求

### `operations-log.md`

记录：

- 为什么要迁移
- 本轮改了哪些文件
- 是否命中 `*Management` 标准化分支
- 还剩哪些风险

### `testing.md`

记录：

- 完整命令
- 通过 / 失败
- 如果失败，记录修复后复验结论

### `verification.md` 与当日记录

记录：

- 需求是否达成
- 对应证据文件
- 剩余风险或未覆盖项

## 阻断规则

- 出现误 403 / 越权：立即阻断后续开发
- 连续 3 次同类错误：停止重复尝试，先回到根因分析
- docs 未同步或验证未跑完：不能宣称迁移完成
