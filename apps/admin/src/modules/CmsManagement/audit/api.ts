import { obHttp } from "@one-base-template/core";
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


export const auditApi = {
  listArticles: async (params: ArticleListParams) =>
    obHttp().get<ApiResponse<AuditPageData<ArticleAuditRecord>>>("/cmict/cms/cmsArticleManage", { params }),

  getArticleDetail: async (id: number) =>
    obHttp().get<ApiResponse<ArticleDetail>>(`/cmict/cms/cmsArticleManage/${id}`),

  reviewArticle: async (payload: ArticleReviewPayload) =>
    obHttp().post<ApiResponse<boolean>>("/cmict/cms/cmsReview", {
      data: payload,
    }),

  listComments: async (params: CommentListParams) =>
    obHttp().get<ApiResponse<AuditPageData<CommentAuditRecord>>>("/cmict/cms/cmsComment/list", { params }),

  getCommentDetail: async (id: number) =>
    obHttp().get<ApiResponse<CommentDetail>>(`/cmict/cms/cmsComment/${id}`),

  reviewComment: async (payload: CommentReviewPayload) =>
    obHttp().post<ApiResponse<boolean>>("/cmict/cms/cmsComment/review", {
      data: payload,
    }),

  removeComment: async (payload: CommentDeletePayload) =>
    obHttp().delete<ApiResponse<boolean>>("/cmict/cms/cmsComment", {
      data: payload,
    }),
};

export default auditApi;
