interface BizBooleanResponse {
  code: number;
  data?: boolean | null;
  message?: string;
}

export interface UserUniqueSnapshot {
  userAccount: string;
  phone: string;
  mail: string;
}

export interface OrgUniqueSnapshot {
  orgName: string;
  parentId: string;
}

export interface PositionUniqueSnapshot {
  postName: string;
}

function normalizeText(value: unknown): string {
  if (typeof value === "string") {
    return value.trim();
  }
  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value);
  }
  return "";
}

export function assertUniqueCheck(response: BizBooleanResponse, fallbackMessage: string): boolean {
  if (response.code !== 200) {
    throw new Error(response.message || fallbackMessage);
  }

  return Boolean(response.data);
}

export function toUserUniqueSnapshot(input: {
  userAccount?: unknown;
  phone?: unknown;
  mail?: unknown;
}): UserUniqueSnapshot {
  return {
    userAccount: normalizeText(input.userAccount),
    phone: normalizeText(input.phone),
    mail: normalizeText(input.mail),
  };
}

export function shouldCheckUserUnique(current: UserUniqueSnapshot, baseline?: UserUniqueSnapshot | null): boolean {
  if (!baseline) {
    return true;
  }

  return (
    current.userAccount !== baseline.userAccount || current.phone !== baseline.phone || current.mail !== baseline.mail
  );
}

export function toOrgUniqueSnapshot(input: { orgName?: unknown; parentId?: unknown }): OrgUniqueSnapshot {
  return {
    orgName: normalizeText(input.orgName),
    parentId: normalizeText(input.parentId),
  };
}

export function shouldCheckOrgUnique(current: OrgUniqueSnapshot, baseline?: OrgUniqueSnapshot | null): boolean {
  if (!baseline) {
    return true;
  }

  return current.orgName !== baseline.orgName || current.parentId !== baseline.parentId;
}

export function toPositionUniqueSnapshot(input: { postName?: unknown }): PositionUniqueSnapshot {
  return {
    postName: normalizeText(input.postName),
  };
}

export function shouldCheckPositionUnique(
  current: PositionUniqueSnapshot,
  baseline?: PositionUniqueSnapshot | null
): boolean {
  if (!baseline) {
    return true;
  }
  return current.postName !== baseline.postName;
}
