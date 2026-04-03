export const infoColumns: TableColumnList = [
  {
    label: "序号",
    type: "index",
    index: 1,
    minWidth: 50,
    fixed: "left",
    showOverflowTooltip: true
  },
  {
    label: "区城",
    prop: "子级区划名称",
    width: 150,
    fixed: "left",
    showOverflowTooltip: true
  },
  {
    label: "公安-检察协同率",
    prop: "公安-检察协同率",
    slot: "公安-检察协同率",
    minWidth: 150,
    sortable: "custom"
  },
  {
    label: "检察办案率",
    prop: "检察办案率",
    slot: "检察办案率",
    minWidth: 120,
    sortable: "custom"
  },
  {
    label: "检察-法院协同率",
    prop: "检察-法院协同率",
    slot: "检察-法院协同率",
    minWidth: 150,
    sortable: "custom"
  },
  {
    label: "法院一审结案率",
    prop: "法院一审结案率",
    slot: "法院一审结案率",
    minWidth: 150,
    sortable: "custom"
  },
  {
    label: "总协同率",
    prop: "总协同率",
    slot: "总协同率",
    minWidth: 120,
    sortable: "custom"
  },
  {
    label: "到市访漏排率",
    prop: "到市访漏排率",
    slot: "到市访漏排率",
    minWidth: 150,
    sortable: "custom"
  },
  {
    label: "赴省访漏排率",
    prop: "赴省访漏排率",
    slot: "赴省访漏排率",
    minWidth: 150,
    sortable: "custom"
  },
  {
    label: "进京访漏排率",
    prop: "进京访漏排率",
    slot: "进京访漏排率",
    minWidth: 150,
    sortable: "custom"
  },
  {
    label: "涉法涉诉量",
    prop: "涉法涉诉量",
    slot: "涉法涉诉量",
    minWidth: 120,
    sortable: "custom"
  },
  {
    label: "信访量",
    prop: "信访量",
    slot: "信访量",
    minWidth: 120,
    sortable: "custom"
  }
];
