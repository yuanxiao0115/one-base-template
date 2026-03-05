import type { FormRules } from 'element-plus';
import type { MenuPermissionRecord, PermissionSavePayload } from './api';

export type ParentOption = {
  value: string
  label: string
  disabled?: boolean
}

export type MenuPermissionForm = {
  id?: string
  parentId: string
  resourceType: number
  resourceName: string
  permissionCode: string
  icon: string
  image: string
  url: string
  openMode: number
  redirect: string
  routeCache: number
  sort: number
  hidden: number
  component: string
  remark: string
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
  parentId: [{
    required: true,
    message: '请选择上级权限',
    trigger: 'change'
  }],
  resourceType: [{
    required: true,
    message: '请选择权限类型',
    trigger: 'change'
  }],
  resourceName: [{
    required: true,
    message: '请输入权限名称',
    trigger: 'blur'
  }]
};

export function toMenuPermissionForm (row: MenuPermissionRecord): MenuPermissionForm {
  return {
    id: row.id,
    parentId: row.parentId || '0',
    resourceType: Number(row.resourceType || 1),
    resourceName: row.resourceName || '',
    permissionCode: row.permissionCode || '',
    icon: row.icon || '',
    image: row.image || '',
    url: row.url || '',
    openMode: Number(row.openMode || 0),
    redirect: row.redirect || '',
    routeCache: Number(row.routeCache || 0),
    sort: Number(row.sort || 10),
    hidden: Number(row.hidden || 0),
    component: row.component || '',
    remark: row.remark || ''
  };
}

export function toMenuPermissionPayload (form: MenuPermissionForm): PermissionSavePayload {
  return {
    id: form.id,
    parentId: form.parentId || '0',
    resourceType: Number(form.resourceType || 1),
    resourceName: form.resourceName.trim(),
    permissionCode: form.permissionCode.trim(),
    icon: form.icon.trim(),
    image: form.image.trim(),
    url: form.url.trim(),
    openMode: Number(form.openMode || 0),
    redirect: form.redirect.trim(),
    routeCache: Number(form.routeCache || 0),
    sort: Number(form.sort || 10),
    hidden: Number(form.hidden || 0),
    component: form.component.trim(),
    remark: form.remark.trim()
  };
}
