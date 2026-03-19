import { inject, provide, type InjectionKey } from 'vue';

export interface PortalEngineContextOptions {
  appId?: string;
}

export interface PortalEngineContext {
  appId?: string;
  values: Map<symbol, unknown>;
}

const PORTAL_ENGINE_CONTEXT_KEY: InjectionKey<PortalEngineContext> =
  Symbol('portal-engine-context');

let defaultPortalEngineContext = createPortalEngineContext();

export function createPortalEngineContext(
  options: PortalEngineContextOptions = {}
): PortalEngineContext {
  return {
    appId: options.appId,
    values: new Map()
  };
}

export function getDefaultPortalEngineContext() {
  return defaultPortalEngineContext;
}

export function resetDefaultPortalEngineContext(options: PortalEngineContextOptions = {}) {
  defaultPortalEngineContext = createPortalEngineContext(options);
  return defaultPortalEngineContext;
}

export function providePortalEngineContext(context: PortalEngineContext) {
  provide(PORTAL_ENGINE_CONTEXT_KEY, context);
  return context;
}

export function usePortalEngineContext() {
  return inject(PORTAL_ENGINE_CONTEXT_KEY, defaultPortalEngineContext);
}

export function readPortalEngineContextValue<T>(
  key: symbol,
  context: PortalEngineContext = defaultPortalEngineContext,
  createFallback?: () => T
) {
  if (!context.values.has(key)) {
    if (!createFallback) {
      throw new Error('[portal-engine] 上下文缺少指定值，且未提供 fallback 创建器');
    }
    context.values.set(key, createFallback());
  }

  return context.values.get(key) as T;
}

export function writePortalEngineContextValue<T>(
  key: symbol,
  value: T,
  context: PortalEngineContext = defaultPortalEngineContext
) {
  context.values.set(key, value);
  return value;
}
