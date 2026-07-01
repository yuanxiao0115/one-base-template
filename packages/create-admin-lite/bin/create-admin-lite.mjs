#!/usr/bin/env node

import { error, log } from 'node:console';
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { cp, readdir } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import process from 'node:process';
import { createInterface } from 'node:readline/promises';
import { fileURLToPath } from 'node:url';

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const templateDir = join(packageRoot, 'templates/admin-lite-minimal');
const packageJson = JSON.parse(readFileSync(join(packageRoot, 'package.json'), 'utf8'));
const cliPackageName = packageJson.name;
const cliPackageVersion = packageJson.version;
const templateName = 'admin-lite-minimal';
const latestLegacyTemplateVersion = '0.1.2';
const metadataFileName = '.admin-lite-template.json';
const reportFileName = '.admin-lite-upgrade-report.md';
const uiSourceLine = '@source "../../node_modules/@one-base-template/ui/dist/**/*.{js,css}";';
const tagStyleImportLine = "import '@one-base-template/tag/style';";
const projectNpmrc = `registry=https://registry.npmmirror.com
@one-base-template:registry=http://artifact.nc.rdcloud.4c.hq.cmcc/artifactory/api/npm/one-package/
`;
const textFileExtensions = new Set([
  '.npmrc',
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
  create-admin-lite upgrade [--to <version>] [--from <version>] [--dry-run] [--yes]

示例:
  create-admin-lite my-admin
  create-admin-lite my-admin ./apps/my-admin
  create-admin-lite upgrade --dry-run
  create-admin-lite upgrade --to ${cliPackageVersion} --yes

说明:
  create 用于生成新项目，upgrade 用于维护已生成项目。
  upgrade 默认目标版本为当前运行的 CLI 版本；推荐通过 @latest 执行。
  生成项目不会写入 npm _auth、token 或账号密码。
  生成项目已内置 @one-base-template scope registry。
  企业 npm 认证信息请在用户本机或 CI 环境中配置。`);
}

function fail(message) {
  error(`create-admin-lite: ${message}`);
  process.exit(1);
}

function parseArgs(argv) {
  if (argv.includes('--help') || argv.includes('-h')) {
    return { help: true };
  }

  if (argv[0] === 'upgrade') {
    return parseUpgradeArgs(argv.slice(1));
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
    command: 'create',
    help: false,
    projectName,
    targetDir: targetDir || positionalTarget || projectName
  };
}

function parseUpgradeArgs(argv) {
  const result = {
    command: 'upgrade',
    help: false,
    toVersion: cliPackageVersion,
    fromVersion: '',
    dryRun: false,
    yes: false
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--to') {
      const next = argv[i + 1];
      if (!next) {
        fail('缺少 --to 参数值');
      }
      result.toVersion = next;
      i += 1;
      continue;
    }
    if (arg === '--from') {
      const next = argv[i + 1];
      if (!next) {
        fail('缺少 --from 参数值');
      }
      result.fromVersion = next;
      i += 1;
      continue;
    }
    if (arg === '--dry-run') {
      result.dryRun = true;
      continue;
    }
    if (arg === '--yes' || arg === '-y') {
      result.yes = true;
      continue;
    }
    fail(`未知参数 ${arg}`);
  }

  return result;
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

function readJsonFile(filePath) {
  return JSON.parse(readFileSync(filePath, 'utf8'));
}

function writeJsonFile(filePath, value) {
  writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

function buildTemplateMetadata(projectName, sourceVersion = cliPackageVersion) {
  return {
    packageName: cliPackageName,
    templateName,
    templateVersion: sourceVersion,
    projectName,
    generatedAt: new Date().toISOString()
  };
}

function writeTemplateMetadata(targetDir, projectName) {
  writeJsonFile(join(targetDir, metadataFileName), buildTemplateMetadata(projectName));
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
      .replaceAll('__PROJECT_NAME_TITLE__', projectName)
      .replaceAll('__TEMPLATE_VERSION__', cliPackageVersion)
      .replaceAll('__GENERATED_AT__', new Date().toISOString());
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
  writeFileSync(join(absoluteTargetDir, '.npmrc'), projectNpmrc);
  await replaceTemplateTokens(absoluteTargetDir, projectName);
  writeTemplateMetadata(absoluteTargetDir, projectName);

  log(`已生成 ${projectName}: ${absoluteTargetDir}`);
  log('');
  log('下一步:');
  log(`  cd ${absoluteTargetDir}`);
  log('  pnpm install');
  log('  pnpm dev');
  log('');
  log(
    '项目 .npmrc 已配置 @one-base-template scope registry；认证信息请写入本机或 CI 的 npm 配置，不要写入项目仓库。'
  );
}

function compareVersions(left, right) {
  const parse = (value) => {
    const match = /^(\d+)\.(\d+)\.(\d+)(?:-.+)?$/.exec(value);
    if (!match) {
      fail(`版本号格式不支持：${value}`);
    }
    return match.slice(1).map((part) => Number(part));
  };
  const leftParts = parse(left);
  const rightParts = parse(right);
  for (let i = 0; i < 3; i += 1) {
    if (leftParts[i] > rightParts[i]) {
      return 1;
    }
    if (leftParts[i] < rightParts[i]) {
      return -1;
    }
  }
  return 0;
}

function readTemplatePackageJson() {
  return readJsonFile(join(templateDir, 'package.json'));
}

function readProjectPackageJson(projectDir) {
  const packageJsonPath = join(projectDir, 'package.json');
  if (!existsSync(packageJsonPath)) {
    fail(`当前目录缺少 package.json：${projectDir}`);
  }
  return readJsonFile(packageJsonPath);
}

function getInternalDependencies(packageJsonValue) {
  const dependencies = packageJsonValue.dependencies ?? {};
  return Object.fromEntries(
    Object.entries(dependencies).filter(([name]) => name.startsWith('@one-base-template/'))
  );
}

function readExistingMetadata(projectDir) {
  const metadataPath = join(projectDir, metadataFileName);
  if (!existsSync(metadataPath)) {
    return null;
  }
  return readJsonFile(metadataPath);
}

function inferSourceVersion(projectDir, projectPackageJson) {
  const internalDependencies = getInternalDependencies(projectPackageJson);
  const requiredNames = Object.keys(getInternalDependencies(readTemplatePackageJson()));
  const missingInternalDeps = requiredNames.filter((name) => !internalDependencies[name]);
  if (missingInternalDeps.length > 0) {
    return {
      version: '',
      confidence: 'none',
      reasons: [`缺少内部依赖：${missingInternalDeps.join(', ')}`]
    };
  }

  const npmrcPath = join(projectDir, '.npmrc');
  const stylePath = join(projectDir, 'src/styles/index.css');
  const bootstrapStylesPath = join(projectDir, 'src/bootstrap/admin-lite-styles.ts');
  const modulesPath = join(projectDir, 'src/modules');
  const reasons = [];
  let score = 0;

  if (
    existsSync(npmrcPath) &&
    readFileSync(npmrcPath, 'utf8').includes('@one-base-template:registry=')
  ) {
    score += 1;
    reasons.push('存在 @one-base-template scoped registry');
  }
  if (existsSync(stylePath) && readFileSync(stylePath, 'utf8').includes('tailwindcss')) {
    score += 1;
    reasons.push('存在 admin-lite 样式入口');
  }
  if (existsSync(join(projectDir, 'src/bootstrap/index.ts'))) {
    score += 1;
    reasons.push('存在 admin-lite bootstrap 入口');
  }
  if (existsSync(modulesPath) && existsSync(join(modulesPath, 'home'))) {
    score += 1;
    reasons.push('默认 home 模块存在');
  }

  if (score < 3) {
    return {
      version: '',
      confidence: 'low',
      reasons: reasons.length > 0 ? reasons : ['项目特征不足，无法确认来源']
    };
  }

  const templateInternalDependencies = getInternalDependencies(readTemplatePackageJson());
  const dependenciesMatchCurrentTemplate = Object.entries(templateInternalDependencies).every(
    ([name, version]) => internalDependencies[name] === version
  );
  const hasCurrentStyleFixes =
    existsSync(stylePath) &&
    existsSync(bootstrapStylesPath) &&
    readFileSync(stylePath, 'utf8').includes(uiSourceLine) &&
    readFileSync(bootstrapStylesPath, 'utf8').includes(tagStyleImportLine);

  return {
    version:
      dependenciesMatchCurrentTemplate && hasCurrentStyleFixes
        ? latestLegacyTemplateVersion
        : '0.1.0',
    confidence: 'inferred',
    reasons
  };
}

function buildUpgradeContext(projectDir, options) {
  if (compareVersions(options.toVersion, cliPackageVersion) > 0) {
    fail(
      `目标版本 ${options.toVersion} 高于当前 CLI ${cliPackageVersion}，请使用 pnpm dlx ${cliPackageName}@latest upgrade`
    );
  }

  const projectPackageJson = readProjectPackageJson(projectDir);
  const metadata = readExistingMetadata(projectDir);
  const inferred = metadata
    ? {
        version: metadata.templateVersion,
        confidence: 'recorded',
        reasons: [`读取 ${metadataFileName}`]
      }
    : inferSourceVersion(projectDir, projectPackageJson);
  const sourceVersion = options.fromVersion || inferred.version;

  if (!sourceVersion) {
    fail(
      `无法识别 admin-lite 模板来源：${inferred.reasons.join('；')}。请确认当前目录或使用 --from <version> 指定来源版本。`
    );
  }

  if (compareVersions(options.toVersion, sourceVersion) < 0) {
    fail(`目标版本 ${options.toVersion} 低于来源版本 ${sourceVersion}，upgrade 不执行降级`);
  }

  return {
    projectDir,
    projectPackageJson,
    projectName: projectPackageJson.name ?? 'admin-lite-project',
    metadata,
    sourceVersion,
    sourceConfidence: options.fromVersion ? 'manual' : inferred.confidence,
    sourceReasons: inferred.reasons,
    targetVersion: options.toVersion
  };
}

function buildUpgradeReport(context, actions, options = {}) {
  const lines = [
    '# admin-lite upgrade report',
    '',
    `- CLI: ${cliPackageName}@${cliPackageVersion}`,
    `- Template: ${templateName}`,
    `- Source version: ${context.sourceVersion} (${context.sourceConfidence})`,
    `- Target version: ${context.targetVersion}`,
    ''
  ];

  if (context.sourceReasons.length > 0) {
    lines.push('## Source evidence', '');
    for (const reason of context.sourceReasons) {
      lines.push(`- ${reason}`);
    }
    lines.push('');
  }

  const appliedTitle = options.dryRun ? 'Would apply actions' : 'Applied actions';
  for (const [title, values] of [
    ['Planned actions', actions.planned],
    [appliedTitle, actions.applied],
    ['Skipped actions', actions.skipped],
    ['Conflicts', actions.conflicts],
    ['Warnings', actions.warnings]
  ]) {
    lines.push(`## ${title}`, '');
    if (values.length === 0) {
      lines.push('- None');
    } else {
      for (const value of values) {
        lines.push(`- ${value}`);
      }
    }
    lines.push('');
  }

  return lines.join('\n');
}

