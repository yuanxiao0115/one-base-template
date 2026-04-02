import path from 'node:path';
import { promises as fs } from 'node:fs';
import { pathToFileURL } from 'node:url';

const MODULE_ID_REGEX = /^[a-z][a-z0-9-]*$/;
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

function createUsage() {
  return '用法: pnpm new:module <module-id> [--app app-id] [--title 模块标题] [--route 路由前缀] [--dry-run]';
}

export function parseArgs(argv) {
  const args = {
    moduleId: '',
    appId: 'admin',
    title: '',
    routeBase: '',
    dryRun: false
  };

  const rest = [...argv];
  args.moduleId = rest.shift() || '';

  while (rest.length > 0) {
    const item = rest.shift();
    if (!item) {
      continue;
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
      args.routeBase = item.slice('--route='.length).trim();
      continue;
    }

    if (item === '--route') {
      args.routeBase = (rest.shift() || '').trim();
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
  const { moduleId, pageName, pageFileName, title, routeBase, apiName, serviceName, moduleVar } =
    params;

  return {
    'index.ts': `import type { AppModuleManifest, AppModuleManifestMeta } from '@one-base-template/core';
import layoutRoutes from './routes';

export const moduleMeta = {
  id: '${moduleId}',
  version: '1',
  moduleTier: 'core',
  enabledByDefault: true
} as const satisfies AppModuleManifestMeta;

const ${moduleVar}: AppModuleManifest = {
  ...moduleMeta,
  apiNamespace: '${moduleId}',
  routes: {
    layout: layoutRoutes
  }
};

export default ${moduleVar};
`,
    'routes.ts': `import type { RouteRecordRaw } from 'vue-router';

export default [
  {
    path: '${routeBase}/index',
    name: '${pageName}',
    component: () => import('./pages/${pageFileName}'),
    meta: {
      title: '${title}',
      keepAlive: true
    }
  }
] satisfies RouteRecordRaw[];
`,
    [`pages/${pageFileName}`]: `<script setup lang="ts">
defineOptions({
  name: '${pageName}'
});
</script>

<template>
  <el-card>
    <template #header>
      <div class="font-medium">${title}</div>
    </template>
    <p class="text-sm text-[var(--el-text-color-regular)]">
      这是 ${moduleId} 模块默认首页，请按业务需求替换页面内容。
    </p>
  </el-card>
</template>
`,
    'api/endpoints.ts': `export const ${apiName}Endpoints = {
  list: '/api/${moduleId}/list'
} as const;
`,
    'api/client.ts': `import { obHttp } from '@one-base-template/core';
import { ${apiName}Endpoints } from './endpoints';

export const ${apiName}Api = {
  list() {
    return obHttp().get(${apiName}Endpoints.list);
  }
};
`,
    [`services/${moduleId}-service.ts`]: `import { ${apiName}Api } from '../api/client';

export const ${serviceName} = {
  list() {
    return ${apiName}Api.list();
  }
};
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

function getPlannedFilePaths(moduleDir, files) {
  return Object.keys(files).map((relativePath) => path.join(moduleDir, relativePath));
}

async function writeFiles(moduleDir, files) {
  for (const [relPath, content] of Object.entries(files)) {
    const absPath = path.join(moduleDir, relPath);
    await fs.mkdir(path.dirname(absPath), { recursive: true });
    await fs.writeFile(absPath, content, 'utf-8');
  }
}

export async function scaffoldModule(options) {
  const {
    rootDir,
    moduleId,
    appId: appIdOption = 'admin',
    title: titleOption = '',
    routeBase: routeBaseOption = '',
    dryRun = false
  } = options;

  if (!moduleId) {
    throw new Error('缺少 module-id。');
  }

  if (!MODULE_ID_REGEX.test(moduleId)) {
    throw new Error(`模块名不合法: "${moduleId}"。仅支持小写字母、数字、短横线，且必须字母开头。`);
  }
  if (!appIdOption) {
    throw new Error('缺少 app-id。');
  }
  if (!APP_ID_REGEX.test(appIdOption)) {
    throw new Error(
      `应用名不合法: "${appIdOption}"。仅支持小写字母、数字、短横线，且必须字母开头。`
    );
  }

  const routeBase = routeBaseOption || moduleId;
  const pascal = toPascalCase(moduleId);
  const camel = toCamelCase(moduleId);
  const title = titleOption || `${pascal} 模块`;
  const pageName = `${pascal}Index`;
  const pageFileName = `${pascal}IndexPage.vue`;
  const moduleVar = `${camel}Module`;
  const apiName = `${camel}Api`;
  const serviceName = `${camel}Service`;

  const appModulesDir = path.join(rootDir, 'apps', appIdOption, 'src/modules');
  if (!(await pathExists(appModulesDir))) {
    throw new Error(`未找到目标应用模块目录: ${appModulesDir}`);
  }
  const moduleDir = path.join(appModulesDir, moduleId);

  if (await pathExists(moduleDir)) {
    throw new Error(`模块目录已存在: ${moduleDir}`);
  }

  const files = createFiles({
    moduleId,
    pageName,
    pageFileName,
    title,
    routeBase,
    apiName,
    serviceName,
    moduleVar
  });

  const plannedFiles = getPlannedFilePaths(moduleDir, files);
  if (dryRun) {
    return {
      created: false,
      dryRun: true,
      moduleId,
      appId: appIdOption,
      moduleDir,
      plannedFiles
    };
  }

  await writeFiles(moduleDir, files);

  return {
    created: true,
    dryRun: false,
    moduleId,
    appId: appIdOption,
    moduleDir,
    plannedFiles
  };
}

async function main() {
  const rootDir = process.cwd();
  const args = parseArgs(process.argv.slice(2));

  if (!args.moduleId) {
    console.error(createUsage());
    process.exit(1);
  }

  const result = await scaffoldModule({
    rootDir,
    moduleId: args.moduleId,
    appId: args.appId,
    title: args.title,
    routeBase: args.routeBase,
    dryRun: args.dryRun
  });

  if (result.dryRun) {
    console.log('[dry-run] 计划创建以下文件：');
    for (const filePath of result.plannedFiles) {
      console.log(`- ${filePath}`);
    }
    return;
  }

  console.log(`模块创建完成：${result.moduleDir}`);
}

const invokedPath = process.argv[1] ? pathToFileURL(path.resolve(process.argv[1])).href : '';

if (invokedPath === import.meta.url) {
  main().catch((error) => {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`创建模块失败: ${message}`);
    process.exit(1);
  });
}
