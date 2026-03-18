#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { URL } from 'node:url';

const repoRoot = path.resolve(new URL('..', import.meta.url).pathname);
const portalEngineRoot = path.join(repoRoot, 'packages/portal-engine');
const materialsRoot = path.join(portalEngineRoot, 'src/materials');
const registryFile = path.join(portalEngineRoot, 'src/registry/materials-registry.ts');
const portalEngineIndexFile = path.join(portalEngineRoot, 'src/index.ts');
const portalEnginePackageFile = path.join(portalEngineRoot, 'package.json');
const portalDesignerExportFile = path.join(portalEngineRoot, 'src/public-designer.ts');
const portalInternalExportFile = path.join(portalEngineRoot, 'src/internal/index.ts');
const portalPublicDesignerTestFile = path.join(portalEngineRoot, 'src/public-designer.test.ts');
const portalMaterialExtensionsContractFile = path.join(
  portalEngineRoot,
  'src/materials/extensions.ts'
);
const portalMaterialExtensionsRegisterFile = path.join(
  portalEngineRoot,
  'src/materials/registerMaterialExtensions.ts'
);
const adminPortalRegisterFile = path.join(
  repoRoot,
  'apps/admin/src/modules/PortalManagement/engine/register.ts'
);
const adminPortalMaterialExtensionsEntryFile = path.join(
  repoRoot,
  'apps/admin/src/modules/PortalManagement/materials/extensions/index.ts'
);
const legacyAdminMaterialRegistrationFile = path.join(
  repoRoot,
  'apps/admin/src/modules/PortalManagement/materials/admin-material-registration.ts'
);

const fallbackFiles = {
  index: path.join(materialsRoot, 'static-fallbacks/index-fallbacks.ts'),
  content: path.join(materialsRoot, 'static-fallbacks/content-fallbacks.ts'),
  style: path.join(materialsRoot, 'static-fallbacks/style-fallbacks.ts')
};

const SECTION_NAMES = ['index', 'content', 'style'];
const errors = [];

function toPosix(relativePath) {
  return relativePath.split(path.sep).join('/');
}

function readTextFile(filePath, description) {
  if (!fs.existsSync(filePath)) {
    errors.push(`${description} 不存在: ${toPosix(path.relative(repoRoot, filePath))}`);
    return '';
  }
  return fs.readFileSync(filePath, 'utf8');
}

