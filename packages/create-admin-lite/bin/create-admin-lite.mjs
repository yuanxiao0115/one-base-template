#!/usr/bin/env node

import { error, log } from 'node:console';
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { cp, readdir } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const registryUrl = 'http://artifact.nc.rdcloud.4c.hq.cmcc/artifactory/api/npm/one-package/';
const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const templateDir = join(packageRoot, 'templates/admin-lite-minimal');
const textFileExtensions = new Set([
  '.css',
  '.html',
  '.js',
  '.json',
  '.md',
  '.mjs',
  '.ts',
  '.tsx',
  '.vue',
  '.yaml',
  '.yml'
]);

function printHelp() {
  log(`create-admin-lite

用法:
  create-admin-lite <project-name> [target-dir]
  create-admin-lite <project-name> --target <target-dir>

示例:
  create-admin-lite my-admin
  create-admin-lite my-admin ./apps/my-admin

说明:
  生成项目不会写入 npm _auth、token 或账号密码。
  企业 npm registry 请在用户本机或 CI 环境中配置。`);
}

function fail(message) {
  error(`create-admin-lite: ${message}`);
  process.exit(1);
}

function parseArgs(argv) {
  if (argv.includes('--help') || argv.includes('-h')) {
    return { help: true };
  }

  const positional = [];
  let targetDir = '';
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--target') {
      const next = argv[i + 1];
      if (!next) {
        fail('缺少 --target 参数值');
      }
      targetDir = next;
      i += 1;
      continue;
    }

    if (arg.startsWith('--')) {
      fail(`未知参数 ${arg}`);
    }
    positional.push(arg);
  }

  const [projectName, positionalTarget] = positional;
  if (positional.length > 2) {
    fail('参数过多，只支持 <project-name> 和一个目标目录');
  }
  if (targetDir && positionalTarget) {
    fail('目标目录不能同时通过位置参数和 --target 指定');
  }

  return {
    help: false,
    projectName,
    targetDir: targetDir || positionalTarget || projectName
  };
}

function isValidPackageName(name) {
  return /^(?:@[a-z0-9][a-z0-9._-]*\/)?[a-z0-9][a-z0-9._-]*$/.test(name);
}

function assertCanCreateProject(projectName, targetDir) {
  if (!projectName) {
    fail('缺少项目名');
  }
  if (!isValidPackageName(projectName)) {
    fail('项目名不合法，只允许小写字母、数字、点、下划线、短横线和合法 scope');
  }
  if (!targetDir) {
    fail('缺少目标目录');
  }
  if (!existsSync(templateDir)) {
    fail(`模板目录不存在：${templateDir}`);
  }

  const absoluteTargetDir = resolve(process.cwd(), targetDir);
  if (existsSync(absoluteTargetDir)) {
    const stat = statSync(absoluteTargetDir);
    if (!stat.isDirectory()) {
      fail(`目标路径已存在且不是目录：${absoluteTargetDir}`);
    }
    if (readdirSync(absoluteTargetDir).length > 0) {
      fail(`目标目录非空：${absoluteTargetDir}`);
    }
  }

  return absoluteTargetDir;
}

function shouldReplaceText(filePath) {
  return textFileExtensions.has(filePath.slice(filePath.lastIndexOf('.')));
}

async function replaceTemplateTokens(targetDir, projectName) {
  const entries = await readdir(targetDir, { withFileTypes: true });
  for (const entry of entries) {
    const filePath = join(targetDir, entry.name);
    if (entry.isDirectory()) {
      await replaceTemplateTokens(filePath, projectName);
      continue;
    }
    if (!entry.isFile()) {
      continue;
    }

    if (!shouldReplaceText(filePath)) {
      continue;
    }

    const current = readFileSync(filePath, 'utf8');
    const next = current
      .replaceAll('__PROJECT_NAME__', projectName)
      .replaceAll('__PROJECT_NAME_TITLE__', projectName);
    if (next !== current) {
      writeFileSync(filePath, next);
    }
  }
}

async function createProject(params) {
  const { projectName, targetDir } = params;
  const absoluteTargetDir = assertCanCreateProject(projectName, targetDir);
  mkdirSync(absoluteTargetDir, { recursive: true });
  await cp(templateDir, absoluteTargetDir, { recursive: true, force: false });
  await replaceTemplateTokens(absoluteTargetDir, projectName);

  log(`已生成 ${projectName}: ${absoluteTargetDir}`);
  log('');
  log('下一步:');
  log(`  cd ${absoluteTargetDir}`);
  log(`  npm config set registry ${registryUrl}`);
  log('  pnpm install');
  log('  pnpm dev');
  log('');
  log('认证信息请写入本机或 CI 的 npm 配置，不要写入项目仓库。');
}

const parsed = parseArgs(process.argv.slice(2));
if (parsed.help) {
  printHelp();
} else {
  await createProject(parsed);
}
