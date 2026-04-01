# Position CRUD Blueprint

## 1. Reference Files

- `/Users/haoqiuzhi/code/one-base-template/apps/admin/src/modules/UserManagement/position/list.vue`
- `/Users/haoqiuzhi/code/one-base-template/apps/admin/src/modules/UserManagement/position/api.ts`
- `/Users/haoqiuzhi/code/one-base-template/apps/admin/src/modules/UserManagement/position/form.ts`
- `/Users/haoqiuzhi/code/one-base-template/apps/admin/src/modules/UserManagement/position/columns.tsx`
- `/Users/haoqiuzhi/code/one-base-template/apps/admin/src/modules/UserManagement/position/components/PositionEditForm.vue`
- `/Users/haoqiuzhi/code/one-base-template/apps/admin/src/modules/UserManagement/position/components/PositionSearchForm.vue`

## 2. Directory Contract

```text
<module>/<entity>/
├── api.ts
├── form.ts
├── actions.ts
├── columns.tsx
├── list.vue
└── components/
    ├── <Entity>EditForm.vue
    └── <Entity>SearchForm.vue
```

## 3. File Responsibilities

### `api.ts`

- Define response envelope and entity-related types.
- Keep request builders close to API functions.
- Trim text query parameters where needed.
- Export a single `<entity>Api` object.

Recommended signatures:

- `page(params)`
- `add(data)`
- `update(data)`
- `remove(id)`
- `checkUnique(params)` if needed

### `form.ts`

- Own form model defaults and rule definitions.
- Own data mapping functions:
  - `to<Entity>Form(detail)`
  - `to<Entity>Payload(form)`
- Normalize strings and numbers in one place.

### `columns.tsx`

- Keep static column schema only.
- Use `slot: 'operation'` for action column.
- Prefer `minWidth` for text columns.
- Alignment baseline:
  - header: left align
  - count/amount numeric columns: right align
  - operation column: right align
  - other regular columns: left align

### `components/*SearchForm.vue`

- Implement only advanced filter UI.
- Use `defineModel` for two-way binding.
- Expose `resetFields` for drawer reset integration.

### `components/*EditForm.vue`

- Render fields only.
- Expose `CrudFormLike` methods (`validate/resetFields/clearValidate`).
- Do not call APIs directly.

### `list.vue`

- Compose:
  - `PageContainer`
  - `OneTableBar`
  - `ObTable`
  - `ObCrudContainer`
- Handle:
  - `useTable` setup
  - `useCrudContainer` setup
  - action button event wiring
- Keep business logic orchestration-only.
- Do not keep complex non-CRUD business flows inline; move them to `actions.ts`.

### `actions.ts`

- Hold non-CRUD business helpers and orchestration:
  - confirm wrappers (`obConfirm`) and cancellation detection
  - batch operation helper functions
  - display mapping helpers (label map, option mapping)
  - import/download helper logic

## 4. useTable Pattern

Baseline options:

- `searchApi`
- `searchForm`
- `paginationFlag`
- `deleteApi`
- `deletePayloadBuilder`
- `onDeleteSuccess`
- `onDeleteError`

Response adapter baseline (important):

- `useTable` global/default `responseAdapter` must support two structures:
  - paged: `{ data: { records/list/rows/items, total... } }`
  - non-paged: `{ code: 200, data: [...] }`
- For `data` direct-array responses, adapter must map it to `records` explicitly.
- Recommended first fix point: `apps/admin/src/config/ui.ts` (`appTableResponseAdapter`), then use page-level override only when necessary.

Standard output usage:

- `loading`
- `dataList`
- `pagination`
- `onSearch`
- `deleteRow`
- `handleSizeChange`
- `handleCurrentChange`

## 5. useCrudContainer Pattern

Baseline options:

- `entityName`
- `createForm`
- `formRef`
- `loadDetail`
- `mapDetailToForm`
- `beforeSubmit`
- `submit`
- `onSuccess`

Standard mode behavior:

- `crud.openCreate()` for create
- `crud.openEdit(row)` for edit
- `crud.openDetail(row)` for detail
- `crud.readonly` controls detail mode disabling

## 6. Delete and Submit UX

Delete:

1. `obConfirm.warn(...)`
2. `deleteRow(row)`
3. `message.success/error`

Rules:

- Do not call `ElMessageBox` directly in UserManagement modules.
- If using `ObActionButtons`, do not add another manual `el-dropdown` in the page.

Submit:

1. form validate
2. map payload in `beforeSubmit`
3. call `submit`
4. success toast + refresh list

## 7. Naming Guidance

Use short verb+noun forms:

- `tableSearchByName`
- `handleDelete`
- `onResetSearch`
- `to<Entity>Payload`

Avoid over-abstracted naming chains.

## 8. New CRUD Module Checklist

1. Copy Position directory skeleton.
2. Replace type fields in `api.ts` and `form.ts`.
3. Replace table columns in `columns.tsx`.
4. Implement form/search components with `defineModel`.
5. Wire `useTable + useCrudContainer` in `list.vue`.
6. Register route entry in module `routes.ts`.
7. Update docs under `apps/docs` if conventions changed.
8. Run verification commands.

## 9. Left Tree + Table Layout

When the page has a left organization tree:

1. Use `PageContainer` `#left` slot with `leftWidth`.
2. Render tree with `ObTree`.
3. Keep leaf label tooltip conditional on real overflow only.
4. In tree table columns, set `treeNode: true` on the tree display column.
5. For admin modules, keep the table side on `ObTable`; do not introduce `ObVxeTable` in new or migrated pages.
6. If API response has data but table is empty, prioritize checking response-adapter mapping path before DOM/layout diagnosis.
