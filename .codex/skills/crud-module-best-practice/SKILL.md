---
name: crud-module-best-practice
description: Build and standardize Vue CRUD modules for this monorepo using the Position module pattern. Use when creating or refactoring admin pages that include list/search/pagination/create/edit/detail/delete flows in `apps/admin/src/modules/**`, especially when implementing `api.ts`, `form.ts`, `columns.tsx`, `list.vue`, and form/search subcomponents.
---

# Crud Module Best Practice

## Overview

Use this skill to generate consistent CRUD modules that match one-base-template conventions.
Follow Position module patterns first, then adapt entity fields and backend contracts.
Current admin baseline: the orchestration page file is `list.vue`; older materials that mention `page.vue` only describe the page responsibility, not the current filename contract.

## Quick Start

1. Read `references/position-crud-blueprint.md`.
2. Locate the target module path under `apps/admin/src/modules`.
3. Create or update:
   - `api.ts`
   - `form.ts`
   - `composables/use<Entity>PageState.ts` (page state orchestration)
   - `columns.tsx`
   - `list.vue`
   - `components/*EditForm.vue`
   - `components/*SearchForm.vue`
4. Wire route registration in module `routes.ts`.
5. Update docs in `apps/docs` when behavior or conventions change.
6. Run verification commands before completion.

Route anti-miss checklist:

- Every new or migrated `*/list.vue` must be registered in module `routes.ts` in the same change.
- Every route component target must exist on disk (no dangling import path).
- For `UserManagement` role domain, always verify both routes exist before claiming migration done:
  - `角色管理`: `/system/role/management`
  - `角色分配`: `/system/role/assign`

## Standard Workflow

### 1) Reuse Position architecture

Keep the feature-first layout:

```text
<entity>/
├── api.ts
├── form.ts
├── columns.tsx
├── composables/
│   └── use<Entity>PageState.ts
├── list.vue
└── components/
    ├── <Entity>EditForm.vue
    └── <Entity>SearchForm.vue
```

### 2) Keep list page orchestration thin

In `list.vue`, only orchestrate:

- `use<Entity>PageState()` grouped state
- template bindings
- slots and event wiring

Do not scatter field cleaning or payload mapping in page handlers.

### 3) Centralize mapping in form.ts

Always define:

- `default<Form>`
- `<entity>FormRules`
- `to<Entity>Form(detail)`
- `to<Entity>Payload(form)`

### 4) Standard API contracts

In `api.ts`, keep explicit types and stable names:

- `BizResponse<T>`
- `<Entity>Record`
- `<Entity>PageParams` / `<Entity>PageData`
- `<Entity>SavePayload`
- `page/add/update/remove/checkUnique` (or semantically equivalent)

### 4.1) Route anti-miss guard (must-check)

Before completion, run a route coverage check for changed modules:

- compare newly added/updated `list.vue` files with `routes.ts` entries
- ensure no route points to missing `.vue` files
- if role domain is touched in `UserManagement`, confirm both `management` and `assign` routes are present

### 4.2) useTable response adapter compatibility (must-check)

When module pages rely on global `useTable` defaults, ensure `responseAdapter` supports both:

- paged payloads: `{ data: { records/list/rows/items, total/totalCount/count } }`
- tree/list payloads: `{ code: 200, data: [] }` (direct array in `data`)

If backend returns `data` as a direct array but adapter only reads `data.records/list/...`,
table data becomes empty even when network response is non-empty.

Default project baseline:

- update `apps/admin/src/config/ui.ts` (`appTableResponseAdapter`) first
- only use page-level `responseAdapter` override for exceptional modules

### 5) Use unified UI composition

Default composition for `adminManagement` modules:

- `PageContainer`
- `OneTableBar`
- `ObTable`
- `ObCrudContainer`
- `ObActionButtons` for operation column when applicable

### 6) Enforce submission and delete behavior

Use this sequence:

- `obConfirm.warn(...)` before delete
- `deleteRow(...)` via `useTable`
- `message.success/error` for user feedback
- `onSearch(false)` after create/edit success

### 7) Action column and confirm conventions

- If `ObActionButtons` is used, do not add extra manual `el-dropdown` in the page.
- Do not call `ElMessageBox` directly in UserManagement modules; use `obConfirm` wrappers.

### 7.1) Table alignment conventions

Use these defaults in `columns.tsx`:

- header alignment: always left (`headerAlign: 'left'` baseline)
- numeric columns (count/amount): right aligned (`align: 'right'`)
- action column: right aligned (`align: 'right'`, usually `fixed: 'right'`)
- regular text/status columns: left aligned (`align: 'left'`)

### 8) Extract non-CRUD complexity into composables

Move these into module-level composables:

- batch status / reset password confirmations
- import/download orchestration helpers
- input-confirm delete helpers
- label map and view-only behavior helpers

Keep `list.vue` focused on CRUD orchestration and event wiring.

### 8.1) State grouping semantics

- `editor`: only CRUD edit state (`visible/mode/title/submitting/form/uniqueCheck`)
- `options`: dictionaries, tree options, select options
- `table`: list/pagination/search form
- `actions`: events and side-effect methods

Do not place `formOptions` under `editor`.

### 9) Left-tree page layout baseline

For pages with left tree + right table:

- Prefer `PageContainer` with `#left` slot and `leftWidth`
- Use `ObTree` for tree rendering
- Leaf labels should only show tooltip when text overflows

For `adminManagement` tree tables (`ObTable` + `useTable`) also enforce:

- tree display column must set `treeNode: true`
- verify `searchApi` + response adapter path can parse `code=200,data=[]` correctly
- if interface has data but table is empty, check adapter parsing before checking DOM/layout

## Do / Don't

Do:

- Reuse Position naming and structure.
- Keep type definitions close to API functions.
- Keep page file focused on orchestration.
- Update docs when conventions change.

Don't:

- Put backend field adaptation inside templates or click handlers.
- Create ad-hoc container state instead of `useCrudContainer`.
- Duplicate global error logic unless a page has special error semantics.

## Verification

Run at least:

```bash
pnpm -C apps/admin typecheck
pnpm -C apps/admin lint
pnpm -C apps/docs build
```

If the change touches shared packages, also run:

```bash
pnpm -C packages/ui typecheck
pnpm -C packages/utils typecheck
```

## References

- See `references/position-crud-blueprint.md` for concrete file-by-file blueprint and checklists.
