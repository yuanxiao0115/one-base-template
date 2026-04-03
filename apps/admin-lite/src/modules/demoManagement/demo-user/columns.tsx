import type { TableColumnList } from '@one-base-template/ui';

const demoUserColumns: TableColumnList = [
  {
    label: '名称',
    prop: 'name',
    minWidth: 180,
    showOverflowTooltip: true
  },
  {
    label: '编码',
    prop: 'code',
    minWidth: 180,
    showOverflowTooltip: true
  },
  {
    label: '状态',
    prop: 'status',
    width: 120,
    slot: 'status'
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
    width: 200,
    align: 'right'
  }
];

export default demoUserColumns;
