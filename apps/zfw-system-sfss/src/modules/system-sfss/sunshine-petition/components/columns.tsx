export const visitColumns: TableColumnList = [
  {
    label: "信访日期",
    prop: "DATE",
    minWidth: 100
  },
  {
    label: "姓名",
    prop: "NAME",
    minWidth: 60
  },
  {
    label: "身份证号",
    prop: "IDCARD_NUM",
    minWidth: 120
  },
  {
    label: "联系电话",
    prop: "PHONE_NUM",
    minWidth: 100
  },
  {
    label: "行政区划",
    prop: "DISTRICT_NAME",
    minWidth: 100
  },
  {
    label: "信访诉求",
    prop: "APPEAL",
    minWidth: 160
  },
  {
    label: "信访类别",
    prop: "TYPE",
    sortable: "custom",
    minWidth: 150
  },
  {
    label: "操作",
    fixed: "right",
    width: 180,
    slot: "operation"
  }
];
