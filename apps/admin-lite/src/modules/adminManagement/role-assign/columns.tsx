import type { TableColumnList } from '@one-base-template/ui';

export const roleAssignColumns: TableColumnList = [
  {
    label: '',
    type: 'selection',
    fixed: 'left'
  },
  {
    label: '用户名',
    prop: 'userAccount',
    minWidth: 180
  },
  {
    label: '姓名',
    prop: 'nickName',
    minWidth: 150
  },
  {
    label: '操作',
    slot: 'operation',
    fixed: 'right',
    width: 120,
    align: 'right'
  }
];

export default roleAssignColumns;
