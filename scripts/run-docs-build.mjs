import { spawn } from 'node:child_process';

const suppressedPatterns = [/`transformWithEsbuild` is deprecated/];

function shouldSuppress(line) {
  return suppressedPatterns.some((pattern) => pattern.test(line));
}

function relayStream(source, target) {
  let pending = '';
  source.on('data', (chunk) => {
    pending += String(chunk);
    const lines = pending.split(/\r?\n/);
    pending = lines.pop() ?? '';
    for (const line of lines) {
      if (!shouldSuppress(line)) {
        target.write(`${line}\n`);
      }
    }
  });
  source.on('end', () => {
    if (pending && !shouldSuppress(pending)) {
      target.write(pending);
    }
  });
}

const command = process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm';
const child = spawn(command, ['exec', 'vitepress', 'build', 'docs'], {
  cwd: process.cwd(),
  stdio: ['inherit', 'pipe', 'pipe'],
  env: process.env
});

relayStream(child.stdout, process.stdout);
relayStream(child.stderr, process.stderr);

child.on('close', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }
  process.exit(code ?? 1);
});
