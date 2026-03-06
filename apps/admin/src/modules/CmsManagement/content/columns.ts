import type { TableColumnList } from "@one-base-template/ui";

export const ARTICLE_TYPE_LABEL_MAP: Record<number, string> = {
  1: "原创",
  2: "转载",
};

export const REVIEW_STATUS_LABEL_MAP: Record<number, string> = {
  0: "待审核",
  1: "已通过",
  2: "已驳回",
};

export const contentColumns: TableColumnList = [
  {
    label: "标题",
    prop: "articleTitle",
    minWidth: 260,
    showOverflowTooltip: true,
  },
  {
    label: "文章类型",
    prop: "articleType",
    width: 110,
    formatter: ({ cellValue }: { cellValue: unknown }) => ARTICLE_TYPE_LABEL_MAP[Number(cellValue)] || "未知",
  },
  {
    label: "作者",
    prop: "articleAuthorName",
    minWidth: 140,
    showOverflowTooltip: true,
  },
  {
    label: "发布时间",
    prop: "publishTime",
    minWidth: 180,
  },
  {
    label: "浏览量",
    prop: "browseAmount",
    width: 96,
    align: "right",
  },
  {
    label: "点赞量",
    prop: "likeAmount",
    width: 96,
    align: "right",
  },
  {
    label: "评论数",
    prop: "commentAmount",
    width: 96,
    align: "right",
  },
  {
    label: "状态",
    prop: "reviewStatus",
    width: 110,
    slot: "reviewStatus",
  },
  {
    label: "操作",
    slot: "operation",
    fixed: "right",
    width: 200,
    align: "right",
  },
];

export default contentColumns;
