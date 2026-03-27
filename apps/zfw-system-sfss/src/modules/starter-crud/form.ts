import type { FormRules } from 'element-plus';
import type { StarterCrudRecord, StarterCrudSavePayload, StarterCrudStatus } from './api';

export interface StarterCrudForm {
  id?: string;
  code: string;
  name: string;
  owner: string;
  status: StarterCrudStatus;
  remark: string;
}

export interface StarterCrudSearchForm {
  keyword: string;
  owner: string;
  status: StarterCrudStatus | '';
}

export const starterCrudStatusOptions = [
  { label: '启用', value: 1 },
  { label: '停用', value: 0 }
] as const;

export function createDefaultStarterCrudForm(): StarterCrudForm {
  return {
    code: '',
    name: '',
    owner: '',
    status: 1,
    remark: ''
  };
}

export function createDefaultStarterCrudSearchForm(): StarterCrudSearchForm {
  return {
    keyword: '',
    owner: '',
    status: ''
  };
}

export const starterCrudFormRules: FormRules<StarterCrudForm> = {
  code: [{ required: true, message: '请输入示例编码', trigger: 'blur' }],
  name: [{ required: true, message: '请输入示例名称', trigger: 'blur' }],
  owner: [{ required: true, message: '请输入负责人', trigger: 'blur' }]
};

export function toStarterCrudForm(detail?: StarterCrudRecord | null): StarterCrudForm {
  if (!detail) {
    return createDefaultStarterCrudForm();
  }

  return {
    id: detail.id,
    code: detail.code,
    name: detail.name,
    owner: detail.owner,
    status: detail.status,
    remark: detail.remark
  };
}

export function toStarterCrudPayload(form: StarterCrudForm): StarterCrudSavePayload {
  return {
    id: form.id,
    code: form.code.trim(),
    name: form.name.trim(),
    owner: form.owner.trim(),
    status: form.status,
    remark: form.remark.trim()
  };
}
