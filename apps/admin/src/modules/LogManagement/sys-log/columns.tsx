import type { TableColumnList } from "@one-base-template/ui";

export default [
  {
    label: "客户端IP",
    prop: "clientIp",
    minWidth: 150,
  },
  {
    label: "模块",
    prop: "module",
    minWidth: 150,
  },
  {
    label: "操作类型",
    prop: "operationType",
    minWidth: 150,
  },
  {
    label: "操作结果",
    prop: "operationResult",
    minWidth: 120,
    slot: "operationResult",
  },
  {
    label: "请求状态码",
    prop: "httpStatus",
    minWidth: 130,
  },
  {
    label: "请求接口地址",
    prop: "requestUrl",
    minWidth: 220,
    showOverflowTooltip: true,
  },
  {
    label: "创建时间",
    prop: "createTime",
    minWidth: 180,
  },
  {
    label: "操作人账号",
    prop: "userAccount",
    minWidth: 150,
  },
  {
    label: "操作人姓名",
    prop: "nickName",
    minWidth: 150,
  },
  {
    label: "操作",
    slot: "operation",
    fixed: "right",
    width: 140,
    align: "right",
  },
] satisfies TableColumnList;
