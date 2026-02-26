import type { TableColumnList } from '@one-base-template/ui'

export const columns: TableColumnList = [
  {
    label: '登录账号',
    prop: 'userAccount',
    minWidth: 150
  },
  {
    label: '用户姓名',
    prop: 'nickName',
    minWidth: 150
  },
  {
    label: '客户端类型',
    prop: 'clientTypeLabel',
    minWidth: 160
  },
  {
    label: '登录IP',
    prop: 'clientIp',
    minWidth: 160
  },
  {
    label: '登录地点',
    prop: 'location',
    minWidth: 160,
    showOverflowTooltip: true
  },
  {
    label: '登录时间',
    prop: 'createTime',
    minWidth: 180,
    sortable: 'custom'
  },
  {
    label: '操作',
    width: 140,
    fixed: 'right',
    slot: 'action'
  }
]

export default columns
