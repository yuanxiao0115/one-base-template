import type { OrgContactNode } from '../types';

export interface BreadcrumbNode {
  id: string;
  title: string;
}

export interface SelectedUser {
  userId: string;
  nickName: string;
  phone: string;
  uniqueId: string;
}

export interface OrgManagerContactViewModel {
  searchKeyword: string;
  showBreadcrumb: boolean;
  breadcrumbs: BreadcrumbNode[];
  currentNodes: OrgContactNode[];
  selectedUsers: SelectedUser[];
}
