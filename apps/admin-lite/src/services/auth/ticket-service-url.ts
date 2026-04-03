export interface TicketServiceUrlLocationLike {
  origin: string;
  href: string;
}

function isAbsoluteHttpUrl(value: string) {
  return value.startsWith('http://') || value.startsWith('https://');
}

/**
 * ticket 场景 serviceUrl 解析规则：
 * 1. 优先使用 URL 显式透传的 serviceUrl（与后端 ticket 契约对齐）；
 * 2. 其次使用 redirectUrl 推导绝对地址；
 * 3. 最后兜底当前回调地址。
 */
export function resolveTicketServiceUrl(params: {
  serviceUrlRaw: string | null;
  redirectUrlRaw: string | null;
  locationLike: TicketServiceUrlLocationLike;
}) {
  const { serviceUrlRaw, redirectUrlRaw, locationLike } = params;

  if (serviceUrlRaw && serviceUrlRaw.trim()) {
    return serviceUrlRaw.trim();
  }

  if (redirectUrlRaw && redirectUrlRaw.trim()) {
    const normalizedRedirectUrl = redirectUrlRaw.trim();
    if (isAbsoluteHttpUrl(normalizedRedirectUrl)) {
      return normalizedRedirectUrl;
    }

    if (normalizedRedirectUrl.startsWith('/')) {
      return `${locationLike.origin}${normalizedRedirectUrl}`;
    }

    return `${locationLike.origin}/${normalizedRedirectUrl}`;
  }

  return locationLike.href;
}
