import type { TableColumnList } from "@one-base-template/ui";
import type { ReviewStatus } from "./api";

export interface OptionItem<T extends number | string> {
  label: string;
  value: T;
}

export const ARTICLE_TYPE_OPTIONS: OptionItem<number>[] = [
  { label: "原创", value: 1 },
  { label: "转载", value: 2 },
];

export const REVIEW_STATUS_OPTIONS: OptionItem<ReviewStatus>[] = [
  { label: "待审核", value: 0 },
  { label: "已通过", value: 1 },
  { label: "已驳回", value: 2 },
];

const REVIEW_STATUS_LABEL_MAP: Record<ReviewStatus, string> = {
  0: "待审核",
  1: "已通过",
  2: "已驳回",
};

const REVIEW_STATUS_TAG_TYPE_MAP: Record<ReviewStatus, "warning" | "success" | "danger"> = {
  0: "warning",
  1: "success",
  2: "danger",
};

export function normalizeReviewStatus(value: number | string): ReviewStatus {
  const parsed = Number(value);
  if (parsed === 1 || parsed === 2) {
    return parsed;
  }
  return 0;
}

export function formatReviewStatus(value: number | string): string {
  const status = normalizeReviewStatus(value);
  return REVIEW_STATUS_LABEL_MAP[status];
}

export function resolveReviewStatusTagType(value: number | string): "warning" | "success" | "danger" {
  const status = normalizeReviewStatus(value);
  return REVIEW_STATUS_TAG_TYPE_MAP[status];
}

export const articleAuditColumns: TableColumnList = [
  {
    label: "标题",
    prop: "articleTitle",
    minWidth: 280,
    showOverflowTooltip: true,
  },
  {
    label: "文章类型",
    prop: "articleTypeLabel",
    width: 120,
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
    label: "审核状态",
    prop: "reviewStatus",
    width: 120,
    slot: "reviewStatus",
  },
  {
    label: "审核人",
    prop: "reviewerName",
    minWidth: 140,
    showOverflowTooltip: true,
  },
  {
    label: "操作",
    slot: "operation",
    fixed: "right",
    align: "right",
    width: 180,
  },
];

export const commentAuditColumns: TableColumnList = [
  {
    label: "",
    type: "selection",
    fixed: "left",
    width: 56,
  },
  {
    label: "文章标题",
    prop: "articleTitle",
    minWidth: 220,
    showOverflowTooltip: true,
  },
  {
    label: "文章类型",
    prop: "articleTypeLabel",
    width: 120,
  },
  {
    label: "评论人",
    prop: "commentatorName",
    minWidth: 120,
    showOverflowTooltip: true,
  },
  {
    label: "评论时间",
    prop: "commentTime",
    minWidth: 180,
  },
  {
    label: "审核状态",
    prop: "reviewStatus",
    width: 120,
    slot: "reviewStatus",
  },
  {
    label: "审核人",
    prop: "reviewerName",
    minWidth: 120,
    showOverflowTooltip: true,
  },
  {
    label: "操作",
    slot: "operation",
    fixed: "right",
    align: "right",
    width: 220,
  },
];

