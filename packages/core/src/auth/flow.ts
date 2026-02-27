import { useAuthStore } from '../stores/auth';
import { useMenuStore } from '../stores/menu';

export interface FinalizeAuthSessionOptions {
  /**
   * 是否在收口流程里调用 fetchMe。
   * - token 直登/SSO 落 token 场景：通常需要 true
   * - 已执行 authStore.login() 场景：可传 false 避免重复拉取
   */
  shouldFetchMe?: boolean;
}

export function safeRedirect(raw: unknown, fallback = '/'): string {
  if (typeof raw !== 'string' || !raw) return fallback;

  try {
    const decoded = decodeURIComponent(raw);
    // 仅允许站内路径，阻断协议跳转与 //host 形式的开放重定向。
    if (!decoded.startsWith('/')) return fallback;
    if (decoded.startsWith('//')) return fallback;
    return decoded;
  } catch {
    if (!raw.startsWith('/')) return fallback;
    if (raw.startsWith('//')) return fallback;
    return raw;
  }
}

export async function finalizeAuthSession(options: FinalizeAuthSessionOptions = {}) {
  const shouldFetchMe = options.shouldFetchMe ?? true;

  if (shouldFetchMe) {
    const authStore = useAuthStore();
    await authStore.fetchMe();
  }

  const menuStore = useMenuStore();
  await menuStore.loadMenus();
}
