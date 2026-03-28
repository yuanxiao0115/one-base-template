import { computed, defineComponent, h, type PropType } from 'vue';
import type { DocumentMaterialNode } from '../schema/types';
import {
  createDefaultMaterialSheetLayout,
  createDocumentMaterialStylePreset,
  DEFAULT_DOCUMENT_MATERIAL_STYLE_PRESET
} from './sheet-style';
import type { DocumentMaterialDefinition } from './types';

function createShellComponent(
  name: string,
  accent: string,
  body: (node: DocumentMaterialNode) => string
) {
  return defineComponent({
    name,
    props: {
      node: {
        type: Object as PropType<DocumentMaterialNode>,
        required: true
      }
    },
    setup(props) {
      const summary = computed(() => body(props.node));
      return () =>
        h(
          'div',
          {
            class: 'document-material-shell',
            style: {
              '--document-shell-accent': accent
            }
          },
          [
            h('div', { class: 'document-material-shell__label' }, props.node.title),
            h('div', { class: 'document-material-shell__summary' }, summary.value)
          ]
        );
    }
  });
}

function createMaterialStylePreset(key: string, borderColor: string) {
  return createDocumentMaterialStylePreset(key, '基础样式', {
    borderColor,
    backgroundColor: '#f8fafc'
  });
}

const headerPreview = createShellComponent('DocumentHeaderBlockPreview', '#7c2d12', (node) =>
  String(node.props.documentNumber || '发文字号')
);
const recipientPreview = createShellComponent(
  'RecipientBlockPreview',
  '#9a3412',
  (node) =>
    `${String(node.props.primaryLabel || '主送')} / ${String(node.props.copyLabel || '抄送')}`
);
const bodyPreview = createShellComponent('BodyBlockPreview', '#1d4ed8', (node) =>
  String(node.props.placeholder || '正文内容')
);
const opinionPreview = createShellComponent(
  'OpinionBlockPreview',
  '#0f766e',
  (node) =>
    `${String(node.props.roleLabel || '意见区')} · ${String(node.props.signatureMode || '图片章')}`
);
const attachmentPreview = createShellComponent('AttachmentBlockPreview', '#4338ca', (node) =>
  String(node.props.label || '附件列表')
);
const stampPreview = createShellComponent('StampBlockPreview', '#be123c', (node) =>
  String(node.props.label || '签章区')
);
const metaPreview = createShellComponent('MetaInfoBlockPreview', '#475569', (node) =>
  String(node.props.fieldsLabel || '拟稿 / 部门 / 日期')
);