function pushPlan(actions, text) {
  actions.planned.push(text);
}

function canPatchStyleEntry(content) {
  return (
    content.includes("@import 'tailwindcss/utilities.css' layer(utilities);") ||
    content.includes('@import "tailwindcss";') ||
    content.includes("@import 'tailwindcss'")
  );
}

function applyStyleSourceMigration(context, actions, dryRun) {
  const stylePath = join(context.projectDir, 'src/styles/index.css');
  pushPlan(actions, `确保 src/styles/index.css 包含 @one-base-template/ui dist Tailwind 扫描源`);
  if (!existsSync(stylePath)) {
    actions.conflicts.push('src/styles/index.css 不存在，无法自动补齐 UI Tailwind 扫描源');
    return;
  }

  const content = readFileSync(stylePath, 'utf8');
  if (content.includes(uiSourceLine)) {
    actions.skipped.push('src/styles/index.css 已包含 UI Tailwind 扫描源');
    return;
  }
  if (!canPatchStyleEntry(content)) {
    actions.conflicts.push('src/styles/index.css 不是可识别的官方样式入口，已跳过自动修改');
    return;
  }

  if (!dryRun) {
    const next = content.trimEnd() + `\n\n${uiSourceLine}\n`;
    writeFileSync(stylePath, next);
  }
  actions.applied.push('src/styles/index.css 已补齐 UI Tailwind 扫描源');
}

