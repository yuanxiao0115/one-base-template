import path from 'node:path';
import { promises as fs } from 'node:fs';
import { cp } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';

const APP_ID_REGEX = /^[a-z][a-z0-9-]*$/;
const TEXT_FILE_EXTENSIONS = new Set([
  '.ts',
  '.tsx',
  '.js',
  '.mjs',
  '.cjs',
  '.vue',
  '.json',
  '.html',
  '.md',
  '.css',
  '.scss',
  '.yml',
  '.yaml'
]);

export function toPascalCase(value) {
  return value
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');
}

function toRuntimeAppPascal(value) {
  return value.endsWith('App') ? value : `${value}App`;
}

function createUsage() {
  return '用法: pnpm new:app <app-id> [--with-crud-starter] [--dry-run]';
}

export function parseArgs(argv) {
  const args = {
    appId: '',
    dryRun: false,
    withCrudStarter: false
  };

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (!token) {
      continue;
    }
    if (!token.startsWith('--') && !args.appId) {
      args.appId = token;
      continue;
    }
    if (token === '--dry-run') {
      args.dryRun = true;
      continue;
    }
    if (token === '--with-crud-starter' || token === '--withCrudStarter') {
      args.withCrudStarter = true;
      continue;
    }
    throw new Error(`未知参数: ${token}`);
  }

  return args;
}

async function pathExists(targetPath) {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

async function collectTextFiles(directory) {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const absolutePath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await collectTextFiles(absolutePath)));
      continue;
    }
    if (entry.isFile() && TEXT_FILE_EXTENSIONS.has(path.extname(entry.name))) {
      files.push(absolutePath);
    }
  }

  return files;
}

function shouldCopySource(sourcePath) {
  const normalized = sourcePath.replaceAll('\\', '/');
  return !normalized.includes('/dist/') && !normalized.includes('/node_modules/');
}

function createTransformContext(appId) {
  const appPascal = toPascalCase(appId);
  const runtimeAppPascal = toRuntimeAppPascal(appPascal);
  const buildName = `${appPascal}BuildConfig`;
  const fmtName = `${appPascal}FmtConfig`;
  const pluginFactoryName = `create${appPascal}Plugins`;
  const prunePluginFactoryName = `create${appPascal}PruneLoginHtmlAssetsPlugin`;

  return {
    appId,
    appPascal,
    runtimeAppPascal,
    directReplacements: [
      ['StartAdminLiteAppBeforeMountContext', `Start${runtimeAppPascal}BeforeMountContext`],
      ['StartAdminLiteAppOptions', `Start${runtimeAppPascal}Options`],
      ['bootstrapAdminLiteApp', `bootstrap${runtimeAppPascal}`],
      ['startAdminLiteApp', `start${runtimeAppPascal}`],
      ['StartAdminLiteApp', `Start${runtimeAppPascal}`],
      ['adminLiteBuildConfig', buildName],
      ['adminLiteFmtConfig', fmtName],
      ['createAdminLitePlugins', pluginFactoryName],
      ['createAdminLitePruneLoginHtmlAssetsPlugin', prunePluginFactoryName],
      ['vite-admin-lite-build-config', `vite-${appId}-build-config`],
      ["appcode: 'admin-lite'", `appcode: '${appId}'`],
      ["Appcode: 'admin-lite'", `Appcode: '${appId}'`],
      ['one-base-template-admin-lite', `one-base-template-${appId}`],
      ['admin-lite-test', `${appId}-test`],
      ['admin-lite-login', `${appId}-login`],
      ['<title>admin-lite</title>', `<title>${appId}</title>`],
      ["appName: 'admin-lite'", `appName: '${appId}'`],
      ['admin-lite-runtime', `${appId}-runtime`],
      ['admin-lite-auth', `${appId}-auth`],
      ['admin-lite-app-shell', `${appId}-app-shell`],
      ['admin-lite-home', `${appId}-home`],
      ['admin-lite-log-management', `${appId}-log-management`],
      ['admin-lite-system-management', `${appId}-system-management`],
      ['/apps/admin-lite/src/modules/home/', `/apps/${appId}/src/modules/home/`],
      ['/apps/admin-lite/src/modules/LogManagement/', `/apps/${appId}/src/modules/LogManagement/`],
      [
        '/apps/admin-lite/src/modules/SystemManagement/',
        `/apps/${appId}/src/modules/SystemManagement/`
      ],
      [
        '/apps/admin-lite/src/modules/adminManagement/',
        `/apps/${appId}/src/modules/adminManagement/`
      ],
      ['admin-lite-styles', `${appId}-styles`],
      ['apps/admin-lite', `apps/${appId}`],
      ['pnpm -C apps/admin-lite', `pnpm -C apps/${appId}`],
      ['/admin-lite/', `/${appId}/`]
    ]
  };
}

