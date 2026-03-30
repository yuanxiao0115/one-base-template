import { defineComponent, h, type Component, type PropType } from 'vue';

import type {
  DocumentFieldOption,
  DocumentFieldType,
  DocumentTemplateField
} from '../schema/types';
import type { DocumentFormEngineContext } from './context';
import { readDocumentContextValue } from './context';

export interface DocumentFieldWidgetRenderProps {
  field: DocumentTemplateField;
  readonly?: boolean;
  modelValue?: unknown;
  options?: DocumentFieldOption[];
}

export interface DocumentFieldWidgetDefinition {
  type: DocumentFieldType;
  label: string;
  previewRenderer: Component;
  runtimeRenderer: Component;
  printRenderer: Component;
  defaultWidgetProps?: Record<string, unknown>;
}

const DOCUMENT_FIELD_WIDGETS_KEY = Symbol('document-form-engine-field-widgets');

function createFieldShellRenderer(
  name: string,
  renderBody: (props: DocumentFieldWidgetRenderProps) => ReturnType<typeof h>,
  shellClass = 'document-field-widget'
) {
  return defineComponent({
    name,
    props: {
      field: {
        type: Object as PropType<DocumentTemplateField>,
        required: true
      },
      readonly: {
        type: Boolean,
        default: false
      },
      modelValue: {
        type: null,
        default: undefined
      },
      options: {
        type: Array as PropType<DocumentFieldOption[]>,
        default: () => []
      }
    },
    setup(props) {
      return () =>
        h('div', { class: shellClass }, [
          h('div', { class: 'document-field-widget__label' }, props.field.label),
          renderBody(props)
        ]);
    }
  });
}

function resolvePrintableValue(props: DocumentFieldWidgetRenderProps, fallback = '') {
  const value = props.modelValue ?? props.field.defaultValue ?? fallback;
  return String(value ?? '').trim();
}

function normalizeValueArray(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((item) => item !== undefined && item !== null && String(item).trim() !== '')
    .map((item) => String(item));
}

function resolveOptionLabels(props: DocumentFieldWidgetRenderProps) {
  const selectedValues = normalizeValueArray(
    Array.isArray(props.modelValue)
      ? props.modelValue
      : [props.modelValue ?? props.field.defaultValue]
  );

  if (selectedValues.length === 0) {
    return '';
  }

  const optionMap = new Map((props.options || []).map((item) => [item.value, item.label]));
  const labels = selectedValues.map((value) => optionMap.get(value) ?? value).filter(Boolean);
  return labels.join('、');
}

function createInputRenderer(name: string, type: 'text' | 'number' | 'date') {
  return createFieldShellRenderer(name, (props) =>
    h('input', {
      class: 'document-field-widget__input',
      type,
      value: String(props.modelValue ?? props.field.defaultValue ?? ''),
      placeholder: String(props.field.widgetProps?.placeholder ?? ''),
      readonly: props.readonly
    })
  );
}

function createTextareaRenderer(name: string) {
  return createFieldShellRenderer(name, (props) =>
    h(
      'textarea',
      {
        class: 'document-field-widget__textarea',
        rows: Number(props.field.widgetProps?.rows ?? 4),
        placeholder: String(props.field.widgetProps?.placeholder ?? ''),
        readonly: props.readonly
      },
      String(props.modelValue ?? props.field.defaultValue ?? '')
    )
  );
}

const textRenderer = createInputRenderer('DocumentTextFieldRenderer', 'text');
const numberRenderer = createInputRenderer('DocumentNumberFieldRenderer', 'number');
const dateRenderer = createInputRenderer('DocumentDateFieldRenderer', 'date');
const textareaRenderer = createTextareaRenderer('DocumentTextareaFieldRenderer');

const richTextRenderer = createFieldShellRenderer('DocumentRichTextFieldRenderer', (props) =>
  h(
    'div',
    {
      class: 'document-field-widget__rich-text'
    },
    String(
      props.modelValue ?? props.field.defaultValue ?? props.field.widgetProps?.placeholder ?? ''
    )
  )
);

const selectRenderer = createFieldShellRenderer('DocumentSelectFieldRenderer', (props) =>
  h(
    'select',
    {
      class: 'document-field-widget__select',
      disabled: props.readonly
    },
    (props.options || []).map((item) =>
      h('option', { value: item.value, selected: item.value === props.modelValue }, item.label)
    )
  )
);

