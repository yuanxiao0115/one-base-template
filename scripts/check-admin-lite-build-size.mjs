import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { gzipSync } from 'node:zlib';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const adminLiteAssetsDir = path.join(rootDir, 'apps/admin-lite/dist/assets');

const sizeBudgets = [
  {
    name: 'iconify-ri chunk',
    pattern: /^iconify-ri-.*\.js$/,
    maxBytes: 1120 * 1024
  },
  {
    name: 'wangeditor chunk',
    pattern: /^wangeditor-.*\.js$/,
    maxBytes: 980 * 1024
  },
  {
    name: 'vxe chunk',
    pattern: /^vxe-.*\.js$/,
    maxBytes: 1080 * 1024
  },
  {
    name: 'element-plus chunk',
    pattern: /^element-plus-.*\.js$/,
    maxBytes: 720 * 1024
  },
  {
    name: 'page chunk',
    pattern: /^page-.*\.js$/,
    maxBytes: 920 * 1024
  }
];

const startupQueueBudgets = {
  dependencyMapPattern: /^admin-lite-app-shell-.*\.js$/,
  maxStartupJsCount: 22,
  maxStartupJsGzipBytes: 820 * 1024,
  tinyChunkMaxBytes: 12 * 1024,
  maxTinyChunkCount: 12
};

function formatKiB(bytes) {
  return `${(bytes / 1024).toFixed(1)} KiB`;
}

async function readAdminJsAssetSizes() {
  const entries = await fs.readdir(adminLiteAssetsDir, { withFileTypes: true });
  const jsFiles = entries
    .filter((entry) => entry.isFile() && entry.name.endsWith('.js'))
    .map((entry) => entry.name);

  return Promise.all(
    jsFiles.map(async (fileName) => {
      const absolutePath = path.join(adminLiteAssetsDir, fileName);
      const stats = await fs.stat(absolutePath);
      return {
        fileName,
        absolutePath,
        size: stats.size
      };
    })
  );
}

function getLargestMatchedAsset(assets, pattern) {
  return assets.filter((asset) => pattern.test(asset.fileName)).sort((a, b) => b.size - a.size)[0];
}

function parseViteDependencyMap(sourceCode) {
  const match = sourceCode.match(/m\.f\|\|\(m\.f=\[(?<list>[\s\S]*?)\]\)\)\)=>/);
  const rawList = match?.groups?.list;
  if (!rawList) {
    return null;
  }

  try {
    return JSON.parse(`[${rawList}]`);
  } catch {
    return null;
  }
}

