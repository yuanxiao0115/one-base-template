import { resolveAppRedirectTarget } from '@one-base-template/core';
import type { BackendKind } from '@/config/env';
import { DEFAULT_FALLBACK_HOME } from '@/config/systems';

export interface StartSsoScenarioOptions {
  backend: BackendKind;
  baseUrl: string;
  onDefaultSsoCallback: () => Promise<{ redirect: string }>;
  onAuthenticatedRedirect: (redirect: string) => Promise<void>;
  onFinalizeAuthSession: () => Promise<void>;
}

export async function startSsoScenario(options: StartSsoScenarioOptions) {
  const { backend, baseUrl, onDefaultSsoCallback, onAuthenticatedRedirect, onFinalizeAuthSession } =
    options;
  void backend;

  const { redirect } = await onDefaultSsoCallback();
  const target = resolveAppRedirectTarget(redirect, {
    fallback: DEFAULT_FALLBACK_HOME,
    baseUrl
  });

  await onFinalizeAuthSession();
  await onAuthenticatedRedirect(target);
}