function canPatchBootstrapStyles(content) {
  return (
    content.includes("import 'element-plus/dist/index.css';") &&
    content.includes('../styles/index.css')
  );
}

function applyTagStyleMigration(context, actions, dryRun) {
  const styleImportPath = join(context.projectDir, 'src/bootstrap/admin-lite-styles.ts');
  pushPlan(actions, `确保 src/bootstrap/admin-lite-styles.ts 导入 @one-base-template/tag/style`);
  if (!existsSync(styleImportPath)) {
    actions.conflicts.push(
      'src/bootstrap/admin-lite-styles.ts 不存在，无法自动补齐 @one-base-template/tag/style'
    );
    return;
  }

  const content = readFileSync(styleImportPath, 'utf8');
  if (content.includes(tagStyleImportLine)) {
    actions.skipped.push('src/bootstrap/admin-lite-styles.ts 已导入 @one-base-template/tag/style');
    return;
  }
  if (!canPatchBootstrapStyles(content)) {
    actions.conflicts.push(
      'src/bootstrap/admin-lite-styles.ts 不是可识别的官方样式入口，已跳过自动修改'
    );
    return;
  }

  if (!dryRun) {
    const lines = content.split('\n');
    const elementPlusIndex = lines.findIndex((line) =>
      line.includes("import 'element-plus/dist/index.css';")
    );
    const insertAt = elementPlusIndex >= 0 ? elementPlusIndex + 1 : 0;
    lines.splice(insertAt, 0, tagStyleImportLine);
    writeFileSync(styleImportPath, lines.join('\n'));
  }
  actions.applied.push('src/bootstrap/admin-lite-styles.ts 已补齐 @one-base-template/tag/style');
}

