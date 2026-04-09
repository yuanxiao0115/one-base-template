import type { OrgContactNode, OrgContactOrgNode, OrgContactUserNode } from '../types';
import type { SelectedUser } from './org-manager-dialog.types';

export function isOrgNode(node: OrgContactNode): node is OrgContactOrgNode {
  return node.nodeType === 'org';
}

export function isUserNode(node: OrgContactNode): node is OrgContactUserNode {
  return node.nodeType === 'user';
}

export function getUserDisplay(node: OrgContactUserNode): SelectedUser {
  return {
    userId: node.userId,
    nickName: node.nickName,
    phone: node.phone,
    uniqueId: node.id
  };
}

export function getErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

export function patchNodeChildren(
  nodes: OrgContactNode[],
  orgId: string,
  children: OrgContactNode[]
): OrgContactNode[] {
  return nodes.map((node) => {
    if (!isOrgNode(node)) {
      return node;
    }
    if (node.id === orgId) {
      return {
        ...node,
        children
      };
    }
    if (!Array.isArray(node.children) || node.children.length === 0) {
      return node;
    }
    return {
      ...node,
      children: patchNodeChildren(node.children, orgId, children)
    };
  });
}

export function syncCheckedNodes(
  nodes: OrgContactNode[],
  selectedUserIdSet: Set<string>
): OrgContactNode[] {
  return nodes.map((node) => {
    if (!isUserNode(node)) {
      return node;
    }
    return {
      ...node,
      checked: selectedUserIdSet.has(node.userId)
    } as OrgContactUserNode;
  });
}