function applyAppTextTransforms(content, context) {
  let nextContent = content;

  for (const [from, to] of context.directReplacements) {
    nextContent = nextContent.split(from).join(to);
  }

  nextContent = nextContent.replace(/AdminLite/g, context.appPascal);
  nextContent = nextContent.replaceAll(
    `apps/docs/docs/guide/${context.appId}-agent-redlines.md`,
    'apps/docs/docs/guide/admin-lite-agent-redlines.md'
  );

  return nextContent;
}

async function transformCopiedFiles(targetDir, context, dryRun) {
  const files = await collectTextFiles(targetDir);

  if (dryRun) {
    return files;
  }

  for (const absolutePath of files) {
    const content = await fs.readFile(absolutePath, 'utf8');
    const nextContent = applyAppTextTransforms(content, context);
    if (nextContent !== content) {
      await fs.writeFile(absolutePath, nextContent, 'utf8');
    }
  }

  return files;
}

async function renameStyleEntry(targetDir, appId, dryRun) {
  const sourcePath = path.join(targetDir, 'src/bootstrap/admin-lite-styles.ts');
  const targetPath = path.join(targetDir, `src/bootstrap/${appId}-styles.ts`);

  if (!(await pathExists(sourcePath))) {
    return null;
  }

  if (!dryRun) {
    await fs.rename(sourcePath, targetPath);
  }

  return targetPath;
}

async function renameBuildConfigEntry(targetDir, appId, dryRun) {
  const sourcePath = path.join(targetDir, 'build/vite-admin-lite-build-config.ts');
  const targetPath = path.join(targetDir, `build/vite-${appId}-build-config.ts`);

  if (!(await pathExists(sourcePath))) {
    return null;
  }

  if (!dryRun) {
    await fs.rename(sourcePath, targetPath);
  }

  return targetPath;
}

async function updateGeneratedPackageJson(targetDir, appId, dryRun) {
  const packageJsonPath = path.join(targetDir, 'package.json');
  const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf8'));
  packageJson.name = appId;
  packageJson.scripts = packageJson.scripts || {};
  packageJson.scripts['lint:arch'] = `node ../../scripts/check-admin-lite-arch.mjs --app ${appId}`;

  if (!dryRun) {
    await fs.writeFile(packageJsonPath, `${JSON.stringify(packageJson, null, 2)}\n`, 'utf8');
  }
}

