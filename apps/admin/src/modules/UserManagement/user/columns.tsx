import type { TableColumnList } from "@one-base-template/ui";

export function buildUserColumns(enableDragSort: boolean): TableColumnList {
  const columns: TableColumnList = [];

  if (enableDragSort) {
    columns.push({
      label: "",
      width: 44,
      align: "center",
      slot: "dragHandle",
    });
  }

  columns.push(
    {
      type: "selection",
      fixed: "left",
      width: 55,
    },
    {
      label: "用户名",
      prop: "nickName",
      minWidth: 220,
      slot: "nickName",
    },
    {
      label: "登录账号",
      prop: "userAccount",
      minWidth: 140,
      showOverflowTooltip: true,
    },
    {
      label: "手机号",
      prop: "phone",
      minWidth: 140,
      showOverflowTooltip: true,
    },
    {
      label: "邮箱",
      prop: "mail",
      minWidth: 220,
      showOverflowTooltip: true,
    },
    {
      label: "性别",
      prop: "gender",
      width: 90,
      align: "left",
      slot: "gender",
    },
    {
      label: "状态",
      prop: "isEnable",
      width: 110,
      align: "left",
      slot: "status",
    },
    {
      label: "用户类型",
      prop: "userType",
      minWidth: 120,
      align: "left",
      slot: "userType",
    },
    {
      label: "创建时间",
      prop: "createTime",
      minWidth: 180,
      showOverflowTooltip: true,
    },
    {
      label: "最后登录时间",
      prop: "lastLoginTime",
      minWidth: 180,
      showOverflowTooltip: true,
    },
    {
      label: "操作",
      fixed: "right",
      width: 260,
      align: "right",
      slot: "operation",
    }
  );

  return columns;
}

export default buildUserColumns;
