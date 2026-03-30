import { createDefaultDocumentSheet, normalizeDocumentSheet } from './sheet';
import type {
  AnyDocumentTemplateSchema,
  DocumentFieldOption,
  DocumentTemplateField,
  DocumentTemplatePlacement,
  DocumentTemplateSchema
} from './types';

export const DEFAULT_DOCUMENT_PAGE = {
  size: 'A4',
  width: 794,
  minHeight: 1123,
  padding: [32, 32, 32, 32]
} as const;

const DEFAULT_DOCUMENT_PRESET = {
  key: 'dispatch-form',
  label: '发文单',
  version: '1.0.0'
} as const;

function normalizeFieldOptions(options: DocumentFieldOption[] | undefined) {
  if (!Array.isArray(options)) {
    return undefined;
  }

  return options
    .filter((item) => item && typeof item.label === 'string' && typeof item.value === 'string')
    .map((item) => ({
      label: item.label,
      value: item.value
    }));
}

function normalizeFields(fields: DocumentTemplateField[] | undefined) {
  if (!Array.isArray(fields)) {
    return [];
  }

  return fields
    .filter((item) => item && typeof item.id === 'string' && typeof item.type === 'string')
    .map((item) => ({
      id: item.id,
      type: item.type,
      label: typeof item.label === 'string' && item.label.trim() ? item.label : item.id,
      defaultValue: item.defaultValue,
      required: Boolean(item.required),
      rules: Array.isArray(item.rules)
        ? item.rules.map((rule) => ({
            type: rule.type,
            value: rule.value,
            message: rule.message
          }))
        : [],
      widgetProps:
        item.widgetProps && typeof item.widgetProps === 'object'
          ? {
              ...item.widgetProps
            }
          : {},
      binding: item.binding
        ? {
            key: item.binding.key,
            path: item.binding.path
          }
        : undefined,
      dataSource:
        item.dataSource?.kind === 'static'
          ? {
              kind: 'static' as const,
              options: normalizeFieldOptions(item.dataSource.options) ?? []
            }
          : undefined
    }));
}

function normalizePlacements(placements: DocumentTemplatePlacement[] | undefined) {
  if (!Array.isArray(placements)) {
    return [];
  }

  return placements
    .filter((item) => item && typeof item.id === 'string' && typeof item.fieldId === 'string')
    .map((item) => ({
      id: item.id,
      fieldId: item.fieldId,
      displayMode: item.displayMode,
      section: item.section,
      readonly: Boolean(item.readonly),
      range: {
        row: Math.max(1, Math.round(item.range?.row ?? 1)),
        col: Math.max(1, Math.round(item.range?.col ?? 1)),
        rowspan: Math.max(1, Math.round(item.range?.rowspan ?? 1)),
        colspan: Math.max(1, Math.round(item.range?.colspan ?? 1))
      }
    }));
}

export function createDefaultDocumentTemplate(): DocumentTemplateSchema {
  const page = {
    size: DEFAULT_DOCUMENT_PAGE.size,
    width: DEFAULT_DOCUMENT_PAGE.width,
    minHeight: DEFAULT_DOCUMENT_PAGE.minHeight,
    padding: [...DEFAULT_DOCUMENT_PAGE.padding] as [number, number, number, number]
  };

  return {
    version: '3',
    kind: 'dispatch-form',
    title: '公文模板',
    page,
    print: {
      showGrid: false
    },
    preset: {
      ...DEFAULT_DOCUMENT_PRESET
    },
    sheet: createDefaultDocumentSheet({
      minHeight: page.minHeight,
      rowHeight: 28,
      columns: 24,
      showGrid: false
    }),
    fields: [],
    placements: [],
    designer: {}
  };
}

function createField(
  id: string,
  type: DocumentTemplateField['type'],
  label: string,
  widgetProps: Record<string, unknown> = {},
  bindingKey?: string,
  options?: DocumentFieldOption[]
): DocumentTemplateField {
  return {
    id,
    type,
    label,
    widgetProps,
    required: false,
    binding: bindingKey
      ? {
          key: bindingKey
        }
      : undefined,
    dataSource:
      options && options.length > 0
        ? {
            kind: 'static',
            options
          }
        : undefined
  };
}

