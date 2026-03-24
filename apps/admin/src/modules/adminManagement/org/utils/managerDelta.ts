interface ManagerSelectionLike {
  userId: string;
}

interface ManagerRecordLike {
  id: string;
  userId: string;
}

export interface OrgManagerDeltaResult {
  addUserIds: string[];
  removeIds: string[];
}

export function resolveOrgManagerDelta(
  selectedUsers: ManagerSelectionLike[],
  originalManagers: ManagerRecordLike[]
): OrgManagerDeltaResult {
  const selectedUserIds = Array.from(
    new Set(selectedUsers.map((item) => item.userId).filter(Boolean))
  );
  const originalUserIds = Array.from(
    new Set(originalManagers.map((item) => item.userId).filter(Boolean))
  );

  const selectedSet = new Set(selectedUserIds);
  const originalSet = new Set(originalUserIds);

  const addUserIds = selectedUserIds.filter((userId) => !originalSet.has(userId));
  const removeIds = originalManagers
    .filter((item) => !selectedSet.has(item.userId))
    .map((item) => item.id)
    .filter(Boolean);

  return {
    addUserIds,
    removeIds
  };
}