const checkboxRenderer = createFieldShellRenderer('DocumentCheckboxFieldRenderer', (props) =>
  h(
    'div',
    { class: 'document-field-widget__choices' },
    (props.options || []).map((item) =>
      h('label', { class: 'document-field-widget__choice' }, [
        h('input', {
          type: 'checkbox',
          disabled: props.readonly
        }),
        h('span', item.label)
      ])
    )
  )
);

const radioRenderer = createFieldShellRenderer('DocumentRadioFieldRenderer', (props) =>
  h(
    'div',
    { class: 'document-field-widget__choices' },
    (props.options || []).map((item) =>
      h('label', { class: 'document-field-widget__choice' }, [
        h('input', {
          type: 'radio',
          name: props.field.id,
          disabled: props.readonly
        }),
        h('span', item.label)
      ])
    )
  )
);

const attachmentRenderer = createFieldShellRenderer('DocumentAttachmentFieldRenderer', () =>
  h('div', { class: 'document-field-widget__attachment' }, '附件上传区')
);

const opinionRenderer = createFieldShellRenderer('DocumentOpinionFieldRenderer', (props) =>
  h('div', { class: 'document-field-widget__opinion' }, [
    h(
      'textarea',
      {
        class: 'document-field-widget__textarea',
        rows: Number(props.field.widgetProps?.rows ?? 4),
        placeholder: String(props.field.widgetProps?.placeholder ?? '请输入意见'),
        readonly: props.readonly
      },
      String(props.modelValue ?? '')
    ),
    h('div', { class: 'document-field-widget__meta' }, '签名 / 时间')
  ])
);

const stampRenderer = createFieldShellRenderer('DocumentStampFieldRenderer', () =>
  h('div', { class: 'document-field-widget__stamp' }, '签章位')
);

const selectorRenderer = createFieldShellRenderer('DocumentSelectorFieldRenderer', (props) =>
  h('input', {
    class: 'document-field-widget__input',
    type: 'text',
    value: String(props.modelValue ?? props.field.defaultValue ?? ''),
    placeholder: String(props.field.widgetProps?.placeholder ?? '请选择'),
    readonly: true
  })
);

const printTextRenderer = createFieldShellRenderer(
  'DocumentPrintTextFieldRenderer',
  (props) =>
    h(
      'div',
      { class: 'document-field-widget__print-text' },
      resolvePrintableValue(props, String(props.field.widgetProps?.placeholder ?? ''))
    ),
  'document-field-widget document-field-widget--print'
);

const printTextareaRenderer = createFieldShellRenderer(
  'DocumentPrintTextareaFieldRenderer',
  (props) =>
    h(
      'div',
      { class: 'document-field-widget__print-block' },
      resolvePrintableValue(props, String(props.field.widgetProps?.placeholder ?? ''))
    ),
  'document-field-widget document-field-widget--print'
);

const printSelectRenderer = createFieldShellRenderer(
  'DocumentPrintSelectFieldRenderer',
  (props) => h('div', { class: 'document-field-widget__print-text' }, resolveOptionLabels(props)),
  'document-field-widget document-field-widget--print'
);

const printOpinionRenderer = createFieldShellRenderer(
  'DocumentPrintOpinionFieldRenderer',
  (props) =>
    h('div', { class: 'document-field-widget__print-opinion' }, [
      h('div', { class: 'document-field-widget__print-block' }, resolvePrintableValue(props, '')),
      h('div', { class: 'document-field-widget__meta' }, '签名 / 时间')
    ]),
  'document-field-widget document-field-widget--print'
);

const printAttachmentRenderer = createFieldShellRenderer(
  'DocumentPrintAttachmentFieldRenderer',
  () => h('div', { class: 'document-field-widget__print-box' }, '附件（打印留白）'),
  'document-field-widget document-field-widget--print'
);

const printStampRenderer = createFieldShellRenderer(
  'DocumentPrintStampFieldRenderer',
  () => h('div', { class: 'document-field-widget__print-box' }, '签章区'),
  'document-field-widget document-field-widget--print'
);