export const DEFAULT_DOCUMENT_MATERIALS: DocumentMaterialDefinition[] = [
  {
    type: 'DocumentHeaderBlock',
    label: '公文头部',
    description: '文头、标题、文号与签发人信息',
    icon: 'ri:file-text-line',
    defaultSize: { rowspan: 6, colspan: 24 },
    sheetLayout: createDefaultMaterialSheetLayout(6, 24),
    stylePreset: createMaterialStylePreset('header', '#7c2d12'),
    defaultProps: {
      title: '关于推进公文表单引擎建设的通知',
      documentNumber: '〔2026〕01号',
      signerLabel: '签发人',
      signerName: '张三'
    },
    propertySchema: [
      { key: 'title', label: '标题', type: 'text', placeholder: '请输入标题' },
      { key: 'documentNumber', label: '文号', type: 'text', placeholder: '请输入文号' },
      { key: 'signerLabel', label: '签发标签', type: 'text' },
      { key: 'signerName', label: '签发人', type: 'text' }
    ],
    designerPreview: headerPreview,
    runtimeRenderer: headerPreview,
    printRenderer: headerPreview
  },
  {
    type: 'RecipientBlock',
    label: '主送抄送',
    description: '主送、抄送和报送对象',
    icon: 'ri:group-line',
    defaultSize: { rowspan: 4, colspan: 24 },
    sheetLayout: createDefaultMaterialSheetLayout(4, 24),
    stylePreset: createMaterialStylePreset('recipient', '#9a3412'),
    defaultProps: {
      primaryLabel: '主送',
      primaryValue: '',
      copyLabel: '抄送',
      copyValue: ''
    },
    propertySchema: [
      { key: 'primaryLabel', label: '主送标签', type: 'text' },
      { key: 'primaryValue', label: '主送默认值', type: 'textarea' },
      { key: 'copyLabel', label: '抄送标签', type: 'text' },
      { key: 'copyValue', label: '抄送默认值', type: 'textarea' }
    ],
    designerPreview: recipientPreview,
    runtimeRenderer: recipientPreview,
    printRenderer: recipientPreview
  },
  {
    type: 'BodyBlock',
    label: '正文',
    description: '正文编辑区或正文占位区',
    icon: 'ri:article-line',
    defaultSize: { rowspan: 12, colspan: 24 },
    sheetLayout: createDefaultMaterialSheetLayout(12, 24),
    stylePreset: createMaterialStylePreset('body', '#1d4ed8'),
    defaultProps: {
      placeholder: '请输入正文内容',
      minRows: 12
    },
    propertySchema: [
      { key: 'placeholder', label: '占位文案', type: 'textarea' },
      { key: 'minRows', label: '最小行数', type: 'number', min: 4, max: 40 }
    ],
    designerPreview: bodyPreview,
    runtimeRenderer: bodyPreview,
    printRenderer: bodyPreview
  },
  {
    type: 'OpinionBlock',
    label: '意见区',
    description: '拟稿、核稿、会签、领导意见统一物料',
    icon: 'ri:chat-3-line',
    defaultSize: { rowspan: 6, colspan: 24 },
    sheetLayout: createDefaultMaterialSheetLayout(6, 24),
    stylePreset: createMaterialStylePreset('opinion', '#0f766e'),
    defaultProps: {
      roleCode: 'draft',
      roleLabel: '拟稿意见',
      rows: 4,
      signatureMode: 'image'
    },
    propertySchema: [
      {
        key: 'roleCode',
        label: '角色编码',
        type: 'select',
        options: [
          { label: '拟稿', value: 'draft' },
          { label: '核稿', value: 'review' },
          { label: '会签', value: 'countersign' },
          { label: '领导', value: 'leader' }
        ]
      },
      { key: 'roleLabel', label: '区块标题', type: 'text' },
      { key: 'rows', label: '展示行数', type: 'number', min: 2, max: 12 },
      {
        key: 'signatureMode',
        label: '签名模式',
        type: 'select',
        options: [
          { label: '图片章', value: 'image' },
          { label: '纯文本', value: 'text' }
        ]
      }
    ],
    designerPreview: opinionPreview,
    runtimeRenderer: opinionPreview,
    printRenderer: opinionPreview
  },
  {
    type: 'AttachmentBlock',
    label: '附件区',
    description: '附件说明与附件列表',
    icon: 'ri:attachment-2',
    defaultSize: { rowspan: 4, colspan: 24 },
    sheetLayout: createDefaultMaterialSheetLayout(4, 24),
    stylePreset: createMaterialStylePreset('attachment', '#4338ca'),
    defaultProps: {
      label: '附件',
      maxCount: 9
    },
    propertySchema: [
      { key: 'label', label: '区块标题', type: 'text' },
      { key: 'maxCount', label: '最大数量', type: 'number', min: 1, max: 20 }
    ],
    designerPreview: attachmentPreview,
    runtimeRenderer: attachmentPreview,
    printRenderer: attachmentPreview
  },
  {
    type: 'StampBlock',
    label: '签章区',
    description: '落款、签名和盖章占位',
    icon: 'ri:stamp-line',
    defaultSize: { rowspan: 5, colspan: 12 },
    sheetLayout: createDefaultMaterialSheetLayout(5, 12),
    stylePreset: {
      ...DEFAULT_DOCUMENT_MATERIAL_STYLE_PRESET,
      key: 'stamp',
      style: {
        ...DEFAULT_DOCUMENT_MATERIAL_STYLE_PRESET.style,
        border: {
          ...DEFAULT_DOCUMENT_MATERIAL_STYLE_PRESET.style.border
        }
      }
    },
    defaultProps: {
      label: '签章区',
      showDate: true
    },
    propertySchema: [
      { key: 'label', label: '区块标题', type: 'text' },
      { key: 'showDate', label: '显示日期', type: 'boolean' }
    ],
    designerPreview: stampPreview,
    runtimeRenderer: stampPreview,
    printRenderer: stampPreview
  },
  {
    type: 'MetaInfoBlock',
    label: '元信息',
    description: '拟稿人、部门、时间等元数据',
    icon: 'ri:profile-line',
    defaultSize: { rowspan: 4, colspan: 12 },
    sheetLayout: createDefaultMaterialSheetLayout(4, 12),
    stylePreset: createMaterialStylePreset('meta', '#475569'),
    defaultProps: {
      fieldsLabel: '拟稿人 / 拟稿部门 / 日期'
    },
    propertySchema: [{ key: 'fieldsLabel', label: '字段说明', type: 'text' }],
    designerPreview: metaPreview,
    runtimeRenderer: metaPreview,
    printRenderer: metaPreview
  }
];
