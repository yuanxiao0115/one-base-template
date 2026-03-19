export function normalizeIdLike(value: unknown): string {
  if (typeof value === 'string') {
    return value;
  }
  if (typeof value === 'number') {
    return String(value);
  }
  return '';
}

export function normalizeString(value: unknown): string {
  return typeof value === 'string' ? value : '';
}
