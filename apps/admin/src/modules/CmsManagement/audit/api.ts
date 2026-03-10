import { getHttpClient } from "@/shared/api/http-client";
import type {
  ArticleAuditRecord,
  ArticleDetail,
  ArticleListParams,
  ArticleReviewPayload,
  AuditPageData,
  ApiResponse,
  CommentAuditRecord,
  CommentDeletePayload,
  CommentDetail,
  CommentListParams,
  CommentReviewPayload,
} from "./types";

export type {
  ArticleAuditRecord,
  ArticleDetail,
  ArticleListParams,
  ArticleReviewPayload,
  AuditPageData,
  ApiResponse,
  CommentAuditRecord,
  CommentDeletePayload,
  CommentDetail,
  CommentListParams,
  CommentReviewPayload,
  ReviewCategoryItem,
  ReviewStatus,
} from "./types";

export const auditApi = {
  listArticles: async (params: ArticleListParams) =>
    getHttpClient().get<ApiResponse<AuditPageData<ArticleAuditRecord>>>("/cmict/cms/cmsArticleManage", { params }),

  getArticleDetail: async (id: number) =>
    getHttpClient().get<ApiResponse<ArticleDetail>>(`/cmict/cms/cmsArticleManage/${id}`),

  reviewArticle: async (payload: ArticleReviewPayload) =>
    getHttpClient().post<ApiResponse<boolean>>("/cmict/cms/cmsReview", {
      data: payload,
    }),

  listComments: async (params: CommentListParams) =>
    getHttpClient().get<ApiResponse<AuditPageData<CommentAuditRecord>>>("/cmict/cms/cmsComment/list", { params }),

  getCommentDetail: async (id: number) =>
    getHttpClient().get<ApiResponse<CommentDetail>>(`/cmict/cms/cmsComment/${id}`),

  reviewComment: async (payload: CommentReviewPayload) =>
    getHttpClient().post<ApiResponse<boolean>>("/cmict/cms/cmsComment/review", {
      data: payload,
    }),

  removeComment: async (payload: CommentDeletePayload) =>
    getHttpClient().delete<ApiResponse<boolean>>("/cmict/cms/cmsComment", {
      data: payload,
    }),
};

export default auditApi;
