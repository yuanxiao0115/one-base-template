# Portal 动作协议与 Target 注册设计稿

> 状态：设计稿（待实施）
> 决策日期：2026-03-06
> 适用范围：`packages/portal-engine`、`apps/admin`、`apps/portal`

## 1. 目标

解决 CMS 组件“写死业务跳转”问题，使同一物料组件可在不同应用中复用。

核心原则：

1. 组件不直接依赖路由路径。
2. 组件通过动作协议声明业务意图。
3. 应用侧通过 target registry 决定具体跳转实现。

## 2. 方案选择

采用 **A+B 组合**：

1. A：标准动作协议（引擎统一执行）。
2. B：应用侧 target 映射表（业务语义 -> 路由/权限）。

不采用“组件内硬编码跳转”与“任意脚本表达式”方案。

## 3. 动作协议（v1）

动作类型仅保留三种：

1. `navigate`
2. `open-url`
3. `emit`

示例：

```json
{
  "action": {
    "type": "navigate",
    "target": "cms_detail",
    "params": {
      "id": "$item.id"
    },
    "query": {
      "categoryId": "$context.categoryId",
      "tabId": "$context.tabId"
    },
    "openMode": "router"
  }
}
```

## 4. Target 命名规范

命名规则：`模块_动作`（业务语义）。

示例：

1. `cms_detail`
2. `cms_list`
3. `todo_open`

禁止：

1. 路由路径语义命名（如 `portal_cms_detail_route`）。
2. 动词缺失的模糊命名（如 `cms_page`）。

## 5. 参数变量来源

变量仅允许以下四类来源：

1. `$item.*`
2. `$context.*`
3. `$route.*`
4. `$user.*`

不允许执行任意表达式与函数调用，避免注入和调试复杂度。

## 6. Registry 设计

每个 app 自维护自己的 target registry。

接口示例：

```ts
interface PortalActionTargetRegistryItem {
  target: string;
  permission?: string;
  to: {
    name?: string;
    path?: string;
    params?: Record<string, unknown>;
    query?: Record<string, unknown>;
  };
}
```

### admin 示例

`cms_detail -> /portal/cms/detail`

### portal 示例

`cms_detail -> /cms/detail`

同一 target 在不同 app 可映射到不同路由。

## 7. 执行策略

执行链路：

1. 解析动作模板变量。
2. 在 registry 查找 target。
3. 执行权限校验（若配置 `permission`）。
4. 调用路由或窗口动作。

未映射策略（已确认）：

1. 阻断执行。
2. 提示错误信息。
3. 记录告警日志。

## 8. 首批改造范围

优先替换已有硬编码跳转组件：

1. `image-text-list`
2. `image-text-column`
3. `carousel-text-list`

目标：清除组件内部 `router.push` 的业务路由写死逻辑。

## 9. 验收标准

1. 首批组件不再直接写死业务路由。
2. 同一 schema 在 admin 与 portal 中可执行一致业务 target。
3. target 未映射时按“阻断并提示”生效。
4. typecheck/lint/build 通过。
