import { describe, expect, it } from "vitest";

import {
  buildPortalTabPermissionUpdatePayload,
  buildTemplatePagePermissionTree,
  collectTemplatePagePermissionTabs,
  type PagePermissionSubmitPayload,
} from "./pagePermission";

describe("PortalManagement/utils/pagePermission", () => {
  it("应递归提取可编辑页面并去重", () => {
    const tabs = [
      {
        id: "group-a",
        tabType: 1,
        tabName: "导航组A",
        children: [
          { id: "tab-home", tabType: 2, tabName: "首页" },
          { id: "tab-link", tabType: 3, tabName: "外链" },
        ],
      },
      { id: "tab-home", tabType: 2, tabName: "首页重复" },
      { id: "tab-news", tabType: 2, tabName: "新闻页" },
      { id: "", tabType: 2, tabName: "无效页" },
    ];

    const result = collectTemplatePagePermissionTabs(tabs as never);

    expect(result).toEqual([
      { tabId: "tab-home", tabName: "首页" },
      { tabId: "tab-news", tabName: "新闻页" },
    ]);
  });

  it("应构造 tab.update 所需权限字段", () => {
    const payload: PagePermissionSubmitPayload = {
      authType: "person",
      allowPerms: { roleIds: ["r1"], userIds: ["u1"] },
      forbiddenPerms: { roleIds: ["r2"], userIds: ["u2"] },
      configPerms: { roleIds: ["r3"], userIds: ["u3"] },
    };

    const detail = {
      id: "tab-home",
      tabName: "首页",
      templateId: "tpl-1",
      sort: 3,
      tabType: 2,
    };

    const result = buildPortalTabPermissionUpdatePayload(detail, payload);

    expect(result).toEqual({
      id: "tab-home",
      tabName: "首页",
      templateId: "tpl-1",
      sort: 3,
      tabType: 2,
      authType: "person",
      allowPerms: { roleIds: ["r1"], userIds: ["u1"] },
      forbiddenPerms: { roleIds: ["r2"], userIds: ["u2"] },
      configPerms: { roleIds: ["r3"], userIds: ["u3"] },
    });

    payload.allowPerms.userIds.push("uX");
    expect(result.allowPerms.userIds).toEqual(["u1"]);
  });

  it("页面详情缺少必填字段时应抛错", () => {
    const payload: PagePermissionSubmitPayload = {
      authType: "person",
      allowPerms: { roleIds: [], userIds: [] },
      forbiddenPerms: { roleIds: [], userIds: [] },
      configPerms: { roleIds: [], userIds: [] },
    };

    expect(() =>
      buildPortalTabPermissionUpdatePayload(
        {
          id: "tab-home",
          tabName: "首页",
          templateId: "tpl-1",
        },
        payload
      )
    ).toThrowError("页面详情缺少必填字段：sort");
  });

  it("应构造可用于页面权限选择的树结构", () => {
    const tabs = [
      {
        id: "group-a",
        tabType: 1,
        tabName: "导航组A",
        children: [
          { id: "tab-home", tabType: 2, tabName: "首页" },
          {
            id: "group-b",
            tabType: 1,
            tabName: "导航组B",
            children: [{ id: "tab-news", tabType: 2, tabName: "新闻页" }],
          },
          { id: "tab-link", tabType: 3, tabName: "外链" },
        ],
      },
      { id: "tab-alone", tabType: 2, tabName: "独立页" },
    ];

    const result = buildTemplatePagePermissionTree(tabs as never);

    expect(result).toEqual([
      {
        id: "group-a",
        label: "导航组A",
        tabId: "",
        selectable: false,
        children: [
          {
            id: "tab-home",
            label: "首页",
            tabId: "tab-home",
            selectable: true,
          },
          {
            id: "group-b",
            label: "导航组B",
            tabId: "",
            selectable: false,
            children: [
              {
                id: "tab-news",
                label: "新闻页",
                tabId: "tab-news",
                selectable: true,
              },
            ],
          },
        ],
      },
      {
        id: "tab-alone",
        label: "独立页",
        tabId: "tab-alone",
        selectable: true,
      },
    ]);
  });
});
