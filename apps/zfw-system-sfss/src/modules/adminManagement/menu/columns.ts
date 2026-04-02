import type { TableColumnList } from '@one-base-template/ui';

export const menuColumns: TableColumnList = [
  {
    label: '权限名称',
    prop: 'resourceName',
    minWidth: 260,
    fixed: 'left',
    treeNode: true
  },
  {
    label: '排序',
    prop: 'sort',
    width: 88,
    align: 'right'
  },
  {
    label: '权限类型',
    prop: 'resourceTypeText',
    width: 108
  },
  {
    label: '访问路径',
    prop: 'url',
    minWidth: 180
  },
  {
    label: '状态',
    prop: 'hidden',
    width: 98,
    formatter: ({ cellValue }: { cellValue: unknown }) =>
      cellValue == null ? '--' : cellValue === 0 ? '显示' : '隐藏'
  },
  {
    label: '操作',
    slot: 'operation',
    fixed: 'right',
    width: 260,
    align: 'right'
  }
];

export default menuColumns;
