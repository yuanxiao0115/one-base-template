import type { TableColumnList } from "@one-base-template/ui";

export default [
  {
    label: "登录账号",
    prop: "userAccount",
    minWidth: 150,
  },
  {
    label: "用户姓名",
    prop: "nickName",
    minWidth: 150,
  },
  {
    label: "客户端类型",
    prop: "clientTypeLabel",
    minWidth: 150,
  },
  {
    label: "登录IP",
    prop: "clientIp",
    minWidth: 150,
  },
  {
    label: "登录地点",
    prop: "location",
    minWidth: 180,
    showOverflowTooltip: true,
  },
  {
    label: "登录时间",
    prop: "createTime",
    minWidth: 180,
  },
  {
    label: "操作",
    slot: "operation",
    fixed: "right",
    width: 140,
    align: "right",
  },
] satisfies TableColumnList;
