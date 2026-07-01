# @one-base-template/create-admin-lite

## 0.3.1

### Patch Changes

- 修复 `0.2.2` 官方模板项目升级到新版时，`AdminTopBar.vue` 与 baseline 测试被误判为用户冲突的问题；旧项目可通过 `upgrade` 自动补齐账号区无边框样式断言。

## 0.3.0

### Minor Changes

- d56ad1f: 生成项目默认提供顶栏个性设置入口，支持打开主题切换、主色微调和灰色模式，并让 upgrade/doctor 覆盖该模板能力。

### Patch Changes

- efe0a9b: 修复 admin-lite 独立项目未加载 UI 包 scoped 样式的问题。CLI 模板、doctor 与 upgrade 会检查并补齐 `@one-base-template/ui` dist 样式入口，UI 包新增 `./style` 样式导出供后续稳定消费。
- 优化 admin-lite 顶栏账号区与菜单搜索视觉：账号触发区移除边框和独立底色，菜单搜索触发器与结果激活态改为更克制的主题色层级。

## 0.2.2

### Patch Changes

- 修复 upgrade 在旧官方模板文件存在时误判冲突的问题；官方基线测试文件可安全更新到当前模板，用户自定义文件仍保持冲突保护。

## 0.2.1

### Patch Changes

- 修复 admin-lite 生成项目未声明 pnpm 版本的问题，模板与 upgrade 现在会补齐 `packageManager: pnpm@10.32.1`，避免 doctor 在本机默认 pnpm 版本偏低时误失败。

## 0.2.0

### Minor Changes

- a5695f0: 增强 admin-lite CLI 的仓外项目生产化能力：新增 doctor 自检命令，模板内置项目级模块脚手架和基线测试，upgrade 可安全补齐新增脚本与测试文件，并扩展发布前仓外生命周期验证。
- 7091929: 新增 admin-lite 已生成项目的保守 upgrade 能力，生成项目写入模板元信息，并支持 dry-run、指定来源版本、指定目标版本和冲突报告。

## 0.1.2

### Patch Changes

- 134058d: 修复 `@one-base-template/tag/style` 样式入口，确保独立项目能引入编译后的 tag 组件完整样式。
- 5fb849f: 修复独立项目模板的 Tailwind 扫描源，避免已发布 UI 包中的工具类未生成导致样式缺失。

## 0.1.1

### Patch Changes

- 8e97b56: 生成项目内置 @one-base-template scope registry 配置，避免公共依赖误走企业 one-package 仓库。

## 0.1.0

### Minor Changes

- 发布第二批公共运行时包，并新增 admin-lite 最小项目初始化 CLI。
