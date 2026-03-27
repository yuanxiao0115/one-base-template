import { describe, expect, it } from 'vite-plus/test';
import {
  createDefaultDocumentTemplate,
  parseDocumentTemplate,
  serializeDocumentTemplate
} from '../index';

describe('document template schema', () => {
  it('应支持序列化与反序列化默认模板', () => {
    const template = createDefaultDocumentTemplate();
    template.materials.push({
      id: 'node-1',
      type: 'BodyBlock',
      title: '正文',
      anchor: {
        row: 1,
        col: 1,
        rowspan: 8,
        colspan: 24
      },
      props: {
        placeholder: '正文'
      }
    });

    const serialized = serializeDocumentTemplate(template);
    const parsed = parseDocumentTemplate(serialized);

    expect(parsed.title).toBe(template.title);
    expect(parsed.materials).toHaveLength(1);
    expect(parsed.materials[0]?.type).toBe('BodyBlock');
  });
});
