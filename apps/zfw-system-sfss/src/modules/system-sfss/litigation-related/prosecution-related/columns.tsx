export const gaColumns: TableColumnList = [
  {
    label: "信访日期",
    prop: "XFRQ",
    minWidth: 120
  },

  {
    label: "姓名",
    prop: "XM",
    minWidth: 100
  },
  {
    label: "身份证号",
    prop: "SFZH",
    minWidth: 150
  },
  {
    label: "联系电话",
    prop: "SJHM",
    minWidth: 120
  },
  // {
  //   label: "信访件编号",
  //   prop: "XFJBH",
  //   minWidth: 120
  // },
  // {
  //   label: "信访形式",
  //   prop: "XFXS",
  //   minWidth: 100
  // },
  // {
  //   label: "住址",
  //   prop: "ZH",
  //   minWidth: 150
  // },

  {
    label: "问题发生地",
    prop: "WTFSD",
    minWidth: 100
  },
  {
    label: "信访内容",
    prop: "XFNR",
    minWidth: 150
  },
  // {
  //   label: "异常动态",
  //   prop: "YCDT",
  //   minWidth: 120
  // },
  // {
  //   label: "问题发生日期",
  //   prop: "WTFSRQ",
  //   minWidth: 120
  // },
  // {
  //   label: "信访人数",
  //   prop: "XFRS",
  //   minWidth: 120
  // },
  // {
  //   label: "信访诉求",
  //   prop: "XFSQ",
  //   minWidth: 120
  // },
  // {
  //   label: "公安业务分类",
  //   prop: "GAYWFL",
  //   minWidth: 120
  // },
  // {
  //   label: "登记单位",
  //   prop: "DJDW",
  //   minWidth: 120
  // },
  // {
  //   label: "档案编号",
  //   prop: "DABH",
  //   minWidth: 120
  // },
  // {
  //   label: "转往处",
  //   prop: "ZWC",
  //   minWidth: 120
  // },
  // {
  //   label: "办理方式",
  //   prop: "BLFS",
  //   minWidth: 120
  // },
  // {
  //   label: "具体承办单位",
  //   prop: "JTCBDW",
  //   minWidth: 120
  // },
  // {
  //   label: "信访件状态",
  //   prop: "XFJZT",
  //   minWidth: 100
  // },
  // {
  //   label: "办结状态",
  //   prop: "BJZT",
  //   minWidth: 100
  // },
  // {
  //   label: "限办时间",
  //   prop: "XBSJ",
  //   minWidth: 120
  // },
  // {
  //   label: "责任部门",
  //   prop: "ZRBM",
  //   minWidth: 120
  // },
  // {
  //   label: "办结时间",
  //   prop: "BJSJ",
  //   minWidth: 120
  // },
  // {
  //   label: "登记时间",
  //   prop: "DJSJ",
  //   minWidth: 120
  // },
  // {
  //   label: "信访事项编号",
  //   prop: "XFSJBH",
  //   minWidth: 120
  // },
  // {
  //   label: "警种名称",
  //   prop: "JZMC",
  //   minWidth: 120
  // },
  // {
  //   label: "信访目的(登记单位)",
  //   prop: "XFMD",
  //   minWidth: 150
  // },
  {
    label: "操作",
    fixed: "right",
    width: 120,
    slot: "operation"
  }
];

