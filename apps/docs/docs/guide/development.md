# 开发规范与维护（执行清单）

<div class="doc-tldr">
  <strong>TL;DR：</strong>开发前先确认作用域与规则文件，开发后至少完成 `typecheck + lint + build`，改动涉及规则或行为时必须同步更新 docs 并通过文档构建。
</div>

## 适用范围

- 适用目录：`/Users/haoqiuzhi/code/one-base-template/**`
- 适用场景：日常开发、自测提交流程、文档同步治理
- 目标读者：业务开发者、模块维护者、值班同学

## 1. 最小工作流

### 1.1 开发前

1. 确认目标目录的 `AGENTS.md`。
2. 明确本次改动属于“代码改动 / 文档改动 / 规则改动”。
3. 若涉及跨模块联动，先阅读 [目录结构与边界](/guide/architecture)。

### 1.2 开发中

1. 优先复用既有 `Ob*` 组件与模块范式。
2. 保持改动最小闭环，避免顺手引入无关重构。
3. 变更规则、路径、命令时同步维护 `apps/docs` 页面。

### 1.3 提交前

在仓库根目录执行：

```bash
pnpm verify:changed
pnpm verify:evidence -- --title "本次改动验证" --cmd "pnpm verify:changed"
pnpm typecheck
pnpm lint
pnpm build
```

说明：`pnpm verify:changed` 会按改动范围自动路由到“单应用验证 / docs 验证 / 全量 verify”。
补充：`pnpm verify:evidence` 会把命令结果写入 `.codex/testing.md`，全部通过时同步写入 `.codex/verification/YYYY-MM-DD.md`。

补充：根级 `pnpm typecheck` / `pnpm lint` / `pnpm build` / `pnpm test:run` 默认排除 `apps/zfw-system-sfss`（迁移遗留代码）。
若改动 `apps/zfw-system-sfss/**`，请额外执行：

```bash
pnpm -C apps/zfw-system-sfss typecheck
pnpm -C apps/zfw-system-sfss lint
pnpm -C apps/zfw-system-sfss build
```

大改动推荐补跑：

```bash
pnpm verify
```

## 2. app 级常用命令

### 2.1 admin

```bash
pnpm -C apps/admin dev
pnpm -C apps/admin typecheck
pnpm -C apps/admin lint
pnpm -C apps/admin lint:arch
pnpm -C apps/admin build
```

### 2.2 admin-lite

```bash
pnpm -C apps/admin-lite dev
pnpm -C apps/admin-lite typecheck
pnpm -C apps/admin-lite lint
pnpm -C apps/admin-lite lint:arch
pnpm -C apps/admin-lite test:run
pnpm -C apps/admin-lite build
```

### 2.3 docs

```bash
pnpm -C apps/docs lint
pnpm -C apps/docs build
```

## 3. 文档同步规则

以下变更必须同步 docs：

1. 路由、菜单、权限策略。
2. 配置项（`env`、`platform-config`、`layout`、`ui`）。
3. 组件基线或页面编排范式。
4. 验证命令与门禁策略。

最小验收命令：

```bash
pnpm -C apps/docs lint
pnpm -C apps/docs build
```

## 4. 质量门禁（5 条硬约束）

1. 代码优先可读，不做无收益抽象。
2. 模块内优先就近实现，跨模块复用再下沉。
3. 列表页基线统一：`ObPageContainer + ObTableBox + ObTable`。
4. CRUD 容器统一：`ObCrudContainer`。
5. 消息与确认统一：`message`、`obConfirm`。

## 5. 失败处理与回滚

| 现象             | 原因                 | 处理动作                                         |
| ---------------- | -------------------- | ------------------------------------------------ |
| `lint:arch` 失败 | 触发架构边界红线     | 按错误提示回到对应 `AGENTS.md` 修正              |
| typecheck 失败   | 类型签名与契约不一致 | 先修类型再继续功能迭代                           |
| docs 构建失败    | 链接失效或导航未同步 | 更新 `config.ts`、`guide/index.md`、相关页面互链 |

如果本轮仅是文档改动回滚，可用 `git restore <docs-file>` 定向回退单文件，再重跑 docs lint/build。

## 6. 验证与验收

### 6.1 验证命令

```bash
pnpm typecheck
pnpm lint
pnpm build
pnpm -C apps/docs lint
pnpm -C apps/docs build
```

### 6.2 通过标准

1. 命令全部通过。
2. 规则变化已在 docs 可检索页面体现。
3. 导航入口与正文互链一致。

## 7. 常见问题

| 问题                             | 原因           | 解决方案                                     |
| -------------------------------- | -------------- | -------------------------------------------- |
| `lint` 和 `lint:arch` 有什么区别 | 检查维度不同   | `lint` 查语法风格，`lint:arch` 查架构边界    |
| 只改一个页面也要跑全量吗         | 需要最低闭环   | 至少跑当前 app 的 `typecheck + lint + build` |
| 为什么代码改动还要改 docs        | 文档是协作入口 | 不同步会导致规则漂移和误操作                 |

## 8. 相关阅读

- [快速开始](/guide/quick-start)
- [目录结构与边界](/guide/architecture)
- [Harness 工程化落地](/guide/harness-engineering)
- [技术文档协作与改造手册](/guide/tech-doc-collaboration)
- [AGENTS 规则分层](/guide/agents-scope)
