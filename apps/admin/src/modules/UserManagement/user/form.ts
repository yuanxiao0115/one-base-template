import type { FormRules } from "element-plus";
import type { UserDetailData, UserOrgPostRecord, UserOrgRecord, UserSavePayload } from "./types";

export interface UserOrgPostForm {
  id?: string;
  postId: string;
  sort: number;
  status: number;
}

export interface UserOrgForm {
  id?: string;
  orgId: string;
  orgRankType: number | null;
  ownSort: number;
  sort: number;
  status: number;
  postVos: UserOrgPostForm[];
}

export interface UserForm {
  id?: string;
  nickName: string;
  userAccount: string;
  phone: string;
  phoneShow: boolean;
  mail: string;
  gender: number;
  isEnable: boolean;
  userType: number;
  isExternal: boolean;
  remark: string;
  roleIds: string[];
  userOrgs: UserOrgForm[];
  avatar?: string;
  createTime?: string;
}

export interface UserAccountForm {
  userId: string;
  nickName: string;
  phone: string;
  userAccount: string;
  newUsername: string;
  isReset: number;
  newPassword: string;
  newPasswordRepeat: string;
}

export interface UserBindForm {
  userIds: string[];
}

const nickNameReg = /^(([a-zA-Z0-9+.?·?a-zA-Z0-9+\u4e00-\u9fa50-9+·?\u4e00-\u9fa50-9+_()（）、]{2,20}$))/;
const accountReg = /^[A-Za-z0-9_]{4,20}$/;
const phoneReg = /^1[3-9]\d{9}$/;

function toNaturalNumber(value: unknown, fallback = 1): number {
  if (typeof value === "number" && Number.isFinite(value)) {
    return Math.max(Math.trunc(value), 0);
  }

  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return Math.max(Math.trunc(parsed), 0);
    }
  }

  return fallback;
}

function trimText(value: string | undefined): string {
  return (value || "").trim();
}

export function createDefaultUserOrgPost(): UserOrgPostForm {
  return {
    postId: "",
    sort: 1,
    status: 1,
  };
}

export function createDefaultUserOrg(): UserOrgForm {
  return {
    orgId: "",
    orgRankType: null,
    ownSort: 1,
    sort: 1,
    status: 1,
    postVos: [createDefaultUserOrgPost()],
  };
}

export function createDefaultUserForm(): UserForm {
  return {
    nickName: "",
    userAccount: "",
    phone: "",
    phoneShow: true,
    mail: "",
    gender: 1,
    isEnable: true,
    userType: 0,
    isExternal: false,
    remark: "",
    roleIds: [],
    userOrgs: [createDefaultUserOrg()],
    avatar: "",
    createTime: "",
  };
}

export const defaultUserForm: UserForm = createDefaultUserForm();

export const defaultUserAccountForm: UserAccountForm = {
  userId: "",
  nickName: "",
  phone: "",
  userAccount: "",
  newUsername: "",
  isReset: 0,
  newPassword: "",
  newPasswordRepeat: "",
};

export const userFormRules: FormRules<UserForm> = {
  nickName: [
    {
      required: true,
      message: "请输入用户名",
      trigger: "blur",
    },
    {
      pattern: nickNameReg,
      message: "长度20内，格式：字母、数字、汉字、_、括号、顿号",
      trigger: "blur",
    },
  ],
  userAccount: [
    {
      required: true,
      message: "请输入登录账号",
      trigger: "blur",
    },
    {
      pattern: accountReg,
      message: "账号长度4-20位，格式：字母、数字、_",
      trigger: "blur",
    },
  ],
  phone: [
    {
      required: true,
      message: "请输入手机号",
      trigger: "blur",
    },
    {
      pattern: phoneReg,
      message: "电话号码格式不正确",
      trigger: "blur",
    },
  ],
  mail: [
    {
      type: "email",
      message: "邮箱格式不正确",
      trigger: "blur",
    },
  ],
  roleIds: [
    {
      type: "array",
      required: false,
      message: "请选择角色",
      trigger: ["change", "blur"],
    },
  ],
  userType: [
    {
      required: true,
      message: "请选择用户类型",
      trigger: "change",
    },
  ],
  gender: [
    {
      required: true,
      message: "请选择性别",
      trigger: "change",
    },
  ],
};