export const jcColumns: TableColumnList = [
  // {
  //   label: "条码",
  //   prop: "TM",
  //   minWidth: 100
  // },
  {
    label: "登记日期",
    prop: "DJRQ",
    minWidth: 120
  },
  {
    label: "姓名",
    prop: "XFRMC",
    minWidth: 100
  },
  {
    label: "身份证号",
    prop: "ZJHM",
    minWidth: 150
  },
  {
    label: "联系电话",
    prop: "LXFS",
    minWidth: 120
  },
  // {
  //   label: "信访类型",
  //   prop: "XFLX",
  //   minWidth: 150
  // },
  // {
  //   label: "是否重复",
  //   prop: "SFCF",
  //   minWidth: 100
  // },
  // {
  //   label: "信访方式",
  //   prop: "SFFSH",
  //   minWidth: 120
  // },
  // {
  //   label: "案件名称",
  //   prop: "AJMC",
  //   minWidth: 150
  // },
  {
    label: "案发地",
    prop: "AFD",
    minWidth: 150
  },
  // {
  //   label: "接收单位",
  //   prop: "JSDW",
  //   minWidth: 120
  // },
  // {
  //   label: "信访次数",
  //   prop: "XFCS",
  //   minWidth: 100
  // },
  // {
  //   label: "承办单位",
  //   prop: "CBDW",
  //   minWidth: 120
  // },
  // {
  //   label: "登记人",
  //   prop: "DJR",
  //   minWidth: 100
  // },
  // {
  //   label: "分流/办理情况",
  //   prop: "BLQK",
  //   minWidth: 150
  // },
  // {
  //   label: "承办人",
  //   prop: "CBR",
  //   minWidth: 120
  // },
  // {
  //   label: "推送日期",
  //   prop: "SLRQ",
  //   minWidth: 120
  // },
  // {
  //   label: "部门受案号",
  //   prop: "BMSAH",
  //   minWidth: 120
  // },
  // {
  //   label: "被信访人姓名",
  //   prop: "BXFRXM",
  //   minWidth: 120
  // },
  {
    label: "案情摘要",
    prop: "AQZY",
    minWidth: 180
  },

  {
    label: "操作",
    fixed: "right",
    width: 200,
    slot: "operation"
  }
];

