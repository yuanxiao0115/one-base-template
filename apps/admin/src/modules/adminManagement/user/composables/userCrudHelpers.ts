export interface UserTypeOption {
  value: number;
  label: string;
}

function resolveDownloadUrl(filename: string, baseUrl: string) {
  const normalizedBaseUrl = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
  return `${normalizedBaseUrl}${filename}`;
}

export function getUserTypeLabelMap(
  options: ReadonlyArray<UserTypeOption>
): Record<number, string> {
  return Object.fromEntries(options.map((item) => [item.value, item.label]));
}

export function getUserTypeLabel(value: number, labelMap: Record<number, string>): string {
  return labelMap[value] || '--';
}

export function downloadUserTemplate(filename = '组织用户导入模板.xlsx', baseUrl = '/') {
  const link = document.createElement('a');
  link.href = resolveDownloadUrl(filename, baseUrl);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