function createStarterCrudFiles() {
  return {
    'src/modules/starter-crud/manifest.ts': `import type { AppModuleManifestMeta } from '@one-base-template/core';

export const moduleManifest = {
  id: 'starter-crud',
  version: '1',
  moduleTier: 'optional',
  enabledByDefault: false
} as const satisfies AppModuleManifestMeta;

export default moduleManifest;
`,
    'src/modules/starter-crud/module.ts': `import type { AppModuleManifest } from '@one-base-template/core';
import { moduleManifest } from './manifest';
import layoutRoutes from './routes';

const starterCrudModule: AppModuleManifest = {
  ...moduleManifest,
  apiNamespace: 'starter-crud',
  routes: {
    layout: layoutRoutes
  }
};

export default starterCrudModule;
`,
    'src/modules/starter-crud/routes.ts': `import { createAuthRouteMeta } from '@/router/meta';
import type { RouteRecordRaw } from 'vue-router';

export default [
  {
    path: 'starter/crud',
    name: 'StarterCrudPage',
    component: async () => import('./list.vue'),
    meta: createAuthRouteMeta({
      title: 'Starter CRUD',
      icon: 'ep:edit-pen',
      order: 30,
      keepAlive: false
    })
  }
] as RouteRecordRaw[];
`,
    'src/modules/starter-crud/api.ts': `export type StarterCrudStatus = 0 | 1;

export interface StarterCrudRecord {
  id: string;
  code: string;
  name: string;
  owner: string;
  status: StarterCrudStatus;
  remark: string;
  updateTime: string;
}

export interface StarterCrudPageParams {
  keyword?: string;
  owner?: string;
  status?: StarterCrudStatus | '';
  currentPage?: number;
  pageSize?: number;
}

export interface StarterCrudPageData {
  records: StarterCrudRecord[];
  total: number;
  currentPage: number;
  pageSize: number;
}

export interface StarterCrudSavePayload {
  id?: string;
  code: string;
  name: string;
  owner: string;
  status: StarterCrudStatus;
  remark: string;
}

const seedRecords: StarterCrudRecord[] = [
  {
    id: 'starter-1',
    code: 'starter-alpha',
    name: 'Starter Alpha',
    owner: '平台组',
    status: 1,
    remark: '用于演示默认 CRUD 流程。',
    updateTime: '2026-03-27 09:00:00'
  },
  {
    id: 'starter-2',
    code: 'starter-beta',
    name: 'Starter Beta',
    owner: '业务组',
    status: 0,
    remark: '可直接替换成真实业务字段。',
    updateTime: '2026-03-27 09:30:00'
  },
  {
    id: 'starter-3',
    code: 'starter-gamma',
    name: 'Starter Gamma',
    owner: '运营组',
    status: 1,
    remark: '保留本地内存闭环，方便首次迁移验证。',
    updateTime: '2026-03-27 10:00:00'
  }
];

let mockRecords = seedRecords.map((item) => ({ ...item }));

function formatNow() {
  const now = new Date();
  const pad = (value: number) => String(value).padStart(2, '0');
  const datePart = [now.getFullYear(), pad(now.getMonth() + 1), pad(now.getDate())].join('-');
  const timePart = [pad(now.getHours()), pad(now.getMinutes()), pad(now.getSeconds())].join(':');
  return datePart + ' ' + timePart;
}

function normalizeText(value: string | number | null | undefined) {
  return String(value || '').trim();
}

function cloneRecord(record: StarterCrudRecord): StarterCrudRecord {
  return { ...record };
}

function normalizePageParams(params: StarterCrudPageParams = {}) {
  return {
    keyword: normalizeText(params.keyword).toLowerCase(),
    owner: normalizeText(params.owner).toLowerCase(),
    status:
      params.status === '' || params.status == null
        ? ''
        : (Number(params.status) === 0 ? 0 : 1) as StarterCrudStatus,
    currentPage: Number(params.currentPage || 1),
    pageSize: Number(params.pageSize || 10)
  };
}

export async function pageStarterCrud(params: StarterCrudPageParams = {}): Promise<StarterCrudPageData> {
  const normalized = normalizePageParams(params);
  const filtered = mockRecords.filter((item) => {
    const matchesKeyword =
      !normalized.keyword ||
      item.code.toLowerCase().includes(normalized.keyword) ||
      item.name.toLowerCase().includes(normalized.keyword);
    const matchesOwner = !normalized.owner || item.owner.toLowerCase().includes(normalized.owner);
    const matchesStatus = normalized.status === '' || item.status === normalized.status;
    return matchesKeyword && matchesOwner && matchesStatus;
  });

  const startIndex = (normalized.currentPage - 1) * normalized.pageSize;
  const pageItems = filtered.slice(startIndex, startIndex + normalized.pageSize).map(cloneRecord);

  return {
    records: pageItems,
    total: filtered.length,
    currentPage: normalized.currentPage,
    pageSize: normalized.pageSize
  };
}

export async function getStarterCrudDetail(id: string): Promise<StarterCrudRecord> {
  const matched = mockRecords.find((item) => item.id === id);
  if (!matched) {
    throw new Error('未找到对应示例记录');
  }
  return cloneRecord(matched);
}

export async function saveStarterCrud(payload: StarterCrudSavePayload): Promise<StarterCrudRecord> {
  const normalizedStatus: StarterCrudStatus = Number(payload.status) === 0 ? 0 : 1;
  const normalizedPayload = {
    id: payload.id,
    code: normalizeText(payload.code),
    name: normalizeText(payload.name),
    owner: normalizeText(payload.owner),
    status: normalizedStatus,
    remark: normalizeText(payload.remark)
  };

  if (!normalizedPayload.code || !normalizedPayload.name || !normalizedPayload.owner) {
    throw new Error('编码、名称、负责人不能为空');
  }

  const duplicated = mockRecords.find(
    (item) => item.code === normalizedPayload.code && item.id !== normalizedPayload.id
  );
  if (duplicated) {
    throw new Error('示例编码已存在，请更换后再保存');
  }

  const baseRecord = {
    code: normalizedPayload.code,
    name: normalizedPayload.name,
    owner: normalizedPayload.owner,
    status: normalizedPayload.status,
    remark: normalizedPayload.remark
  };

  if (normalizedPayload.id) {
    const targetIndex = mockRecords.findIndex((item) => item.id === normalizedPayload.id);
    if (targetIndex < 0) {
      throw new Error('待更新记录不存在');
    }
    const currentRecord = mockRecords[targetIndex];
    if (!currentRecord) {
      throw new Error('待更新记录不存在');
    }

    const nextRecord: StarterCrudRecord = {
      ...currentRecord,
      ...baseRecord,
      updateTime: formatNow()
    };
    mockRecords.splice(targetIndex, 1, nextRecord);
    return cloneRecord(nextRecord);
  }

  const createdRecord: StarterCrudRecord = {
    ...baseRecord,
    id: 'starter-' + Date.now().toString(36),
    updateTime: formatNow()
  };
  mockRecords.unshift(createdRecord);
  return cloneRecord(createdRecord);
}

export async function removeStarterCrud(id: string): Promise<void> {
  const targetIndex = mockRecords.findIndex((item) => item.id === id);
  if (targetIndex < 0) {
    throw new Error('待删除记录不存在');
  }
  mockRecords.splice(targetIndex, 1);
}

export function resetStarterCrudMockData() {
  mockRecords = seedRecords.map((item) => ({ ...item }));
}
`,
    'src/modules/starter-crud/form.ts': `import type { FormRules } from 'element-plus';
import type { StarterCrudRecord, StarterCrudSavePayload, StarterCrudStatus } from './api';

export interface StarterCrudForm {
  id?: string;
  code: string;
  name: string;
  owner: string;
  status: StarterCrudStatus;
  remark: string;
}

export interface StarterCrudSearchForm {
  keyword: string;
  owner: string;
  status: StarterCrudStatus | '';
}

export const starterCrudStatusOptions = [
  { label: '启用', value: 1 },
  { label: '停用', value: 0 }
] as const;

export function createDefaultStarterCrudForm(): StarterCrudForm {
  return {
    code: '',
    name: '',
    owner: '',
    status: 1,
    remark: ''
  };
}

export function createDefaultStarterCrudSearchForm(): StarterCrudSearchForm {
  return {
    keyword: '',
    owner: '',
    status: ''
  };
}

export const starterCrudFormRules: FormRules<StarterCrudForm> = {
  code: [{ required: true, message: '请输入示例编码', trigger: 'blur' }],
  name: [{ required: true, message: '请输入示例名称', trigger: 'blur' }],
  owner: [{ required: true, message: '请输入负责人', trigger: 'blur' }]
};

export function toStarterCrudForm(detail?: StarterCrudRecord | null): StarterCrudForm {
  if (!detail) {
    return createDefaultStarterCrudForm();
  }

  return {
    id: detail.id,
    code: detail.code,
    name: detail.name,
    owner: detail.owner,
    status: detail.status,
    remark: detail.remark
  };
}

export function toStarterCrudPayload(form: StarterCrudForm): StarterCrudSavePayload {
  return {
    id: form.id,
    code: form.code.trim(),
    name: form.name.trim(),
    owner: form.owner.trim(),
    status: form.status,
    remark: form.remark.trim()
  };
}
`,
    'src/modules/starter-crud/columns.tsx': `import type { TableColumnList } from '@one-base-template/ui';

export const starterCrudColumns: TableColumnList = [
  {
    label: '示例编码',
    prop: 'code',
    minWidth: 180,
    showOverflowTooltip: true
  },
  {
    label: '示例名称',
    prop: 'name',
    minWidth: 180,
    showOverflowTooltip: true
  },
  {
    label: '负责人',
    prop: 'owner',
    minWidth: 140
  },
  {
    label: '状态',
    prop: 'status',
    slot: 'status',
    width: 110
  },
  {
    label: '更新时间',
    prop: 'updateTime',
    minWidth: 180
  },
  {
    label: '操作',
    slot: 'operation',
    fixed: 'right',
    width: 260,
    align: 'right'
  }
];

export default starterCrudColumns;
`,
    'src/modules/starter-crud/composables/useStarterCrudPageState.ts': `import { reactive, ref } from 'vue';
import { message, obConfirm, type CrudFormLike, type TablePagination } from '@one-base-template/ui';
import {
  getStarterCrudDetail,
  pageStarterCrud,
  removeStarterCrud,
  saveStarterCrud,
  type StarterCrudRecord
} from '../api';
import {
  createDefaultStarterCrudForm,
  createDefaultStarterCrudSearchForm,
  toStarterCrudForm,
  toStarterCrudPayload,
  type StarterCrudSearchForm
} from '../form';
import starterCrudColumns from '../columns';

interface SearchFormExpose {
  resetFields?: () => void;
}

function createTablePagination(): TablePagination {
  return {
    total: 0,
    pageSize: 10,
    currentPage: 1,
    background: true,
    pageSizes: [10, 20, 50],
    layout: 'total, sizes, prev, pager, next, jumper'
  };
}

function isConfirmCanceled(error: unknown) {
  return error === 'cancel' || error === 'close';
}

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

export function useStarterCrudPageState() {
  const refs = {
    tableRef: ref<unknown>(null),
    searchRef: ref<SearchFormExpose>(),
    editFormRef: ref<CrudFormLike>()
  };

  const table = reactive({
    loading: false,
    searchForm: reactive<StarterCrudSearchForm>(createDefaultStarterCrudSearchForm()),
    dataList: [] as StarterCrudRecord[],
    tableColumns: starterCrudColumns,
    tablePagination: reactive(createTablePagination())
  });

  const editor = reactive({
    crudVisible: false,
    crudMode: 'create' as 'create' | 'edit' | 'detail',
    crudTitle: '新增示例记录',
    crudSubmitting: false,
    crudReadonly: false,
    crudForm: createDefaultStarterCrudForm()
  });

  function syncEditorMeta() {
    editor.crudReadonly = editor.crudMode === 'detail';
    if (editor.crudMode === 'create') {
      editor.crudTitle = '新增示例记录';
      return;
    }
    if (editor.crudMode === 'edit') {
      editor.crudTitle = '编辑示例记录';
      return;
    }
    editor.crudTitle = '查看示例记录';
  }

  async function searchTable() {
    table.loading = true;
    try {
      const response = await pageStarterCrud({
        ...table.searchForm,
        currentPage: table.tablePagination.currentPage,
        pageSize: table.tablePagination.pageSize
      });
      table.dataList = response.records;
      table.tablePagination.total = response.total;
      table.tablePagination.currentPage = response.currentPage;
      table.tablePagination.pageSize = response.pageSize;
    } finally {
      table.loading = false;
    }
  }

  function onKeywordUpdate(keyword: string) {
    table.searchForm.keyword = keyword;
  }

  function tableSearch(keyword = table.searchForm.keyword) {
    table.searchForm.keyword = keyword;
    table.tablePagination.currentPage = 1;
    void searchTable();
  }

  function onResetSearch() {
    refs.searchRef.value?.resetFields?.();
    Object.assign(table.searchForm, createDefaultStarterCrudSearchForm());
    table.tablePagination.currentPage = 1;
    void searchTable();
  }

  function handleSizeChange(pageSize: number) {
    table.tablePagination.pageSize = pageSize;
    table.tablePagination.currentPage = 1;
    void searchTable();
  }

  function handleCurrentChange(currentPage: number) {
    table.tablePagination.currentPage = currentPage;
    void searchTable();
  }

  function closeEditor() {
    editor.crudVisible = false;
    editor.crudSubmitting = false;
    refs.editFormRef.value?.clearValidate?.();
  }

  function openCreate() {
    editor.crudMode = 'create';
    editor.crudForm = createDefaultStarterCrudForm();
    syncEditorMeta();
    refs.editFormRef.value?.clearValidate?.();
    editor.crudVisible = true;
  }

  async function openEdit(row: StarterCrudRecord) {
    editor.crudMode = 'edit';
    editor.crudForm = toStarterCrudForm(await getStarterCrudDetail(row.id));
    syncEditorMeta();
    refs.editFormRef.value?.clearValidate?.();
    editor.crudVisible = true;
  }

  async function openDetail(row: StarterCrudRecord) {
    editor.crudMode = 'detail';
    editor.crudForm = toStarterCrudForm(await getStarterCrudDetail(row.id));
    syncEditorMeta();
    refs.editFormRef.value?.clearValidate?.();
    editor.crudVisible = true;
  }

  async function confirmEditor() {
    if (editor.crudReadonly) {
      closeEditor();
      return;
    }

    const valid = await refs.editFormRef.value?.validate?.();
    if (valid === false) {
      return;
    }

    editor.crudSubmitting = true;
    try {
      await saveStarterCrud(toStarterCrudPayload(editor.crudForm));
      message.success(editor.crudMode === 'create' ? '新增示例记录成功' : '更新示例记录成功');
      closeEditor();
      table.tablePagination.currentPage = 1;
      await searchTable();
    } catch (error) {
      message.error(getErrorMessage(error, '保存示例记录失败'));
    } finally {
      editor.crudSubmitting = false;
    }
  }

  async function handleDelete(row: StarterCrudRecord) {
    try {
      await obConfirm.warn('是否确认删除示例记录「' + row.name + '」？', '删除确认');
      await removeStarterCrud(row.id);
      message.success('删除示例记录成功');
      if (table.dataList.length === 1 && table.tablePagination.currentPage > 1) {
        table.tablePagination.currentPage -= 1;
      }
      await searchTable();
    } catch (error) {
      if (isConfirmCanceled(error)) {
        return;
      }
      message.error(getErrorMessage(error, '删除示例记录失败'));
    }
  }

  syncEditorMeta();
  void searchTable();

  return {
    refs,
    table,
    editor,
    actions: {
      tableSearch,
      onKeywordUpdate,
      onResetSearch,
      handleSizeChange,
      handleCurrentChange,
      openCreate,
      openEdit,
      openDetail,
      confirmEditor,
      closeEditor,
      handleDelete
    }
  };
}
`,
    'src/modules/starter-crud/components/StarterCrudEditForm.vue': `<script setup lang="ts">
import { ref } from 'vue';
import type { FormInstance, FormRules } from 'element-plus';
import type { CrudFormLike } from '@one-base-template/ui';
import type { StarterCrudStatus } from '../api';
import type { StarterCrudForm } from '../form';

const props = defineProps<{
  rules: FormRules<StarterCrudForm>;
  disabled: boolean;
  statusOptions: ReadonlyArray<{ label: string; value: StarterCrudStatus }>;
}>();

const model = defineModel<StarterCrudForm>({ required: true });
const formRef = ref<FormInstance>();

defineExpose<CrudFormLike>({
  validate: (...args) => {
    const [callback] = args;
    if (callback) {
      return formRef.value?.validate?.(callback);
    }
    return formRef.value?.validate?.();
  },
  clearValidate: (...args) => formRef.value?.clearValidate?.(...args),
  resetFields: (...args) => formRef.value?.resetFields?.(...args)
});
</script>

<template>
  <el-form ref="formRef" label-position="top" :model="model" :rules="props.rules" :disabled="props.disabled">
    <el-form-item label="示例编码" prop="code">
      <el-input v-model.trim="model.code" maxlength="30" clearable placeholder="请输入示例编码" />
    </el-form-item>

    <el-form-item label="示例名称" prop="name">
      <el-input v-model.trim="model.name" maxlength="30" clearable placeholder="请输入示例名称" />
    </el-form-item>

    <el-form-item label="负责人" prop="owner">
      <el-input v-model.trim="model.owner" maxlength="20" clearable placeholder="请输入负责人" />
    </el-form-item>

    <el-form-item label="状态" prop="status">
      <el-radio-group v-model="model.status">
        <el-radio-button
          v-for="item in props.statusOptions"
          :key="item.value"
          :value="item.value"
        >
          {{ item.label }}
        </el-radio-button>
      </el-radio-group>
    </el-form-item>

    <el-form-item label="备注" prop="remark" class="ob-crud-container__item--full">
      <el-input
        v-model.trim="model.remark"
        type="textarea"
        :rows="4"
        maxlength="200"
        show-word-limit
        placeholder="请输入备注"
      />
    </el-form-item>
  </el-form>
</template>
`,
    'src/modules/starter-crud/components/StarterCrudSearchForm.vue': `<script setup lang="ts">
import { ref } from 'vue';
import type { FormInstance } from 'element-plus';
import type { StarterCrudStatus } from '../api';
import type { StarterCrudSearchForm } from '../form';

const props = defineProps<{
  statusOptions: ReadonlyArray<{ label: string; value: StarterCrudStatus }>;
}>();

const model = defineModel<StarterCrudSearchForm>({ required: true });
const formRef = ref<FormInstance>();

defineExpose({
  resetFields: () => formRef.value?.resetFields?.()
});
</script>

<template>
  <el-form ref="formRef" label-position="top" :model="model">
    <el-form-item label="负责人" prop="owner">
      <el-input v-model.trim="model.owner" clearable maxlength="20" placeholder="请输入负责人" />
    </el-form-item>

    <el-form-item label="状态" prop="status">
      <el-select v-model="model.status" clearable placeholder="请选择状态" class="w-full">
        <el-option
          v-for="item in props.statusOptions"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        />
      </el-select>
    </el-form-item>
  </el-form>
</template>
`,
    'src/modules/starter-crud/list.vue': `<script setup lang="ts">
import { reactive } from 'vue';
import { Plus } from '@element-plus/icons-vue';
import StarterCrudEditForm from './components/StarterCrudEditForm.vue';
import StarterCrudSearchForm from './components/StarterCrudSearchForm.vue';
import { starterCrudFormRules, starterCrudStatusOptions } from './form';
import { useStarterCrudPageState } from './composables/useStarterCrudPageState';

defineOptions({
  name: 'StarterCrudManagementPage'
});

const pageState = useStarterCrudPageState();
const { refs, actions } = pageState;
const table = reactive(pageState.table);
const editor = reactive(pageState.editor);
</script>

<template>
  <ObPageContainer padding="0" overflow="hidden">
    <ObTableBox
      title="Starter CRUD"
      :columns="table.tableColumns"
      placeholder="请输入示例名称或编码搜索"
      :keyword="table.searchForm.keyword"
      @search="actions.tableSearch"
      @update:keyword="actions.onKeywordUpdate"
      @reset-form="actions.onResetSearch"
    >
      <template #buttons>
        <el-button type="primary" :icon="Plus" @click="actions.openCreate">新增示例记录</el-button>
      </template>

      <template #default="{ size, dynamicColumns }">
        <ObVxeTable
          :ref="refs.tableRef"
          :size
          :loading="table.loading"
          :data="table.dataList"
          :columns="dynamicColumns"
          :pagination="table.tablePagination"
          @page-size-change="actions.handleSizeChange"
          @page-current-change="actions.handleCurrentChange"
        >
          <template #status="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'info'">
              {{ row.status === 1 ? '启用' : '停用' }}
            </el-tag>
          </template>

          <template #operation="{ row, size: actionSize }">
            <ObActionButtons>
              <el-button link type="primary" :size="actionSize" @click="actions.openEdit(row)">
                编辑
              </el-button>
              <el-button link type="primary" :size="actionSize" @click="actions.openDetail(row)">
                查看
              </el-button>
              <el-button link type="danger" :size="actionSize" @click="actions.handleDelete(row)">
                删除
              </el-button>
            </ObActionButtons>
          </template>
        </ObVxeTable>
      </template>

      <template #drawer>
        <StarterCrudSearchForm
          :ref="refs.searchRef"
          v-model="table.searchForm"
          :status-options="starterCrudStatusOptions"
        />
      </template>
    </ObTableBox>
  </ObPageContainer>

  <ObCrudContainer
    v-model="editor.crudVisible"
    container="drawer"
    :mode="editor.crudMode"
    :title="editor.crudTitle"
    :loading="editor.crudSubmitting"
    :show-cancel-button="!editor.crudReadonly"
    confirm-text="保存"
    :drawer-size="480"
    @confirm="actions.confirmEditor"
    @cancel="actions.closeEditor"
    @close="actions.closeEditor"
  >
    <StarterCrudEditForm
      :ref="refs.editFormRef"
      v-model="editor.crudForm"
      :rules="starterCrudFormRules"
      :disabled="editor.crudReadonly"
      :status-options="starterCrudStatusOptions"
    />
  </ObCrudContainer>
</template>
`
  };
}