function readJsonFile(filePath, description) {
  const source = readTextFile(filePath, description);
  if (!source) {
    return null;
  }
  try {
    return JSON.parse(source);
  } catch (error) {
    errors.push(
      `${description} JSON 解析失败: ${toPosix(path.relative(repoRoot, filePath))} (${String(error)})`
    );
    return null;
  }
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

function assertIncludes(source, marker, errorMessage) {
  if (!source.includes(marker)) {
    errors.push(errorMessage);
  }
}

function resolveExportEntryPath(entry, key) {
  if (!entry) {
    return '';
  }
  if (typeof entry === 'string') {
    return key === 'default' ? entry : '';
  }
  if (typeof entry === 'object') {
    const value = entry[key];
    return typeof value === 'string' ? value : '';
  }
  return '';
}

function validateMaterialExtensionContracts() {
  const extensionContractSource = readTextFile(
    portalMaterialExtensionsContractFile,
    'portal-engine 物料扩展协议文件'
  );
  if (extensionContractSource) {
    assertIncludes(
      extensionContractSource,
      'export interface PortalMaterialExtension',
      'materials/extensions.ts: 缺少 PortalMaterialExtension 导出'
    );
    assertIncludes(
      extensionContractSource,
      'materials?: PortalMaterialDescriptor[]',
      'materials/extensions.ts: PortalMaterialExtension 必须允许可选 materials 列表'
    );
    assertIncludes(
      extensionContractSource,
      'export function definePortalMaterialCategory',
      'materials/extensions.ts: 缺少 definePortalMaterialCategory helper'
    );
    assertIncludes(
      extensionContractSource,
      'export function definePortalMaterial',
      'materials/extensions.ts: 缺少 definePortalMaterial helper'
    );
    assertIncludes(
      extensionContractSource,
      'export function definePortalMaterialExtension',
      'materials/extensions.ts: 缺少 definePortalMaterialExtension helper'
    );
  }

  const extensionRegisterSource = readTextFile(
    portalMaterialExtensionsRegisterFile,
    'portal-engine 扩展注册实现文件'
  );
  if (extensionRegisterSource) {
    assertIncludes(
      extensionRegisterSource,
      'export function registerMaterialExtensions',
      'materials/registerMaterialExtensions.ts: 缺少 registerMaterialExtensions 导出'
    );
    assertIncludes(
      extensionRegisterSource,
      'export function unregisterMaterialExtensions',
      'materials/registerMaterialExtensions.ts: 缺少 unregisterMaterialExtensions 导出'
    );
    assertIncludes(
      extensionRegisterSource,
      'resolveMaterialCategory(',
      'materials/registerMaterialExtensions.ts: 缺少扩展分类解析逻辑'
    );
    assertIncludes(
      extensionRegisterSource,
      'ensureExtensionCategory(',
      'materials/registerMaterialExtensions.ts: 缺少分类保底注册逻辑'
    );
    assertIncludes(
      extensionRegisterSource,
      'registerPortalMaterialComponent(',
      'materials/registerMaterialExtensions.ts: 缺少组件注册逻辑'
    );
  }
}

function validateAdminExtensionEntry() {
  if (fs.existsSync(legacyAdminMaterialRegistrationFile)) {
    errors.push(
      `发现已废弃文件: ${toPosix(path.relative(repoRoot, legacyAdminMaterialRegistrationFile))}`
    );
  }

  const extensionEntrySource = readTextFile(
    adminPortalMaterialExtensionsEntryFile,
    'admin 物料扩展入口文件'
  );
  if (extensionEntrySource) {
    assertIncludes(
      extensionEntrySource,
      'PORTAL_ADMIN_MATERIAL_EXTENSIONS',
      'materials/extensions/index.ts: 必须导出 PORTAL_ADMIN_MATERIAL_EXTENSIONS'
    );
    assertIncludes(
      extensionEntrySource,
      'PortalMaterialExtension[]',
      'materials/extensions/index.ts: 扩展入口必须显式声明 PortalMaterialExtension[]'
    );
  }

  const adminRegisterSource = readTextFile(adminPortalRegisterFile, 'admin Portal 注册入口文件');
  if (adminRegisterSource) {
    assertIncludes(
      adminRegisterSource,
      'materialExtensions?: PortalMaterialExtension[]',
      'engine/register.ts: setupPortalEngineForAdmin 必须暴露 materialExtensions 参数'
    );
    assertIncludes(
      adminRegisterSource,
      'registerMaterialExtensions(context, [',
      'engine/register.ts: 必须通过 registerMaterialExtensions 统一注册扩展'
    );
    assertIncludes(
      adminRegisterSource,
      '...PORTAL_ADMIN_MATERIAL_EXTENSIONS',
      'engine/register.ts: 必须先注入 admin 默认扩展列表'
    );
    assertIncludes(
      adminRegisterSource,
      '...(options.materialExtensions ?? [])',
      'engine/register.ts: 必须合并调用方传入 materialExtensions'
    );
  }
}

function validateDesignerPublicExports() {
  const portalEnginePackageJson = readJsonFile(
    portalEnginePackageFile,
    'portal-engine package.json'
  );
  if (!portalEnginePackageJson || typeof portalEnginePackageJson !== 'object') {
    return;
  }

  const exportMap = portalEnginePackageJson.exports;
  if (!(exportMap && typeof exportMap === 'object')) {
    return;
  }

  const designerExport = exportMap['./designer'];
  const internalExport = exportMap['./internal'];
  const hasSemanticSubpath = Boolean(designerExport || internalExport);
  if (!hasSemanticSubpath) {
    return;
  }

  if (!designerExport) {
    errors.push('packages/portal-engine/package.json: 缺少 ./designer 子路径导出');
  }
  if (!internalExport) {
    errors.push('packages/portal-engine/package.json: 缺少 ./internal 子路径导出');
  }

  const designerTypesPath = resolveExportEntryPath(designerExport, 'types');
  const designerDefaultPath = resolveExportEntryPath(designerExport, 'default');
  if (designerTypesPath && designerTypesPath !== './src/public-designer.ts') {
    errors.push(
      'packages/portal-engine/package.json: ./designer.types 必须指向 ./src/public-designer.ts'
    );
  }
  if (designerDefaultPath && designerDefaultPath !== './src/public-designer.ts') {
    errors.push(
      'packages/portal-engine/package.json: ./designer.default 必须指向 ./src/public-designer.ts'
    );
  }

  const internalTypesPath = resolveExportEntryPath(internalExport, 'types');
  const internalDefaultPath = resolveExportEntryPath(internalExport, 'default');
  if (internalTypesPath && internalTypesPath !== './src/internal/index.ts') {
    errors.push(
      'packages/portal-engine/package.json: ./internal.types 必须指向 ./src/internal/index.ts'
    );
  }
  if (internalDefaultPath && internalDefaultPath !== './src/internal/index.ts') {
    errors.push(
      'packages/portal-engine/package.json: ./internal.default 必须指向 ./src/internal/index.ts'
    );
  }

  const designerSource = readTextFile(portalDesignerExportFile, 'portal-engine 语义化导出文件');
  const internalSource = readTextFile(portalInternalExportFile, 'portal-engine internal 导出文件');
  const indexSource = readTextFile(portalEngineIndexFile, 'portal-engine 根导出文件');
  readTextFile(portalPublicDesignerTestFile, 'portal-engine public designer 测试文件');

  if (designerSource) {
    const requiredDesignerSymbols = [
      'PortalTemplateDesignerLayout',
      'PortalTemplateDesignerHeader',
      'PortalTemplateDesignerSidebar',
      'PortalTemplateDesignerToolbar',
      'PortalTemplateDesignerPreview',
      'PortalPageDesignerLayout',
      'PortalMaterialPalette',
      'PortalPropertyInspector',
      'PortalTemplateDesignerPreviewTarget',
      'PortalDesignerRouteQueryPrimitive',
      'PortalDesignerRouteQueryValue',
      'PortalDesignerRouteQueryLike',
      'UsePortalTemplateDesignerRouteOptions',
      'UsePortalPageDesignerRouteOptions',
      'usePortalTemplateDesignerRoute',
      'usePortalPageDesignerRoute'
    ];
    for (const symbol of requiredDesignerSymbols) {
      if (!designerSource.includes(symbol)) {
        errors.push(`public-designer.ts: 缺少语义化导出符号 ${symbol}`);
      }
    }
  }

  if (internalSource) {
    const requiredInternalSymbols = [
      'PortalTemplateWorkbenchShell',
      'PortalDesignerHeaderBar',
      'PortalDesignerTreePanel',
      'PortalDesignerActionStrip',
      'PortalDesignerPreviewFrame',
      'PortalPageEditorWorkbench',
      'MaterialLibrary',
      'PropertyPanel',
      'createTemplateWorkbenchController',
      'useTemplateWorkbench',
      'PortalTabTree',
      'PortalPageSettingsForm',
      'PortalShellHeaderSettingsForm',
      'PortalShellFooterSettingsForm',
      'createTemplateWorkbenchPageController',
      'useTemplateWorkbenchPage',
      'buildNextRouteQueryWithTabId',
      'buildPortalPageEditorBackRouteLocation',
      'buildPortalPageEditorRouteLocation',
      'buildPortalPreviewRouteLocation',
      'resolvePortalTabIdFromQuery',
      'resolvePortalTemplateIdFromQuery',
      'createPageEditorController',
      'usePageEditorWorkbench',
      'useTemplateWorkbenchPageByRoute',
      'usePageEditorWorkbenchByRoute'
    ];
    for (const symbol of requiredInternalSymbols) {
      if (!internalSource.includes(symbol)) {
        errors.push(`internal/index.ts: 缺少实现语义导出符号 ${symbol}`);
      }
    }
  }

  if (indexSource) {
    const forbiddenRootMarkers = [
      'export { default as PropertyPanel }',
      'export { default as MaterialLibrary }',
      'export { default as PortalPageEditorWorkbench }',
      'export { default as PortalDesignerPreviewFrame }',
      'export { default as PortalTemplateWorkbenchShell }',
      'export { default as PortalDesignerHeaderBar }',
      'export { default as PortalDesignerTreePanel }',
      'export { default as PortalDesignerActionStrip }',
      'export { useTemplateWorkbenchPageByRoute }',
      'export { usePageEditorWorkbenchByRoute }',
      'CreateTemplateWorkbenchControllerOptions',
      'SubmitTabAttributePayload',
      'TemplateWorkbenchApi',
      'TemplateWorkbenchConfirmParams',
      'TemplateWorkbenchController',
      'TemplateWorkbenchNotifier',
      'TreeSortDropPayload',
      'createTemplateWorkbenchController',
      'useTemplateWorkbench',
      'export { default as PortalTabTree }',
      'PortalPageSettingsForm',
      'PortalShellHeaderSettingsForm',
      'PortalShellFooterSettingsForm',
      'CreateTemplateWorkbenchPageControllerOptions',
      'TemplateWorkbenchPageController',
      'TemplateWorkbenchPagePreviewTarget',
      'createTemplateWorkbenchPageController',
      'useTemplateWorkbenchPage',
      'buildNextRouteQueryWithTabId',
      'buildPortalPageEditorBackRouteLocation',
      'buildPortalPageEditorRouteLocation',
      'buildPortalPreviewRouteLocation',
      'resolvePortalTabIdFromQuery',
      'resolvePortalTemplateIdFromQuery',
      'CreatePageEditorControllerOptions',
      'PortalPageEditorLayoutStore',
      'PageEditorController',
      'PortalPageEditorApi',
      'PortalPageEditorNotifier',
      'PortalPageEditorTabDetail',
      'createPageEditorController',
      'usePageEditorWorkbench',
      '  PortalRouteQueryPrimitive,\n',
      '  PortalRouteQueryValue\n',
      '  PortalRouteQueryLike,\n',
      'export type { UseTemplateWorkbenchPageByRouteOptions }',
      'export type { UsePageEditorWorkbenchByRouteOptions }'
    ];
    const requiredPreviewTypeMarkers = [
      'PortalRouteQueryPrimitive as PortalPreviewRouteQueryPrimitive',
      'PortalRouteQueryValue as PortalPreviewRouteQueryValue',
      'PortalRouteQueryLike as PortalPreviewRouteQueryLike',
      'UsePortalPreviewPageByRouteOptions as UsePortalPreviewRouteOptions'
    ];
    assertIncludes(
      indexSource,
      './public-designer',
      'src/index.ts: 根出口必须继续转发 public-designer 语义化导出'
    );
    for (const marker of requiredPreviewTypeMarkers) {
      assertIncludes(indexSource, marker, `src/index.ts: 缺少 preview 语义化类型导出 ${marker}`);
    }
    for (const marker of forbiddenRootMarkers) {
      if (indexSource.includes(marker)) {
        errors.push(`src/index.ts: root 不应继续暴露实现语义导出 ${marker}`);
      }
    }
  }
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
    const componentName = extractDefineOptionsName(
      source,
      toPosix(path.relative(repoRoot, vueFile))
    );
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
      errors.push(
        `${configRelativePath}: ${section}.name=${configName} 与路径推导名 ${derivedName} 不一致`
      );
      continue;
    }

    if (!hasExplicitAlias(section, configName, derivedName)) {
      errors.push(
        `${configRelativePath}: ${section}.name=${configName} 依赖历史别名 ${derivedName}，但 static fallback 未显式声明 aliases`
      );
    }
  }
}

validateMaterialExtensionContracts();
validateAdminExtensionEntry();
validateDesignerPublicExports();

if (errors.length > 0) {
  console.error('[portal-engine] 物料一致性检查失败：');
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log(`[portal-engine] 物料一致性检查通过，共检查 ${configFiles.length} 个 config.json。`);
