import { describe, expect, it } from 'vite-plus/test';

import {
  createDefaultDocumentTemplate,
  parseDocumentTemplate,
  serializeDocumentTemplate
} from '../index';
import { createDispatchDocumentTemplate } from '../schema/template';

describe('document template schema v3', () => {
  it('应创建 v3 默认模板骨架', () => {
    const template = createDefaultDocumentTemplate();

    expect(template.version).toBe('3');
    expect(template.preset.key).toBe('dispatch-form');
    expect(template.fields).toEqual([]);
    expect(template.placements).toEqual([]);
    expect(template.sheet.cells).toEqual([]);
    expect(template.sheet.images).toEqual([]);
  });

  it('应支持序列化与反序列化 v3 模板', () => {
    const template = createDispatchDocumentTemplate();
    const serialized = serializeDocumentTemplate(template);
    const parsed = parseDocumentTemplate(serialized);

    expect(parsed.version).toBe('3');
    expect(parsed.fields.length).toBeGreaterThan(0);
    expect(parsed.placements.length).toBeGreaterThan(0);
    expect(parsed.sheet.cells.length).toBeGreaterThan(0);
  });
});
