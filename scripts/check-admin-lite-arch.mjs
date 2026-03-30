import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const targetExtensions = new Set(['.ts', '.tsx', '.vue']);
const importMetaEnvAllowList = new Set(['config/env.ts', 'utils/logger.ts']);

/**
 * @typedef {{ file: string; line: number; column: number; message: string }} Violation
 */

/**
 * @param {string} directory
 * @returns {Promise<string[]>}
 */
async function collectSourceFiles(directory) {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const absolutePath = path.join(directory, entry.name);
      if (entry.isDirectory()) {
        return collectSourceFiles(absolutePath);
      }
      if (entry.isFile() && targetExtensions.has(path.extname(entry.name))) {
        return [absolutePath];
      }
      return [];
    })
  );
  return files.flat();
}

/**
 * @param {string} text
 * @param {number} index
 */
function getLineColumn(text, index) {
  let line = 1;
  let lineStart = 0;
  for (let i = 0; i < index; i += 1) {
    if (text.charCodeAt(i) === 10) {
      line += 1;
      lineStart = i + 1;
    }
  }
  return { line, column: index - lineStart + 1 };
}

/**
 * @param {string} file
 * @param {string} content
 * @param {RegExp} pattern
 * @param {string} message
 * @param {Violation[]} violations
 */
function pushViolations(file, content, pattern, message, violations) {
  for (const match of content.matchAll(pattern)) {
    const index = match.index ?? 0;
    pushViolationByIndex(file, content, index, message, violations);
  }
}

/**
 * @param {string} file
 * @param {string} content
 * @param {number} index
 * @param {string} message
 * @param {Violation[]} violations
 */
function pushViolationByIndex(file, content, index, message, violations) {
  const position = getLineColumn(content, index);
  violations.push({
    file,
    line: position.line,
    column: position.column,
    message
  });
}

const staticImportPattern = /\bimport\s+(?:type\s+)?(?:[\w*\s{},]*\s+from\s*)?['"]([^'"]+)['"]/g;
const dynamicImportPattern = /\bimport\s*\(\s*['"]([^'"]+)['"]\s*\)/g;
const trimImportExtensionPattern = /\.(?:[cm]?tsx?|jsx?|vue)$/;

/**
 * @param {string} importSource
 */