function applyDependencyMigration(context, actions, dryRun) {
  const templatePackageJson = readTemplatePackageJson();
  const templateInternalDependencies = getInternalDependencies(templatePackageJson);
  const currentDependencies = context.projectPackageJson.dependencies ?? {};
  const packageJsonPath = join(context.projectDir, 'package.json');
  const updates = [];

  for (const [name, version] of Object.entries(templateInternalDependencies)) {
    pushPlan(actions, `同步 ${name} 到模板声明版本 ${version}`);
    if (currentDependencies[name] === version) {
      actions.skipped.push(`${name} 已是 ${version}`);
      continue;
    }
    updates.push(`${name}: ${version}`);
    if (!dryRun) {
      currentDependencies[name] = version;
    }
  }

  if (updates.length > 0) {
    if (!dryRun) {
      writeJsonFile(packageJsonPath, {
        ...context.projectPackageJson,
        dependencies: currentDependencies
      });
      context.projectPackageJson.dependencies = currentDependencies;
    }
    actions.applied.push(`package.json 已同步内部依赖：${updates.join(', ')}`);
  }
}

function applyMetadataMigration(context, actions, dryRun) {
  pushPlan(actions, `写入 ${metadataFileName} 模板元信息`);
  if (actions.conflicts.length > 0) {
    actions.skipped.push(`${metadataFileName} 因存在冲突未更新，人工处理后请重新执行 upgrade`);
    return;
  }

  if (!dryRun) {
    const metadata = {
      ...buildTemplateMetadata(context.projectName, context.targetVersion),
      upgradedAt: new Date().toISOString(),
      previousTemplateVersion: context.sourceVersion
    };
    writeJsonFile(join(context.projectDir, metadataFileName), metadata);
  }
  actions.applied.push(`${metadataFileName} 已更新到 ${context.targetVersion}`);
}