export function createDispatchDocumentTemplate(): DocumentTemplateSchema {
  const template = createDefaultDocumentTemplate();
  template.title = '发文单示例模板';
  template.sheet.rows = 44;
  template.sheet.cells = [
    { row: 1, col: 1, rowspan: 1, colspan: 24, value: '发文单' },
    { row: 3, col: 1, rowspan: 1, colspan: 5, value: '标题' },
    { row: 7, col: 1, rowspan: 2, colspan: 2, value: '主送' },
    { row: 9, col: 1, rowspan: 2, colspan: 2, value: '抄送' },
    { row: 11, col: 1, rowspan: 1, colspan: 24, value: '正文' },
    { row: 25, col: 1, rowspan: 1, colspan: 24, value: '意见区' },
    { row: 34, col: 1, rowspan: 1, colspan: 12, value: '附件' },
    { row: 34, col: 13, rowspan: 1, colspan: 12, value: '签章' },
    { row: 40, col: 1, rowspan: 1, colspan: 3, value: '拟稿人' },
    { row: 40, col: 9, rowspan: 1, colspan: 3, value: '部门' },
    { row: 40, col: 17, rowspan: 1, colspan: 3, value: '日期' }
  ];
  template.sheet.merges = [
    { row: 1, col: 1, rowspan: 1, colspan: 24 },
    { row: 3, col: 6, rowspan: 3, colspan: 19 },
    { row: 7, col: 3, rowspan: 2, colspan: 22 },
    { row: 9, col: 3, rowspan: 2, colspan: 22 },
    { row: 12, col: 1, rowspan: 12, colspan: 24 },
    { row: 26, col: 1, rowspan: 7, colspan: 24 },
    { row: 35, col: 1, rowspan: 4, colspan: 12 },
    { row: 35, col: 13, rowspan: 4, colspan: 12 },
    { row: 40, col: 4, rowspan: 1, colspan: 4 },
    { row: 40, col: 12, rowspan: 1, colspan: 4 },
    { row: 40, col: 20, rowspan: 1, colspan: 5 }
  ];
  template.sheet.styles = [
    {
      row: 1,
      col: 1,
      rowspan: 1,
      colspan: 24,
      fontSize: 20,
      fontWeight: 'bold',
      horizontalAlign: 'center',
      verticalAlign: 'middle'
    },
    {
      row: 3,
      col: 1,
      rowspan: 3,
      colspan: 24,
      fontSize: 16,
      fontWeight: 'bold',
      horizontalAlign: 'center',
      verticalAlign: 'middle',
      border: {
        top: { color: '#1f2937', style: 'solid', width: 1 },
        right: { color: '#1f2937', style: 'solid', width: 1 },
        bottom: { color: '#1f2937', style: 'solid', width: 1 },
        left: { color: '#1f2937', style: 'solid', width: 1 }
      }
    },
    {
      row: 7,
      col: 1,
      rowspan: 4,
      colspan: 24,
      border: {
        top: { color: '#475569', style: 'solid', width: 1 },
        right: { color: '#475569', style: 'solid', width: 1 },
        bottom: { color: '#475569', style: 'solid', width: 1 },
        left: { color: '#475569', style: 'solid', width: 1 }
      },
      verticalAlign: 'middle',
      wrap: true
    },
    {
      row: 12,
      col: 1,
      rowspan: 12,
      colspan: 24,
      border: {
        top: { color: '#475569', style: 'solid', width: 1 },
        right: { color: '#475569', style: 'solid', width: 1 },
        bottom: { color: '#475569', style: 'solid', width: 1 },
        left: { color: '#475569', style: 'solid', width: 1 }
      }
    },
    {
      row: 26,
      col: 1,
      rowspan: 7,
      colspan: 24,
      border: {
        top: { color: '#475569', style: 'solid', width: 1 },
        right: { color: '#475569', style: 'solid', width: 1 },
        bottom: { color: '#475569', style: 'solid', width: 1 },
        left: { color: '#475569', style: 'solid', width: 1 }
      }
    },
    {
      row: 35,
      col: 1,
      rowspan: 4,
      colspan: 12,
      border: {
        top: { color: '#475569', style: 'solid', width: 1 },
        right: { color: '#475569', style: 'solid', width: 1 },
        bottom: { color: '#475569', style: 'solid', width: 1 },
        left: { color: '#475569', style: 'solid', width: 1 }
      }
    },
    {
      row: 35,
      col: 13,
      rowspan: 4,
      colspan: 12,
      border: {
        top: { color: '#475569', style: 'solid', width: 1 },
        right: { color: '#475569', style: 'solid', width: 1 },
        bottom: { color: '#475569', style: 'solid', width: 1 },
        left: { color: '#475569', style: 'solid', width: 1 }
      }
    },
    {
      row: 40,
      col: 1,
      rowspan: 1,
      colspan: 24,
      border: {
        top: { color: '#475569', style: 'solid', width: 1 },
        right: { color: '#475569', style: 'solid', width: 1 },
        bottom: { color: '#475569', style: 'solid', width: 1 },
        left: { color: '#475569', style: 'solid', width: 1 }
      }
    }
  ];
  template.fields = [
    createField('documentTitle', 'text', '标题', { placeholder: '请输入标题' }, 'title'),
    createField('serialNo', 'serialNo', '文号', { placeholder: '请输入文号' }, 'serialNo'),
    createField(
      'primaryRecipients',
      'textarea',
      '主送',
      { placeholder: '请输入主送单位', rows: 2 },
      'primaryRecipients'
    ),
    createField(
      'copyRecipients',
      'textarea',
      '抄送',
      { placeholder: '请输入抄送单位', rows: 2 },
      'copyRecipients'
    ),
    createField('body', 'richText', '正文', { placeholder: '请输入正文' }, 'body'),
    createField('opinion', 'opinion', '意见区', { rows: 4 }, 'opinion'),
    createField('attachment', 'attachment', '附件', {}, 'attachments'),
    createField('stamp', 'stamp', '签章', {}, 'stamp'),
    createField('drafter', 'person', '拟稿人', { placeholder: '请选择拟稿人' }, 'drafter'),
    createField('department', 'department', '部门', { placeholder: '请选择部门' }, 'department'),
    createField('issueDate', 'date', '日期', {}, 'issueDate')
  ];
  template.placements = [
    {
      id: 'placement-document-title',
      fieldId: 'documentTitle',
      range: { row: 3, col: 6, rowspan: 3, colspan: 19 },
      displayMode: 'mergedRange',
      section: 'header'
    },
    {
      id: 'placement-serial-no',
      fieldId: 'serialNo',
      range: { row: 6, col: 18, rowspan: 1, colspan: 7 },
      displayMode: 'singleCell',
      section: 'header'
    },
    {
      id: 'placement-primary',
      fieldId: 'primaryRecipients',
      range: { row: 7, col: 3, rowspan: 2, colspan: 22 },
      displayMode: 'mergedRange',
      section: 'recipient'
    },
    {
      id: 'placement-copy',
      fieldId: 'copyRecipients',
      range: { row: 9, col: 3, rowspan: 2, colspan: 22 },
      displayMode: 'mergedRange',
      section: 'recipient'
    },
    {
      id: 'placement-body',
      fieldId: 'body',
      range: { row: 12, col: 1, rowspan: 12, colspan: 24 },
      displayMode: 'mergedRange',
      section: 'body'
    },
    {
      id: 'placement-opinion',
      fieldId: 'opinion',
      range: { row: 26, col: 1, rowspan: 7, colspan: 24 },
      displayMode: 'mergedRange',
      section: 'opinion'
    },
    {
      id: 'placement-attachment',
      fieldId: 'attachment',
      range: { row: 35, col: 1, rowspan: 4, colspan: 12 },
      displayMode: 'mergedRange',
      section: 'attachment'
    },
    {
      id: 'placement-stamp',
      fieldId: 'stamp',
      range: { row: 35, col: 13, rowspan: 4, colspan: 12 },
      displayMode: 'imageSlot',
      section: 'footer'
    },
    {
      id: 'placement-drafter',
      fieldId: 'drafter',
      range: { row: 40, col: 4, rowspan: 1, colspan: 4 },
      displayMode: 'singleCell',
      section: 'meta'
    },
    {
      id: 'placement-department',
      fieldId: 'department',
      range: { row: 40, col: 12, rowspan: 1, colspan: 4 },
      displayMode: 'singleCell',
      section: 'meta'
    },
    {
      id: 'placement-issue-date',
      fieldId: 'issueDate',
      range: { row: 40, col: 20, rowspan: 1, colspan: 5 },
      displayMode: 'singleCell',
      section: 'meta'
    }
  ];

  return template;
}