function normalizeImportSource(importSource) {
  return importSource.split(/[?#]/)[0]?.replaceAll('\\', '/') ?? importSource;
}

/**
 * @param {string} relativePath
 * @param {string} importSource
 */
function resolveImportPath(relativePath, importSource) {
  const source = normalizeImportSource(importSource);
  if (source.startsWith('@/')) {
    return source.slice(2);
  }
  if (source.startsWith('./') || source.startsWith('../')) {
    const baseDir = path.posix.dirname(relativePath);
    return path.posix.normalize(path.posix.join(baseDir, source));
  }
  return null;
}

/**
 * @param {string} relativePath
 */
function normalizeResolvedPath(relativePath) {
  return relativePath.replace(trimImportExtensionPattern, '');
}

/**
 * @param {string} relativePath
 */
function resolveOwnerModuleName(relativePath) {
  const match = relativePath.match(/^modules\/([^/]+)\//);
  return match?.[1] ?? null;
}

/**
 * @param {string} resolvedPath
 */
function resolveTargetModuleName(resolvedPath) {
  const normalized = normalizeResolvedPath(resolvedPath);
  const match = normalized.match(/^modules\/([^/]+)\//);
  return match?.[1] ?? null;
}

/**
 * @param {string} resolvedPath
 */
function isInfraHttpPath(resolvedPath) {
  const normalized = normalizeResolvedPath(resolvedPath);
  return normalized === 'infra/http' || normalized.startsWith('infra/http/');
}

/**
 * @param {string} content
 * @returns {Array<{ source: string; index: number }>}
 */
function collectImportSources(content) {
  const imports = [];
  for (const match of content.matchAll(staticImportPattern)) {
    const source = match[1];
    if (!source) {
      continue;
    }
    imports.push({ source, index: match.index ?? 0 });
  }

  for (const match of content.matchAll(dynamicImportPattern)) {
    const source = match[1];
    if (!source) {
      continue;
    }
    imports.push({ source, index: match.index ?? 0 });
  }

  return imports;
}

/**
 * @param {string} relativePath
 */
function isDirectInfraHttpGuardedFile(relativePath) {
  if (relativePath.startsWith('pages/') || relativePath.startsWith('components/')) {
    return true;
  }
  return /^modules\/[^/]+\/(pages|components|stores)\//.test(relativePath);
}

/**
 * @param {string} relativePath
 */
function isBootstrapScopedFile(relativePath) {
  return relativePath.startsWith('bootstrap/') || relativePath === 'config/env.ts';
}

/**
 * @param {string} relativePath
 */
function isGlobalInstallScopedFile(relativePath) {
  return isBootstrapScopedFile(relativePath) || relativePath === 'main.ts';
}

/**
 * @param {string} relativePath
 */
function isModuleSourceFile(relativePath) {
  return relativePath.startsWith('modules/');
}

/**
 * @param {string} relativePath
 */
function isCrudListPage(relativePath) {
  return /^modules\/[^/]+(?:\/[^/]+)*\/list\.vue$/.test(relativePath);
}

/**
 * @param {string} relativePath
 */
function isModuleApiFile(relativePath) {
  return /^modules\/[^/]+(?:\/[^/]+)*\/api\.ts$/.test(relativePath);
}

function parseArgs(argv) {
  const args = {
    appId: 'admin-lite'
  };

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (token === '--app') {
      const nextValue = argv[index + 1];
      if (!nextValue) {
        throw new Error('参数 --app 缺少应用名。');
      }
      args.appId = nextValue;
      index += 1;
      continue;
    }
    throw new Error(`未知参数: ${token}`);
  }

  return args;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const appDir = path.join(rootDir, 'apps', args.appId);
  const appSrcDir = path.join(appDir, 'src');

  try {
    await fs.access(appSrcDir);
  } catch {
    throw new Error(`未找到应用源码目录: apps/${args.appId}/src`);
  }

  const files = await collectSourceFiles(appSrcDir);
  /** @type {Violation[]} */
  const violations = [];

  for (const absolutePath of files) {
    const relativePath = path.relative(appSrcDir, absolutePath).replaceAll(path.sep, '/');
    const content = await fs.readFile(absolutePath, 'utf8');
    const importSources = collectImportSources(content);
    const ownerModuleName = resolveOwnerModuleName(relativePath);

    if (!importMetaEnvAllowList.has(relativePath)) {
      pushViolations(
        absolutePath,
        content,
        /import\.meta\.env\b/g,
        "禁止直接使用 import.meta.env，请改为通过 '@/config/env' 的 getAppEnv/buildEnv 读取。",
        violations
      );
    }

    if (ownerModuleName) {
      for (const item of importSources) {
        const resolvedPath = resolveImportPath(relativePath, item.source);
        if (!resolvedPath) {
          continue;
        }
        const targetModuleName = resolveTargetModuleName(resolvedPath);
        if (!targetModuleName || targetModuleName === ownerModuleName) {
          continue;
        }
        pushViolationByIndex(
          absolutePath,
          content,
          item.index,
          '禁止模块间直接依赖，请通过 services/types/core/ui 暴露公共能力。',
          violations
        );
      }
    }

    if (isDirectInfraHttpGuardedFile(relativePath)) {
      for (const item of importSources) {
        const resolvedPath = resolveImportPath(relativePath, item.source);
        if (!resolvedPath || !isInfraHttpPath(resolvedPath)) {
          continue;
        }
        pushViolationByIndex(
          absolutePath,
          content,
          item.index,
          '禁止在页面/组件/store 直接引用 infra/http，请改用 service 或在 API 层通过 @one-base-template/core 的 obHttp() 获取。',
          violations
        );
      }
    }

    if (!isBootstrapScopedFile(relativePath)) {
      pushViolations(
        absolutePath,
        content,
        /import\s*\{[^}]*\bcreateApp\b[^}]*\}\s*from\s*['"]vue['"]/gs,
        '禁止在业务模块创建 Vue App，请在 src/bootstrap 中集中处理启动逻辑。',
        violations
      );
      pushViolations(
        absolutePath,
        content,
        /import\s*\{[^}]*\b(createPinia|setActivePinia)\b[^}]*\}\s*from\s*['"]pinia['"]/gs,
        '禁止在业务模块初始化 Pinia，请在 src/bootstrap 中集中安装。',
        violations
      );
      pushViolations(
        absolutePath,
        content,
        /import\s*\{[^}]*\b(createRouter|createWebHistory)\b[^}]*\}\s*from\s*['"]vue-router['"]/gs,
        '禁止在业务模块创建 Router，请在 src/bootstrap/index.ts 中集中创建。',
        violations
      );
    }

    if (!isGlobalInstallScopedFile(relativePath)) {
      pushViolations(
        absolutePath,
        content,
        /\bapp\.(use|component|directive|mixin|provide)\s*\(/g,
        '禁止在业务模块安装全局能力，请在 src/bootstrap 或 src/main.ts(beforeMount) 中统一处理。',
        violations
      );
    }

    pushViolations(
      absolutePath,
      content,
      /\bapp\._context\b/g,
      '禁止依赖 Vue 私有 API app._context，请通过显式参数传递 appContext。',
      violations
    );

    if (isModuleSourceFile(relativePath)) {
      pushViolations(
        absolutePath,
        content,
        /import\s*\{[^}]*\bElMessage\b[^}]*\}\s*from\s*['"]element-plus['"]/gs,
        "modules 业务代码禁止直接使用 ElMessage，请改为 '@one-base-template/ui' 的 message 封装。",
        violations
      );
      pushViolations(
        absolutePath,
        content,
        /import\s*\{[^}]*\bElMessageBox\b[^}]*\}\s*from\s*['"]element-plus['"]/gs,
        "modules 业务代码禁止直接使用 ElMessageBox，请改为 '@one-base-template/ui' 的 obConfirm 封装。",
        violations
      );
    }

    if (isCrudListPage(relativePath)) {
      pushViolations(
        absolutePath,
        content,
        /<\s*el-table\b/gi,
        'CRUD list.vue 禁止使用 el-table，请统一使用 ObVxeTable。',
        violations
      );
      pushViolations(
        absolutePath,
        content,
        /<\s*el-dialog\b/gi,
        'CRUD list.vue 禁止直接使用 el-dialog，请统一使用 ObCrudContainer。',
        violations
      );
      pushViolations(
        absolutePath,
        content,
        /<\s*el-upload\b/gi,
        'CRUD list.vue 禁止直接编排 el-upload，请将上传能力下沉到表单/领域组件或复用 ObImportUpload。',
        violations
      );
      pushViolations(
        absolutePath,
        content,
        /@\w+(?::[\w-]+)?\s*=\s*(?:"[^"]*=>[^"]*"|'[^']*=>[^']*')/g,
        'CRUD list.vue 禁止在模板事件中使用内联箭头函数，请改为显式 handler（如 @click="handleXxx(row)"）。',
        violations
      );
    }

    if (isModuleApiFile(relativePath)) {
      pushViolations(
        absolutePath,
        content,
        /export\s+type\s*\{[^}]+\}\s*from\s*['"]\.\/types['"]/gs,
        'api.ts 禁止从 ./types 做类型中转导出；请在业务文件中直接从 types.ts 导入类型。',
        violations
      );
      pushViolations(
        absolutePath,
        content,
        /\b(?:const|let|var)\s+\w+\s*=\s*obHttp\(\)\s*;?/g,
        'api.ts 禁止 `const http = obHttp()` 这类中间变量；请直接使用 obHttp().get/post/...。',
        violations
      );
      pushViolations(
        absolutePath,
        content,
        /\bfunction\s+\w+\s*\([^)]*\)\s*\{\s*return\s+obHttp\(\)\s*;?\s*\}/gs,
        'api.ts 禁止封装 getHttp() 返回 obHttp()；请直接使用 obHttp().get/post/...。',
        violations
      );
      pushViolations(
        absolutePath,
        content,
        /\b(?:const|let|var)\s+\w+\s*=\s*\([^)]*\)\s*=>\s*obHttp\(\)\s*;?/g,
        'api.ts 禁止箭头函数包装 obHttp()；请直接使用 obHttp().get/post/...。',
        violations
      );
    }
  }

  if (violations.length === 0) {
    console.log(`${args.appId} 架构边界检查通过。`);
    return;
  }

  console.error(`${args.appId} 架构边界检查失败，共 ${violations.length} 处问题：`);
  for (const violation of violations) {
    const filePath = path.relative(rootDir, violation.file).replaceAll(path.sep, '/');
    console.error(`- ${filePath}:${violation.line}:${violation.column} ${violation.message}`);
  }
  process.exit(1);
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`架构边界检查执行失败：${message}`);
  process.exit(1);
});