function buildUpgradeActions() {
  return {
    planned: [],
    applied: [],
    skipped: [],
    conflicts: [],
    warnings: []
  };
}

function planAndMaybeApplyUpgrade(context, dryRun) {
  const actions = buildUpgradeActions();
  if (compareVersions(context.sourceVersion, context.targetVersion) === 0) {
    actions.warnings.push('来源版本与目标版本相同，本次只检查并补齐模板元信息和已知安全迁移');
  }

  applyDependencyMigration(context, actions, dryRun);
  applyStyleSourceMigration(context, actions, dryRun);
  applyTagStyleMigration(context, actions, dryRun);
  applyMetadataMigration(context, actions, dryRun);
  return actions;
}

function printUpgradeSummary(context, actions, dryRun) {
  log(`admin-lite upgrade ${dryRun ? 'dry-run' : 'apply'}`);
  log(`来源版本: ${context.sourceVersion} (${context.sourceConfidence})`);
  log(`目标版本: ${context.targetVersion}`);
  log('');
  log(buildUpgradeReport(context, actions, { dryRun }));
}

async function confirmUpgrade(context, options) {
  if (options.yes || options.dryRun) {
    return true;
  }
  if (!process.stdin.isTTY) {
    fail('非交互环境执行真实 upgrade 请使用 --yes');
  }
  if (context.sourceConfidence === 'inferred') {
    log('当前项目缺少模板元信息，CLI 已通过项目特征推断来源版本。');
  }
  log('即将执行以上迁移动作。');
  const readline = createInterface({
    input: process.stdin,
    output: process.stdout
  });
  const answer = await readline.question('确认继续？输入 yes 继续：');
  readline.close();
  return answer.trim().toLowerCase() === 'yes';
}

async function upgradeProject(options) {
  const projectDir = process.cwd();
  const context = buildUpgradeContext(projectDir, options);

  if (context.sourceConfidence === 'inferred' && !options.yes && !process.stdin.isTTY) {
    fail('当前项目缺少模板元信息且来源版本为推断结果；非交互环境请使用 --yes 或 --from <version>');
  }

  const previewActions = planAndMaybeApplyUpgrade(context, true);
  printUpgradeSummary(context, previewActions, true);
  const confirmed = await confirmUpgrade(context, options);
  if (!confirmed) {
    fail('用户取消 upgrade');
  }
  if (options.dryRun) {
    return;
  }

  const applyContext = buildUpgradeContext(projectDir, options);
  const actions = planAndMaybeApplyUpgrade(applyContext, false);
  const report = buildUpgradeReport(applyContext, actions);
  writeFileSync(join(projectDir, reportFileName), report);
  printUpgradeSummary(applyContext, actions, false);
  log(`升级报告已写入 ${reportFileName}`);
  if (actions.conflicts.length > 0) {
    fail('upgrade 已完成安全迁移，但存在需要人工处理的冲突');
  }
}

const parsed = parseArgs(process.argv.slice(2));
if (parsed.help) {
  printHelp();
} else if (parsed.command === 'upgrade') {
  await upgradeProject(parsed);
} else {
  await createProject(parsed);
}
