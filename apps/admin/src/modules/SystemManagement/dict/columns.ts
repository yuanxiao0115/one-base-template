import type { TableColumnList } from "@one-base-template/ui";

export const dictColumns: TableColumnList = [
  {
    label: "字典编码",
    prop: "dictCode",
    minWidth: 180,
  },
  {
    label: "字典名称",
    prop: "dictName",
    minWidth: 180,
  },
  {
    label: "描述",
    prop: "remark",
    minWidth: 220,
  },
  {
    label: "创建人",
    prop: "creatorName",
    minWidth: 160,
  },
  {
    label: "创建时间",
    prop: "createTime",
    minWidth: 180,
  },
  {
    label: "操作",
    slot: "operation",
    fixed: "right",
    width: 280,
    align: "right",
  },
];

export const dictItemColumns: TableColumnList = [
  {
    label: "字段名称",
    prop: "itemName",
    minWidth: 180,
  },
  {
    label: "字段键值",
    prop: "itemValue",
    minWidth: 180,
  },
  {
    label: "状态",
    prop: "disabled",
    slot: "disabled",
    width: 120,
  },
  {
    label: "展示序位",
    prop: "sort",
    minWidth: 110,
    align: "right",
  },
  {
    label: "描述",
    prop: "remark",
    minWidth: 220,
  },
  {
    label: "创建人",
    prop: "createBy",
    minWidth: 140,
  },
  {
    label: "创建时间",
    prop: "createTime",
    minWidth: 180,
  },
  {
    label: "操作",
    slot: "itemOperation",
    fixed: "right",
    width: 240,
    align: "right",
  },
];

export default dictColumns;
