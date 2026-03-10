import { renderBootstrapError } from "./error-view";

export async function startAdminApp() {
  try {
    const { loadPlatformConfig } = await import("../config/platform-config");
    await loadPlatformConfig();
    const { bootstrapAdminMode } = await import("./admin-entry");
    const { app, router } = bootstrapAdminMode();
    await router.isReady();
    app.mount("#app");
  } catch (error) {
    renderBootstrapError(error);
  }
}
