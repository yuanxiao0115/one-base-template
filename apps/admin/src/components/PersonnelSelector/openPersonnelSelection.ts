import { type AppContext, createVNode, render } from "vue";
import PersonnelSelectionDialogHost from "./PersonnelSelectionDialogHost.vue";
import type {
  OpenPersonnelSelectionResult,
  PersonnelFetchNodes,
  PersonnelSearchNodes,
  PersonnelSelectedItem,
  PersonnelSelectedOrg,
  PersonnelSelectedPosition,
  PersonnelSelectedRole,
  PersonnelSelectedUser,
  PersonnelSelectionField,
  PersonnelSelectionModel,
  PersonnelSelectMode,
} from "./types";

interface PersonnelSelectionLegacyUser {
  id: string;
  nickName?: string;
  userAccount?: string;
  phone?: string;
  title?: string;
  subTitle?: string;
}

interface PersonnelSelectionLegacyNode {
  id: string;
  title?: string;
  subTitle?: string;
  orgName?: string;
  roleName?: string;
  positionName?: string;
}

export interface OpenPersonnelSelectionOptions {
  title?: string;
  width?: number | string;
  mode?: PersonnelSelectMode;
  selectionField?: PersonnelSelectionField;
  allowSelectOrg?: boolean;
  required?: boolean;
  disabled?: boolean;
  confirmText?: string;
  cancelText?: string;
  closeOnClickModal?: boolean;
  model?: PersonnelSelectionModel;
  selectedItems?: PersonnelSelectedItem[];
  users?: PersonnelSelectionLegacyUser[];
  orgs?: PersonnelSelectionLegacyNode[];
  roles?: PersonnelSelectionLegacyNode[];
  positions?: PersonnelSelectionLegacyNode[];
  fetchNodes: PersonnelFetchNodes;
  searchNodes: PersonnelSearchNodes;
}

let personnelSelectionAppContext: AppContext | null = null;

function getSelectionFieldByMode(mode: PersonnelSelectMode): PersonnelSelectionField {
  if (mode === "org") {
    return "orgIds";
  }
  if (mode === "role") {
    return "roleIds";
  }
  if (mode === "position") {
    return "positionIds";
  }
  return "userIds";
}

function getDefaultTitle(mode: PersonnelSelectMode): string {
  if (mode === "org") {
    return "选择组织";
  }
  if (mode === "role") {
    return "选择角色";
  }
  if (mode === "position") {
    return "选择岗位";
  }
  return "选择人员";
}

function uniqueById<T extends { id: string }>(rows: T[]): T[] {
  const map = new Map<string, T>();
  rows.forEach((item) => {
    if (!item.id) {
      return;
    }
    map.set(item.id, item);
  });
  return Array.from(map.values());
}

function toSelectedUser(item: PersonnelSelectionLegacyUser): PersonnelSelectedUser {
  const title = item.nickName || item.title || item.userAccount || item.id;
  const subTitle = item.phone || item.userAccount || item.subTitle || "--";
  return {
    id: item.id,
    nodeType: "user",
    title,
    subTitle,
    nickName: title,
    userAccount: item.userAccount || "",
    phone: item.phone || "",
  };
}

function toSelectedOrg(item: PersonnelSelectionLegacyNode): PersonnelSelectedOrg {
  return {
    id: item.id,
    nodeType: "org",
    title: item.title || item.orgName || "组织",
    subTitle: item.subTitle,
  };
}

function toSelectedRole(item: PersonnelSelectionLegacyNode): PersonnelSelectedRole {
  return {
    id: item.id,
    nodeType: "role",
    title: item.title || item.roleName || "角色",
    subTitle: item.subTitle,
  };
}

function toSelectedPosition(item: PersonnelSelectionLegacyNode): PersonnelSelectedPosition {
  return {
    id: item.id,
    nodeType: "position",
    title: item.title || item.positionName || "岗位",
    subTitle: item.subTitle,
  };
}

