---
outline: [2, 3]
---

<script setup lang="ts">
import CrudContainerDrawerDocDemo from './components/CrudContainerDrawerDocDemo.vue'
</script>

# CRUD 容器与 Hook

`ObCrudContainer + useCrudContainer` 用于统一新增/编辑/详情容器流程。

目标：让业务页面只关注**表单字段、接口调用、业务校验**，不再重复维护弹窗/抽屉状态机。

## 能力总览

- 统一容器壳：`dialog / drawer` 二选一
- drawer 支持布局切换：`drawerColumns=1|2`（默认 `1`）
- 统一模式：`create / edit / detail`
- 统一提交流程：`form.validate -> beforeSubmit -> submit -> onSuccess`
- 支持前置加载：`beforeOpen`（字典、权限、默认值）
- 支持纯容器模式：仅控制 `visible`，不强制绑定 form
- 保留 `footer` 插槽：业务可完全接管按钮
- 支持全局默认容器：未传 `container` 时读取 `OneUiPlugin` 配置（`props` 优先）

## 全局默认容器配置（props 优先）

```ts
import { OneUiPlugin } from '@one-base-template/ui'

app.use(OneUiPlugin, {
  prefix: 'Ob',
  aliases: true,
  crudContainer: {
    defaultContainer: 'dialog'
  }
})
```

说明：

- 组件传了 `container`（如 `container=\"drawer\"`）时，以组件 props 为准；
- 组件未传 `container` 时，自动使用全局 `defaultContainer`。

在 `apps/admin` 中，默认值已预设在：

- `/Users/haoqiuzhi/code/one-base-template/apps/admin/src/config/ui.ts` 的 `appCrudContainerDefaultType`
- `/Users/haoqiuzhi/code/one-base-template/apps/admin/src/bootstrap/index.ts` 安装 `OneUiPlugin` 时注入

修改方式：

1. 打开 `apps/admin/src/config/ui.ts`
2. 把 `appCrudContainerDefaultType` 改为 `'dialog'` 或 `'drawer'`
3. 重新运行 `pnpm -C apps/admin typecheck` 验证

## 1. 最小接入（dialog 托管模式）

```vue
<script setup lang="ts">
import { ref, type Ref } from 'vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import {
  CrudContainer as ObCrudContainer,
  useCrudContainer,
  type CrudFormLike
} from '@one-base-template/ui'

type UserForm = {
  id?: string
  name: string
  phone: string
}

const formRef = ref<FormInstance>()

const rules: FormRules<UserForm> = {
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  phone: [{ required: true, message: '请输入手机号', trigger: 'blur' }]
}

async function addUser(payload: UserForm) {
  return Promise.resolve({ code: 200, data: payload })
}

async function editUser(payload: UserForm) {
  return Promise.resolve({ code: 200, data: payload })
}

const crud = useCrudContainer<UserForm, { id: string; name: string; phone: string }>({
  entityName: '用户',
  container: 'dialog',
  createForm: () => ({ name: '', phone: '' }),
  formRef: formRef as unknown as Ref<CrudFormLike | undefined>,
  beforeSubmit: ({ form }) => ({ ...form }),
  submit: async ({ mode, payload }) => {
    const response = mode === 'create' ? await addUser(payload) : await editUser(payload)
    if (response.code !== 200) {
      throw new Error('保存失败')
    }
    return response
  },
  onSuccess: ({ mode }) => {
    ElMessage.success(mode === 'create' ? '新增成功' : '更新成功')
  }
})
</script>

<template>
  <el-button type="primary" @click="crud.openCreate()">新增用户</el-button>

  <ObCrudContainer
    v-model="crud.visible"
    container="dialog"
    :mode="crud.mode"
    :title="crud.title"
    :loading="crud.submitting"
    :confirm-text="'保存'"
    @confirm="crud.confirm"
    @cancel="crud.close"
  >
    <el-form ref="formRef" :model="crud.form" :rules="rules" label-width="88px" :disabled="crud.readonly">
      <el-form-item label="姓名" prop="name">
        <el-input v-model.trim="crud.form.name" />
      </el-form-item>
      <el-form-item label="手机号" prop="phone">
        <el-input v-model.trim="crud.form.phone" />
      </el-form-item>
    </el-form>
  </ObCrudContainer>
</template>
```

