import path from 'node:path';
import { promises as fs } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';

const MODULE_ID_REGEX = /^[a-z][a-z0-9-]*$/;
const APP_ID_REGEX = /^[a-z][a-z0-9-]*$/;
const MODULE_TIER_VALUES = new Set(['core', 'optional']);

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

function normalizeRouteBase(routeBase) {
  return String(routeBase || '')
    .trim()
    .replace(/^\/+/, '')
    .replace(/\/+$/, '');
}

function normalizeRoutePath(routeBase) {
  const normalized = normalizeRouteBase(routeBase);
  return normalized ? `/${normalized}/index` : '/index';
}

function createUsage() {
  return [
    '用法: pnpm -C apps/<app-id> new:module <module-id> [--title 模块标题] [--route 路由前缀] [--tier core|optional] [--enabled-by-default] [--dry-run]',
    '兼容模式: node scripts/new-module.mjs <module-id> --app <app-id> ...'
  ].join('\n');
}

export function parseArgs(argv) {
  const args = {
    moduleId: '',
    appId: '',
    title: '',
    routeBase: '',
    moduleTier: 'optional',
    enabledByDefault: false,
    dryRun: false
  };

  const rest = [...argv];

  while (rest.length > 0) {
    const item = rest.shift();
    if (!item) {
      continue;
    }

    if (!item.startsWith('-')) {
      if (!args.moduleId) {
        args.moduleId = item;
        continue;
      }
      throw new Error(`未知参数: ${item}`);
    }

    if (item === '--dry-run') {
      args.dryRun = true;
      continue;
    }

    if (item === '--enabled-by-default') {
      args.enabledByDefault = true;
      continue;
    }

    if (item === '--core') {
      args.moduleTier = 'core';
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

    if (item.startsWith('--tier=')) {
      args.moduleTier = item.slice('--tier='.length).trim();
      continue;
    }

    if (item === '--tier') {
      args.moduleTier = (rest.shift() || '').trim();
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
    title,
    routePath,
    moduleVar,
    moduleTier,
    enabledByDefault,
    moduleIndexRouteName
  } = params;

  return {
    'index.ts': `import type { AppModuleManifest, AppModuleManifestMeta } from '@one-base-template/core';
import layoutRoutes from './routes';

export const moduleMeta = {
  id: '${moduleId}',
  version: '1',
  moduleTier: '${moduleTier}',
  enabledByDefault: ${enabledByDefault}
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
    'routes.ts': `import { createAuthRouteMeta } from '@/router/meta';
import { collectGlobRouteModules } from '@one-base-template/core';
import type { RouteRecordRaw } from 'vue-router';

const legacyModuleRoutes = collectGlobRouteModules({
  ...import.meta.glob<RouteRecordRaw[]>('./*/router/index.ts', {
    eager: true,
    import: 'default'
  }),
  ...import.meta.glob<RouteRecordRaw[]>('./*/router.ts', {
    eager: true,
    import: 'default'
  })
});

export default [
  {
    path: '${routePath}',
    name: '${moduleIndexRouteName}',
    component: async () => import('./index.vue'),
    meta: createAuthRouteMeta({
      title: '${title}',
      keepAlive: true
    })
  },
  ...legacyModuleRoutes
] satisfies RouteRecordRaw[];
`,
    'index.vue': `<script setup lang="ts">
defineOptions({
  name: '${moduleIndexRouteName}View'
});
</script>

<template>
  <el-card>
    <template #header>
      <div class="font-medium">${title}</div>
    </template>
    <p class="text-sm text-[var(--el-text-color-regular)]">
      该模块使用 legacy 聚合路由模板，子业务请通过 'pnpm -C apps/&lt;app-id&gt; new:module:item' 继续生成。
    </p>
  </el-card>
</template>
`,
    'README.md': `# ${title}

该模块为“模块级骨架”模板，默认包含：

- 'index.ts'：模块声明与 moduleMeta
- 'routes.ts'：legacy 聚合路由（collectGlobRouteModules + import.meta.glob）
- 'index.vue'：模块默认占位页

子业务建议按目录 './<feature>/router/index.ts' 或 './<feature>/router.ts' 落地，以便被聚合路由自动收集。
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
  for (const [relativePath, content] of Object.entries(files)) {
    const absolutePath = path.join(moduleDir, relativePath);
    await fs.mkdir(path.dirname(absolutePath), { recursive: true });
    await fs.writeFile(absolutePath, content, 'utf-8');
  }
}

export async function scaffoldModule(options) {
  const {
    rootDir,
    moduleId,
    appId,
    title: titleOption = '',
    routeBase: routeBaseOption = '',
    moduleTier = 'optional',
    enabledByDefault = false,
    dryRun = false
  } = options;

  if (!moduleId) {
    throw new Error('缺少 module-id。');
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

  if (!MODULE_TIER_VALUES.has(moduleTier)) {
    throw new Error(`不支持的模块层级: "${moduleTier}"。可选值：core / optional。`);
  }

  const routeBase = normalizeRouteBase(routeBaseOption || moduleId);
  const routePath = normalizeRoutePath(routeBase);
  const modulePascal = toPascalCase(moduleId);
  const moduleCamel = toCamelCase(moduleId);
  const title = titleOption || `${modulePascal} 模块`;
  const moduleIndexRouteName = `${modulePascal}Index`;
  const moduleVar = `${moduleCamel}Module`;

  const appModulesDir = path.join(rootDir, 'apps', appId, 'src/modules');
  if (!(await pathExists(appModulesDir))) {
    throw new Error(`未找到目标应用模块目录: ${appModulesDir}`);
  }

  const moduleDir = path.join(appModulesDir, moduleId);
  if (await pathExists(moduleDir)) {
    throw new Error(`模块目录已存在: ${moduleDir}`);
  }

  const files = createFiles({
    moduleId,
    title,
    routePath,
    moduleVar,
    moduleTier,
    enabledByDefault,
    moduleIndexRouteName
  });

  const plannedFiles = getPlannedFilePaths(moduleDir, files);

  if (dryRun) {
    return {
      created: false,
      dryRun: true,
      moduleId,
      appId,
      moduleDir,
      plannedFiles
    };
  }

  await writeFiles(moduleDir, files);

  return {
    created: true,
    dryRun: false,
    moduleId,
    appId,
    moduleDir,
    plannedFiles
  };
}

async function main() {
  const scriptDir = path.dirname(fileURLToPath(import.meta.url));
  const rootDir = path.resolve(scriptDir, '..');
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
    moduleTier: args.moduleTier,
    enabledByDefault: args.enabledByDefault,
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
