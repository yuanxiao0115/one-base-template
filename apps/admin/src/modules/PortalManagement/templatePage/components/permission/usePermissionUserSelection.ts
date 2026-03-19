import { shallowRef } from 'vue';
import type { Ref } from 'vue';
import { openPersonnelSelection } from '@/components/PersonnelSelector';
import type { PersonnelSelectedUser } from '@/components/PersonnelSelector/types';

import {
  createPermissionMemberSource,
  type PermissionMemberSourceApi
} from './permission-member-source';
import { normalizeIdLike } from './permission-common';

export interface PermissionUserSelectionOptions<TField extends string, TUser> {
  api: PermissionMemberSourceApi;
  resolveRootParentId: () => string;
  getUsersByField: (field: TField) => TUser[];
  setUsersByField: (field: TField, users: TUser[]) => void;
  mapCurrentUserForDialog: (user: TUser) => { id: string; nickName?: string };
  mapSelectedUser: (user: PersonnelSelectedUser) => TUser | null;
}

export interface PermissionUserSelectionState<TField extends string> {
  pickingField: Ref<TField | ''>;
  fetchNodes: ReturnType<typeof createPermissionMemberSource>['fetchNodes'];
  searchNodes: ReturnType<typeof createPermissionMemberSource>['searchNodes'];
  pickUsers: (field: TField) => Promise<void>;
}

export function usePermissionUserSelection<TField extends string, TUser>(
  options: PermissionUserSelectionOptions<TField, TUser>
): PermissionUserSelectionState<TField> {
  const pickingField: Ref<TField | ''> = shallowRef<TField | ''>('');
  const { fetchNodes, searchNodes } = createPermissionMemberSource({
    api: options.api,
    resolveRootParentId: options.resolveRootParentId
  });

  async function pickUsers(field: TField) {
    if (pickingField.value) {
      return;
    }

    pickingField.value = field;
    try {
      const current = options.getUsersByField(field);
      const result = await openPersonnelSelection({
        title: '选择人员',
        mode: 'person',
        required: false,
        users: current.map(options.mapCurrentUserForDialog),
        model: {
          userIds: current
            .map((item) => options.mapCurrentUserForDialog(item).id)
            .filter((id) => Boolean(normalizeIdLike(id)))
        },
        fetchNodes,
        searchNodes
      }).catch(() => null);

      if (!result) {
        return;
      }

      const users = (Array.isArray(result.users) ? result.users : [])
        .map((item: PersonnelSelectedUser) => options.mapSelectedUser(item))
        .filter((item): item is TUser => Boolean(item));
      options.setUsersByField(field, users);
    } finally {
      pickingField.value = '';
    }
  }

  return {
    pickingField,
    fetchNodes,
    searchNodes,
    pickUsers
  };
}
