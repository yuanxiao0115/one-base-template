export interface TenantUniqueSnapshot {
  tenantName: string;
  contactPhone: string;
}

export function toTenantUniqueSnapshot(input: {
  tenantName?: string;
  contactPhone?: string;
}): TenantUniqueSnapshot {
  return {
    tenantName: input.tenantName?.trim() ?? '',
    contactPhone: input.contactPhone?.trim() ?? ''
  };
}

export function shouldCheckTenantUnique(
  current: TenantUniqueSnapshot,
  baseline?: TenantUniqueSnapshot | null
): boolean {
  if (!baseline) {
    return true;
  }

  return (
    current.tenantName !== baseline.tenantName || current.contactPhone !== baseline.contactPhone
  );
}
