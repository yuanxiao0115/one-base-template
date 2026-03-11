import { describe, expect, it } from "vitest";
import {
  buildPortalPageLayoutForSave,
  normalizePortalPageSettingsV2,
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

  it("应校验页面标题、角色模式与内容必填规则", () => {
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
      },
      { componentCount: 0 }
    );

    expect(issues.map((item) => item.field)).toEqual(
      expect.arrayContaining(["basic.pageTitle", "access.roleIds", "publishGuard.requireContent"])
    );
  });
});
