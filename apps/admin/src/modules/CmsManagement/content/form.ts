import type { FormRules } from "element-plus";
import type { ContentDetail, ContentRecord, ContentSavePayload } from "./api";

export interface ContentForm {
  id?: string;
  articleTitle: string;
  cmsCategoryIdList: string[];
  articleType: number;
  articleAuthorName: string;
  articleContent: string;
  publishTime: string;
  coverUrl: string;
  articleSource: string;
  outerHref: string;
  cmsArticleAttachmentList: Array<{
    attachmentName: string;
    attachmentUrl: string;
  }>;
}

export const defaultContentForm: ContentForm = {
  articleTitle: "",
  cmsCategoryIdList: [],
  articleType: 1,
  articleAuthorName: "",
  articleContent: "",
  publishTime: "",
  coverUrl: "",
  articleSource: "",
  outerHref: "",
  cmsArticleAttachmentList: [],
};

function isRepostArticle(source?: Partial<ContentForm>): boolean {
  return Number(source?.articleType || 1) === 2;
}

function validateArticleSource(
  _: unknown,
  value: unknown,
  callback: (error?: Error) => void,
  source?: Partial<ContentForm>
) {
  if (!isRepostArticle(source)) {
    callback();
    return;
  }

  const articleSource = typeof value === "string" ? value.trim() : "";
  if (!articleSource) {
    callback(new Error("请输入转载来源"));
    return;
  }

  if (articleSource.length > 300) {
    callback(new Error("转载来源长度不能超过 300 个字符"));
    return;
  }

  callback();
}

function validateOuterHref(
  _: unknown,
  value: unknown,
  callback: (error?: Error) => void,
  source?: Partial<ContentForm>
) {
  if (!isRepostArticle(source)) {
    callback();
    return;
  }

  const outerHref = typeof value === "string" ? value.trim() : "";
  if (!outerHref) {
    callback(new Error("请输入转载链接"));
    return;
  }

  if (!/^https?:\/\//.test(outerHref)) {
    callback(new Error("转载链接需以 http:// 或 https:// 开头"));
    return;
  }

  if (outerHref.length > 500) {
    callback(new Error("转载链接长度不能超过 500 个字符"));
    return;
  }

  callback();
}

export const contentFormRules: FormRules<ContentForm> = {
  articleTitle: [
    {
      required: true,
      message: "请输入标题",
      trigger: "blur",
    },
    {
      max: 100,
      message: "标题长度不能超过 100 个字符",
      trigger: "blur",
    },
  ],
  cmsCategoryIdList: [
    {
      required: true,
      message: "请选择所属栏目",
      trigger: "change",
      type: "array",
    },
    {
      validator: (_, value, callback) => {
        if (!Array.isArray(value) || value.length === 0) {
          callback(new Error("请至少选择一个所属栏目"));
          return;
        }
        callback();
      },
      trigger: "change",
    },
  ],
  articleType: [
    {
      required: true,
      message: "请选择文章类型",
      trigger: "change",
      type: "number",
    },
  ],
  articleAuthorName: [
    {
      required: true,
      message: "请输入作者",
      trigger: "blur",
    },
    {
      max: 50,
      message: "作者长度不能超过 50 个字符",
      trigger: "blur",
    },
  ],
  articleContent: [
    {
      required: true,
      message: "请输入内容",
      trigger: "blur",
    },
  ],
  publishTime: [
    {
      required: true,
      message: "请选择发布时间",
      trigger: "change",
    },
  ],
  coverUrl: [
    {
      required: true,
      message: "请上传封面图片",
      trigger: "change",
    },
  ],
  articleSource: [
    {
      validator: validateArticleSource,
      trigger: ["blur", "change"],
    },
  ],
  outerHref: [
    {
      validator: validateOuterHref,
      trigger: ["blur", "change"],
    },
  ],
};

function normalizeCategoryIds(detail: Pick<ContentRecord, "cmsCategoryIdList"> & Partial<ContentDetail>) {
  if (Array.isArray(detail.cmsCategoryIdList) && detail.cmsCategoryIdList.length > 0) {
    return detail.cmsCategoryIdList.filter(Boolean);
  }

  if (Array.isArray(detail.cmsCategoryList) && detail.cmsCategoryList.length > 0) {
    return detail.cmsCategoryList.map((item) => item.id).filter(Boolean);
  }

  return [];
}

export function toContentForm(detail: ContentRecord | ContentDetail): ContentForm {
  return {
    id: detail.id,
    articleTitle: detail.articleTitle || "",
    cmsCategoryIdList: normalizeCategoryIds(detail),
    articleType: Number(detail.articleType || 1),
    articleAuthorName: detail.articleAuthorName || "",
    articleContent: detail.articleContent || "",
    publishTime: detail.publishTime || "",
    coverUrl: detail.coverUrl || "",
    articleSource: detail.articleSource || "",
    outerHref: detail.outerHref || "",
    cmsArticleAttachmentList: Array.isArray(detail.cmsArticleAttachmentList)
      ? detail.cmsArticleAttachmentList
          .map((item) => ({
            attachmentName: String(item.attachmentName || "").trim(),
            attachmentUrl: String(item.attachmentUrl || "").trim(),
          }))
          .filter((item) => Boolean(item.attachmentUrl))
      : [],
  };
}

export function toContentPayload(form: ContentForm): ContentSavePayload {
  const articleType = Number(form.articleType || 1);

  return {
    id: form.id,
    articleTitle: form.articleTitle.trim(),
    cmsCategoryIdList: form.cmsCategoryIdList.map((id) => String(id).trim()).filter(Boolean),
    articleType,
    articleAuthorName: form.articleAuthorName.trim(),
    articleContent: form.articleContent.trim(),
    publishTime: form.publishTime,
    coverUrl: form.coverUrl.trim(),
    articleSource: articleType === 2 ? form.articleSource.trim() : "",
    outerHref: articleType === 2 ? form.outerHref.trim() : "",
    cmsArticleAttachmentList: form.cmsArticleAttachmentList
      .map((item) => ({
        attachmentName: item.attachmentName.trim() || "附件",
        attachmentUrl: item.attachmentUrl.trim(),
      }))
      .filter((item) => Boolean(item.attachmentUrl)),
  };
}
