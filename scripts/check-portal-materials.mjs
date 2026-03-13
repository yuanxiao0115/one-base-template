#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

const repoRoot = path.resolve(new URL('..', import.meta.url).pathname);
const portalEngineRoot = path.join(repoRoot, 'packages/portal-engine');
const materialsRoot = path.join(portalEngineRoot, 'src/materials');
const registryFile = path.join(portalEngineRoot, 'src/registry/materials-registry.ts');

const fallbackFiles = {
  index: path.join(materialsRoot, 'static-fallbacks/index-fallbacks.ts'),
  content: path.join(materialsRoot, 'static-fallbacks/content-fallbacks.ts'),
  style: path.join(materialsRoot, 'static-fallbacks/style-fallbacks.ts'),
};

const SECTION_NAMES = ['index', 'content', 'style'];
const errors = [];

function toPosix(relativePath) {
  return relativePath.split(path.sep).join('/');
}

function walkFiles(directory) {
  const entries = fs.readdirSync(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const absolutePath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...walkFiles(absolutePath));
      continue;
    }

    files.push(absolutePath);
  }

  return files;
}

function extractDefineOptionsName(source, filePath) {
  const match = source.match(/defineOptions\s*\(\s*\{[\s\S]*?name\s*:\s*['"`]([^'"`]+)['"`]/);
  if (!match?.[1]) {
    errors.push(`${filePath}: 未找到 defineOptions({ name })`);
    return '';
  }
  return match[1];
}

function toggleBasePrefix(name) {
  return name.startsWith('base-') ? name.slice(5) : `base-${name}`;
}

function toKebabCase(value) {
  return value
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/([A-Z])([A-Z][a-z])/g, '$1-$2')
    .toLowerCase();
}

function deriveExpectedName(vueFilePath, section) {
  const relativePath = toPosix(path.relative(materialsRoot, vueFilePath));
  const match = relativePath.match(/^([^/]+)\/(.+)\/(index|content|style)\.vue$/);
  if (!match) {
    return '';
  }

  const namespace = toKebabCase(match[1] || '');
  const materialPath = match[2] || '';
  const normalizedMaterialPath = materialPath
    .split('/')
    .filter(Boolean)
    .map((segment) => toKebabCase(segment))
    .map((segment, index) => {
      if (index === 0 && segment.startsWith(`${namespace}-`)) {
        return segment.slice(namespace.length + 1);
      }
      return segment;
    })
    .join('-');

  if (!(namespace && normalizedMaterialPath)) {
    return '';
  }

  return `${namespace}-${normalizedMaterialPath}-${section}`;
}

function hasExplicitAlias(section, name, alias) {
  const source = fs.readFileSync(fallbackFiles[section], 'utf8');
  return source.includes(`name: '${name}'`) && source.includes(`'${alias}'`);
}

const registrySource = fs.readFileSync(registryFile, 'utf8');
const configFiles = walkFiles(materialsRoot).filter((file) => file.endsWith('/config.json'));

for (const configFile of configFiles) {
  const configRelativePath = toPosix(path.relative(path.join(portalEngineRoot, 'src'), configFile));
  const expectedRegistryImport = `../${configRelativePath}`;
  if (!registrySource.includes(expectedRegistryImport)) {
    errors.push(`${configRelativePath}: materials-registry.ts 未引入该 config.json`);
  }

  const config = JSON.parse(fs.readFileSync(configFile, 'utf8'));

  for (const section of SECTION_NAMES) {
    const sectionConfig = config?.[section];
    const configName = typeof sectionConfig?.name === 'string' ? sectionConfig.name.trim() : '';
    if (!configName) {
      errors.push(`${configRelativePath}: 缺少 ${section}.name`);
      continue;
    }

    const vueFile = path.join(path.dirname(configFile), `${section}.vue`);
    if (!fs.existsSync(vueFile)) {
      errors.push(`${configRelativePath}: 缺少 ${section}.vue`);
      continue;
    }

    const source = fs.readFileSync(vueFile, 'utf8');
    const componentName = extractDefineOptionsName(source, toPosix(path.relative(repoRoot, vueFile)));
    if (componentName && componentName !== configName) {
      errors.push(
        `${configRelativePath}: ${section}.vue defineOptions.name=${componentName} 与 config.${section}.name=${configName} 不一致`
      );
    }

    const derivedName = deriveExpectedName(vueFile, section);
    if (!derivedName || derivedName === configName) {
      continue;
    }

    const aliasPeer = toggleBasePrefix(derivedName);
    if (aliasPeer !== configName) {
      errors.push(`${configRelativePath}: ${section}.name=${configName} 与路径推导名 ${derivedName} 不一致`);
      continue;
    }

    if (!hasExplicitAlias(section, configName, derivedName)) {
      errors.push(
        `${configRelativePath}: ${section}.name=${configName} 依赖历史别名 ${derivedName}，但 static fallback 未显式声明 aliases`
      );
    }
  }
}

if (errors.length > 0) {
  console.error('[portal-engine] 物料一致性检查失败：');
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log(`[portal-engine] 物料一致性检查通过，共检查 ${configFiles.length} 个 config.json。`);
