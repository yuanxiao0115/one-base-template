import { getCoreOptions } from '../context';
import { useAuthStore } from '../stores/auth';
import { useMenuStore } from '../stores/menu';

function normalizeRedirect(raw: string | null): string {
  if (!raw) return '/';

  try {
    const decoded = decodeURIComponent(raw);
    // 只允许站内跳转
    if (!decoded.startsWith('/')) return '/';
    if (decoded.startsWith('//')) return '/';
    return decoded;
  } catch {
    return '/';
  }
}

export async function handleSsoCallback(): Promise<{ redirect: string }> {
  const options = getCoreOptions();
  if (!options.sso.enabled) {
    return { redirect: '/login' };
  }

  const url = new URL(window.location.href);
  const sp = url.searchParams;

  const redirect = normalizeRedirect(sp.get('redirect') ?? sp.get('redirectUrl'));

  const sso = options.adapter.sso;

  let matched = false;

  // 约定按策略列表顺序匹配，命中即停止，避免多种参数同时存在时出现重复 exchange。
  for (const strategy of options.sso.strategies) {
    if (strategy.type === 'token') {
      const token = strategy.paramNames.map(k => sp.get(k)).find(v => !!v);
      if (!token) continue;
      matched = true;

      if (strategy.exchange === 'adapter') {
        if (!sso?.exchangeToken) {
          throw new Error('[sso] 已配置 exchange=adapter，但 adapter 未实现 exchangeToken');
        }
        await sso.exchangeToken(token);
      }
      break;
    }

    if (strategy.type === 'ticket') {
      const ticket = strategy.paramNames.map(k => sp.get(k)).find(v => !!v);
      if (!ticket) continue;
      matched = true;

      if (!sso?.exchangeTicket) {
        throw new Error('[sso] adapter 未实现 exchangeTicket');
      }

      const serviceUrl = strategy.serviceUrlParam ? sp.get(strategy.serviceUrlParam) : sp.get('serviceUrl');
      await sso.exchangeTicket({ ticket, serviceUrl: serviceUrl ?? undefined });
      break;
    }

    if (strategy.type === 'oauth') {
      const code = sp.get(strategy.codeParam ?? 'code');
      if (!code) continue;
      matched = true;

      if (!sso?.exchangeOAuthCode) {
        throw new Error('[sso] adapter 未实现 exchangeOAuthCode');
      }

      const state = sp.get(strategy.stateParam ?? 'state') ?? undefined;
      await sso.exchangeOAuthCode({
        code,
        state,
        redirectUri: strategy.redirectUri
      });
      break;
    }
  }

  if (!matched) {
    throw new Error('[sso] 未匹配到任何 SSO 策略，请检查 URL 参数或策略配置');
  }

  // exchange 成功后拉取用户与菜单
  const authStore = useAuthStore();
  await authStore.fetchMe();

  const menuStore = useMenuStore();
  await menuStore.loadMenus();

  return { redirect };
}
