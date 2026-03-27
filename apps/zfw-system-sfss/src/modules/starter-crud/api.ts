export type StarterCrudStatus = 0 | 1;

export interface StarterCrudRecord {
  id: string;
  code: string;
  name: string;
  owner: string;
  status: StarterCrudStatus;
  remark: string;
  updateTime: string;
}

export interface StarterCrudPageParams {
  keyword?: string;
  owner?: string;
  status?: StarterCrudStatus | '';
  currentPage?: number;
  pageSize?: number;
}

export interface StarterCrudPageData {
  records: StarterCrudRecord[];
  total: number;
  currentPage: number;
  pageSize: number;
}

export interface StarterCrudSavePayload {
  id?: string;
  code: string;
  name: string;
  owner: string;
  status: StarterCrudStatus;
  remark: string;
}

const seedRecords: StarterCrudRecord[] = [
  {
    id: 'starter-1',
    code: 'starter-alpha',
    name: 'Starter Alpha',
    owner: '平台组',
    status: 1,
    remark: '用于演示默认 CRUD 流程。',
    updateTime: '2026-03-27 09:00:00'
  },
  {
    id: 'starter-2',
    code: 'starter-beta',
    name: 'Starter Beta',
    owner: '业务组',
    status: 0,
    remark: '可直接替换成真实业务字段。',
    updateTime: '2026-03-27 09:30:00'
  },
  {
    id: 'starter-3',
    code: 'starter-gamma',
    name: 'Starter Gamma',
    owner: '运营组',
    status: 1,
    remark: '保留本地内存闭环，方便首次迁移验证。',
    updateTime: '2026-03-27 10:00:00'
  }
];

let mockRecords = seedRecords.map((item) => ({ ...item }));

function formatNow() {
  const now = new Date();
  const pad = (value: number) => String(value).padStart(2, '0');
  const datePart = [now.getFullYear(), pad(now.getMonth() + 1), pad(now.getDate())].join('-');
  const timePart = [pad(now.getHours()), pad(now.getMinutes()), pad(now.getSeconds())].join(':');
  return datePart + ' ' + timePart;
}

function normalizeText(value: string | number | null | undefined) {
  return String(value || '').trim();
}

function cloneRecord(record: StarterCrudRecord): StarterCrudRecord {
  return { ...record };
}

function normalizePageParams(params: StarterCrudPageParams = {}) {
  return {
    keyword: normalizeText(params.keyword).toLowerCase(),
    owner: normalizeText(params.owner).toLowerCase(),
    status:
      params.status === '' || params.status == null
        ? ''
        : ((Number(params.status) === 0 ? 0 : 1) as StarterCrudStatus),
    currentPage: Number(params.currentPage || 1),
    pageSize: Number(params.pageSize || 10)
  };
}

export async function pageStarterCrud(
  params: StarterCrudPageParams = {}
): Promise<StarterCrudPageData> {
  const normalized = normalizePageParams(params);
  const filtered = mockRecords.filter((item) => {
    const matchesKeyword =
      !normalized.keyword ||
      item.code.toLowerCase().includes(normalized.keyword) ||
      item.name.toLowerCase().includes(normalized.keyword);
    const matchesOwner = !normalized.owner || item.owner.toLowerCase().includes(normalized.owner);
    const matchesStatus = normalized.status === '' || item.status === normalized.status;
    return matchesKeyword && matchesOwner && matchesStatus;
  });

  const startIndex = (normalized.currentPage - 1) * normalized.pageSize;
  const pageItems = filtered.slice(startIndex, startIndex + normalized.pageSize).map(cloneRecord);

  return {
    records: pageItems,
    total: filtered.length,
    currentPage: normalized.currentPage,
    pageSize: normalized.pageSize
  };
}

export async function getStarterCrudDetail(id: string): Promise<StarterCrudRecord> {
  const matched = mockRecords.find((item) => item.id === id);
  if (!matched) {
    throw new Error('未找到对应示例记录');
  }
  return cloneRecord(matched);
}

export async function saveStarterCrud(payload: StarterCrudSavePayload): Promise<StarterCrudRecord> {
  const normalizedStatus: StarterCrudStatus = Number(payload.status) === 0 ? 0 : 1;
  const normalizedPayload = {
    id: payload.id,
    code: normalizeText(payload.code),
    name: normalizeText(payload.name),
    owner: normalizeText(payload.owner),
    status: normalizedStatus,
    remark: normalizeText(payload.remark)
  };

  if (!normalizedPayload.code || !normalizedPayload.name || !normalizedPayload.owner) {
    throw new Error('编码、名称、负责人不能为空');
  }

  const duplicated = mockRecords.find(
    (item) => item.code === normalizedPayload.code && item.id !== normalizedPayload.id
  );
  if (duplicated) {
    throw new Error('示例编码已存在，请更换后再保存');
  }

  const baseRecord = {
    code: normalizedPayload.code,
    name: normalizedPayload.name,
    owner: normalizedPayload.owner,
    status: normalizedPayload.status,
    remark: normalizedPayload.remark
  };

  if (normalizedPayload.id) {
    const targetIndex = mockRecords.findIndex((item) => item.id === normalizedPayload.id);
    if (targetIndex < 0) {
      throw new Error('待更新记录不存在');
    }
    const currentRecord = mockRecords[targetIndex];
    if (!currentRecord) {
      throw new Error('待更新记录不存在');
    }

    const nextRecord: StarterCrudRecord = {
      ...currentRecord,
      ...baseRecord,
      updateTime: formatNow()
    };
    mockRecords.splice(targetIndex, 1, nextRecord);
    return cloneRecord(nextRecord);
  }

  const createdRecord: StarterCrudRecord = {
    ...baseRecord,
    id: 'starter-' + Date.now().toString(36),
    updateTime: formatNow()
  };
  mockRecords.unshift(createdRecord);
  return cloneRecord(createdRecord);
}

export async function removeStarterCrud(id: string): Promise<void> {
  const targetIndex = mockRecords.findIndex((item) => item.id === id);
  if (targetIndex < 0) {
    throw new Error('待删除记录不存在');
  }
  mockRecords.splice(targetIndex, 1);
}

export function resetStarterCrudMockData() {
  mockRecords = seedRecords.map((item) => ({ ...item }));
}
