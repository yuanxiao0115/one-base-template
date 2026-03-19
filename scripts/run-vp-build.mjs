import { spawn } from 'node:child_process';

const startPattern = /PLUGIN_TIMINGS/;
const endPattern = /rolldown\.rs\/options\/checks#plugintimings/;

function relayStream(source, target) {
  let pending = '';
  let suppressingPluginTimings = false;

  source.on('data', (chunk) => {
    pending += String(chunk);
    const lines = pending.split(/\r?\n/);
    pending = lines.pop() ?? '';

    for (const line of lines) {
      if (suppressingPluginTimings) {
        if (endPattern.test(line)) {
          suppressingPluginTimings = false;
        }
        continue;
      }

      if (startPattern.test(line)) {
        suppressingPluginTimings = true;
        continue;
      }

      target.write(`${line}\n`);
    }
  });

  source.on('end', () => {
    if (!pending || suppressingPluginTimings) {
      return;
    }
    if (startPattern.test(pending)) {
      return;
    }
    target.write(pending);
  });
}

const command = process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm';
const child = spawn(command, ['exec', 'vp', 'build'], {
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
