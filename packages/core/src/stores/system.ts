import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

export interface AppSystemInfo {
  code: string;
  name: string;
}

export interface SystemOptions {
  /**
   * 默认系统 code（例如 sczfw 的 permissionCode=admin_server）。
   * 仅作为“没有本地缓存/缓存失效”时的兜底选择。
   */
  defaultCode?: string;
  /**
   * 系统首页映射：每个系统固定一个首页路径。
   * 例如：{ admin_server: '/home/index', b_system: '/b/home' }
   */
  homeMap?: Record<string, string>;
  /**
   * 当未命中 homeMap 时的兜底首页路径（默认 /home/index）。
   */
  fallbackHome?: string;
}

const SYSTEM_LIST_STORAGE_KEY = 'ob_system_list';
const SYSTEM_CURRENT_STORAGE_KEY = 'ob_system_current';

function isNonEmptyString(v: unknown): v is string {
  return typeof v === 'string' && v.length > 0;
}

function readStoredCurrent(): string | null {
  try {
    const raw = localStorage.getItem(SYSTEM_CURRENT_STORAGE_KEY);
    return isNonEmptyString(raw) ? raw : null;
  } catch {
    return null;
  }
}

function writeStoredCurrent(code: string) {
  try {
    localStorage.setItem(SYSTEM_CURRENT_STORAGE_KEY, code);
  } catch {
    // ignore
  }
}

function clearStoredCurrent() {
  try {
    localStorage.removeItem(SYSTEM_CURRENT_STORAGE_KEY);
  } catch {
    // ignore
  }
}

function readStoredSystems(): AppSystemInfo[] | null {
  try {
    const raw = localStorage.getItem(SYSTEM_LIST_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return null;

    const list: AppSystemInfo[] = [];
    for (const item of parsed) {
      if (!item || typeof item !== 'object') continue;
      const code = (item as Record<string, unknown>).code;
      const name = (item as Record<string, unknown>).name;
      if (!isNonEmptyString(code)) continue;
      list.push({
        code,
        name: isNonEmptyString(name) ? name : code
      });
    }
    return list.length ? list : null;
  } catch {
    // localStorage 不可用或 JSON 解析失败时，直接清理缓存，避免后续反复报错
    try {
      localStorage.removeItem(SYSTEM_LIST_STORAGE_KEY);
    } catch {
      // ignore
    }
    return null;
  }
}

function writeStoredSystems(list: AppSystemInfo[]) {
  try {
    localStorage.setItem(SYSTEM_LIST_STORAGE_KEY, JSON.stringify(list));
  } catch {
    // ignore
  }
}

function clearStoredSystems() {
  try {
    localStorage.removeItem(SYSTEM_LIST_STORAGE_KEY);
  } catch {
    // ignore
  }
}

export const useSystemStore = defineStore('ob-system', () => {
  const systems = ref<AppSystemInfo[]>([]);
  const currentSystemCode = ref<string>('');

  // 由 app 注入：默认系统、首页映射等
  const defaultCode = ref<string>('');
  const homeMap = ref<Record<string, string>>({});
  const fallbackHome = ref<string>('/home/index');

  // 参考老项目：把当前系统与系统列表持久化到 localStorage，刷新后可快速恢复 UI 状态
  const storedSystems = readStoredSystems();
  if (storedSystems?.length) {
    systems.value = storedSystems;
  }

  const storedCurrent = readStoredCurrent();
  if (storedCurrent) {
    currentSystemCode.value = storedCurrent;
  }

  const currentSystem = computed(() => systems.value.find(s => s.code === currentSystemCode.value));
  const currentSystemName = computed(() => currentSystem.value?.name ?? (currentSystemCode.value || '系统'));

  function init(options?: SystemOptions) {
    defaultCode.value = options?.defaultCode ?? '';
    homeMap.value = options?.homeMap ?? {};
    fallbackHome.value = options?.fallbackHome ?? '/home/index';

    // 若本地未缓存 currentSystemCode，则使用默认系统兜底（此时系统列表可能还未加载）
    if (!currentSystemCode.value && defaultCode.value) {
      setCurrentSystem(defaultCode.value);
    }
  }

  function setSystems(nextSystems: AppSystemInfo[]) {
    systems.value = nextSystems;
    writeStoredSystems(nextSystems);
  }

  function setCurrentSystem(code: string) {
    currentSystemCode.value = code;
    writeStoredCurrent(code);
  }

  /**
   * 根据“可用系统列表”修正 currentSystemCode，保证一定落在可用范围内。
   * 返回最终选中的 systemCode（可能为空字符串）。
   */
  function ensureCurrentSystem(availableSystemCodes: string[]): string {
    const available = new Set(availableSystemCodes.filter(isNonEmptyString));

    if (currentSystemCode.value && available.has(currentSystemCode.value)) {
      return currentSystemCode.value;
    }

    if (defaultCode.value && available.has(defaultCode.value)) {
      setCurrentSystem(defaultCode.value);
      return defaultCode.value;
    }

    const first = availableSystemCodes.find(isNonEmptyString) ?? '';
    if (first) {
      setCurrentSystem(first);
      return first;
    }

    // 没有任何可用系统时，保持为空
    return '';
  }

  function resolveHomePath(systemCode?: string): string {
    const code = systemCode ?? currentSystemCode.value;
    const mapped = code ? homeMap.value[code] : undefined;
    return isNonEmptyString(mapped) ? mapped : fallbackHome.value;
  }

  function reset() {
    systems.value = [];
    currentSystemCode.value = '';
    defaultCode.value = '';
    homeMap.value = {};
    fallbackHome.value = '/home/index';
    clearStoredSystems();
    clearStoredCurrent();
  }

  return {
    systems,
    currentSystemCode,
    currentSystem,
    currentSystemName,
    init,
    setSystems,
    setCurrentSystem,
    ensureCurrentSystem,
    resolveHomePath,
    reset
  };
});