async function writeFiles(rootDir, files, dryRun) {
  const fileEntries = Object.entries(files);
  if (dryRun) {
    return fileEntries.map(([relativePath]) => path.join(rootDir, relativePath));
  }

  const createdFiles = [];
  for (const [relativePath, content] of fileEntries) {
    const absolutePath = path.join(rootDir, relativePath);
    await fs.mkdir(path.dirname(absolutePath), { recursive: true });
    await fs.writeFile(absolutePath, content, 'utf8');
    createdFiles.push(absolutePath);
  }

  return createdFiles;
}

async function enableCrudStarter(targetDir, dryRun) {
  const createdFiles = await writeFiles(targetDir, createStarterCrudFiles(), dryRun);
  const platformConfigPath = path.join(targetDir, 'src/config/platform-config.ts');
  const platformConfig = await fs.readFile(platformConfigPath, 'utf8');
  const nextPlatformConfig = platformConfig.replace(
    /enabledModules:\s*\[\s*'home',\s*'admin-management',\s*'log-management',\s*'system-management'\s*\]/,
    "enabledModules: ['home', 'admin-management', 'log-management', 'system-management', 'starter-crud']"
  );

  if (!dryRun && nextPlatformConfig !== platformConfig) {
    await fs.writeFile(platformConfigPath, nextPlatformConfig, 'utf8');
  }

  return createdFiles;
}

