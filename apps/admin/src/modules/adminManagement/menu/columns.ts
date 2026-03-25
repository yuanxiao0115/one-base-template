import type { TableColumnList } from '@one-base-template/ui';

function formatMenuBinaryValue(cellValue: unknown, enabledLabel: string, disabledLabel: string) {
  if (cellValue == null) {
    return '--';
  }

  return cellValue === 1 ? enabledLabel : disabledLabel;
}

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
    label: '图标',
    prop: 'icon',
    width: 120,
    slot: 'icon'
  },
  {
    label: '权限类型',
    prop: 'resourceTypeText',
    width: 108
  },
  {
    label: '缓存路由',
    prop: 'routeCache',
    width: 112,
    formatter: ({ cellValue }: { cellValue: unknown }) =>
      formatMenuBinaryValue(cellValue, '是', '否')
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
    label: '打开方式',
    prop: 'openMode',
    width: 112,
    formatter: ({ cellValue }: { cellValue: unknown }) =>
      cellValue == null ? '--' : cellValue === 0 ? '内部' : '外部'
  },
  {
    label: '跳转地址',
    prop: 'redirect',
    minWidth: 180
  },
  {
    label: '组件',
    prop: 'component',
    minWidth: 180
  },
  {
    label: '备注',
    prop: 'remark',
    minWidth: 180
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