export const userAccountFormRules: FormRules<UserAccountForm> = {
  newUsername: [
    {
      required: true,
      message: "请输入登录账号",
      trigger: "blur",
    },
    {
      pattern: accountReg,
      message: "账号长度4-20位，格式：字母、数字、_",
      trigger: "blur",
    },
  ],
  isReset: [
    {
      required: true,
      message: "请选择是否重置密码",
      trigger: "change",
    },
  ],
  newPassword: [
    {
      validator: (_, value, callback) => {
        const password = typeof value === "string" ? value : "";
        if (!password) {
          callback(new Error("请输入新密码"));
          return;
        }

        const reg = /^(?![A-Za-z]+$)(?![A-Z\d]+$)(?![A-Z\W_]+$)(?![a-z\d]+$)(?![a-z\W_]+$)(?![\d\W_]+$)\S{8,20}$/;
        if (!reg.test(password)) {
          callback(new Error("长度8-20位，至少包含大小写字母、数字、特殊字符中的3种及以上。"));
          return;
        }

        callback();
      },
      trigger: "blur",
    },
  ],
  newPasswordRepeat: [
    {
      validator: (_, value, callback) => {
        const confirmPassword = typeof value === "string" ? value : "";
        if (!confirmPassword) {
          callback(new Error("请确认新密码"));
          return;
        }

        callback();
      },
      trigger: "blur",
    },
  ],
};

function toUserOrgPostForm(item: UserOrgPostRecord): UserOrgPostForm {
  return {
    id: item.id,
    postId: item.postId || "",
    sort: toNaturalNumber(item.sort, 1),
    status: toNaturalNumber(item.status, 1),
  };
}

function toUserOrgForm(item: UserOrgRecord): UserOrgForm {
  return {
    id: item.id,
    orgId: item.orgId || "",
    orgRankType: item.orgRankType == null ? null : toNaturalNumber(item.orgRankType, 0),
    ownSort: toNaturalNumber(item.ownSort, 1),
    sort: toNaturalNumber(item.sort, 1),
    status: toNaturalNumber(item.status, 1),
    postVos:
      Array.isArray(item.postVos) && item.postVos.length > 0
        ? item.postVos.map((post) => toUserOrgPostForm(post))
        : [createDefaultUserOrgPost()],
  };
}

export function toUserForm(detail: UserDetailData): UserForm {
  const { userInfo } = detail;
  const userOrgs =
    Array.isArray(userInfo.userOrgs) && userInfo.userOrgs.length > 0
      ? userInfo.userOrgs.map((item) => toUserOrgForm(item))
      : [createDefaultUserOrg()];

  const roleIds = Array.isArray(userInfo.roleIds) ? userInfo.roleIds.map((item) => String(item)).filter(Boolean) : [];

  return {
    id: userInfo.id,
    nickName: userInfo.nickName || "",
    userAccount: userInfo.userAccount || "",
    phone: userInfo.phone || "",
    phoneShow: userInfo.phoneShow,
    mail: userInfo.mail || "",
    gender: toNaturalNumber(userInfo.gender, 1),
    isEnable: Boolean(userInfo.isEnable),
    userType: toNaturalNumber(userInfo.userType, 0),
    isExternal: Boolean(userInfo.isExternal),
    remark: userInfo.remark || "",
    roleIds,
    userOrgs,
    avatar: userInfo.avatar || "",
    createTime: userInfo.createTime || "",
  };
}

function toUserOrgPostPayload(item: UserOrgPostForm): UserOrgPostRecord {
  return {
    id: item.id,
    postId: trimText(item.postId),
    sort: toNaturalNumber(item.sort, 1),
    status: toNaturalNumber(item.status, 1),
  };
}

function toUserOrgPayload(item: UserOrgForm): UserOrgRecord {
  const postVos = item.postVos.map((post) => toUserOrgPostPayload(post)).filter((post) => Boolean(post.postId));

  return {
    id: item.id,
    orgId: trimText(item.orgId),
    orgRankType: item.orgRankType == null ? null : toNaturalNumber(item.orgRankType, 0),
    ownSort: toNaturalNumber(item.ownSort, 1),
    sort: toNaturalNumber(item.sort, 1),
    status: toNaturalNumber(item.status, 1),
    postVos: postVos.length > 0 ? postVos : [toUserOrgPostPayload(createDefaultUserOrgPost())],
  };
}

export function toUserPayload(form: UserForm): UserSavePayload {
  const userOrgs = form.userOrgs.map((item) => toUserOrgPayload(item)).filter((item) => Boolean(item.orgId));

  return {
    id: form.id,
    nickName: trimText(form.nickName),
    userAccount: trimText(form.userAccount),
    phone: trimText(form.phone),
    phoneShow: Boolean(form.phoneShow),
    mail: trimText(form.mail),
    gender: toNaturalNumber(form.gender, 1),
    isEnable: Boolean(form.isEnable),
    userType: toNaturalNumber(form.userType, 0),
    isExternal: Boolean(form.isExternal),
    remark: trimText(form.remark),
    roleIds: form.roleIds.map((item) => String(item)).filter(Boolean),
    userOrgs: userOrgs.length > 0 ? userOrgs : [toUserOrgPayload(createDefaultUserOrg())],
  };
}
