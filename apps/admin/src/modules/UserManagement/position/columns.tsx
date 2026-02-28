import type { TableColumnList } from '@one-base-template/ui';

export const positionColumns: TableColumnList = [
  {
    label: '序号',
    type: 'index',
    width: 80
  },
  {
    label: '职位名称',
    prop: 'postName',
    minWidth: 200
  },
  {
    label: '职位描述',
    prop: 'remark',
    minWidth: 220
  },
  {
    label: '排序',
    prop: 'sort',
    minWidth: 120
  },
  {
    label: '创建时间',
    prop: 'createTime',
    minWidth: 180
  },
  {
    label: '操作',
    fixed: 'right',
    width: 180,
    slot: 'operation'
  }
];

export default positionColumns;
