# 2026-03-09 CMS 内容模块全屏富文本改造（实施记录）

## 背景

用户要求仅在 `publicity/content` 模块中完成以下改造：

1. 新增 / 编辑 / 查看统一使用全屏弹层；
2. 正文改为富文本输入；
3. 附件上传改为真实上传链路，不再使用纯 URL 文本输入；
4. 对标老项目 `/Users/haoqiuzhi/code/sczfw/standard-oa-web-sczfw` 的同模块行为。

## 范围冻结

- **改造范围**：`apps/admin/src/modules/CmsManagement/content/**` 及其直接依赖。
- **必要扩展**：`packages/ui/src/components/container/CrudContainer.vue` 新增全屏 props。
- **不在本次范围**：封面图上传组件化（保留当前 URL 字段输入）。

## 实施方案

### 1) 容器层（全屏）

- 在内容页 `page.vue` 将 `ObCrudContainer` 切换为：
  - `container="dialog"`
  - `:dialog-fullscreen="true"`
- 在 UI 组件 `CrudContainer.vue` 增加 `dialogFullscreen` props 并透传到 `el-dialog` 的 `fullscreen`。

### 2) 富文本组件封装

- 新增 `apps/admin/src/components/rich-text/ObRichTextEditor.vue`：
  - 基于 `@wangeditor/editor` + `@wangeditor/editor-for-vue`；
  - 提供 `v-model` 与 `upload(payload)` 回调；
  - 统一处理空内容归一化、表单校验触发、图片/视频上传插入。

### 3) 上传 API 收口

- 在 `content/api.ts` 增加：
  - `uploadResource(file)`：调用 `/cmict/file/resource/upload`，返回 `joinUrl`；
  - `uploadAttachment(file)`：调用 `/cmict/file/upload-file`，返回附件对象。
- 上传返回兼容：
  - 支持 `{ code, data, message }` 包裹结构；
  - 兼容直接返回 data 对象。

### 4) 表单层改造

- 在 `ContentEditForm.vue`：
  - 正文：`textarea` -> `ObRichTextEditor`；
  - 查看态：`v-html` 预览正文；
  - 附件：多行 URL 文本 -> `el-upload`，上传后回填 `cmsArticleAttachmentList`；
  - 保留现有转载字段联动规则。

## 验证

- `pnpm -C apps/admin typecheck`
- `pnpm -C apps/admin lint`
- `pnpm -C apps/admin build`
- `pnpm -C apps/docs lint`
- `pnpm -C apps/docs build`

以上命令已通过。

## 风险与后续

- 当前封面图仍为 URL 输入，不是上传控件；如果需要与老项目进一步对齐，可在下一轮补 `UploadImg` 风格封装。
