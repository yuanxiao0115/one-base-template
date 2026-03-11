import type { FormRules } from "element-plus";
import type { RoleRecord, RoleSavePayload } from "./types";

export interface RoleForm {
  id?: string;
  roleName: string;
  roleCode: string;
  remark: string;
}

export const defaultRoleForm: RoleForm = {
  roleName: "",
  roleCode: "",
  remark: "",
};

export const roleFormRules: FormRules<RoleForm> = {
  roleName: [
    {
      required: true,
      message: "请输入角色名称",
      trigger: "blur",
    },
  ],
};

export function toRoleForm(detail: RoleRecord): RoleForm {
  return {
    id: detail.id,
    roleName: detail.roleName || "",
    roleCode: detail.roleCode || "",
    remark: detail.remark || "",
  };
}

export function toRolePayload(form: RoleForm): RoleSavePayload {
  return {
    id: form.id,
    roleName: form.roleName.trim(),
    roleCode: form.roleCode.trim(),
    remark: form.remark.trim(),
  };
}
