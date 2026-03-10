export interface RouterLike {
  isReady?: () => Promise<unknown> | unknown;
}

export interface AppLike {
  mount: (selector: string) => unknown;
}

export interface BootstrapResultLike {
  app: AppLike;
  router?: RouterLike;
}

export interface StartAppWithRuntimeConfigOptions<TBootstrapResult extends BootstrapResultLike> {
  loadRuntimeConfig: () => Promise<unknown>;
  bootstrap: () => Promise<TBootstrapResult> | TBootstrapResult;
  onError: (error: unknown) => void;
  mountSelector?: string;
}

export async function startAppWithRuntimeConfig<TBootstrapResult extends BootstrapResultLike>(
  options: StartAppWithRuntimeConfigOptions<TBootstrapResult>
): Promise<void> {
  const { loadRuntimeConfig, bootstrap, onError, mountSelector = '#app' } = options;

  try {
    await loadRuntimeConfig();
    const result = await bootstrap();
    if (result.router?.isReady) {
      await result.router.isReady();
    }
    result.app.mount(mountSelector);
  } catch (error) {
    onError(error);
  }
}
