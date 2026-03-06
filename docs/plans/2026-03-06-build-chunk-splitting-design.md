# 构建 chunk 拆分设计

**日期**: 2026-03-06  
**主题**: 通过低风险 `manualChunks` 降低 `admin` / `portal` / `template` 的构建 chunk warning

---

## 1. 背景

当前 `pnpm build` 中：

- `apps/admin` 的 `bootstrap-*.js` 超过 3 MB
- `apps/portal` 的 `bootstrap-*.js` 超过 2.6 MB
- `apps/template` 的 `bootstrap-*.js` 超过 2.3 MB

构建可通过，但持续出现 Vite `Some chunks are larger than 500 kB after minification` warning。

## 2. 已确认根因

### 2.1 入口装配偏重

- `apps/admin/src/bootstrap/index.ts` 在启动阶段集中装配 router / core / ui / adapter / guards
- `apps/portal/src/bootstrap/index.ts` 与 `apps/template/src/bootstrap/index.ts` 同样在入口集中安装共享壳

### 2.2 路由页面当前以静态 import 为主

- `apps/admin/AGENTS.md` 已明确：admin 模块路由文件当前统一使用静态 `import`
- `apps/portal/src/router/routes.ts`、`apps/template/src/router/routes.ts` 也使用静态页面导入

这意味着大量业务页、共享壳、主题样式与依赖会更早进入主图谱。

### 2.3 现有 Vite 配置没有显式拆包策略

- `apps/admin/vite.config.ts`
- `apps/portal/vite.config.ts`
- `apps/template/vite.config.ts`

当前均未配置 `build.rollupOptions.output.manualChunks`。

## 3. 方案对比

### 方案 A：仅提高 `chunkSizeWarningLimit`

**优点**

- 改动最小

**缺点**

- 只隐藏 warning，不改善产物结构
- 无法降低后续调试和缓存成本

**结论**

- 不采用

### 方案 B：增加低风险 `manualChunks`

**优点**

- 不触碰 admin 当前“路由静态 import”规则
- 仅在打包阶段拆分 vendor / workspace shell / 重模块
- 对运行时行为影响最小

**缺点**

- 不能像改异步路由那样极限缩小首包

**结论**

- **采用**

### 方案 C：放开静态 import 规则，改页面级懒加载

**优点**

- 对 admin 首包缩减最明显

**缺点**

- 触碰现有项目规则与模块路由组织方式
- 风险明显更高

**结论**

- 本轮不做

## 4. 最终设计

### 4.1 改动范围

- `apps/admin/vite.config.ts`
- `apps/portal/vite.config.ts`
- `apps/template/vite.config.ts`
- `apps/docs/docs/guide/development.md`
- `.codex/operations-log.md`
- `.codex/testing.md`
- `.codex/verification.md`

### 4.2 拆包策略

优先拆以下类别：

1. `vue` / `vue-router` / `pinia`
2. `element-plus`（及其生态）
3. `vxe-table` / `vxe-pc-ui`
4. `@iconify/*`
5. `gm-crypto` / `crypto-js` / `sm-crypto`
6. `sortablejs` / `grid-layout-plus`
7. `packages/core` / `packages/ui` / `packages/tag` / `packages/portal-engine`
8. admin 内部的重模块：`portal`、`UserManagement`、`SystemManagement`、`LogManagement`
9. portal / template 的页面与共享壳按应用级 feature chunk 分组

### 4.3 约束

- 不修改 `apps/admin/AGENTS.md` 的静态 import 规则
- 不调整业务代码加载时序
- 不新增运行时条件分支
- 不仅靠提高 warning 阈值来“消音”

## 5. 验证策略

- `pnpm build` 作为核心验证命令
- 观察点：
  - 构建通过
  - 是否仍出现大 chunk warning
  - 主要 chunk 是否被拆分为更清晰的 vendor / feature / shell 文件
- 文档改动后补跑 `pnpm -C apps/docs lint`

## 6. 预期结果

- `admin` / `portal` / `template` 的超大 bootstrap chunk 被拆分
- 构建 warning 数量减少，最好清零
- 保持现有运行时行为不变
