import { describe, expect, it } from 'vite-plus/test';

import {
  createDefaultDocumentTemplate,
  parseDocumentTemplate,
  serializeDocumentTemplate
} from '../schema/template';

describe('document sheet schema', () => {
  it('默认模板应包含 sheet 配置', () => {
    const template = createDefaultDocumentTemplate();

    expect(template.version).toBe('2');
    expect(template.sheet).toMatchObject({
      columns: 24,
      merges: [],
      styles: []
    });
    expect(template.sheet.rows).toBeGreaterThan(0);
  });

  it('应将 v1 模板自动迁移为 v2 并补齐 sheet', () => {
    const legacyRaw = JSON.stringify({
      version: '1',
      kind: 'dispatch-form',
      title: '历史模板',
      page: {
        size: 'A4',
        width: 794,
        minHeight: 600,
        padding: [16, 16, 16, 16]
      },
      grid: {
        columns: 12,
        rowHeight: 20
      },
      materials: [],
      print: {
        showGrid: true
      }
    });

    const migrated = parseDocumentTemplate(legacyRaw);

    expect(migrated.version).toBe('2');
    expect(migrated.sheet.columns).toBe(12);
    expect(migrated.sheet.rows).toBe(30);
    expect(migrated.sheet.viewport.showGrid).toBe(true);
  });

  it('序列化后应保留 sheet 配置', () => {
    const template = createDefaultDocumentTemplate();
    template.sheet.merges.push({
      row: 2,
      col: 2,
      rowspan: 2,
      colspan: 3
    });

    const raw = serializeDocumentTemplate(template);
    const parsed = parseDocumentTemplate(raw);

    expect(parsed.sheet.merges).toHaveLength(1);
    expect(parsed.sheet.merges[0]).toMatchObject({
      row: 2,
      col: 2,
      rowspan: 2,
      colspan: 3
    });
  });
});
