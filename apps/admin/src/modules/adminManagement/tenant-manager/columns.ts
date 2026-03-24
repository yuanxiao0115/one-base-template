import type { TableColumnList } from '@one-base-template/ui';

export const tenantManagerColumns: TableColumnList = [
  {
    label: '勾选列',
    type: 'selection',
    fixed: 'left',
    reserveSelection: true,
    width: 52
  },
  {
    label: '管理员账号',
    prop: 'userAccount',
    minWidth: 180
  },
  {
    label: '管理员状态',
    prop: 'isEnable',
    width: 120,
    slot: 'isEnable'
  },
  {
    label: '租户名称',
    prop: 'tenantName',
    minWidth: 180
  },
  {
    label: '创建时间',
    prop: 'createTime',
    minWidth: 180
  },
  {
    label: '操作',
    slot: 'operation',
    fixed: 'right',
    width: 220,
    align: 'right'
  }
];

export default tenantManagerColumns;