## 2. drawer 托管模式（默认单列，可切双列）

```vue
<script setup lang="ts">
import { CrudContainer as ObCrudContainer, useCrudContainer } from '@one-base-template/ui'

const crud = useCrudContainer({
  entityName: '组织',
  container: 'drawer',
  createForm: () => ({ orgName: '', sort: 10 }),
  submit: async ({ payload }) => {
    await Promise.resolve(payload)
  }
})
</script>

<template>
  <el-button @click="crud.openCreate()">新增组织</el-button>

  <ObCrudContainer
    v-model="crud.visible"
    container="drawer"
    :drawer-columns="2"
    :mode="crud.mode"
    :title="crud.title"
    :loading="crud.submitting"
    :drawer-size="640"
    @confirm="crud.confirm"
    @cancel="crud.close"
  >
    <el-form :model="crud.form" :disabled="crud.readonly">
      <el-form-item label="组织名称">
        <el-input v-model="crud.form.orgName" />
      </el-form-item>
      <el-form-item label="排序">
        <el-input-number v-model="crud.form.sort" :min="1" />
      </el-form-item>
    </el-form>
  </ObCrudContainer>
</template>
```

## 2.1 抽屉样式规范（标题/内容/label）

`ObCrudContainer` 在 `container="drawer"` 下已内置以下样式规范：

- 抽屉宽度：默认 `400px`（可通过 `drawerSize` 覆盖）
- 抽屉底色：通过声明 `--el-dialog-bg-color: #FFFFFF` 驱动（drawer/header/body/footer 同步生效）
- 标题区：`48px` 高，`padding: 15px 16px`，`margin: 0`，标题 `#1D2129 / 18px / 600`
- 内容区：`el-drawer__body` 负责 `padding: 24px 20px` 与白底，`ob-crud-container__body` 内边距为 `0`
- 单列场景：内容区可用宽度 `400 - 20*2 = 360px`，输入项默认 `100%` 贴合
- 表单 label：默认上置（`top` 视觉），`font-size: 14px`，`line-height: 22px`
- 底部区：`64px` 高，顶部 `1px solid #E5E6EB` 分割线
- 列布局：`drawerColumns=1|2`，默认 `1`

上述 Drawer 壳层样式已统一抽离到 admin 覆盖文件：

- `/Users/haoqiuzhi/code/one-base-template/apps/admin/src/styles/element-plus/drawer-overrides.css`

该覆盖同时作用于：

- `ObCrudContainer` 业务抽屉
- `OneTableBar` 高级筛选抽屉

使用建议：

- 常规编辑表单：不传 `drawerColumns`，走默认单列
- 字段较多：传 `:drawer-columns="2"`，提升可视密度
- 双列下需跨整行字段：给 `el-form-item` 增加 `class="ob-crud-container__item--full"`

```vue
<template>
  <ObCrudContainer
    v-model="visible"
    container="drawer"
    :drawer-columns="2"
    title="编辑组织"
  >
    <el-form :model="form">
      <el-form-item label="组织名称">
        <el-input v-model="form.name" />
      </el-form-item>
      <el-form-item label="备注" class="ob-crud-container__item--full">
        <el-input v-model="form.remark" type="textarea" />
      </el-form-item>
    </el-form>
  </ObCrudContainer>
</template>
```

## 2.2 在线示例（Vue 组件）

<CrudContainerDrawerDocDemo />

## 3. beforeOpen 加载字典（打开前前置方法）

```ts
const statusOptions = ref<Array<{ label: string; value: number }>>([])

const crud = useCrudContainer({
  entityName: '菜单',
  createForm: () => ({ status: 1, name: '' }),
  beforeOpen: async ({ mode, row, form }) => {
    // 1) 字典前置加载
    if (statusOptions.value.length === 0) {
      const response = await menuApi.getStatusEnum()
      statusOptions.value = response.data || []
    }

    // 2) 新增场景补默认值
    if (mode === 'create') {
      form.status = 1
      return
    }

    // 3) 编辑/详情可根据当前行预处理
    if (row && row.status == null) {
      form.status = 1
    }
  }
})
```

