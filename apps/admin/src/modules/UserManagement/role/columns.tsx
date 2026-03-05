import type { TableColumnList } from "@one-base-template/ui";

export const roleColumns: TableColumnList = [
  {
    label: "角色名称",
    prop: "roleName",
    minWidth: 180,
  },
  {
    label: "角色编码",
    prop: "roleCode",
    minWidth: 160,
  },
  {
    label: "描述",
    prop: "remark",
    minWidth: 220,
  },
  {
    label: "创建时间",
    prop: "createTime",
    minWidth: 180,
  },
  {
    label: "修改时间",
    prop: "updateTime",
    minWidth: 180,
  },
  {
    label: "操作",
    slot: "operation",
    fixed: "right",
    width: 260,
    align: "right",
  },
];

export default roleColumns;
