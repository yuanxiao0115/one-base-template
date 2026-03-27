import {
  createDefaultDocumentTemplate,
  type DocumentTemplateSchema
} from '@one-base-template/document-form-engine';

export function createMockDocumentTemplate(): DocumentTemplateSchema {
  const template = createDefaultDocumentTemplate();
  template.title = '发文单示例模板';
  template.materials = [
    {
      id: 'document-header',
      type: 'DocumentHeaderBlock',
      title: '发文头部',
      anchor: {
        row: 1,
        col: 1,
        rowspan: 6,
        colspan: 24
      },
      props: {
        title: '关于公文表单引擎建设的通知',
        documentNumber: '示例〔2026〕1号',
        signerLabel: '签发人',
        signerName: '办公室-张三'
      }
    },
    {
      id: 'recipient',
      type: 'RecipientBlock',
      title: '主送抄送',
      anchor: {
        row: 8,
        col: 1,
        rowspan: 4,
        colspan: 24
      },
      props: {
        primaryLabel: '主送',
        primaryValue: '示例单位',
        copyLabel: '抄送',
        copyValue: '示例部门'
      }
    },
    {
      id: 'body',
      type: 'BodyBlock',
      title: '正文',
      anchor: {
        row: 13,
        col: 1,
        rowspan: 12,
        colspan: 24
      },
      props: {
        placeholder: '这里是正文内容示例。'
      }
    },
    {
      id: 'opinion',
      type: 'OpinionBlock',
      title: '会签意见',
      anchor: {
        row: 26,
        col: 1,
        rowspan: 8,
        colspan: 24
      },
      props: {
        roleCode: 'countersign',
        roleLabel: '会签意见',
        rows: 4,
        signatureMode: 'image'
      }
    },
    {
      id: 'attachment',
      type: 'AttachmentBlock',
      title: '附件',
      anchor: {
        row: 35,
        col: 1,
        rowspan: 4,
        colspan: 12
      },
      props: {
        label: '附件',
        maxCount: 6
      }
    },
    {
      id: 'stamp',
      type: 'StampBlock',
      title: '签章区',
      anchor: {
        row: 35,
        col: 13,
        rowspan: 4,
        colspan: 12
      },
      props: {
        label: '签章区',
        showDate: true
      }
    },
    {
      id: 'meta',
      type: 'MetaInfoBlock',
      title: '拟稿信息',
      anchor: {
        row: 40,
        col: 1,
        rowspan: 4,
        colspan: 24
      },
      props: {
        fieldsLabel: '拟稿人 / 拟稿部门 / 日期'
      }
    }
  ];
  return template;
}
