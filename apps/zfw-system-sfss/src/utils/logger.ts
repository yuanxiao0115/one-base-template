/**
 * zfw-system-sfss 应用日志工具。
 */
type LoggerLevel = 'debug' | 'error' | 'info' | 'warn';

type LoggerMethod = (message: string, ...args: unknown[]) => void;

function shouldLog(level: LoggerLevel): boolean {
  if (level === 'debug') {
    return import.meta.env.DEV;
  }
  return true;
}

function formatScope(scope: string): string {
  return scope.trim() ? `[${scope.trim()}]` : '[app]';
}

function resolveWriter(level: LoggerLevel): (...args: unknown[]) => void {
  if (level === 'debug') {
    return console.debug;
  }
  if (level === 'info') {
    return console.info;
  }
  if (level === 'warn') {
    return console.warn;
  }
  return console.error;
}

export function createAppLogger(scope: string): Record<LoggerLevel, LoggerMethod> {
  const prefix = formatScope(scope);

  const buildMethod = (level: LoggerLevel): LoggerMethod => {
    const writer = resolveWriter(level);
    return (message: string, ...args: unknown[]) => {
      if (!shouldLog(level)) {
        return;
      }
      writer(`${prefix} ${message}`, ...args);
    };
  };

  return {
    debug: buildMethod('debug'),
    info: buildMethod('info'),
    warn: buildMethod('warn'),
    error: buildMethod('error')
  };
}
