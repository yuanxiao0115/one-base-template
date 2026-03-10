import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const adminAssetsDir = path.join(rootDir, "apps/admin/dist/assets");

const sizeBudgets = [
  {
    name: "iconify-ri chunk",
    pattern: /^iconify-ri-.*\.js$/,
    maxBytes: 1120 * 1024,
  },
  {
    name: "vxe chunk",
    pattern: /^vxe-.*\.js$/,
    maxBytes: 1080 * 1024,
  },
  {
    name: "element-plus chunk",
    pattern: /^element-plus-.*\.js$/,
    maxBytes: 720 * 1024,
  },
  {
    name: "page chunk",
    pattern: /^page-.*\.js$/,
    maxBytes: 920 * 1024,
  },
];

function formatKiB(bytes) {
  return `${(bytes / 1024).toFixed(1)} KiB`;
}

async function readAdminJsAssetSizes() {
  const entries = await fs.readdir(adminAssetsDir, { withFileTypes: true });
  const jsFiles = entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(".js"))
    .map((entry) => entry.name);

  return Promise.all(
    jsFiles.map(async (fileName) => {
      const absolutePath = path.join(adminAssetsDir, fileName);
      const stats = await fs.stat(absolutePath);
      return {
        fileName,
        size: stats.size,
      };
    })
  );
}

function getLargestMatchedAsset(assets, pattern) {
  return assets
    .filter((asset) => pattern.test(asset.fileName))
    .sort((a, b) => b.size - a.size)[0];
}

async function main() {
  try {
    await fs.access(adminAssetsDir);
  } catch {
    console.error("未找到 admin 构建产物，请先执行 pnpm -C apps/admin build 或 pnpm build。");
    process.exit(1);
  }

  const assets = await readAdminJsAssetSizes();
  const violations = [];

  console.log("admin 构建体积预算检查：");
  for (const budget of sizeBudgets) {
    const matched = getLargestMatchedAsset(assets, budget.pattern);
    if (!matched) {
      console.warn(`- ${budget.name}: 未匹配到对应 chunk，跳过。`);
      continue;
    }

    const status = matched.size <= budget.maxBytes ? "PASS" : "FAIL";
    const summary = `- ${budget.name}: ${matched.fileName} = ${formatKiB(matched.size)} / 预算 ${formatKiB(budget.maxBytes)} [${status}]`;
    if (status === "PASS") {
      console.log(summary);
      continue;
    }

    console.error(summary);
    violations.push({
      budget: budget.name,
      fileName: matched.fileName,
      size: matched.size,
      maxBytes: budget.maxBytes,
    });
  }

  if (violations.length === 0) {
    console.log("admin 构建体积预算检查通过。");
    return;
  }

  console.error(`admin 构建体积预算检查失败，共 ${violations.length} 项超限。`);
  process.exit(1);
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`admin 构建体积预算检查执行失败：${message}`);
  process.exit(1);
});
