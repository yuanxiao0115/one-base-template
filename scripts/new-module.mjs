import path from 'node:path';
import { promises as fs } from 'node:fs';

function toPascalCase(value) {
  return value
    .split('-')
    .filter(Boolean)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');
}

function toCamelCase(value) {
  const pascal = toPascalCase(value);
  return pascal ? pascal.charAt(0).toLowerCase() + pascal.slice(1) : '';
}

function parseArgs(argv) {
  const args = {
    moduleId: '',
    title: '',
    routeBase: '',
    dryRun: false
  };

  const rest = [...argv];
  args.moduleId = rest.shift() || '';

  while (rest.length > 0) {
    const item = rest.shift();
    if (!item) continue;

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
  }

  return args;
}

function createFiles(params) {
  const { moduleId, pageName, pageFileName, title, routeBase, apiName, serviceName, moduleVar } = params;

  return {
    'module.ts': `import type { AdminModuleManifest } from '@/router/types';
import layoutRoutes from './routes/layout';

const ${moduleVar}: AdminModuleManifest = {
  id: '${moduleId}',
  version: '1',
  enabledByDefault: true,
  apiNamespace: '${moduleId}',
  routes: {
    layout: layoutRoutes
  }
};

export default ${moduleVar};
`,
    'index.ts': `export { default as ${moduleVar} } from './module';
`,
    'routes.ts': `export { default } from './routes/layout';
`,
    'routes/layout.ts': `import type { RouteRecordRaw } from 'vue-router';

export default [
  {
    path: '${routeBase}/index',
    name: '${pageName}',
    component: () => import('../pages/${pageFileName}'),
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
    'api/client.ts': `import { getAppHttpClient } from '@/shared/api/http-client';
import { ${apiName}Endpoints } from './endpoints';

export const ${apiName}Api = {
  list() {
    return getAppHttpClient().get(${apiName}Endpoints.list);
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

async function writeFiles(moduleDir, files, dryRun) {
  const fileEntries = Object.entries(files);

  if (dryRun) {
    console.log('[dry-run] 计划创建以下文件：');
    for (const [relPath] of fileEntries) {
      console.log(`- ${path.join(moduleDir, relPath)}`);
    }
    return;
  }

  for (const [relPath, content] of fileEntries) {
    const absPath = path.join(moduleDir, relPath);
    await fs.mkdir(path.dirname(absPath), { recursive: true });
    await fs.writeFile(absPath, content, 'utf-8');
  }

  console.log(`模块创建完成：${moduleDir}`);
}

async function main() {
  const rootDir = process.cwd();
  const args = parseArgs(process.argv.slice(2));

  if (!args.moduleId) {
    console.error('用法: pnpm new:module <module-id> [--title 模块标题] [--route 路由前缀] [--dry-run]');
    process.exit(1);
  }

  if (!/^[a-z][a-z0-9-]*$/.test(args.moduleId)) {
    console.error(`模块名不合法: "${args.moduleId}"。仅支持小写字母、数字、短横线，且必须字母开头。`);
    process.exit(1);
  }

  const moduleId = args.moduleId;
  const routeBase = args.routeBase || moduleId;
  const pascal = toPascalCase(moduleId);
  const camel = toCamelCase(moduleId);
  const title = args.title || `${pascal} 模块`;
  const pageName = `${pascal}Index`;
  const pageFileName = `${pascal}IndexPage.vue`;
  const moduleVar = `${camel}Module`;
  const apiName = `${camel}Api`;
  const serviceName = `${camel}Service`;

  const moduleDir = path.join(rootDir, 'apps/admin/src/modules', moduleId);

  try {
    await fs.access(moduleDir);
    console.error(`模块目录已存在: ${moduleDir}`);
    process.exit(1);
  } catch {
    // 目录不存在，继续创建
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

  await writeFiles(moduleDir, files, args.dryRun);
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`创建模块失败: ${message}`);
  process.exit(1);
});
