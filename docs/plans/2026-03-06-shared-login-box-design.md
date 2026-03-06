# 共享登录框抽离设计

**日期**: 2026-03-06  
**主题**: `admin` / `portal` 共享登录框与登录动作，页面壳与登录后逻辑各自维护

---

## 1. 背景

当前仓库存在两套登录页：

- `apps/admin/src/pages/login/LoginPage.vue`
- `apps/portal/src/pages/login/LoginPage.vue`

目标不是复用整页，而是把**稳定且重复的登录能力**抽到共享层，同时让两个应用保留自己的页面与后续逻辑。

已确认的业务边界：

- **登录操作要统一**：portal 使用真实登录，登录接口与 admin 一致
- **登录框要复用**：公共组件统一命名为 `LoginBox.vue`
- **公共登录动作要复用**：统一命名为 `login.ts`
- **页面壳各自维护**：admin / portal 各自保留自己的登录页布局、背景、文案
- **登录后的逻辑各自维护**：
  - admin 继续走自己的 redirect/home 逻辑
  - portal 继续走自己的前台分流逻辑
- **portal 不接菜单接口**：portal 作为前台独立静态应用，不依赖 `/cmict/admin/permission/*`

老项目 frontlogin 的关键行为已经确认：

- 登录接口：`POST /cmict/auth/login`
- 登录成功后分流接口：`GET /cmict/admin/front-config/portal`
- 分流规则：
  - 存在 `redirect` 时，**优先跳 `redirect`**
  - 否则 `enable=true` → `/portal/index`
  - 否则若 `customUrl` 合法 → 跳 `customUrl`
  - 否则兜底 `/portal/index`

---

## 2. 范围冻结

### 本次要做

- 抽离共享登录框 `LoginBox.vue`
- 抽离共享登录动作 `login.ts`
- admin 登录页接入共享登录框和共享登录动作
- portal 登录页接入共享登录框和共享登录动作
- portal 增加首页分流服务与跳转编排
- 更新文档

### 本次不做

- 不抽整页登录页
- 不抽 admin 的 `/login?token=` 直登逻辑
- 不抽 admin 的 `/sso` 回调逻辑
- 不改 portal 的静态路由前台架构
- 不让 portal 接菜单接口
- 不抽新的 SSO/验证码体系

---

## 3. 方案对比

### 方案 A：抽整页登录页

**优点**

- 复用率最高

**缺点**

- 页面布局、背景、标题、直登、分流逻辑都会耦合
- portal 和 admin 后续演进成本高

**结论**

- 不采用

### 方案 B：抽登录框 + 抽登录动作

**优点**

- 公共边界清晰
- 页面壳与后置逻辑继续留在 app 内
- 符合 `packages/ui` 与 `packages/core` 的职责分层

**缺点**

- 页面层仍保留少量编排代码

**结论**

- **采用**

### 方案 C：连同验证码与页面配置也全部抽走

**优点**

- 复用更彻底

**缺点**

- 共享层会快速膨胀
- 当前 admin 的验证码组件实现细节会外溢到共享层

**结论**

- 本轮不做，留给后续 `v2`

---

## 4. 最终设计

### 4.1 分层落点

#### `packages/ui`

新增：

- `packages/ui/src/components/auth/LoginBox.vue`

职责：

- 只负责账号/密码输入区
- 暴露统一 `submit` 事件
- 接收 `loading`、标题、占位文案等 UI 参数
- 不直接调用接口
- 不处理路由跳转

#### `packages/core`

新增：

- `packages/core/src/auth/login.ts`

职责：

- 封装公共登录动作
- 统一调用 `authStore.login()`
- 完成登录后的 `finalizeAuthSession({ shouldFetchMe: false })`
- 提供 portal 的目标跳转解析函数

约束：

- core 不直接依赖 app 内加密文件
- `sczfw` 登录加密通过注入 `encryptor` 完成
- 不承载页面提示、页面配置、直登、SSO

#### `apps/admin`

保留：

- 登录背景与页面视觉
- 登录页配置加载
- `/login?token=` 直登逻辑
- admin 自己的 redirect/home 跳转
- 验证码弹层编排

#### `apps/portal`

保留：

- portal 自己的登录页壳
- portal 登录后的首页分流逻辑
- portal 前台静态路由模式

新增：

- `apps/portal/src/shared/services/auth-remote-service.ts`

封装：

- `GET /cmict/portal/getLoginPage`
- `GET /cmict/admin/front-config/portal`

---

## 5. 数据流

### 5.1 admin 登录流

1. 页面加载登录页配置
2. `LoginBox.vue` 收集账号密码
3. 页面触发表单校验与滑块验证码
4. 页面调用共享 `login.ts`
5. `login.ts` 完成真实登录与收口
6. admin 页面自行决定最终跳转

### 5.2 portal 登录流

1. portal 页面展示自己的登录壳
2. `LoginBox.vue` 收集账号密码
3. 页面触发表单校验与验证码
4. 页面调用共享 `login.ts`
5. 登录成功后：
   - 先看 `redirect`
   - 没有 `redirect` 再调 `/cmict/admin/front-config/portal`
   - 根据返回 `{ enable, customUrl }` 计算目标路径

### 5.3 portal 与菜单接口边界

- `apps/portal` 继续保持 `preset=static-single`
- 登录完成后允许执行 core 的会话收口，但**不引入 remote 菜单能力**
- 不新增 `/cmict/admin/permission/*` 请求依赖

---

## 6. 风险与控制

### 风险 1：共享动作误带入页面逻辑

**控制**

- `login.ts` 只做登录与纯跳转解析，不做页面提示和路由跳转

### 风险 2：portal `customUrl` 带来跳转风险

**控制**

- 用 `safeRedirect()` 统一校验
- 非站内路径回退 `/portal/index`

### 风险 3：portal 被误改成 remote 菜单应用

**控制**

- 设计与文档明确：portal 不接菜单接口
- 代码实现不新增菜单服务封装

---

## 7. 验证策略

- `packages/core`：为 portal 跳转解析函数补单测
- `packages/ui`：做类型校验
- `apps/admin`：类型校验
- `apps/portal`：类型校验 + lint
- 文档：`apps/docs` build

建议验证命令：

```bash
pnpm -C packages/core test:run src/auth/login.test.ts
pnpm -C packages/core typecheck
pnpm -C packages/ui typecheck
pnpm -C apps/admin typecheck
pnpm -C apps/portal typecheck
pnpm -C apps/portal lint
pnpm -w build
pnpm -C apps/docs build
```

---

## 8. 结论

本次采用“**共享登录框 + 共享登录动作**”方案：

- 公共层只收敛稳定重复能力
- admin / portal 登录页页面壳继续分治
- portal 登录后维持前台独立分流，不接菜单接口
