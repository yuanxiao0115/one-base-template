import type { FormRules } from 'element-plus';
import type { OrgRecord, OrgSavePayload } from './types';

export interface OrgForm {
  id?: string;
  parentId: string;
  orgName: string;
  briefName: string;
  sort: number;
  orgCategory: string;
  orgLevel: number | null;
  orgLevelName: string;
  orgLevelId: string;
  institutionalType: string;
  uscc: string;
  orgType: number;
  isExternal: boolean;
  remark: string;
}

export interface OrgTreeOption {
  value: string;
  label: string;
  disabled?: boolean;
  children?: OrgTreeOption[];
}

export const defaultOrgForm: OrgForm = {
  parentId: '',
  orgName: '',
  briefName: '',
  sort: 10,
  orgCategory: '',
  orgLevel: null,
  orgLevelName: '',
  orgLevelId: '',
  institutionalType: '',
  uscc: '',
  orgType: 0,
  isExternal: false,
  remark: ''
};

export const orgFormRules: FormRules<OrgForm> = {
  parentId: [
    {
      required: true,
      message: '请选择上级组织',
      trigger: 'change'
    }
  ],
  orgName: [
    {
      required: true,
      message: '请输入组织全称',
      trigger: 'blur'
    },
    {
      max: 30,
      message: '组织全称最长30字',
      trigger: 'blur'
    }
  ],
  briefName: [
    {
      required: true,
      message: '请输入组织简称',
      trigger: 'blur'
    },
    {
      max: 30,
      message: '组织简称最长30字',
      trigger: 'blur'
    }
  ],
  uscc: [
    {
      required: true,
      message: '请输入统一社会信用代码',
      trigger: 'blur'
    },
    {
      max: 30,
      message: '统一社会信用代码最长30字',
      trigger: 'blur'
    }
  ],
  orgType: [
    {
      required: true,
      message: '请选择创建类型',
      trigger: 'change'
    }
  ],
  orgCategory: [
    {
      required: true,
      message: '请选择组织类型',
      trigger: 'change'
    }
  ],
  orgLevel: [
    {
      required: true,
      message: '请选择等级',
      trigger: 'change'
    }
  ],
  sort: [
    {
      required: true,
      message: '请输入自然数显示排序',
      trigger: 'blur',
      type: 'number'
    },
    {
      validator: (_, value, callback) => {
        if (!Number.isFinite(value) || Number(value) < 0 || !Number.isInteger(Number(value))) {
          callback(new Error('格式错误，请输入自然数'));
          return;
        }
        callback();
      },
      trigger: 'blur'
    }
  ]
};

export function toOrgForm(detail: OrgRecord): OrgForm {
  return {
    id: detail.id,
    parentId: detail.parentId ?? '',
    orgName: detail.orgName,
    briefName: detail.briefName ?? '',
    sort: detail.sort ?? 0,
    orgCategory: detail.orgCategory ?? '',
    orgLevel: detail.orgLevel ?? null,
    orgLevelName: detail.orgLevelName ?? '',
    orgLevelId: detail.orgLevelId ?? '',
    institutionalType: detail.institutionalType ?? '',
    uscc: detail.uscc ?? '',
    orgType: detail.orgType ?? 0,
    isExternal: detail.isExternal ?? false,
    remark: detail.remark ?? ''
  };
}

export function toOrgPayload(form: OrgForm, rootParentId: string): OrgSavePayload {
  const parentId = form.parentId.trim() || rootParentId || '0';

  return {
    id: form.id,
    parentId,
    orgName: form.orgName.trim(),
    briefName: form.briefName.trim(),
    sort: form.sort,
    orgCategory: form.orgCategory.trim(),
    orgLevelName: form.orgLevelName.trim(),
    orgLevel: form.orgLevel,
    orgLevelId: form.orgLevelId.trim(),
    institutionalType: form.institutionalType.trim(),
    uscc: form.uscc.trim(),
    orgType: form.orgType,
    isExternal: form.isExternal,
    remark: form.remark.trim()
  };
}
