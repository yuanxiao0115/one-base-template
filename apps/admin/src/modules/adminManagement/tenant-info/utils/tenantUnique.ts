export interface TenantUniqueSnapshot {
  tenantName: string;
  contactPhone: string;
}

function normalizeText(value: unknown): string {
  if (typeof value === 'string') {
    return value.trim();
  }

  if (typeof value === 'number' && Number.isFinite(value)) {
    return String(value);
  }

  return '';
}

export function toTenantUniqueSnapshot(input: {
  tenantName?: unknown;
  contactPhone?: unknown;
}): TenantUniqueSnapshot {
  return {
    tenantName: normalizeText(input.tenantName),
    contactPhone: normalizeText(input.contactPhone)
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
