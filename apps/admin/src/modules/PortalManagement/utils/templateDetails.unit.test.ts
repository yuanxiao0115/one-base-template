import { describe, expect, it } from "vitest";

import {
  buildPortalHeaderNavItems,
  createDefaultPortalTemplateDetails,
  parsePortalTemplateDetails,
  resolvePortalShellForTab,
} from "./templateDetails";

describe("PortalManagement/utils/templateDetails", () => {
  it("应在 details 缺失或非法时回退默认配置", () => {
    expect(parsePortalTemplateDetails("")).toEqual(createDefaultPortalTemplateDetails());
    expect(parsePortalTemplateDetails("invalid-json")).toEqual(createDefaultPortalTemplateDetails());
    expect(parsePortalTemplateDetails(null)).toEqual(createDefaultPortalTemplateDetails());
  });

  it("应兼容 pageHeader/pageFooter 与 shell 开关同步", () => {
    const parsed = parsePortalTemplateDetails(
      JSON.stringify({
        pageHeader: 0,
        pageFooter: 1,
        shell: {
          header: { enabled: true },
          footer: { enabled: false },
        },
      })
    );

    expect(parsed.pageHeader).toBe(0);
    expect(parsed.pageFooter).toBe(1);
    expect(parsed.shell.header.enabled).toBe(false);
    expect(parsed.shell.footer.enabled).toBe(true);
  });

  it("应按页面覆盖优先级解析 header/footer", () => {
    const details = parsePortalTemplateDetails({
      pageHeader: 1,
      pageFooter: 1,
      shell: {
        header: {
          enabled: true,
          variant: "classic",
          tokens: { bgColor: "#111111" },
        },
      },
      pageOverrides: {
        pageA: {
          headerOverrideEnabled: true,
          header: {
            variant: "newsRed",
            tokens: { bgColor: "#cc0000" },
          },
        },
      },
    });

    const resolvedA = resolvePortalShellForTab(details, "pageA");
    const resolvedB = resolvePortalShellForTab(details, "pageB");

    expect(resolvedA.header.variant).toBe("newsRed");
    expect(resolvedA.header.tokens.bgColor).toBe("#cc0000");
    expect(resolvedB.header.variant).toBe("classic");
    expect(resolvedB.header.tokens.bgColor).toBe("#111111");
  });

  it("应从页面树提取可用于页眉导航的可见页面与链接", () => {
    const nav = buildPortalHeaderNavItems([
      {
        id: "group-1",
        tabType: 1,
        tabName: "分组",
        children: [
          {
            id: "page-1",
            tabType: 2,
            tabName: "首页",
          },
          {
            id: "link-1",
            tabType: 3,
            tabName: "外链",
            tabUrl: "https://example.com",
          },
          {
            id: "page-hidden",
            tabType: 2,
            tabName: "隐藏页",
            isHide: 1,
          },
        ],
      },
    ]);

    expect(nav).toEqual([
      {
        key: "tab-page-1",
        label: "首页",
        tabId: "page-1",
      },
      {
        key: "link-link-1",
        label: "外链",
        url: "https://example.com",
      },
    ]);
  });
});
