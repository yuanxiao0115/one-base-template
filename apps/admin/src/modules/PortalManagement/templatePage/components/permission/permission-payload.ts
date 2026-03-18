export interface SelectedUserLite {
  id: string;
  nickName: string;
}

export interface AuthorityUserItem {
  typeId: string;
  type: number;
  typeName: string;
}

export interface PermissionGroupPayload {
  roleIds: string[];
  userIds: string[];
}

export interface PagePermissionPayload {
  authType: 'person' | 'role';
  allowPerms: PermissionGroupPayload;
  forbiddenPerms: PermissionGroupPayload;
  configPerms: PermissionGroupPayload;
}

export interface TemplateAuthorityPayload {
  authType: 'person' | 'role';
  whiteDTOS: AuthorityUserItem[];
  blackDTOS: AuthorityUserItem[];
  userIds: string[];
  whiteList: AuthorityUserItem[];
  blackList: AuthorityUserItem[];
  editUsers: AuthorityUserItem[];
  allowRole: { roleIds: string[] };
  forbiddenRole: { roleIds: string[] };
  configRole: { roleIds: string[] };
}

interface NormalizePermissionGroupResult {
  roleIds: string[];
  users: SelectedUserLite[];
}

interface PagePermissionFormLike {
  authType: 'person' | 'role';
  allowRoleIds: string[];
  forbiddenRoleIds: string[];
  configRoleIds: string[];
  allowUsers: SelectedUserLite[];
  forbiddenUsers: SelectedUserLite[];
  configUsers: SelectedUserLite[];
}

interface TemplateAuthorityFormLike {
  authType: 'person' | 'role';
  whiteUsers: AuthorityUserItem[];
  blackUsers: AuthorityUserItem[];
  editUsers: AuthorityUserItem[];
  allowRoleIds: string[];
  forbiddenRoleIds: string[];
  configRoleIds: string[];
}

function normalizeIdLike(value: unknown): string {
  if (typeof value === 'string') {
    return value;
  }
  if (typeof value === 'number') {
    return String(value);
  }
  return '';
}

function normalizeString(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

export function normalizeRoleIds(value: unknown): string[] {
  if (!value || typeof value !== 'object') {
    return [];
  }
  const obj = value as Record<string, unknown>;
  const roleIdsRaw = Array.isArray(obj.roleIds) ? obj.roleIds : [];
  const roleListRaw = Array.isArray(obj.roleList) ? obj.roleList : [];
  const fromIds = roleIdsRaw.map(normalizeIdLike).filter(Boolean);
  const fromList = roleListRaw
    .map((item) => {
      if (!item || typeof item !== 'object') {
        return '';
      }
      const row = item as Record<string, unknown>;
      return normalizeIdLike(row.id) || normalizeIdLike(row.roleId);
    })
    .filter(Boolean);
  return Array.from(new Set([...fromIds, ...fromList]));
}

function normalizeUsersFromUnknown(value: unknown, fallbackIds?: unknown): SelectedUserLite[] {
  const fromUserList = Array.isArray(value)
    ? value
        .map((item) => {
          if (!item || typeof item !== 'object') {
            return null;
          }
          const row = item as Record<string, unknown>;
          const id = normalizeIdLike(row.id) || normalizeIdLike(row.userId);
          if (!id) {
            return null;
          }
          const nickName =
            normalizeString(row.nickName) ||
            normalizeString(row.name) ||
            normalizeString(row.title) ||
            id;
          return { id, nickName };
        })
        .filter((item): item is SelectedUserLite => Boolean(item))
    : [];

  if (fromUserList.length > 0) {
    return fromUserList;
  }

  if (!Array.isArray(fallbackIds)) {
    return [];
  }

  return fallbackIds
    .map((item) => {
      const id = normalizeIdLike(item);
      if (!id) {
        return null;
      }
      return { id, nickName: id };
    })
    .filter((item): item is SelectedUserLite => Boolean(item));
}

export function normalizePermissionGroup(value: unknown): NormalizePermissionGroupResult {
  if (!value || typeof value !== 'object') {
    return { roleIds: [], users: [] };
  }
  const obj = value as Record<string, unknown>;
  return {
    roleIds: normalizeRoleIds(obj),
    users: normalizeUsersFromUnknown(obj.userList, obj.userIds)
  };
}

export function normalizeAuthorityUsers(value: unknown): AuthorityUserItem[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value
    .map((item) => {
      if (!item || typeof item !== 'object') {
        return null;
      }
      const row = item as Record<string, unknown>;
      const typeId =
        normalizeIdLike(row.typeId) ||
        normalizeIdLike(row.id) ||
        normalizeIdLike(row.userId) ||
        normalizeIdLike(row.value);
      if (!typeId) {
        return null;
      }
      const typeName =
        normalizeString(row.typeName) ||
        normalizeString(row.nickName) ||
        normalizeString(row.name) ||
        normalizeString(row.title) ||
        typeId;
      return {
        typeId,
        type: typeof row.type === 'number' ? row.type : 0,
        typeName
      };
    })
    .filter((item): item is AuthorityUserItem => Boolean(item));
}

export function normalizeEditUsers(value: unknown, fallbackUserIds: unknown): AuthorityUserItem[] {
  const fromItems = normalizeAuthorityUsers(value);
  if (fromItems.length > 0) {
    return fromItems;
  }

  if (!Array.isArray(fallbackUserIds)) {
    return [];
  }

  return fallbackUserIds
    .map((item) => {
      const id = normalizeIdLike(item);
      if (!id) {
        return null;
      }
      return {
        typeId: id,
        type: 0,
        typeName: id
      };
    })
    .filter((item): item is AuthorityUserItem => Boolean(item));
}

export function buildPagePermissionPayload(form: PagePermissionFormLike): PagePermissionPayload {
  if (form.authType === 'role') {
    return {
      authType: 'role',
      allowPerms: { roleIds: [...form.allowRoleIds], userIds: [] },
      forbiddenPerms: { roleIds: [...form.forbiddenRoleIds], userIds: [] },
      configPerms: { roleIds: [...form.configRoleIds], userIds: [] }
    };
  }

  return {
    authType: 'person',
    allowPerms: { roleIds: [], userIds: form.allowUsers.map((item) => item.id) },
    forbiddenPerms: { roleIds: [], userIds: form.forbiddenUsers.map((item) => item.id) },
    configPerms: { roleIds: [], userIds: form.configUsers.map((item) => item.id) }
  };
}

export function buildTemplateAuthorityPayload(
  form: TemplateAuthorityFormLike
): TemplateAuthorityPayload {
  if (form.authType === 'role') {
    return {
      authType: 'role',
      whiteDTOS: [],
      blackDTOS: [],
      userIds: [],
      whiteList: [],
      blackList: [],
      editUsers: [],
      allowRole: { roleIds: [...form.allowRoleIds] },
      forbiddenRole: { roleIds: [...form.forbiddenRoleIds] },
      configRole: { roleIds: [...form.configRoleIds] }
    };
  }

  const white = form.whiteUsers.map((item) => ({ ...item, type: 0 }));
  const black = form.blackUsers.map((item) => ({ ...item, type: 0 }));
  const edit = form.editUsers.map((item) => ({ ...item, type: 0 }));

  return {
    authType: 'person',
    whiteDTOS: white,
    blackDTOS: black,
    userIds: edit.map((item) => item.typeId),
    whiteList: white,
    blackList: black,
    editUsers: edit,
    allowRole: { roleIds: [] },
    forbiddenRole: { roleIds: [] },
    configRole: { roleIds: [] }
  };
}
