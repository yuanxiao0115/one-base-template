import type { FormRules } from "element-plus";
import type { DictItemRecord, DictItemSavePayload, DictRecord, DictSavePayload } from "./api";

export interface DictForm {
  id?: string;
  dictCode: string;
  dictName: string;
  remark: string;
}

export const defaultDictForm: DictForm = {
  dictCode: "",
  dictName: "",
  remark: "",
};

export const dictFormRules: FormRules<DictForm> = {
  dictCode: [
    {
      required: true,
      message: "请输入字典编码",
      trigger: "blur",
    },
    {
      pattern: /^\w{1,50}$/,
      message: "字典编码必须是数字、字母、下划线组合，且不超过 50 个字符",
      trigger: "blur",
    },
  ],
  dictName: [
    {
      required: true,
      message: "请输入字典名称",
      trigger: "blur",
    },
    {
      pattern: /^[\u4e00-\u9fa5a-zA-Z0-9_]{1,50}$/,
      message: "字典名称必须是中英文、数字、下划线组合，且不超过 50 个字符",
      trigger: "blur",
    },
  ],
};

export function toDictForm(detail: DictRecord): DictForm {
  return {
    id: detail.id,
    dictCode: detail.dictCode || "",
    dictName: detail.dictName || "",
    remark: detail.remark || "",
  };
}

export function toDictPayload(form: DictForm): DictSavePayload {
  return {
    id: form.id,
    dictCode: form.dictCode.trim(),
    dictName: form.dictName.trim(),
    remark: form.remark.trim(),
  };
}

export interface DictItemForm {
  id?: string;
  dictId: string;
  itemName: string;
  itemValue: string;
  sort: number;
  remark: string;
}

export const defaultDictItemForm: DictItemForm = {
  dictId: "",
  itemName: "",
  itemValue: "",
  sort: 10,
  remark: "",
};

export const dictItemFormRules: FormRules<DictItemForm> = {
  itemName: [
    {
      required: true,
      message: "请输入字段名称",
      trigger: "blur",
    },
    {
      pattern: /^[a-zA-Z_\u4e00-\u9fa5]{1,50}$/,
      message: "字段名称必须是中英文或下划线组合，且不超过 50 个字符",
      trigger: "blur",
    },
  ],
  itemValue: [
    {
      required: true,
      message: "请输入字段键值",
      trigger: "blur",
    },
    {
      pattern: /^[a-zA-Z0-9_]{1,50}$/,
      message: "字段键值必须是字母数字下划线组合，且不超过 50 个字符",
      trigger: "blur",
    },
  ],
  sort: [
    {
      required: true,
      message: "请输入展示序位",
      trigger: "blur",
      type: "number",
    },
  ],
};

export function toDictItemForm(detail: DictItemRecord): DictItemForm {
  return {
    id: detail.id,
    dictId: detail.dictId,
    itemName: detail.itemName || "",
    itemValue: detail.itemValue || "",
    sort: Number(detail.sort || 0),
    remark: detail.remark || "",
  };
}

export function toDictItemPayload(form: DictItemForm): DictItemSavePayload {
  return {
    id: form.id,
    dictId: form.dictId,
    itemName: form.itemName.trim(),
    itemValue: form.itemValue.trim(),
    sort: Number(form.sort || 0),
    remark: form.remark.trim(),
  };
}
