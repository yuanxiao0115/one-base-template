import type { BizResponse, PageResult, PortalTemplate } from '../types';

export type BizResLike = Pick<BizResponse<unknown>, 'code' | 'message' | 'success'>;

export function normalizeBizOk(res: BizResLike | null | undefined): boolean {
  const code = res?.code;
  return (
    res?.success === true ||
    code === 0 ||
    code === 200 ||
    String(code) === '0' ||
    String(code) === '200'
  );
}

export function normalizePageTotal(data: PageResult<unknown> | null | undefined): number {
  const raw =
    (data as Record<string, unknown> | null)?.total ??
    (data as Record<string, unknown> | null)?.totalCount ??
    0;
  const val = Number(raw);
  return Number.isFinite(val) ? val : 0;
}

export function normalizeRecords(
  data: PageResult<PortalTemplate> | null | undefined
): PortalTemplate[] {
  const raw = (data as PageResult<PortalTemplate> | null)?.records;
  return Array.isArray(raw) ? raw : [];
}

export function normalizeIdLike(value: unknown): string {
  if (typeof value === 'string') {
    return value;
  }
  if (typeof value === 'number') {
    return String(value);
  }
  return '';
}

export function normalizeIntegerLike(value: unknown, fallback = 0): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function normalizeTemplateName(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

export function extractTemplateId(value: unknown): string {
  const direct = normalizeIdLike(value);
  if (direct) {
    return direct;
  }

  if (value && typeof value === 'object') {
    const obj = value as Record<string, unknown>;
    return normalizeIdLike(obj.id) || normalizeIdLike(obj.templateId) || '';
  }

  return '';
}
