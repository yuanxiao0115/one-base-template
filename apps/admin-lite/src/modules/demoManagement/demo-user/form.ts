import type { FormRules } from 'element-plus';
import type { DemoUserForm } from './types';

export function createDefaultDemoUserForm(): DemoUserForm {
  return {
    name: '',
    code: '',
    status: 1
  };
}

export const demoUserFormRules: FormRules<DemoUserForm> = {
  name: [{ required: true, message: '请输入名称', trigger: 'blur' }],
  code: [{ required: true, message: '请输入编码', trigger: 'blur' }]
};
