# monorepo-web 迁移踩坑清单

> 适用范围：`monorepo-web -> one-base-template` 的模块迁移、脚手架派生与联调收口。  
> 目标：把“已经踩过的坑”变成可执行检查项，降低重复返工。

## TL;DR

1. 先收口语义：配置项必须“看名字就懂含义”。
2. 先对齐结构：目录层级与模块契约优先对齐模板基线。
3. 先删中转层：迁移期兜底层不保留到主线。
4. 先统一组件：业务页面优先使用 `Ob*` 体系，避免双轨并存。
5. CRUD 页面统一四件套：`ObPageContainer + ObTableBox + ObTable + ObActionButtons`。
6. CRUD 新增/编辑/查看统一容器：`ObCrudContainer`。
7. 迁移完成后必须补齐文档与验证，不允许“代码改了文档没改”。

## 1) 本次迁移真实踩坑（含纠偏）

| 问题现象                               | 错误做法                                    | 收口后标准                                          |
| -------------------------------------- | ------------------------------------------- | --------------------------------------------------- |
| 页面出现大块空白、滚动条行为异常       | 只替换 `ObTable`，未统一页面容器高度链      | 列表页统一 `ObPageContainer + ObTableBox + ObTable` |
| 同一个列表页按钮风格不一致，维护成本高 | 操作列手写一排 `el-button`                  | 操作列统一 `ObActionButtons`                        |
| 新增/编辑弹层交互不一致                | CRUD 场景直接使用 `el-dialog` / `el-drawer` | CRUD 场景统一 `ObCrudContainer`                     |
| 页面出现 `i*` 与 `Ob*` 双轨并存        | 保留历史映射组件做过渡                      | 业务页只保留 `Ob*` 组件体系                         |
| 登录可用但业务接口不通                 | 只补一条代理前缀                            | 按真实链路补齐 `/cmict`、`/zfw`、`/zb` 等前缀       |

## 2) Ob\* 组件统一规范（强约束）

### 2.1 CRUD 页面三板斧（必须）

适用于所有 CRUD 列表编排页（含 admin、admin-lite、zfw 派生项目）：

- 页面容器：`ObPageContainer`
- 列表骨架：`ObTableBox`
- 主表组件：`ObTable`

```vue
<template>
  <ObPageContainer padding="0" overflow="hidden">
    <ObTableBox
      title="岗位管理"
      :columns="columns"
      placeholder="请输入岗位名称搜索"
      @search="tableSearch"
      @resetForm="resetForm(searchRef)"
    >
      <template #buttons>
        <el-button type="primary" @click="openCreate">新增</el-button>
      </template>

      <template #default="{ size, dynamicColumns }">
        <ObTable
          :size="size"
          :columns="dynamicColumns"
          :data="dataList"
          :pagination="pagination"
          :loading="loading"
          align-whole="left"
          table-layout="auto"
          adaptive
        >
          <template #operation="{ row }">
            <ObActionButtons>
              <el-button link type="primary" @click="openEdit(row)">编辑</el-button>
              <el-button link type="danger" @click="removeRow(row)">删除</el-button>
            </ObActionButtons>
          </template>
        </ObTable>
      </template>
    </ObTableBox>
  </ObPageContainer>
</template>
```

### 2.2 行操作按钮统一 `ObActionButtons`（必须）

适用场景：列表操作列（查看/编辑/授权/删除）。

- 统一折叠与优先级，减少页面层手写规则。
- 删除等危险操作放右侧并使用危险色按钮。
- 禁止在 `ObActionButtons` 里再套一层 `el-dropdown` 做二次折叠。

### 2.3 CRUD 弹窗/抽屉统一 `ObCrudContainer`（必须）

适用场景：新增、编辑、详情。

```vue
<template>
  <ObCrudContainer
    v-model="visible"
    :mode="mode"
    :title="title"
    container="drawer"
    :drawer-columns="2"
    @submit="submit"
  >
    <RoleForm v-if="visible" ref="formRef" v-model="formData" :mode="mode" />
  </ObCrudContainer>
</template>
```

### 2.4 例外场景（可用 `el-dialog`）

以下场景可保留 `el-dialog`：

- 纯展示型详情（无新增/编辑提交流程）。
- 分析类页面的临时钻取弹层（如统计明细查看）。

一旦进入 CRUD 流程（新增/编辑/提交/校验），必须回到 `ObCrudContainer`。

## 3) 高频坑（按影响排序）

### 3.1 配置语义混杂

- 现象：一个字段同时表达多个维度，配置读起来“像开盲盒”。
- 典型坑：把“系统范围”和“菜单来源”混在一个字段里，导致同事误解配置意图。
- 收口建议：系统范围与菜单来源拆成独立字段，避免隐式耦合。

### 3.2 目录结构额外套层

- 现象：迁移后目录比模板多一层或多组过渡目录。
- 典型坑：`views/System-sfss` 这类额外层级保留在 `modules/**` 下。
- 收口建议：对齐模板同层结构，模块根只保留必须契约文件和真实业务目录。

