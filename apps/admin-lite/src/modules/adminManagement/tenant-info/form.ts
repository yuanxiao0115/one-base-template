import type { FormRules } from 'element-plus';
import type { TenantInfoForm, TenantInfoRecord, TenantInfoSavePayload } from './types';

export function createTenantInfoForm(): TenantInfoForm {
  return {
    id: '',
    tenantName: '',
    contactName: '',
    contactPhone: '',
    maxNumber: 100,
    tenantState: 0,
    managerAccount: '',
    expireTime: '',
    remark: ''
  };
}

export function toTenantInfoForm(record?: Partial<TenantInfoRecord> | null): TenantInfoForm {
  const fallback = createTenantInfoForm();

  return {
    ...fallback,
    id: record?.id ?? '',
    tenantName: record?.tenantName ?? '',
    contactName: record?.contactName ?? '',
    contactPhone: record?.contactPhone ?? '',
    maxNumber: record?.maxNumber ?? fallback.maxNumber,
    tenantState: record?.tenantState ?? fallback.tenantState,
    managerAccount: record?.managerAccount ?? '',
    expireTime: record?.expireTime ?? '',
    remark: record?.remark ?? ''
  };
}

export function toTenantInfoPayload(form: TenantInfoForm): TenantInfoSavePayload {
  return {
    id: form.id || undefined,
    tenantName: form.tenantName.trim(),
    contactName: form.contactName.trim(),
    contactPhone: form.contactPhone.trim(),
    maxNumber: form.maxNumber,
    tenantState: form.tenantState,
    managerAccount: form.managerAccount.trim(),
    expireTime: form.expireTime,
    remark: form.remark.trim()
  };
}

export const tenantInfoFormRules: FormRules<TenantInfoForm> = {
  tenantName: [
    { required: true, message: '请输入租户名称', trigger: 'blur' },
    {
      pattern: /^[a-zA-Z0-9_\u4e00-\u9fa5]+$/,
      message: '请输入中英文、数字、下划线组合',
      trigger: 'blur'
    }
  ],
  contactName: [
    { required: true, message: '请输入联系人', trigger: 'blur' },
    {
      pattern: /^(([a-zA-Z+.?·?a-zA-Z+]{2,50}$)|([\u4e00-\u9fa5+·?\u4e00-\u9fa5+]{2,50}$))/,
      message: '格式错误，仅支持中英文姓名格式',
      trigger: 'blur'
    }
  ],
  contactPhone: [
    { required: true, message: '请输入联系方式', trigger: 'blur' },
    {
      pattern: /^1\d{10}$/,
      message: '请输入正确的手机号',
      trigger: 'blur'
    }
  ],
  maxNumber: [{ required: true, message: '请输入最大用户数', trigger: 'change' }],
  tenantState: [{ required: true, message: '请选择租户状态', trigger: 'change' }],
  managerAccount: [
    { required: true, message: '请输入管理员账号', trigger: 'blur' },
    {
      pattern: /^[a-zA-Z][a-zA-Z0-9_]{2,31}$/,
      message: '请输入3-32位字母数字下划线，且以字母开头',
      trigger: 'blur'
    }
  ],
  expireTime: [
    { required: true, message: '请选择到期时间', trigger: 'change' },
    {
      validator: (_rule, value, callback) => {
        if (!value) {
          callback(new Error('请选择到期时间'));
          return;
        }
        const timestamp = new Date(String(value)).getTime();
        if (!Number.isFinite(timestamp) || timestamp <= Date.now()) {
          callback(new Error('到期时间不能小于当前时间'));
          return;
        }
        callback();
      },
      trigger: 'change'
    }
  ]
};
