import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const adminSrcDir = path.join(rootDir, 'apps/admin/src');
const targetExtensions = new Set(['.ts', '.tsx', '.vue']);
const importMetaEnvAllowList = new Set(['infra/env.ts', 'config/platform-config.ts', 'shared/logger.ts']);

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
    const position = getLineColumn(content, index);
    violations.push({
      file,
      line: position.line,
      column: position.column,
      message,
    });
  }
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
  return relativePath.startsWith('bootstrap/') || relativePath === 'infra/env.ts';
}

async function main() {
  const files = await collectSourceFiles(adminSrcDir);
  /** @type {Violation[]} */
  const violations = [];

  for (const absolutePath of files) {
    const relativePath = path.relative(adminSrcDir, absolutePath).replaceAll(path.sep, '/');
    const content = await fs.readFile(absolutePath, 'utf8');

    if (!importMetaEnvAllowList.has(relativePath)) {
      pushViolations(
        absolutePath,
        content,
        /import\.meta\.env\b/g,
        "禁止直接使用 import.meta.env，请改为通过 '@/infra/env' 的 getAppEnv/buildEnv 读取。",
        violations
      );
    }

    if (relativePath.startsWith('modules/')) {
      pushViolations(
        absolutePath,
        content,
        /['"]@\/modules\/[^'"]+['"]/g,
        '禁止模块间直接依赖，请通过 shared/core/ui 暴露公共能力。',
        violations
      );
    }

    if (isDirectInfraHttpGuardedFile(relativePath)) {
      pushViolations(
        absolutePath,
        content,
        /['"]@\/infra\/http['"]/g,
        "禁止在页面/组件/store 直接引用 infra/http，请改用 service 或 shared/api。",
        violations
      );
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
        '禁止在业务模块创建 Router，请在 src/bootstrap/router.ts 中创建。',
        violations
      );
      pushViolations(
        absolutePath,
        content,
        /\bapp\.(use|component|directive|mixin|provide)\s*\(/g,
        '禁止在业务模块安装全局能力，请到 src/bootstrap 中统一处理。',
        violations
      );
    }

    pushViolations(
      absolutePath,
      content,
      /\bapp\._context\b/g,
      "禁止依赖 Vue 私有 API app._context，请通过显式参数传递 appContext。",
      violations
    );
  }

  if (violations.length === 0) {
    console.log('admin 架构边界检查通过。');
    return;
  }

  console.error(`admin 架构边界检查失败，共 ${violations.length} 处问题：`);
  for (const violation of violations) {
    const filePath = path.relative(rootDir, violation.file).replaceAll(path.sep, '/');
    console.error(`- ${filePath}:${violation.line}:${violation.column} ${violation.message}`);
  }
  process.exit(1);
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`admin 架构边界检查执行失败：${message}`);
  process.exit(1);
});