export async function scaffoldApp(options) {
  const { rootDir, appId, dryRun = false, withCrudStarter = false } = options;

  if (!appId) {
    throw new Error('缺少 app-id。');
  }
  if (!APP_ID_REGEX.test(appId)) {
    throw new Error(`应用名不合法: "${appId}"。仅支持小写字母、数字、短横线，且必须字母开头。`);
  }

  const adminLiteDir = path.join(rootDir, 'apps/admin-lite');
  const targetDir = path.join(rootDir, 'apps', appId);

  if (!(await pathExists(adminLiteDir))) {
    throw new Error(`未找到基座目录: ${adminLiteDir}`);
  }
  if (await pathExists(targetDir)) {
    throw new Error(`目标目录已存在: ${targetDir}`);
  }

  const context = createTransformContext(appId);
  const plannedFiles = [];

  if (dryRun) {
    plannedFiles.push(
      targetDir,
      path.join(targetDir, `src/bootstrap/${appId}-styles.ts`),
      path.join(targetDir, `build/vite-${appId}-build-config.ts`)
    );
    if (withCrudStarter) {
      plannedFiles.push(path.join(targetDir, 'src/modules/starter-crud'));
    }

    return {
      created: false,
      dryRun: true,
      appId,
      targetDir,
      withCrudStarter,
      plannedFiles
    };
  }

  await cp(adminLiteDir, targetDir, {
    recursive: true,
    filter: shouldCopySource
  });

  plannedFiles.push(targetDir);
  const renamedStyleFile = await renameStyleEntry(targetDir, appId, false);
  if (renamedStyleFile) {
    plannedFiles.push(renamedStyleFile);
  }
  const renamedBuildConfigFile = await renameBuildConfigEntry(targetDir, appId, false);
  if (renamedBuildConfigFile) {
    plannedFiles.push(renamedBuildConfigFile);
  }

  await transformCopiedFiles(targetDir, context, false);
  await updateGeneratedPackageJson(targetDir, appId, false);

  let starterCrudFiles = [];
  if (withCrudStarter) {
    starterCrudFiles = await enableCrudStarter(targetDir, false);
    plannedFiles.push(...starterCrudFiles);
  }

  return {
    created: !dryRun,
    dryRun,
    appId,
    targetDir,
    withCrudStarter,
    plannedFiles
  };
}

