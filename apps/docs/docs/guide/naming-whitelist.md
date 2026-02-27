# 命名白名单（CLI 可复用）

## 目标

这份白名单用于统一 `apps/admin`、`packages/*` 与后续 CLI 生成器的命名风格，减少“同义不同名”导致的生成差异和维护成本。

核心原则：

- 方法名优先 **动词 + 名词**（如 `getInitialPath`、`parseRuntimeConfig`）
- 优先短词、通用词，避免抽象长词链
- 事件处理函数统一 `onXxx`
- composable 统一 `useXxx`

## 机器可读版本（推荐给 CLI 直接读取）

白名单 JSON 文件路径：

`apps/docs/public/cli-naming-whitelist.json`

示例读取（Node）：

```ts
import { readFileSync } from 'node:fs';

const raw = readFileSync('apps/docs/public/cli-naming-whitelist.json', 'utf-8');
const whitelist = JSON.parse(raw);
```

## 推荐动词集合

### 通用方法

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
- `to`
- `set`
- `sync`
- `open`
- `close`
- `start`
- `stop`
- `fetch`

### store action（Pinia）

- `set`
- `update`
- `reset`
- `clear`
- `load`

### API client

- `get`
- `list`
- `create`
- `add`
- `update`
- `remove`
- `delete`

## 不建议动词（默认不用于新代码）

- `assemble`
- `orchestrate`
- `resolve`
- `process`
- `execute`
- `perform`
- `manage`

> 说明：`handle` 仅保留在事件处理场景（如 `onSubmit` 内部 `handleSubmitSuccess`）使用，不作为默认业务方法前缀。

## 命名示例

- ✅ `getModuleIds`
- ✅ `parseRuntimeConfig`
- ✅ `clearByPrefixes`
- ✅ `onThemeChange`
- ✅ `useMenuState`
- ❌ `resolveEnabledModuleManifests`
- ❌ `assembleAppRoutes`
- ❌ `orchestrateAuthBootstrap`

## 落地建议（给生成器）

1. 先从白名单动词中选一个最贴近语义的词。
2. 若同语义存在多个词，按优先级选短词：`get > fetch`、`remove > delete`（业务层）。
3. 未命中时回退到 `get`（查询）或 `update`（修改）。
4. 事件函数强制 `on` 前缀，composable 强制 `use` 前缀。
