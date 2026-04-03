import type { TableColumnList } from '@one-base-template/ui';

export const starterCrudColumns: TableColumnList = [
  {
    label: '示例编码',
    prop: 'code',
    minWidth: 180,
    showOverflowTooltip: true
  },
  {
    label: '示例名称',
    prop: 'name',
    minWidth: 180,
    showOverflowTooltip: true
  },
  {
    label: '负责人',
    prop: 'owner',
    minWidth: 140
  },
  {
    label: '状态',
    prop: 'status',
    slot: 'status',
    width: 110
  },
  {
    label: '更新时间',
    prop: 'updateTime',
    minWidth: 180
  },
  {
    label: '操作',
    slot: 'operation',
    fixed: 'right',
    width: 240,
    align: 'right'
  }
];

export default starterCrudColumns;
