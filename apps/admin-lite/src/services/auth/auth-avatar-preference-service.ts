import { getNamespacedKey } from '@one-base-template/core';

const AVATAR_HIDDEN_USER_IDS_STORAGE_BASE_KEY = 'ob_admin_avatar_hidden_user_ids';

let avatarHiddenUserIds: Set<string> | null = null;

function loadAvatarHiddenUserIds(): Set<string> {
  const key = getNamespacedKey(AVATAR_HIDDEN_USER_IDS_STORAGE_BASE_KEY);

  try {
    const rawValue = localStorage.getItem(key);
    if (!rawValue) {
      return new Set<string>();
    }

    const parsed = JSON.parse(rawValue) as unknown;
    if (!Array.isArray(parsed)) {
      return new Set<string>();
    }

    return new Set(
      parsed
        .map((item) => (item == null ? '' : String(item).trim()))
        .filter((item) => item.length > 0)
    );
  } catch {
    return new Set<string>();
  }
}

function getAvatarHiddenUserIds(): Set<string> {
  if (!avatarHiddenUserIds) {
    avatarHiddenUserIds = loadAvatarHiddenUserIds();
  }
  return avatarHiddenUserIds;
}

function saveAvatarHiddenUserIds() {
  const key = getNamespacedKey(AVATAR_HIDDEN_USER_IDS_STORAGE_BASE_KEY);
  try {
    const values = Array.from(getAvatarHiddenUserIds());
    localStorage.setItem(key, JSON.stringify(values));
  } catch {
    // 本地存储不可用时忽略写入失败
  }
}

export function isAvatarHidden(userId: string | number | null | undefined): boolean {
  if (userId == null) {
    return false;
  }
  return getAvatarHiddenUserIds().has(String(userId));
}

export function setAvatarHidden(
  userId: string | number | null | undefined,
  hidden: boolean
): boolean {
  if (userId == null) {
    return false;
  }

  const id = String(userId);
  const hiddenIds = getAvatarHiddenUserIds();

  if (hidden) {
    hiddenIds.add(id);
  } else {
    hiddenIds.delete(id);
  }

  saveAvatarHiddenUserIds();
  return true;
}

export function buildAvatarFallbackText(...candidates: Array<string | null | undefined>): string {
  const value =
    candidates
      .map((item) => (typeof item === 'string' ? item.trim() : ''))
      .find((item) => item.length > 0) || '用户';

  const chars = Array.from(value);
  return chars.slice(-2).join('') || '用户';
}
