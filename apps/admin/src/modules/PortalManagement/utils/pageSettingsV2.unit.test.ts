import { describe, expect, it } from "vitest";
import {
  buildPortalPageLayoutForSave,
  normalizePortalPageSettingsV2,
  resolvePortalPageRuntimeSettings,
  validatePortalPageSettingsV2,
} from "@one-base-template/portal-engine";

describe("Portal 页面设置V2", () => {
  it("应兼容旧 settings.gridData 并转为 V2 layout", () => {
    const settings = normalizePortalPageSettingsV2({
      gridData: {
        colNum: 24,
        colSpace: 8,
        rowSpace: 12,
      },
    });

    expect(settings.version).toBe("2.0");
    expect(settings.layout).toEqual({
      colNum: 24,
      colSpace: 8,
      rowSpace: 12,
    });
  });

  it("应兼容旧版边距/背景/页头页脚字段", () => {
    const settings = normalizePortalPageSettingsV2({
      marginData: {
        marginTop: 12,
        paddingLeft: 20,
      },
      backgroundData: {
        pageBgColor: "#fafafa",
        pageBgImage: "https://example.com/bg.jpg",
        bgScope: "content",
      },
      headerFooterData: {
        layoutMode: "flow",
        footerFixedMode: "fixed",
      },
      basicData: {
        scrollMode: "hidden",
        contentMaxWidth: 1360,
      },
    });

    expect(settings.layoutMode).toBe("header-fixed-footer-fixed-content-scroll");
    expect(settings.spacing.marginTop).toBe(12);
    expect(settings.spacing.paddingLeft).toBe(20);
    expect(settings.background.backgroundColor).toBe("#fafafa");
    expect(settings.background.backgroundImage).toBe("https://example.com/bg.jpg");
    expect(settings.background.scope).toBe("content");
    expect(settings.headerFooterBehavior.footerMode).toBe("fixed");
    expect(settings.layoutContainer.fixedWidth).toBe(1360);
    expect(settings.layoutContainer.overflowMode).toBe("hidden");
  });

  it("保存时应统一输出 V2 settings", () => {
    const pageLayout = buildPortalPageLayoutForSave(
      {
        version: "2.0",
        basic: {
          pageTitle: "工作门户",
          isVisible: true,
        },
        layout: {
          colNum: 12,
          colSpace: 16,
          rowSpace: 16,
        },
        access: {
          mode: "public",
          roleIds: [],
        },
        publishGuard: {
          requireContent: true,
          requireTitle: true,
        },
      },
      [{ i: "a", x: 0, y: 0, w: 6, h: 6 }]
    );

    const settings = pageLayout.settings;
    expect(settings).toBeTruthy();
    expect(settings?.version).toBe("2.0");
    expect(Array.isArray(pageLayout.component)).toBe(true);
    expect(pageLayout.component).toHaveLength(1);
  });

  it("应按断点解析运行时布局参数", () => {
    const runtime = resolvePortalPageRuntimeSettings(
      {
        version: "2.0",
        layout: { colNum: 12, colSpace: 16, rowSpace: 16 },
        responsive: {
          pad: {
            enabled: true,
            maxWidth: 1200,
            colNum: 8,
            colSpace: 10,
            rowSpace: 10,
            marginTop: 0,
            marginRight: 0,
            marginBottom: 0,
            marginLeft: 0,
            paddingTop: 8,
            paddingRight: 8,
            paddingBottom: 8,
            paddingLeft: 8,
            bannerHeight: 220,
          },
          mobile: {
            enabled: true,
            maxWidth: 768,
            colNum: 4,
            colSpace: 6,
            rowSpace: 6,
            marginTop: 0,
            marginRight: 0,
            marginBottom: 0,
            marginLeft: 0,
            paddingTop: 6,
            paddingRight: 6,
            paddingBottom: 6,
            paddingLeft: 6,
            bannerHeight: 180,
          },
        },
      },
      {
        viewportWidth: 700,
      }
    );

    expect(runtime.viewport).toBe("mobile");
    expect(runtime.grid.colNum).toBe(4);
    expect(runtime.bannerHeight).toBe(180);
  });

  it("应校验页面标题、角色模式与内容必填规则，且 Banner 图片为空不阻断保存", () => {
    const issues = validatePortalPageSettingsV2(
      {
        version: "2.0",
        basic: {
          pageTitle: "   ",
          isVisible: true,
        },
        layout: {
          colNum: 12,
          colSpace: 16,
          rowSpace: 16,
        },
        access: {
          mode: "role",
          roleIds: [],
        },
        publishGuard: {
          requireContent: true,
          requireTitle: true,
        },
        banner: {
          enabled: true,
          image: "",
        },
        responsive: {
          pad: {
            enabled: true,
            maxWidth: 900,
          },
          mobile: {
            enabled: true,
            maxWidth: 980,
          },
        },
      },
      { componentCount: 0 }
    );

    expect(issues.map((item) => item.field)).toEqual(
      expect.arrayContaining([
        "basic.pageTitle",
        "access.roleIds",
        "publishGuard.requireContent",
        "responsive.mobile.maxWidth",
      ])
    );

    expect(issues.map((item) => item.field)).not.toContain("banner.image");
  });
});