export function normalizeDocumentTemplate(
  input: Partial<AnyDocumentTemplateSchema> | null | undefined
): DocumentTemplateSchema {
  const fallback = createDefaultDocumentTemplate();
  if (!input) {
    return fallback;
  }

  const page = {
    ...fallback.page,
    ...input.page
  };
  const print = {
    ...fallback.print,
    ...input.print
  };

  return {
    version: '3',
    kind: 'dispatch-form',
    title: typeof input.title === 'string' && input.title.trim() ? input.title : fallback.title,
    page,
    print,
    preset:
      input.preset?.key === 'dispatch-form'
        ? {
            key: 'dispatch-form',
            label: input.preset.label || fallback.preset.label,
            version: input.preset.version || fallback.preset.version
          }
        : {
            ...fallback.preset
          },
    sheet: normalizeDocumentSheet(input.sheet, fallback.sheet),
    fields: normalizeFields(input.fields),
    placements: normalizePlacements(input.placements),
    designer:
      input.designer && typeof input.designer === 'object'
        ? {
            univerSnapshot:
              input.designer.univerSnapshot && typeof input.designer.univerSnapshot === 'object'
                ? { ...(input.designer.univerSnapshot as Record<string, unknown>) }
                : undefined
          }
        : {
            ...fallback.designer
          }
  };
}

export function serializeDocumentTemplate(template: DocumentTemplateSchema) {
  return JSON.stringify(template, null, 2);
}

export function parseDocumentTemplate(raw: string) {
  return normalizeDocumentTemplate(JSON.parse(raw) as Partial<AnyDocumentTemplateSchema>);
}
