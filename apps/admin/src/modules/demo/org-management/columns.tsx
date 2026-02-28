import type { TableColumnList } from '@one-base-template/ui'

export const orgColumns: TableColumnList = [
  {
    label: '组织全称',
    prop: 'orgName',
    minWidth: 220,
    treeNode: true,
    slot: 'orgName',
    showOverflowTooltip: true
  },
  {
    label: '组织简称',
    prop: 'briefName',
    minWidth: 180,
    showOverflowTooltip: true
  },
  {
    label: '排序',
    prop: 'sort',
    width: 90,
    align: 'center'
  },
  {
    label: '组织类型',
    prop: 'orgCategory',
    minWidth: 150,
    slot: 'orgCategory'
  },
  {
    label: '等级',
    prop: 'orgLevelName',
    minWidth: 120,
    showOverflowTooltip: true
  },
  {
    label: '机构类别',
    prop: 'institutionalType',
    minWidth: 150,
    slot: 'institutionalType'
  },
  {
    label: '统一社会信用代码',
    prop: 'uscc',
    minWidth: 180,
    showOverflowTooltip: true
  },
  {
    label: '创建时间',
    prop: 'createTime',
    minWidth: 180,
    sortable: 'custom'
  },
  {
    label: '操作',
    fixed: 'right',
    width: 220,
    slot: 'operation'
  }
]

export default orgColumns
