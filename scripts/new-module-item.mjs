import path from 'node:path';
import { promises as fs } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';

const MODULE_ID_REGEX = /^[a-z][a-z0-9-]*$/;
const ITEM_ID_REGEX = /^[a-z][a-z0-9-]*$/;
const APP_ID_REGEX = /^[a-z][a-z0-9-]*$/;

function toPascalCase(value) {
  return value
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');
}

function toCamelCase(value) {
  const pascal = toPascalCase(value);
  return pascal ? pascal.charAt(0).toLowerCase() + pascal.slice(1) : '';
}

function normalizeRoutePath(routePath) {
  const normalized = String(routePath || '').trim();
  if (!normalized) {
    return '';
  }
  return normalized.startsWith('/') ? normalized : `/${normalized}`;
}

function createUsage() {
  return [
    '用法: pnpm -C apps/<app-id> new:module:item <item-id> --module <module-id> [--title 页面标题] [--route 路由路径] [--dry-run]',
    '兼容模式: node scripts/new-module-item.mjs <item-id> --app <app-id> --module <module-id> ...'
  ].join('\n');
}

export function parseArgs(argv) {
  const args = {
    itemId: '',
    moduleId: '',
    appId: '',
    title: '',
    routePath: '',
    dryRun: false
  };

  const rest = [...argv];

  while (rest.length > 0) {
    const item = rest.shift();
    if (!item) {
      continue;
    }

    if (!item.startsWith('-')) {
      if (!args.itemId) {
        args.itemId = item;
        continue;
      }
      throw new Error(`未知参数: ${item}`);
    }

    if (item === '--dry-run') {
      args.dryRun = true;
      continue;
    }

    if (item.startsWith('--title=')) {
      args.title = item.slice('--title='.length).trim();
      continue;
    }

    if (item === '--title') {
      args.title = (rest.shift() || '').trim();
      continue;
    }

    if (item.startsWith('--route=')) {
      args.routePath = item.slice('--route='.length).trim();
      continue;
    }

    if (item === '--route') {
      args.routePath = (rest.shift() || '').trim();
      continue;
    }

    if (item.startsWith('--module=')) {
      args.moduleId = item.slice('--module='.length).trim();
      continue;
    }

    if (item === '--module') {
      args.moduleId = (rest.shift() || '').trim();
      continue;
    }

    if (item.startsWith('--app=')) {
      args.appId = item.slice('--app='.length).trim();
      continue;
    }

    if (item === '--app') {
      args.appId = (rest.shift() || '').trim();
      continue;
    }

    throw new Error(`未知参数: ${item}`);
  }

  return args;
}

function createFiles(params) {
  const {
    moduleId,
    itemId,
    title,
    routePath,
    routeName,
    pageName,
    recordType,
    apiName,
    queryType,
    formType,
    itemCamel,
    itemPascal
  } = params;

  return {
    'router/index.ts': `import { createAuthRouteMeta } from '@/router/meta';
import type { RouteRecordRaw } from 'vue-router';

export default [
  {
    path: '${routePath}',
    name: '${routeName}',
    component: async () => import('../list.vue'),
    meta: createAuthRouteMeta({
      title: '${title}',
      keepAlive: true
    })
  }
] satisfies RouteRecordRaw[];
`,
    'types.ts': `export interface ${recordType} {
  id: string;
  name: string;
  code: string;
  status: 0 | 1;
  updateTime: string;
}

export interface ${queryType} {
  keyword?: string;
  currentPage?: number;
  pageSize?: number;
}

export interface ${formType} {
  id?: string;
  name: string;
  code: string;
  status: 0 | 1;
}
`,
    'api.ts': `import { obHttp } from '@one-base-template/core';
import type { ${formType}, ${queryType} } from './types';

export const ${apiName} = {
  page(params: ${queryType}) {
    return obHttp().post('/api/${moduleId}/${itemId}/page', { data: params });
  },
  detail(id: string) {
    return obHttp().get('/api/${moduleId}/${itemId}/detail/' + id);
  },
  save(payload: ${formType}) {
    return obHttp().post('/api/${moduleId}/${itemId}/save', { data: payload });
  },
  remove(id: string) {
    return obHttp().post('/api/${moduleId}/${itemId}/remove/' + id);
  }
};
`,
    'form.ts': `import type { FormRules } from 'element-plus';
import type { ${formType} } from './types';

export function createDefault${itemPascal}Form(): ${formType} {
  return {
    name: '',
    code: '',
    status: 1
  };
}

export const ${itemCamel}FormRules: FormRules<${formType}> = {
  name: [{ required: true, message: '请输入名称', trigger: 'blur' }],
  code: [{ required: true, message: '请输入编码', trigger: 'blur' }]
};
`,
    'columns.tsx': `import type { TableColumnList } from '@one-base-template/ui';

const ${itemCamel}Columns: TableColumnList = [
  {
    label: '名称',
    prop: 'name',
    minWidth: 180,
    showOverflowTooltip: true
  },
  {
    label: '编码',
    prop: 'code',
    minWidth: 180,
    showOverflowTooltip: true
  },
  {
    label: '状态',
    prop: 'status',
    width: 120,
    slot: 'status'
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
    width: 200,
    align: 'right'
  }
];

export default ${itemCamel}Columns;
`,
    'const.ts': `export const ${itemCamel}StatusOptions = [
  { label: '启用', value: 1 },
  { label: '停用', value: 0 }
] as const;
`,
    'list.vue': `<script setup lang="ts">
import { ref } from 'vue';
import { Plus } from '@element-plus/icons-vue';
import ${itemCamel}Columns from './columns';
import type { ${recordType} } from './types';

defineOptions({
  name: '${pageName}'
});

const keyword = ref('');
const loading = ref(false);
const dataList = ref<${recordType}[]>([]);

function handleSearch(nextKeyword: string) {
  keyword.value = nextKeyword;
}

function handleCreate() {
  // 模板占位：后续按业务接入 ObCrudContainer + 表单提交流程
}
</script>

<template>
  <ObPageContainer padding="0" overflow="hidden">
    <ObTableBox
      :columns="${itemCamel}Columns"
      :keyword="keyword"
      placeholder="请输入关键字搜索"
      @search="handleSearch"
      @update:keyword="handleSearch"
    >
      <template #buttons>
        <el-button type="primary" :icon="Plus" @click="handleCreate">新增</el-button>
      </template>

      <template #default="{ size, dynamicColumns }">
        <ObTable
          :size="size"
          :loading="loading"
          :data="dataList"
          :columns="dynamicColumns"
          :pagination="false"
        />
      </template>
    </ObTableBox>
  </ObPageContainer>
</template>
`
  };
}

