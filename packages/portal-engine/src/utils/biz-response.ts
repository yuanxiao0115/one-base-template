export interface PortalBizResponseLike {
  code?: unknown;
  success?: unknown;
}

export function isPortalBizOk(response: PortalBizResponseLike | null | undefined): boolean {
  const code = response?.code;
  return (
    response?.success === true ||
    code === 0 ||
    code === 200 ||
    String(code) === '0' ||
    String(code) === '200'
  );
}