export const fyColumns: TableColumnList = [
  {
    label: "信访日期",
    prop: "RQ",
    minWidth: 100
  },
  {
    label: "姓名",
    prop: "XFRMC",
    minWidth: 100
  },
  {
    label: "身份证号",
    prop: "ZJHM",
    minWidth: 150
  },
  {
    label: "联系电话",
    prop: "LXFS",
    minWidth: 120
  },
  // {
  //   label: "初/重",
  //   prop: "CZ",
  //   minWidth: 100
  // },
  // {
  //   label: "类型",
  //   prop: "LX",
  //   minWidth: 100
  // },
  {
    label: "责任单位",
    prop: "ZRDW",
    minWidth: 100
  },
  {
    label: "信访诉求",
    prop: "XFSQ",
    minWidth: 180
  },
  // {
  //   label: "责任领导",
  //   prop: "ZRLD",
  //   minWidth: 100
  // },
  // {
  //   label: "包联领导",
  //   prop: "BLLD",
  //   minWidth: 100
  // },
  // {
  //   label: "办理情况（写明化解情况）",
  //   prop: "BLQK",
  //   minWidth: 180
  // },
  // {
  //   label: "是否进行过评查（写明哪个单位评查，时间、评查结果）",
  //   prop: "SFJXGPC",
  //   minWidth: 150
  // },
  // {
  //   label: "案件进展（审理中、拟终结、拟再审、已再审、已终结、息诉罢访等）",
  //   prop: "AJJZ",
  //   minWidth: 150
  // },
  // {
  //   label: "拟终结进度/拟再审进度",
  //   prop: "NZJJD",
  //   minWidth: 120
  // },
  // {
  //   label: "是否属于未判先访，未穷尽法律救济途径前信访",
  //   prop: "SFSYWPXF",
  //   minWidth: 150
  // },
  // {
  //   label: "月份",
  //   prop: "YF",
  //   minWidth: 120
  // },
  // {
  //   label: "案件生效日期",
  //   prop: "AJSXRQ",
  //   minWidth: 120
  // },
  // {
  //   label:
  //     "未曾立案、裁定不予受理、驳回起诉、行政拆迁、涉众经济纠纷等（属于那种情况）",
  //   prop: "SYNZQK",
  //   minWidth: 120
  // },
  // {
  //   label: "是否隐患排查",
  //   prop: "SFYHPC",
  //   minWidth: 120
  // },
  // {
  //   label: "全流程调解",
  //   prop: "QLCTJ",
  //   minWidth: 150
  // },
  // {
  //   label: "判后答疑",
  //   prop: "PHDY",
  //   minWidth: 150
  // },
  // {
  //   label: "风险研判",
  //   prop: "FXYP",
  //   minWidth: 150
  // },
  // {
  //   label: "人数",
  //   prop: "RS",
  //   minWidth: 100
  // },
  // {
  //   label: "证件号码",
  //   prop: "ZJHM",
  //   minWidth: 150
  // },
  // {
  //   label: "联系方式",
  //   prop: "LXFS",
  //   minWidth: 120
  // },
  // {
  //   label: "住所地",
  //   prop: "ZSD",
  //   minWidth: 150
  // },
  // {
  //   label: "籍贯",
  //   prop: "JG",
  //   minWidth: 150
  // },
  // {
  //   label: "被反映案号",
  //   prop: "BFYAH",
  //   minWidth: 150
  // },
  // {
  //   label: "被反映或省院庭室",
  //   prop: "BFYHSYTS",
  //   minWidth: 150
  // },
  // {
  //   label: "分类",
  //   prop: "FL",
  //   minWidth: 120
  // },
  // {
  //   label: "一级案由",
  //   prop: "YIJAY",
  //   minWidth: 150
  // },
  // {
  //   label: "二级案由",
  //   prop: "ERJAY",
  //   minWidth: 150
  // },
  // {
  //   label: "三级案由",
  //   prop: "SANJAY",
  //   minWidth: 150
  // },
  // {
  //   label: "四级案由",
  //   prop: "SIJAY",
  //   minWidth: 150
  // },
  // {
  //   label: "具体案由",
  //   prop: "JTAY",
  //   minWidth: 150
  // },
  // {
  //   label: "一审案号",
  //   prop: "YISAH",
  //   minWidth: 150
  // },
  // {
  //   label: "一审法院",
  //   prop: "YISFY",
  //   minWidth: 150
  // },
  // {
  //   label: "一审主办人",
  //   prop: "YISZBR",
  //   minWidth: 120
  // },
  // {
  //   label: "二审案号",
  //   prop: "ERSAH",
  //   minWidth: 150
  // },
  // {
  //   label: "二审法院",
  //   prop: "ERSFY",
  //   minWidth: 150
  // },
  // {
  //   label: "二审结果",
  //   prop: "ERSJG",
  //   minWidth: 150
  // },
  // {
  //   label: "二审主办人",
  //   prop: "ERSZBR",
  //   minWidth: 120
  // },
  // {
  //   label: "再审案号",
  //   prop: "ZSAH",
  //   minWidth: 150
  // },
  // {
  //   label: "再审法院",
  //   prop: "ZSFY",
  //   minWidth: 150
  // },
  // {
  //   label: "再审主办人",
  //   prop: "ZSZBR",
  //   minWidth: 120
  // },

  // {
  //   label: "生效案号",
  //   prop: "SXAH",
  //   minWidth: 150
  // },
  // {
  //   label: "生效法院",
  //   prop: "SXFY",
  //   minWidth: 150
  // },
  // {
  //   label: "生效主办人",
  //   prop: "SXZBR",
  //   minWidth: 120
  // },
  // {
  //   label: "备注",
  //   prop: "BZ",
  //   minWidth: 120
  // },
  // {
  //   label: "三跨三分离情况（跨省、市、区）",
  //   prop: "SKSFLQK",
  //   minWidth: 120
  // }
  {
    label: "操作",
    fixed: "right",
    width: 120,
    slot: "operation"
  }
];