const DEFAULT_DOCUMENT_FIELD_WIDGETS: DocumentFieldWidgetDefinition[] = [
  {
    type: 'text',
    label: '文本',
    previewRenderer: textRenderer,
    runtimeRenderer: textRenderer,
    printRenderer: printTextRenderer,
    defaultWidgetProps: {
      placeholder: '请输入文本'
    }
  },
  {
    type: 'textarea',
    label: '多行文本',
    previewRenderer: textareaRenderer,
    runtimeRenderer: textareaRenderer,
    printRenderer: printTextareaRenderer,
    defaultWidgetProps: {
      placeholder: '请输入内容',
      rows: 4
    }
  },
  {
    type: 'richText',
    label: '富文本',
    previewRenderer: richTextRenderer,
    runtimeRenderer: richTextRenderer,
    printRenderer: printTextareaRenderer,
    defaultWidgetProps: {
      placeholder: '请输入正文'
    }
  },
  {
    type: 'number',
    label: '数字',
    previewRenderer: numberRenderer,
    runtimeRenderer: numberRenderer,
    printRenderer: printTextRenderer
  },
  {
    type: 'amount',
    label: '金额',
    previewRenderer: numberRenderer,
    runtimeRenderer: numberRenderer,
    printRenderer: printTextRenderer
  },
  {
    type: 'date',
    label: '日期',
    previewRenderer: dateRenderer,
    runtimeRenderer: dateRenderer,
    printRenderer: printTextRenderer
  },
  {
    type: 'select',
    label: '下拉',
    previewRenderer: selectRenderer,
    runtimeRenderer: selectRenderer,
    printRenderer: printSelectRenderer
  },
  {
    type: 'radio',
    label: '单选',
    previewRenderer: radioRenderer,
    runtimeRenderer: radioRenderer,
    printRenderer: printSelectRenderer
  },
  {
    type: 'checkbox',
    label: '多选',
    previewRenderer: checkboxRenderer,
    runtimeRenderer: checkboxRenderer,
    printRenderer: printSelectRenderer
  },
  {
    type: 'person',
    label: '人员',
    previewRenderer: selectorRenderer,
    runtimeRenderer: selectorRenderer,
    printRenderer: printTextRenderer
  },
  {
    type: 'department',
    label: '部门',
    previewRenderer: selectorRenderer,
    runtimeRenderer: selectorRenderer,
    printRenderer: printTextRenderer
  },
  {
    type: 'attachment',
    label: '附件',
    previewRenderer: attachmentRenderer,
    runtimeRenderer: attachmentRenderer,
    printRenderer: printAttachmentRenderer
  },
  {
    type: 'opinion',
    label: '意见',
    previewRenderer: opinionRenderer,
    runtimeRenderer: opinionRenderer,
    printRenderer: printOpinionRenderer,
    defaultWidgetProps: {
      rows: 4
    }
  },
  {
    type: 'stamp',
    label: '签章',
    previewRenderer: stampRenderer,
    runtimeRenderer: stampRenderer,
    printRenderer: printStampRenderer
  },
  {
    type: 'serialNo',
    label: '编号',
    previewRenderer: textRenderer,
    runtimeRenderer: textRenderer,
    printRenderer: printTextRenderer,
    defaultWidgetProps: {
      placeholder: '请输入编号'
    }
  }
];

export function getDocumentFieldWidgets(context: DocumentFormEngineContext) {
  return readDocumentContextValue<DocumentFieldWidgetDefinition[]>(
    DOCUMENT_FIELD_WIDGETS_KEY,
    context,
    () => [...DEFAULT_DOCUMENT_FIELD_WIDGETS]
  );
}

export function registerDocumentFieldWidgets(
  context: DocumentFormEngineContext,
  definitions: DocumentFieldWidgetDefinition[]
) {
  const current = getDocumentFieldWidgets(context);
  const nextByType = new Map(current.map((item) => [item.type, item]));

  definitions.forEach((item) => {
    nextByType.set(item.type, item);
  });

  const next = [...nextByType.values()];
  context.values.set(DOCUMENT_FIELD_WIDGETS_KEY, next);
  return next;
}

export function getDocumentFieldWidgetDefinition(
  type: DocumentFieldType,
  context: DocumentFormEngineContext
) {
  return getDocumentFieldWidgets(context).find((item) => item.type === type) ?? null;
}
