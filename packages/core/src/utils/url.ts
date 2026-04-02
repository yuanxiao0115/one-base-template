export function isHttpUrl(value: string): boolean {
  return /^https?:\/\//i.test(value.trim());
}

export function resolveSafeHttpUrl(raw: unknown, fallback = ''): string {
  const value = typeof raw === 'string' ? raw.trim() : '';
  return isHttpUrl(value) ? value : fallback;
}

export function resolveExternalTargetUrl(params: {
  redirect?: unknown;
  path?: unknown;
  fallback?: string;
}): string {
  const redirect = resolveSafeHttpUrl(params.redirect);
  if (redirect) {
    return redirect;
  }

  const path = resolveSafeHttpUrl(params.path);
  if (path) {
    return path;
  }

  return params.fallback ?? '';
}
