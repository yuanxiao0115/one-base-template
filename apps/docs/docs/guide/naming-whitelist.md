# 命名白名单（CLI 可复用）

<div class="doc-tldr">
  <strong>TL;DR：</strong>命名白名单用于约束脚手架与业务代码命名，默认走“动词 + 名词”；新增命名先过白名单，再跑 `check:naming`，豁免必须带 owner/reason/expires/scopes。
</div>

## 适用范围

- 适用目录：`apps/docs/public/cli-naming-whitelist.json` 与命名校验脚本
- 适用场景：新增模块、API 命名、store action 命名、CLI 生成器治理
- 目标读者：脚手架维护者、业务模块开发者、代码规范负责人

## 1. 目标与原则

目标：统一 `apps/admin`、`apps/admin-lite`、`apps/portal`、`packages/*` 命名风格，减少同义不同名导致的维护成本。

核心原则：

1. 方法名优先 `动词 + 名词`（如 `getInitialPath`、`parseRuntimeConfig`）。
2. 事件处理函数统一 `onXxx`。
3. composable 统一 `useXxx`。
4. 优先短词和通用词，避免抽象长词链。

## 2. 机器可读入口（CLI 直读）

白名单文件：`apps/docs/public/cli-naming-whitelist.json`

读取示例：

```ts
import { readFileSync } from 'node:fs';

const raw = readFileSync('apps/docs/public/cli-naming-whitelist.json', 'utf-8');
const whitelist = JSON.parse(raw);
```

## 3. 推荐动词集合

### 3.1 通用方法

- `get`
- `list`
- `find`
- `load`
- `create`
- `add`
- `update`
- `remove`
- `clear`
- `save`
- `reset`
- `parse`
- `build`
- `map`
- `set`
- `sync`
- `open`
- `close`
- `start`
- `stop`
- `fetch`
- `warn`

### 3.2 断言/判断前缀

- `is`
- `has`
- `can`
- `should`

### 3.3 store action（Pinia）

- `set`
- `update`
- `reset`
- `clear`
- `load`

### 3.4 API client

- `get`
- `list`
- `create`
- `add`
- `update`
- `remove`
- `delete`

## 4. 不建议动词（新代码默认禁用）

- `assemble`
- `orchestrate`
- `resolve`
- `process`
- `execute`
- `perform`
- `manage`

> 说明：`handle` 仅用于事件处理上下文，不作为默认业务方法前缀。

## 5. 命名示例

- ✅ `getModuleIds`
- ✅ `parseRuntimeConfig`
- ✅ `clearByPrefixes`
- ✅ `onThemeChange`
- ✅ `useMenuState`
- ❌ `resolveEnabledModuleManifests`
- ❌ `assembleAppRoutes`
- ❌ `orchestrateAuthBootstrap`

## 6. 落地流程（给开发者/生成器）

1. 先从白名单动词中选择最贴近语义的词。
2. 同语义冲突时优先短词（如 `get > fetch`）。
3. 未命中时：查询回退 `get`，修改回退 `update`。
4. 事件函数强制 `on` 前缀，composable 强制 `use` 前缀。

## 7. 自动校验与验收

在仓库根目录执行：

```bash
pnpm check:naming:config
pnpm check:naming
```

- `check:naming:config`：校验白名单 JSON schema。
- `check:naming`：先校验 schema，再扫描代码命名。

通过标准：

1. schema 校验通过。
2. 命名扫描无违规。

## 8. 精确豁免机制（结构化治理）

`allowedNames` 已停用。确需豁免时，仅允许在 `allowedNameExemptions` 里声明完整元数据：

```json
{
  "allowedNameExemptions": [
    {
      "name": "legacyName",
      "owner": "module-owner",
      "reason": "历史接口命名暂不可改",
      "expiresAt": "2026-06-30",
      "scopes": ["apps/admin/src/modules/**/api/*.ts"]
    }
  ]
}
```

强制约束：

1. `owner/reason/expiresAt/scopes` 缺一不可。
2. `expiresAt` 过期后 `pnpm check:naming` 直接失败。
3. 豁免声明未命中任何代码会直接失败（防僵尸配置）。

## 9. 常见问题

| 问题                   | 原因                        | 处理方式                                |
| ---------------------- | --------------------------- | --------------------------------------- |
| 白名单改了但 CI 仍失败 | schema 不合法或扫描命中违规 | 先跑 `check:naming:config` 定位配置错误 |
| 想快速放行历史命名     | 直接加全局豁免              | 改为精确豁免并设置过期时间              |
| 新模块命名反复返工     | 命名前没看白名单            | 脚手架生成前先读取 JSON 白名单          |