function normalizeSelectedItems(options: OpenPersonnelSelectionOptions): PersonnelSelectedItem[] {
  if (Array.isArray(options.selectedItems) && options.selectedItems.length > 0) {
    return uniqueById(options.selectedItems);
  }

  const users = Array.isArray(options.users) ? options.users.map(toSelectedUser) : [];
  const orgs = Array.isArray(options.orgs) ? options.orgs.map(toSelectedOrg) : [];
  const roles = Array.isArray(options.roles) ? options.roles.map(toSelectedRole) : [];
  const positions = Array.isArray(options.positions) ? options.positions.map(toSelectedPosition) : [];

  return uniqueById([...users, ...orgs, ...roles, ...positions]);
}

function normalizeModel(
  options: OpenPersonnelSelectionOptions,
  selectedItems: PersonnelSelectedItem[]
): Required<PersonnelSelectionModel> {
  const model: Required<PersonnelSelectionModel> = {
    userIds: Array.from(new Set(options.model?.userIds || [])),
    orgIds: Array.from(new Set(options.model?.orgIds || [])),
    roleIds: Array.from(new Set(options.model?.roleIds || [])),
    positionIds: Array.from(new Set(options.model?.positionIds || [])),
  };

  if (model.userIds.length || model.orgIds.length || model.roleIds.length || model.positionIds.length) {
    return model;
  }

  selectedItems.forEach((item) => {
    if (item.nodeType === "user") {
      model.userIds.push(item.id);
      return;
    }
    if (item.nodeType === "org") {
      model.orgIds.push(item.id);
      return;
    }
    if (item.nodeType === "role") {
      model.roleIds.push(item.id);
      return;
    }
    if (item.nodeType === "position") {
      model.positionIds.push(item.id);
    }
  });

  return model;
}

export function registerPersonnelSelectionAppContext(context: AppContext | null): void {
  personnelSelectionAppContext = context;
}

export async function openPersonnelSelection(
  options: OpenPersonnelSelectionOptions
): Promise<OpenPersonnelSelectionResult> {
  return new Promise((resolve, reject) => {
    if (typeof document === "undefined") {
      reject(new Error("当前环境不支持打开选人弹窗"));
      return;
    }

    const mode = options.mode || "person";
    const selectionField = options.selectionField || getSelectionFieldByMode(mode);
    const selectedItems = normalizeSelectedItems(options);
    const model = normalizeModel(options, selectedItems);

    const host = document.createElement("div");
    document.body.appendChild(host);

    let settled = false;

    function cleanup() {
      render(null, host);
      if (host.parentNode) {
        host.parentNode.removeChild(host);
      }
    }

    function settleResolve(payload: OpenPersonnelSelectionResult) {
      if (settled) {
        return;
      }
      settled = true;
      resolve(payload);
    }

    function settleReject() {
      if (settled) {
        return;
      }
      settled = true;
      reject("cancel");
    }

    const vnode = createVNode(PersonnelSelectionDialogHost, {
      visible: true,
      title: options.title || getDefaultTitle(mode),
      width: options.width || 1120,
      mode,
      selectionField,
      allowSelectOrg: Boolean(options.allowSelectOrg),
      required: options.required !== false,
      disabled: Boolean(options.disabled),
      confirmText: options.confirmText || "确定",
      cancelText: options.cancelText || "取消",
      closeOnClickModal: Boolean(options.closeOnClickModal),
      initialModel: model,
      initialSelectedItems: selectedItems,
      fetchNodes: options.fetchNodes,
      searchNodes: options.searchNodes,
      onConfirm: (payload: OpenPersonnelSelectionResult) => {
        settleResolve(payload);
      },
      onCancel: () => {
        settleReject();
      },
      onClosed: () => {
        cleanup();
      },
    });

    if (personnelSelectionAppContext) {
      vnode.appContext = personnelSelectionAppContext;
    }

    render(vnode, host);
  });
}
