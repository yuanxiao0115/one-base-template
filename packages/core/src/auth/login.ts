import type { BackendKind } from '../config/platform-config';
import type { LoginPayload } from '../adapter/types';
import { useAuthStore } from '../stores/auth';
import { finalizeAuthSession, safeRedirect } from './flow';

export interface PortalFrontConfig {
  enable?: boolean;
  customUrl?: string;
}

export interface ResolvePortalLoginTargetOptions {
  redirect?: unknown;
  fallback?: string;
  frontConfig?: PortalFrontConfig | null;
}

export interface LoginByPasswordOptions {
  backend: BackendKind;
  username: string;
  password: string;
  captcha?: string;
  captchaKey?: string;
  alreadyEncrypted?: boolean;
  encryptor?: (plainText: string) => string;
}

function buildLoginPayload(options: LoginByPasswordOptions): LoginPayload {
  if (options.backend !== 'basic') {
    return {
      username: options.username,
      password: options.password
    };
  }

  if (options.alreadyEncrypted) {
    return {
      username: options.username,
      password: options.password,
      captcha: options.captcha,
      captchaKey: options.captchaKey,
      encrypt: 1
    };
  }

  if (!options.encryptor) {
    throw new Error('[login] basic 登录缺少 encryptor');
  }

  return {
    username: options.encryptor(options.username),
    password: options.encryptor(options.password),
    captcha: options.captcha,
    captchaKey: options.captchaKey,
    encrypt: 1
  };
}

export async function loginByPassword(options: LoginByPasswordOptions) {
  const authStore = useAuthStore();
  await authStore.login(buildLoginPayload(options));
  await finalizeAuthSession({
    shouldFetchMe: false
  });
}

export function resolvePortalLoginTarget(options: ResolvePortalLoginTargetOptions): string {
  const fallback = options.fallback ?? '/portal/index';
  const redirectTarget = safeRedirect(options.redirect, '');
  if (redirectTarget) {
    return redirectTarget;
  }

  if (options.frontConfig?.enable) {
    return fallback;
  }

  return safeRedirect(options.frontConfig?.customUrl, fallback);
}
