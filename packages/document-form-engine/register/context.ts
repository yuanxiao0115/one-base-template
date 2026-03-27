export interface DocumentFormEngineContextOptions {
  appId?: string;
}

export interface DocumentFormEngineContext {
  appId?: string;
  values: Map<symbol, unknown>;
}

export function createDocumentFormEngineContext(
  options: DocumentFormEngineContextOptions = {}
): DocumentFormEngineContext {
  return {
    appId: options.appId,
    values: new Map()
  };
}

export function readDocumentContextValue<T>(
  key: symbol,
  context: DocumentFormEngineContext,
  createFallback: () => T
) {
  if (!context.values.has(key)) {
    context.values.set(key, createFallback());
  }

  return context.values.get(key) as T;
}
