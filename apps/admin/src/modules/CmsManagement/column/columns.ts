import type { TableColumnList } from "@one-base-template/ui";

export const columnColumns: TableColumnList = [
  {
    label: "栏目名称",
    prop: "categoryName",
    minWidth: 220,
    treeNode: true,
    showOverflowTooltip: true,
  },
  {
    label: "显示状态",
    prop: "isShow",
    width: 120,
    slot: "isShow",
  },
  {
    label: "文章数量",
    prop: "articleAmount",
    width: 110,
    align: "right",
  },
  {
    label: "排序",
    prop: "sort",
    width: 90,
    align: "right",
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
    width: 320,
    align: "right",
  },
];

export default columnColumns;
