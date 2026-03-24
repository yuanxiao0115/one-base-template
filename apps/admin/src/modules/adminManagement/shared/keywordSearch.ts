export const DEFAULT_MIN_KEYWORD_LENGTH = 2;

export function normalizeKeyword(value: unknown): string {
  if (typeof value === 'string') {
    return value.trim();
  }

  if (typeof value === 'number' && Number.isFinite(value)) {
    return String(value).trim();
  }

  return '';
}

export function canTriggerKeywordSearch(
  keyword: unknown,
  minLength = DEFAULT_MIN_KEYWORD_LENGTH
): boolean {
  const normalized = normalizeKeyword(keyword);
  const normalizedMinLength = Number.isFinite(minLength) ? Math.max(Math.trunc(minLength), 0) : 0;
  return normalized.length >= normalizedMinLength;
}
