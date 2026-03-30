import { describe, expect, it } from 'vite-plus/test';

import {
  createDefaultDocumentTemplate,
  parseDocumentTemplate,
  serializeDocumentTemplate
} from '../index';
import {
  createDesignerUniverSnapshotEnvelope,
  createDispatchDocumentTemplate,
  extractDesignerUniverSnapshotData
} from '../schema/template';

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

  it('应丢弃未封装的旧版 univerSnapshot', () => {
    const template = createDispatchDocumentTemplate();
    template.designer = {
      univerSnapshot: {
        legacy: true
      }
    };

    const parsed = parseDocumentTemplate(serializeDocumentTemplate(template));
    const snapshot = extractDesignerUniverSnapshotData(parsed.designer?.univerSnapshot);
    expect(snapshot).toBeNull();
  });

  it('应保留新版封装的 univerSnapshot', () => {
    const template = createDispatchDocumentTemplate();
    template.designer = {
      univerSnapshot: createDesignerUniverSnapshotEnvelope({
        seed: 'snapshot-v1'
      })
    };

    const parsed = parseDocumentTemplate(serializeDocumentTemplate(template));
    const snapshot = extractDesignerUniverSnapshotData(parsed.designer?.univerSnapshot);
    expect(snapshot).toMatchObject({
      seed: 'snapshot-v1'
    });
  });
});
