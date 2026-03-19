export interface PermissionRoleFieldConfig<TKey extends string = string> {
  key: TKey;
  label: string;
}

export interface PermissionUserFieldConfig<TField extends string = string> {
  field: TField;
  label: string;
}

export type PagePermissionRoleFieldKey = 'allowRoleIds' | 'forbiddenRoleIds' | 'configRoleIds';
export type PagePermissionUserFieldKey = 'allow' | 'forbidden' | 'config';
export type PortalAuthorityRoleFieldKey = 'allowRoleIds' | 'forbiddenRoleIds' | 'configRoleIds';
export type PortalAuthorityUserFieldKey = 'white' | 'black' | 'edit';

export const PAGE_PERMISSION_ROLE_FIELDS = [
  { key: 'allowRoleIds', label: '可访问角色' },
  { key: 'forbiddenRoleIds', label: '不可访问角色' },
  { key: 'configRoleIds', label: '可维护角色' }
] as const satisfies ReadonlyArray<PermissionRoleFieldConfig<PagePermissionRoleFieldKey>>;

export const PAGE_PERMISSION_USER_FIELDS = [
  { field: 'allow', label: '可访问者' },
  { field: 'forbidden', label: '不可访问者' },
  { field: 'config', label: '可维护人员' }
] as const satisfies ReadonlyArray<PermissionUserFieldConfig<PagePermissionUserFieldKey>>;

export const PORTAL_AUTHORITY_ROLE_FIELDS = [
  { key: 'allowRoleIds', label: '可访问角色' },
  { key: 'forbiddenRoleIds', label: '不可访问角色' },
  { key: 'configRoleIds', label: '可维护角色' }
] as const satisfies ReadonlyArray<PermissionRoleFieldConfig<PortalAuthorityRoleFieldKey>>;

export const PORTAL_AUTHORITY_USER_FIELDS = [
  { field: 'white', label: '可访问人员' },
  { field: 'black', label: '不可访问人员' },
  { field: 'edit', label: '可维护人员' }
] as const satisfies ReadonlyArray<PermissionUserFieldConfig<PortalAuthorityUserFieldKey>>;