function normalizeDependencyFileName(rawValue) {
  return String(rawValue).replace(/^\/?assets\//, '');
}

function parseBlockedPrefixesFromChunk(sourceCode) {
  const matches = [
    ...sourceCode.matchAll(
      /filter\(dep=>dep&&!((?:\[[\s\S]*?\]))\.some\(prefix=>dep\.startsWith\(prefix\)\)\)/g
    )
  ];

  return [
    ...new Set(
      matches.flatMap((match) => {
        try {
          const prefixes = JSON.parse(match[1]);
          return Array.isArray(prefixes) ? prefixes.filter((item) => typeof item === 'string') : [];
        } catch {
          return [];
        }
      })
    )
  ];
}

async function collectStartupDependencyJsFiles(assets) {
  const appShellAsset = getLargestMatchedAsset(assets, startupQueueBudgets.dependencyMapPattern);
  if (!appShellAsset) {
    return { appShellAsset: null, startupJsFiles: null };
  }

  const sourceCode = await fs.readFile(appShellAsset.absolutePath, 'utf8');
  const dependencies = parseViteDependencyMap(sourceCode);
  if (!dependencies) {
    return { appShellAsset, startupJsFiles: null };
  }

  const blockedPrefixes = parseBlockedPrefixesFromChunk(sourceCode);
  const startupJsFiles = [
    ...new Set(
      dependencies
        .filter((value) => typeof value === 'string' && value.endsWith('.js'))
        .filter(
          (value) =>
            !blockedPrefixes.some((prefix) => String(value).replace(/^\//, '').startsWith(prefix))
        )
        .map(normalizeDependencyFileName)
    )
  ];

  return { appShellAsset, startupJsFiles };
}

async function getTotalGzipBytes(assets) {
  const buffers = await Promise.all(assets.map((asset) => fs.readFile(asset.absolutePath)));
  return buffers.reduce((total, buffer) => total + gzipSync(buffer).byteLength, 0);
}

async function main() {
  try {
    await fs.access(adminLiteAssetsDir);
  } catch {
    console.error(
      '未找到 admin-lite 构建产物，请先执行 pnpm -C apps/admin-lite build 或 pnpm build。'
    );
    process.exit(1);
  }

  const assets = await readAdminJsAssetSizes();
  const assetsByFileName = new Map(assets.map((asset) => [asset.fileName, asset]));
  const violations = [];
  let tinyChunkCandidates = assets;
  let tinyChunkScopeLabel = 'all js chunks';

  console.log('admin-lite 构建体积预算检查：');
  for (const budget of sizeBudgets) {
    const matched = getLargestMatchedAsset(assets, budget.pattern);
    if (!matched) {
      console.log(`- ${budget.name}: 未匹配到对应 chunk，跳过。`);
      continue;
    }

    const status = matched.size <= budget.maxBytes ? 'PASS' : 'FAIL';
    const summary = `- ${budget.name}: ${matched.fileName} = ${formatKiB(matched.size)} / 预算 ${formatKiB(budget.maxBytes)} [${status}]`;
    if (status === 'PASS') {
      console.log(summary);
      continue;
    }

    console.error(summary);
    violations.push({
      budget: budget.name,
      fileName: matched.fileName,
      size: matched.size,
      maxBytes: budget.maxBytes
    });
  }

  const { appShellAsset, startupJsFiles } = await collectStartupDependencyJsFiles(assets);
  if (!appShellAsset) {
    console.log('- startup dependency map: 未匹配到 admin-lite-app-shell chunk，跳过。');
  } else if (!startupJsFiles) {
    console.log(`- startup dependency map: ${appShellAsset.fileName} 未解析到依赖图，跳过。`);
  } else {
    const startupJsAssets = startupJsFiles
      .map((fileName) => assetsByFileName.get(fileName))
      .filter(Boolean);
    const missingStartupJsFiles = startupJsFiles.filter(
      (fileName) => !assetsByFileName.has(fileName)
    );

    if (missingStartupJsFiles.length > 0) {
      console.log(
        `- startup dependency map: ${missingStartupJsFiles.length} 个文件未在 dist/assets 找到，已忽略（示例：${missingStartupJsFiles
          .slice(0, 3)
          .join(', ')}）。`
      );
    }

    const startupJsCount = startupJsAssets.length;
    tinyChunkCandidates = startupJsAssets;
    tinyChunkScopeLabel = 'startup dependency map js';
    const startupCountStatus =
      startupJsCount <= startupQueueBudgets.maxStartupJsCount ? 'PASS' : 'FAIL';
    const startupCountSummary = `- startup dependency map js count: ${startupJsCount} / 预算 ${startupQueueBudgets.maxStartupJsCount} [${startupCountStatus}]`;
    if (startupCountStatus === 'PASS') {
      console.log(startupCountSummary);
    } else {
      console.error(startupCountSummary);
      violations.push({
        budget: 'startup dependency map js count',
        size: startupJsCount,
        maxBytes: startupQueueBudgets.maxStartupJsCount
      });
    }

    const startupJsGzipBytes = await getTotalGzipBytes(startupJsAssets);
    const startupGzipStatus =
      startupJsGzipBytes <= startupQueueBudgets.maxStartupJsGzipBytes ? 'PASS' : 'FAIL';
    const startupGzipSummary = `- startup dependency map js gzip: ${formatKiB(startupJsGzipBytes)} / 预算 ${formatKiB(startupQueueBudgets.maxStartupJsGzipBytes)} [${startupGzipStatus}]`;
    if (startupGzipStatus === 'PASS') {
      console.log(startupGzipSummary);
    } else {
      console.error(startupGzipSummary);
      violations.push({
        budget: 'startup dependency map js gzip',
        size: startupJsGzipBytes,
        maxBytes: startupQueueBudgets.maxStartupJsGzipBytes
      });
    }
  }

  const tinyChunks = tinyChunkCandidates.filter(
    (asset) => asset.size <= startupQueueBudgets.tinyChunkMaxBytes
  );
  const tinyChunkStatus =
    tinyChunks.length <= startupQueueBudgets.maxTinyChunkCount ? 'PASS' : 'FAIL';
  const tinyChunkSummary = `- tiny chunks(${formatKiB(startupQueueBudgets.tinyChunkMaxBytes)} 以下, ${tinyChunkScopeLabel})数量: ${tinyChunks.length} / 预算 ${startupQueueBudgets.maxTinyChunkCount} [${tinyChunkStatus}]`;
  if (tinyChunkStatus === 'PASS') {
    console.log(tinyChunkSummary);
  } else {
    console.error(tinyChunkSummary);
    violations.push({
      budget: 'tiny chunks count',
      size: tinyChunks.length,
      maxBytes: startupQueueBudgets.maxTinyChunkCount
    });
  }

  if (violations.length === 0) {
    console.log('admin-lite 构建体积预算检查通过。');
    return;
  }

  console.error(`admin-lite 构建体积预算检查失败，共 ${violations.length} 项超限。`);
  process.exit(1);
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`admin-lite 构建体积预算检查执行失败：${message}`);
  process.exit(1);
});
