import { describe, expect, it } from "vitest";
import {
  createOneAppManualChunks,
  createOneAppPreloadDependenciesResolver,
} from "../../../../scripts/vite/manual-chunks";

describe("manual-chunks wangeditor 策略", () => {
  const manualChunks = createOneAppManualChunks({
    appName: "admin",
    featureChunks: [
      {
        name: "admin-cms-management",
        patterns: ["/apps/admin/src/modules/CmsManagement/"],
      },
    ],
  });

  it("应将 wangeditor 依赖收敛到单独 vendor chunk", () => {
    expect(manualChunks("/repo/node_modules/@wangeditor/editor/dist/index.esm.js")).toBe("wangeditor");
    expect(manualChunks("/repo/node_modules/prismjs/components/prism-core.js")).toBe("wangeditor");
  });

  it("应保持 CMS 业务页面继续进入 feature chunk", () => {
    expect(manualChunks("/repo/apps/admin/src/modules/CmsManagement/content/page.vue")).toBe(
      "admin-cms-management"
    );
  });
});

describe("admin preload resolver", () => {
  const preloadResolver = createOneAppPreloadDependenciesResolver({
    appName: "admin",
  });

  it("LoginPage 不应预加载 app-shell/wangeditor 等重依赖", () => {
    const deps = [
      "assets/admin-app-shell-xxx.js",
      "assets/wangeditor-yyy.js",
      "assets/vue-vendor-zzz.js",
    ];
    expect(
      preloadResolver("assets/LoginPage-abc.js", deps, {
        hostId: "assets/LoginPage-abc.js",
        hostType: "js",
      })
    ).toEqual(["assets/vue-vendor-zzz.js"]);
  });
});
