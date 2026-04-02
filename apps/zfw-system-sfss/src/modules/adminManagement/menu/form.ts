import type { FormRules } from 'element-plus';
import type { MenuPermissionRecord, PermissionSavePayload } from './types';

export interface ParentOption {
  value: string;
  label: string;
  disabled?: boolean;
  children?: ParentOption[];
}

export interface MenuPermissionForm {
  id?: string;
  parentId: string;
  resourceType: number;
  resourceName: string;
  permissionCode: string;
  icon: string;
  image: string;
  url: string;
  openMode: number;
  redirect: string;
  routeCache: number;
  sort: number;
  hidden: number;
  component: string;
  remark: string;
}

export const defaultMenuPermissionForm: MenuPermissionForm = {
  parentId: '0',
  resourceType: 1,
  resourceName: '',
  permissionCode: '',
  icon: '',
  image: '',
  url: '',
  openMode: 0,
  redirect: '',
  routeCache: 0,
  sort: 10,
  hidden: 0,
  component: '',
  remark: ''
};

export const menuPermissionFormRules: FormRules<MenuPermissionForm> = {
  parentId: [
    {
      required: true,
      message: '请选择上级权限',
      trigger: 'change'
    }
  ],
  resourceType: [
    {
      required: true,
      message: '请选择权限类型',
      trigger: 'change'
    }
  ],
  resourceName: [
    {
      required: true,
      message: '请输入权限名称',
      trigger: 'blur'
    }
  ]
};

export function toMenuPermissionForm(row: MenuPermissionRecord): MenuPermissionForm {
  return {
    id: row.id,
    parentId: row.parentId ?? '0',
    resourceType: row.resourceType,
    resourceName: row.resourceName,
    permissionCode: row.permissionCode ?? '',
    icon: row.icon ?? '',
    image: row.image ?? '',
    url: row.url ?? '',
    openMode: row.openMode ?? 0,
    redirect: row.redirect ?? '',
    routeCache: row.routeCache ?? 0,
    sort: row.sort ?? 10,
    hidden: row.hidden ?? 0,
    component: row.component ?? '',
    remark: row.remark ?? ''
  };
}

export function toMenuPermissionPayload(form: MenuPermissionForm): PermissionSavePayload {
  return {
    id: form.id,
    parentId: form.parentId || '0',
    resourceType: form.resourceType,
    resourceName: form.resourceName.trim(),
    permissionCode: form.permissionCode.trim(),
    icon: form.icon.trim(),
    image: form.image.trim(),
    url: form.url.trim(),
    openMode: form.openMode,
    redirect: form.redirect.trim(),
    routeCache: form.routeCache,
    sort: form.sort,
    hidden: form.hidden,
    component: form.component.trim(),
    remark: form.remark.trim()
  };
}
