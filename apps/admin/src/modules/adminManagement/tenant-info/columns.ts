import type { TableColumnList } from '@one-base-template/ui';

export const tenantInfoColumns: TableColumnList = [
  {
    label: '租户ID',
    prop: 'id',
    minWidth: 180
  },
  {
    label: '租户名称',
    prop: 'tenantName',
    minWidth: 180
  },
  {
    label: '联系人',
    prop: 'contactName',
    minWidth: 140
  },
  {
    label: '联系电话',
    prop: 'contactPhone',
    minWidth: 150
  },
  {
    label: '状态',
    prop: 'tenantState',
    width: 120,
    slot: 'tenantState'
  },
  {
    label: '最大用户数',
    prop: 'maxNumber',
    width: 130,
    align: 'right'
  },
  {
    label: '管理员',
    prop: 'managerAccount',
    minWidth: 180
  },
  {
    label: '到期时间',
    prop: 'expireTime',
    minWidth: 180
  },
  {
    label: '备注',
    prop: 'remark',
    minWidth: 220
  },
  {
    label: '操作',
    slot: 'operation',
    fixed: 'right',
    width: 340,
    align: 'right'
  }
];

export default tenantInfoColumns;