### 3.3 过渡中转层残留

- 现象：`pages/api/services` 等迁移期目录长期保留。
- 典型坑：同一能力在“新目录 + 过渡目录”双处维护。
- 收口建议：迁移完成即删除中转层，不保留“看起来兼容、实际增负担”的壳。

### 3.4 路由手工汇总

- 现象：每次加子模块都要手动改 `routes.ts` 的 import 列表。
- 典型坑：漏引入、顺序漂移、多人并行冲突。
- 收口建议：改为 `import.meta.glob` 自动收集并做稳定排序。

### 3.5 组件体系双轨并存

- 现象：`i*`（Element 二次封装）和 `Ob*` 同时存在。
- 典型坑：同类页面风格、行为、API 三套口径并行。
- 收口建议：业务页统一到 `Ob*`，禁止再做同构映射转发层。

### 3.6 接口链路未补齐

- 现象：登录可用但业务页接口不通。
- 典型坑：只代理 `/cmict`，遗漏 `/zfw`、`/zb` 等链路。
- 收口建议：迁移前列出全量接口前缀，按链路补齐代理与环境变量。

### 3.7 文档写成“过程复盘”而非“接手手册”

- 现象：文档很多，但同事不知道先看哪里、怎么做下一步。
- 典型坑：页面充满历史过程、术语混用、缺少可复制片段。
- 收口建议：只保留最终口径，示例优先代码块，并给出最小验证命令。

## 4) 可执行检查表（可直接照做）

### 迁移前

- [ ] 明确迁移边界：目录、路由、接口前缀、配置入口。
- [ ] 明确非目标：本轮不做的兼容与历史保留项。
- [ ] 明确统一口径：组件体系、路由装配方式、配置命名策略。

### 迁移中

- [ ] 目录保持与模板同层结构，不新增无收益中间层。
- [ ] 接口按真实前缀补全代理，联调变量一次配齐。
- [ ] 删除中转文件与过渡目录，不叠加“临时兼容壳”。
- [ ] 路由采用自动收集方案，避免手工维护 import 清单。
- [ ] CRUD 列表必须符合“三板斧 + 按钮组 + CRUD 容器”规范。

### 迁移后

- [ ] 跑目标 app 的 `typecheck + lint + lint:arch + test:run + build`。
- [ ] 改动文档后补跑 `pnpm -C apps/docs lint` 与 `pnpm -C apps/docs build`。
- [ ] 同步更新接手文档，确保同事能“按文档直接落地”。

### 推荐命令

```bash
# 1) 架构硬门禁（优先）
pnpm -C apps/<app-name> lint:arch

# 2) 扫描是否仍有 I* 组件残留
rg -n "<I[A-Z]|</I[A-Z]" apps/<app-name>/src/modules -g '*.vue'

# 3) 扫描 CRUD 模块是否直接使用 el-table
rg -n "<el-table" apps/<app-name>/src/modules -g '*.vue'

# 4) 扫描是否存在内联箭头事件
rg -n "@click=\"\(\) =>|@.*=\"\(\) =>" apps/<app-name>/src/modules -g '*.vue'
```

## 5) 对外解释模板（给同事）

### 为什么统一 `Ob*`，不再随意混用 Element 原生组件？

因为 `Ob*` 统一了交互、样式与维护口径，能显著降低并行开发时的分歧与返工。

### 为什么 CRUD 必须固定这套容器结构？

因为高度链、滚动行为、操作按钮折叠、弹层行为都依赖统一结构，拆开后最容易出现“页面能跑但体验不一致”的隐性问题。

### 为什么迁移后要删中转层？

中转层只适合短期过渡，保留到主线会造成双维护、排障链路变长、规则失焦。

## 6) 可继续完善项（建议排期）

1. 在 `lint:arch` 增加“CRUD 三板斧 + ObActionButtons + ObCrudContainer”更细粒度规则。
2. 在文档新增“迁移完成定义（DoD）”一页，把验收项做成可复制模板。
3. 在 `admin-lite` 内置一个 `CRUD Demo` 标准模块（可开关路由），用于迁移时直接复制骨架：
   `ObPageContainer + ObTableBox + ObTable + ObActionButtons + ObCrudContainer`。
4. 给 `new:app` 增加 CRUD 模块模板，默认生成与 `CRUD Demo` 同构的标准骨架，减少人工偏差。
5. 在 docs 增加“反例库（错误写法 -> 正确写法）”，让新同学更快建立边界感。

## 7) 相关文档

- [开发规范与维护](/guide/development)
- [admin 迁移红线](/guide/admin-agent-redlines)
- [admin-lite 迁移红线](/guide/admin-lite-agent-redlines)
- [CRUD 模块最佳实践](/guide/crud-module-best-practice)
- [CRUD 容器与 Hook](/guide/crud-container)
- [统一表格迁移指南](/guide/table-vxe-migration)
- [菜单与路由规范（Schema）](/guide/menu-route-spec)
- [admin-lite 后台基座](/guide/admin-lite-base-app)
