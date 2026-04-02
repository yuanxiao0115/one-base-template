export interface SsoCallbackStrategyHandlers {
  onZhxt(payload: { token: string }): Promise<void>;
  onYdbg(payload: { token: string }): Promise<void>;
  onTicket(payload: {
    ticket: string;
    serviceUrlRaw: string | null;
    redirectUrlRaw: string | null;
  }): Promise<void>;
  onTypeToken(payload: { type: string; token: string }): Promise<void>;
  onMoaToken(payload: { token: string }): Promise<void>;
  onUserToken(payload: { token: string }): Promise<void>;
}

export interface StartSsoCallbackStrategyOptions {
  searchParams: URLSearchParams;
  handlers: SsoCallbackStrategyHandlers;
}

export async function startSsoCallbackStrategy(options: StartSsoCallbackStrategyOptions) {
  const { searchParams, handlers } = options;

  const token = searchParams.get('token');
  const type = searchParams.get('type');
  const userToken = searchParams.get('Usertoken');
  const moaToken = searchParams.get('moaToken');
  const ticket = searchParams.get('ticket');
  const sourceCode = searchParams.get('sourceCode');

  if (sourceCode === 'zhxt' && token) {
    await handlers.onZhxt({ token });
    return;
  }

  if (sourceCode === 'YDBG' && token) {
    await handlers.onYdbg({ token });
    return;
  }

  if (ticket) {
    await handlers.onTicket({
      ticket,
      serviceUrlRaw: searchParams.get('serviceUrl'),
      redirectUrlRaw: searchParams.get('redirectUrl')
    });
    return;
  }

  if (type && token) {
    await handlers.onTypeToken({ type, token });
    return;
  }

  if (moaToken) {
    await handlers.onMoaToken({ token: moaToken });
    return;
  }

  if (userToken) {
    await handlers.onUserToken({ token: userToken });
    return;
  }

  throw new Error('登录参数无效');
}
