import { describe, expect, it } from 'vite-plus/test';

import {
  extractTemplateId,
  normalizeBizOk,
  normalizePageTotal,
  normalizeRecords
} from './template-list-helpers';

describe('PortalManagement/templatePage/template-list-helpers', () => {
  it('normalizeBizOk 应识别 success=true 与常见 code 成功值', () => {
    expect(normalizeBizOk({ success: true })).toBe(true);
    expect(normalizeBizOk({ code: 0 })).toBe(true);
    expect(normalizeBizOk({ code: '200' })).toBe(true);
    expect(normalizeBizOk({ code: 500 })).toBe(false);
    expect(normalizeBizOk(undefined)).toBe(false);
  });

  it('normalizePageTotal 应兼容 total 与 totalCount', () => {
    expect(normalizePageTotal({ total: 12 })).toBe(12);
    expect(normalizePageTotal({ totalCount: '8' } as unknown as Record<string, unknown>)).toBe(8);
    expect(normalizePageTotal({})).toBe(0);
  });

  it('normalizeRecords 应仅返回数组 records', () => {
    expect(normalizeRecords({ records: [{ id: '1' }] })).toEqual([{ id: '1' }]);
    expect(normalizeRecords({ records: undefined })).toEqual([]);
    expect(normalizeRecords(undefined)).toEqual([]);
  });

  it('extractTemplateId 应支持直接值与对象字段', () => {
    expect(extractTemplateId('abc')).toBe('abc');
    expect(extractTemplateId(123)).toBe('123');
    expect(extractTemplateId({ id: 'x1' })).toBe('x1');
    expect(extractTemplateId({ templateId: 22 })).toBe('22');
    expect(extractTemplateId(null)).toBe('');
  });
});
