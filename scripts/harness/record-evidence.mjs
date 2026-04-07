import path from 'node:path';
import { promises as fs } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

function parseArgs(argv) {
  const args = {
    title: '',
    scope: '',
    commands: [],
    tailLines: 20,
    dryRun: false,
    skipVerifyRecord: false
  };

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (token === '--') {
      continue;
    }
    if (token === '--title') {
      args.title = argv[index + 1] ?? '';
      index += 1;
      continue;
    }
    if (token === '--scope') {
      args.scope = argv[index + 1] ?? '';
      index += 1;
      continue;
    }
    if (token === '--cmd') {
      const command = argv[index + 1];
      if (command) {
        args.commands.push(command);
      }
      index += 1;
      continue;
    }
    if (token === '--tail-lines') {
      const parsed = Number.parseInt(argv[index + 1] ?? '', 10);
      if (Number.isFinite(parsed) && parsed > 0) {
        args.tailLines = parsed;
      }
      index += 1;
      continue;
    }
    if (token === '--dry-run') {
      args.dryRun = true;
      continue;
    }
    if (token === '--skip-verify-record') {
      args.skipVerifyRecord = true;
      continue;
    }
    throw new Error(`未知参数：${token}`);
  }

  if (!args.title) {
    throw new Error('缺少必填参数：--title');
  }
  if (args.commands.length === 0) {
    throw new Error('至少提供一个 --cmd 参数');
  }

  return args;
}

function getTodayDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = `${now.getMonth() + 1}`.padStart(2, '0');
  const date = `${now.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${date}`;
}

function tailOutput(content, lineCount) {
  if (!content.trim()) {
    return '(无输出)';
  }
  const lines = content.split('\n');
  const sliced = lines.slice(-lineCount);
  return sliced.join('\n').trim();
}

function runCommand(command, tailLines) {
  const result = spawnSync(command, {
    cwd: rootDir,
    shell: true,
    encoding: 'utf8',
    maxBuffer: 20 * 1024 * 1024
  });

  const stdout = result.stdout ?? '';
  const stderr = result.stderr ?? '';
  const combinedOutput = [stdout, stderr].filter(Boolean).join('\n').trim();
  const exitCode = result.status ?? 1;

  return {
    command,
    exitCode,
    success: exitCode === 0,
    outputTail: tailOutput(combinedOutput, tailLines)
  };
}

async function appendMarkdown(filePath, section) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  let prefix = '';
  try {
    const current = await fs.readFile(filePath, 'utf8');
    if (!current.endsWith('\n')) {
      prefix = '\n';
    }
    if (!current.endsWith('\n\n')) {
      prefix += '\n';
    }
  } catch {
    // 文件不存在时按追加创建，无需额外处理。
  }

  await fs.appendFile(filePath, `${prefix}${section}\n`, 'utf8');
}

async function updateVerificationIndex(date, title) {
  const verificationIndexPath = path.join(rootDir, '.codex/verification.md');
  const content = await fs.readFile(verificationIndexPath, 'utf8');
  const latestBlock = [
    '## 最新记录',
    '',
    `- 日期：${date}`,
    `- 文件：\`.codex/verification/${date}.md\``,
    `- 补充：${title}`,
    ''
  ].join('\n');

  const next = content.replace(/## 最新记录[\s\S]*?(?=\n## )/, latestBlock);
  if (next !== content) {
    await fs.writeFile(verificationIndexPath, next, 'utf8');
    return;
  }

  await fs.appendFile(verificationIndexPath, `\n${latestBlock}\n`, 'utf8');
}

async function writeTestingRecord(date, args, results) {
  const testingPath = path.join(rootDir, '.codex/testing.md');
  const sectionLines = [
    `## ${date}（${args.title}）`,
    '',
    `- 作用域：${args.scope || '未指定'}`,
    '- 命令：',
    ...args.commands.map((command) => `  - \`${command}\``),
    '- 结果：',
    ...results.map(
      (result) =>
        `  - \`${result.command}\`：${result.success ? '通过' : '失败'}（exit=${result.exitCode}）`
    ),
    '- 输出摘要：',
    '```text',
    ...results.flatMap((result) => [`$ ${result.command}`, result.outputTail, '']),
    '```'
  ];

  await appendMarkdown(testingPath, sectionLines.join('\n'));
}

async function writeVerificationRecord(date, args, results) {
  const verificationPath = path.join(rootDir, `.codex/verification/${date}.md`);
  const sectionLines = [
    `## ${args.title}`,
    '',
    '- 结论：通过。',
    '- 证据：',
    ...results.map((result) => `  - \`${result.command}\``)
  ];
  await appendMarkdown(verificationPath, sectionLines.join('\n'));
  await updateVerificationIndex(date, args.title);
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const date = getTodayDate();

  if (args.dryRun) {
    console.log('record-evidence dry-run');
    console.log(`- title: ${args.title}`);
    console.log(`- scope: ${args.scope || '(未指定)'}`);
    console.log(`- commands: ${args.commands.join(' | ')}`);
    console.log(`- skipVerifyRecord: ${args.skipVerifyRecord}`);
    return;
  }

  // 核心流程：执行命令 -> 记录 testing -> 全通过再记录 verification。
  const results = [];
  for (const command of args.commands) {
    const result = runCommand(command, args.tailLines);
    results.push(result);
    if (!result.success) {
      break;
    }
  }

  await writeTestingRecord(date, args, results);

  const allPassed =
    results.length === args.commands.length && results.every((result) => result.success);
  if (allPassed && !args.skipVerifyRecord) {
    await writeVerificationRecord(date, args, results);
  }

  if (!allPassed) {
    const failed = results.find((result) => !result.success);
    throw new Error(`命令失败：${failed?.command ?? '未知命令'}`);
  }
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`record-evidence 执行失败：${message}`);
  process.exit(1);
});