## 4. 表单关联、提交、重置行为说明

```ts
const crud = useCrudContainer({
  entityName: '权限',
  createForm: () => ({ name: '', code: '' }),
  resetOnCreateOpen: true,
  resetOnClose: true,
  submit: async ({ payload }) => {
    await api.save(payload)
  }
})
```

默认行为：

- `openCreate()`：重置表单
- `close()`：关闭并重置表单
- `confirm()`：
  - `create/edit`：先 `form.validate()`，通过后提交
  - `detail`：仅关闭容器

## 5. 保存成功后回调刷新列表

```ts
const tableRef = ref<{ refresh?: () => void } | null>(null)

const crud = useCrudContainer({
  entityName: '用户',
  createForm: () => ({ name: '' }),
  submit: async ({ payload }) => {
    await userApi.save(payload)
  },
  onSuccess: async () => {
    await tableRef.value?.refresh?.()
  }
})
```

## 6. 自定义 footer（仅一个按钮）

```vue
<ObCrudContainer
  v-model="crud.visible"
  :mode="crud.mode"
  :title="crud.title"
  :loading="crud.submitting"
  @confirm="crud.confirm"
>
  <el-form :model="crud.form">
    <el-form-item label="名称">
      <el-input v-model="crud.form.name" />
    </el-form-item>
  </el-form>

  <template #footer="{ confirm }">
    <div style="display: flex; justify-content: flex-end; width: 100%">
      <el-button type="primary" @click="confirm">仅保留保存按钮</el-button>
    </div>
  </template>
</ObCrudContainer>
```

## 7. 纯容器模式（仅控制 visible）

适用场景：页面并不需要默认“确认/取消”流程，只想复用容器外壳。

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { CrudContainer as ObCrudContainer } from '@one-base-template/ui'

const visible = ref(false)
</script>

<template>
  <el-button @click="visible = true">打开容器</el-button>

  <ObCrudContainer
    v-model="visible"
    container="drawer"
    title="高级配置"
    :show-footer="false"
    :drawer-size="720"
  >
    <div>这里放任意自定义内容，不绑定 form、也不依赖 Hook。</div>
  </ObCrudContainer>
</template>
```

## 8. 常见问题

### 1) 为什么点击确定没有触发提交？

优先检查：

- 是否在托管模式下传入了 `formRef`
- `form.validate()` 是否通过
- 是否在 `detail` 模式（该模式确定只会关闭）

### 2) 为什么确认按钮不显示？

- 检查 `showFooter/showConfirmButton` 是否被关闭
- 若使用了 `footer` 插槽，默认按钮会被插槽覆盖

### 3) 编辑弹窗打开后为什么是空数据？

- 检查 `openEdit(row)` 是否传入了 row
- 若依赖接口详情，检查 `loadDetail` 是否返回了数据
- 若有映射逻辑，检查 `mapDetailToForm` 是否正确回填字段

### 4) beforeOpen 报错后还能打开吗？

当前默认是**降级打开**：不会因为前置失败强制阻断。必填项仍由表单校验兜底。

### 5) 为什么页面里不写 `onError` 和 `try/catch` 也有错误提示？

`@one-base-template/ui` 对 `useCrudContainer` 做了默认错误提示封装：

- 未传 `onError` 时，会按阶段给出默认文案（打开失败/详情失败/保存失败）
- `@confirm` 可直接绑定 `crud.confirm`
- 若业务需要自定义错误处理，再传 `onError` 覆盖默认行为

### 6) 为什么推荐 `obConfirm`，不是 `confirm`？

为避免和浏览器全局 `confirm` 命名冲突，项目统一推荐：

- 使用 `obConfirm.warn/success/error`
- `confirm` 仅做历史兼容，新增页面不再推荐直接使用

## 迁移建议（旧写法 -> 新写法）

- `useDialog/useDrawer`：统一替换为 `useCrudContainer`
- 手写 `visible/mode/title/submitting`：改为 Hook 托管
- 页面弹窗底部重复按钮逻辑：优先用 `ObCrudContainer` 默认 footer，特殊场景再用 `#footer`
