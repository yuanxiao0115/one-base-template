import { tryGetCoreOptions } from '../context';
import { type StorageKind, readFromStorages, removeByPrefixes, removeFromStorages } from '../utils/storage';

function normalizeNamespace(value: string | undefined): string | undefined {
  if (!value) return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

export function getCoreStorageNamespace(explicitNamespace?: string): string | undefined {
  const explicit = normalizeNamespace(explicitNamespace);
  if (explicit) return explicit;

  const options = tryGetCoreOptions();
  const fromRoot = normalizeNamespace(options?.storageNamespace);
  if (fromRoot) return fromRoot;

  // 向后兼容：历史仅在 theme 上配置 storageNamespace。
  return normalizeNamespace(options?.theme?.storageNamespace);
}

export function resolveNamespacedKey(baseKey: string, explicitNamespace?: string): string {
  const namespace = getCoreStorageNamespace(explicitNamespace);
  return namespace ? `${namespace}:${baseKey}` : baseKey;
}

export function resolveNamespacedPrefix(basePrefix: string, explicitNamespace?: string): string {
  const namespace = getCoreStorageNamespace(explicitNamespace);
  return namespace ? `${namespace}:${basePrefix}` : basePrefix;
}

export function readWithLegacyFallback(
  baseKey: string,
  kinds: StorageKind[] = ['local', 'session'],
  explicitNamespace?: string
): { key: string; value: string } | null {
  const scopedKey = resolveNamespacedKey(baseKey, explicitNamespace);

  if (scopedKey !== baseKey) {
    const scopedValue = readFromStorages(scopedKey, kinds);
    if (scopedValue != null) {
      return {
        key: scopedKey,
        value: scopedValue
      };
    }
  }

  const legacyValue = readFromStorages(baseKey, kinds);
  if (legacyValue == null) return null;

  return {
    key: baseKey,
    value: legacyValue
  };
}

export function removeScopedAndLegacy(
  baseKey: string,
  kinds: StorageKind[] = ['local', 'session'],
  explicitNamespace?: string
) {
  const scopedKey = resolveNamespacedKey(baseKey, explicitNamespace);
  removeFromStorages(scopedKey, kinds);
  if (scopedKey !== baseKey) {
    removeFromStorages(baseKey, kinds);
  }
}

export function removeByScopedPrefixes(
  basePrefixes: string[],
  kind: StorageKind = 'local',
  explicitNamespace?: string
): number {
  const scopedPrefixes = basePrefixes.map(prefix => resolveNamespacedPrefix(prefix, explicitNamespace));
  const allPrefixes = Array.from(new Set([...basePrefixes, ...scopedPrefixes]));
  return removeByPrefixes(allPrefixes, kind);
}
