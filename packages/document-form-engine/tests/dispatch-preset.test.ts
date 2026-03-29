import { describe, expect, it } from 'vite-plus/test';

import { createDispatchDocumentTemplate } from '../schema/template';

describe('dispatch form preset', () => {
  it('应生成发文单首发模板', () => {
    const template = createDispatchDocumentTemplate();

    expect(template.title).toContain('发文单');
    expect(template.fields.map((item) => item.type)).toEqual(
      expect.arrayContaining(['serialNo', 'richText', 'attachment', 'opinion', 'stamp'])
    );
    expect(template.placements.length).toBe(template.fields.length);
    expect(template.sheet.merges.length).toBeGreaterThan(0);
    expect(template.sheet.cells.some((item) => String(item.value).includes('主送'))).toBe(true);
  });
});