async function pathExists(targetPath) {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

function getPlannedFilePaths(itemDir, files) {
  return Object.keys(files).map((relativePath) => path.join(itemDir, relativePath));
}

async function writeFiles(itemDir, files) {
  for (const [relativePath, content] of Object.entries(files)) {
    const absolutePath = path.join(itemDir, relativePath);
    await fs.mkdir(path.dirname(absolutePath), { recursive: true });
    await fs.writeFile(absolutePath, content, 'utf-8');
  }
}

export async function scaffoldModuleItem(options) {
  const {
    rootDir,
    itemId,
    moduleId,
    appId,
    title: titleOption = '',
    routePath: routePathOption = '',
    dryRun = false
  } = options;

  if (!itemId) {
    throw new Error('缺少 item-id。');
  }

  if (!ITEM_ID_REGEX.test(itemId)) {
    throw new Error(`子业务名不合法: "${itemId}"。仅支持小写字母、数字、短横线，且必须字母开头。`);
  }

  if (!moduleId) {
    throw new Error('缺少 module-id。请通过 --module 传入模块目录名。');
  }

  if (!MODULE_ID_REGEX.test(moduleId)) {
    throw new Error(`模块名不合法: "${moduleId}"。仅支持小写字母、数字、短横线，且必须字母开头。`);
  }

  if (!appId) {
    throw new Error('缺少 app-id。请在子项目脚本中固定 --app，或手动传 --app <app-id>。');
  }

  if (!APP_ID_REGEX.test(appId)) {
    throw new Error(`应用名不合法: "${appId}"。仅支持小写字母、数字、短横线，且必须字母开头。`);
  }

  const itemPascal = toPascalCase(itemId);
  const modulePascal = toPascalCase(moduleId);
  const itemCamel = toCamelCase(itemId);
  const title = titleOption || `${itemPascal} 管理`;
  const routePath = normalizeRoutePath(routePathOption) || `/${moduleId}/${itemId}/index`;
  const routeName = `${modulePascal}${itemPascal}Page`;
  const pageName = `${modulePascal}${itemPascal}ListPage`;
  const recordType = `${itemPascal}Record`;
  const queryType = `${itemPascal}QueryParams`;
  const formType = `${itemPascal}Form`;
  const apiName = `${itemCamel}Api`;

  const moduleDir = path.join(rootDir, 'apps', appId, 'src/modules', moduleId);
  if (!(await pathExists(moduleDir))) {
    throw new Error(`未找到目标模块目录: ${moduleDir}。请先执行 new:module 创建模块骨架。`);
  }

  const itemDir = path.join(moduleDir, itemId);
  if (await pathExists(itemDir)) {
    throw new Error(`子业务目录已存在: ${itemDir}`);
  }

  const files = createFiles({
    moduleId,
    itemId,
    title,
    routePath,
    routeName,
    pageName,
    recordType,
    apiName,
    queryType,
    formType,
    itemCamel,
    itemPascal
  });

  const plannedFiles = getPlannedFilePaths(itemDir, files);

  if (dryRun) {
    return {
      created: false,
      dryRun: true,
      itemId,
      moduleId,
      appId,
      itemDir,
      plannedFiles
    };
  }

  await writeFiles(itemDir, files);

  return {
    created: true,
    dryRun: false,
    itemId,
    moduleId,
    appId,
    itemDir,
    plannedFiles
  };
}

async function main() {
  const scriptDir = path.dirname(fileURLToPath(import.meta.url));
  const rootDir = path.resolve(scriptDir, '..');
  const args = parseArgs(process.argv.slice(2));

  if (!args.itemId) {
    console.error(createUsage());
    process.exit(1);
  }

  const result = await scaffoldModuleItem({
    rootDir,
    itemId: args.itemId,
    moduleId: args.moduleId,
    appId: args.appId,
    title: args.title,
    routePath: args.routePath,
    dryRun: args.dryRun
  });

  if (result.dryRun) {
    console.log('[dry-run] 计划创建以下文件：');
    for (const filePath of result.plannedFiles) {
      console.log(`- ${filePath}`);
    }
    return;
  }

  console.log(`子业务创建完成：${result.itemDir}`);
}

const invokedPath = process.argv[1] ? pathToFileURL(path.resolve(process.argv[1])).href : '';

if (invokedPath === import.meta.url) {
  main().catch((error) => {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`创建子业务失败: ${message}`);
    process.exit(1);
  });
}
