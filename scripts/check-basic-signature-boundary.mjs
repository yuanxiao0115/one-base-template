import { promises as fs } from 'node:fs';
import path from 'node:path';

const rootDir = process.cwd();
const targetFiles = [
  'apps/admin/src/services/security/signature.ts',
  'apps/portal/src/config/basic/signature.ts',
  'apps/admin-lite/src/services/security/signature.ts'
];

const requiredImports = ['buildClientSignature', 'getClientSignatureInput'];

function collectViolations(relPath, code) {
  const violations = [];

  for (const importName of requiredImports) {
    const pattern = new RegExp(`\\b${importName}\\b`);
    if (!pattern.test(code)) {
      violations.push(`必须复用 @one-base-template/core 的 ${importName}()`);
    }
  }

  if (!/from\s+['"]@one-base-template\/core['"]/.test(code)) {
    violations.push("必须从 '@one-base-template/core' 导入签名辅助方法");
  }

  if (/\bbtoa\s*\(/.test(code)) {
    violations.push('禁止在 app 层直接使用 btoa() 拼接 Client-Signature');
  }

  if (/fc54f9655dc04da486663f1055978ba8/.test(code)) {
    violations.push('禁止在 app 层硬编码默认 clientSignatureSalt');
  }

  if (/\?\?\s*['"]1['"]/.test(code)) {
    violations.push("禁止在 app 层硬编码默认 clientId='1'");
  }

  return violations.map((message) => ({ file: relPath, message }));
}

async function main() {
  const violations = [];

  for (const relPath of targetFiles) {
    const absPath = path.join(rootDir, relPath);
    const code = await fs.readFile(absPath, 'utf8');
    violations.push(...collectViolations(relPath, code));
  }

  if (violations.length === 0) {
    console.log('basic 签名边界检查通过。');
    return;
  }

  console.error(`basic 签名边界检查失败，共 ${violations.length} 处问题：`);
  for (const violation of violations) {
    console.error(`- ${violation.file} ${violation.message}`);
  }
  process.exit(1);
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`basic 签名边界检查执行失败：${message}`);
  process.exit(1);
});