async function main() {
  const rootDir = process.cwd();
  const args = parseArgs(process.argv.slice(2));

  if (!args.appId) {
    console.error(createUsage());
    process.exit(1);
  }

  const result = await scaffoldApp({
    rootDir,
    appId: args.appId,
    dryRun: args.dryRun,
    withCrudStarter: args.withCrudStarter
  });

  if (result.dryRun) {
    console.log('[dry-run] 计划生成新 app：');
    console.log(`- 目标目录: ${result.targetDir}`);
    console.log(`- 附带 CRUD starter: ${result.withCrudStarter ? '是' : '否'}`);
    console.log(`- 样式入口: src/bootstrap/${result.appId}-styles.ts`);
    if (result.withCrudStarter) {
      console.log('- 新增模块: src/modules/starter-crud');
    }
    return;
  }

  console.log(`新 app 已生成: ${result.targetDir}`);
  console.log(`启动命令: vp run --filter ${result.appId} dev`);
  console.log(
    `验证命令: pnpm -C apps/${result.appId} typecheck && pnpm -C apps/${result.appId} build`
  );
}

const invokedPath = process.argv[1] ? pathToFileURL(path.resolve(process.argv[1])).href : '';

if (invokedPath === import.meta.url) {
  main().catch((error) => {
    const message = error instanceof Error ? error.message : String(error);
    console.error(message);
    process.exit(1);
  });
}
