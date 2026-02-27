import type { CoreOptions } from './createCore';

let coreOptions: CoreOptions | null = null;

export function setCoreOptions(options: CoreOptions) {
  coreOptions = options;
}

export function getCoreOptions(): CoreOptions {
  if (!coreOptions) {
    throw new Error('[core] CoreOptions 未初始化，请先在 main.ts 中调用 createCore().');
  }
  return coreOptions;
}

export function tryGetCoreOptions(): CoreOptions | null {
  return coreOptions;
}
