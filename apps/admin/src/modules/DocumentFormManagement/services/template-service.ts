import {
  normalizeDocumentTemplate,
  type DocumentTemplateSchema
} from '@one-base-template/document-form-engine';

export type DocumentTemplateStatus = 'draft' | 'published';

export interface DocumentTemplateRecord {
  id: string;
  version: number;
  status: DocumentTemplateStatus;
  note: string;
  template: DocumentTemplateSchema;
  createdAt: string;
  publishedAt?: string;
}

export interface DocumentTemplateSnapshot {
  draft: DocumentTemplateRecord | null;
  published: DocumentTemplateRecord | null;
  history: DocumentTemplateRecord[];
}

export interface DocumentTemplateService {
  ensureDraft(seedTemplate: DocumentTemplateSchema): DocumentTemplateRecord;
  updateDraft(template: DocumentTemplateSchema, note?: string): DocumentTemplateRecord;
  publishDraft(note?: string): DocumentTemplateRecord;
  rollbackToPublished(version?: number): DocumentTemplateRecord | null;
  getSnapshot(): DocumentTemplateSnapshot;
}

interface DocumentTemplateStore {
  draft: DocumentTemplateRecord | null;
  published: DocumentTemplateRecord | null;
  history: DocumentTemplateRecord[];
}

export const DOCUMENT_TEMPLATE_STORAGE_KEY = 'ob_document_form_template_store_v1';

let recordSeed = 0;
let hydrated = false;
const store: DocumentTemplateStore = {
  draft: null,
  published: null,
  history: []
};

function getNowIso() {
  return new Date().toISOString();
}

function createRecordId() {
  recordSeed += 1;
  return `document-template-${recordSeed}`;
}

function cloneTemplate(template: DocumentTemplateSchema): DocumentTemplateSchema {
  return JSON.parse(JSON.stringify(template)) as DocumentTemplateSchema;
}

function getStorage() {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function normalizeRecord(record: DocumentTemplateRecord): DocumentTemplateRecord {
  const template = normalizeDocumentTemplate(record.template);
  return {
    ...record,
    template
  };
}

function cloneRecord(record: DocumentTemplateRecord): DocumentTemplateRecord {
  return {
    ...record,
    template: cloneTemplate(record.template)
  };
}

function cloneSnapshot(): DocumentTemplateSnapshot {
  return {
    draft: store.draft ? cloneRecord(store.draft) : null,
    published: store.published ? cloneRecord(store.published) : null,
    history: store.history.map((item) => cloneRecord(item))
  };
}

function upsertHistory(record: DocumentTemplateRecord) {
  const nextRecord = cloneRecord(record);
  const nextHistory = store.history.filter((item) => item.id !== nextRecord.id);
  nextHistory.push(nextRecord);
  nextHistory.sort((a, b) => a.version - b.version);
  store.history = nextHistory;
}

function syncRecordSeed() {
  const records = [store.draft, store.published, ...store.history].filter(
    Boolean
  ) as DocumentTemplateRecord[];
  const maxSeed = records.reduce((seed, record) => {
    const matched = record.id.match(/document-template-(\d+)$/);
    if (!matched) {
      return seed;
    }

    return Math.max(seed, Number(matched[1]));
  }, 0);
  recordSeed = Math.max(recordSeed, maxSeed);
}

function persistStore() {
  const storage = getStorage();
  if (!storage) {
    return;
  }

  try {
    storage.setItem(DOCUMENT_TEMPLATE_STORAGE_KEY, JSON.stringify(cloneSnapshot()));
  } catch (error) {
    console.warn('[DocumentTemplateService] 持久化草稿失败', error);
  }
}

function hydrateStoreFromStorage() {
  if (hydrated) {
    return;
  }
  hydrated = true;

  const storage = getStorage();
  if (!storage) {
    return;
  }

  const raw = storage.getItem(DOCUMENT_TEMPLATE_STORAGE_KEY);
  if (!raw) {
    return;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<DocumentTemplateSnapshot>;
    store.draft =
      parsed.draft && parsed.draft.status === 'draft'
        ? normalizeRecord(parsed.draft as DocumentTemplateRecord)
        : null;
    store.published =
      parsed.published && parsed.published.status === 'published'
        ? normalizeRecord(parsed.published as DocumentTemplateRecord)
        : null;
    store.history = Array.isArray(parsed.history)
      ? parsed.history
          .filter((item) => item && (item.status === 'draft' || item.status === 'published'))
          .map((item) => normalizeRecord(item as DocumentTemplateRecord))
      : [];
    syncRecordSeed();
  } catch (error) {
    console.warn('[DocumentTemplateService] 读取持久化草稿失败，已回退内存态', error);
    storage.removeItem(DOCUMENT_TEMPLATE_STORAGE_KEY);
  }
}

function createDraftRecord(
  template: DocumentTemplateSchema,
  note = '草稿初始化'
): DocumentTemplateRecord {
  const now = getNowIso();
  const draftVersion = Math.max(store.published?.version ?? 0, store.draft?.version ?? 0);

  return {
    id: createRecordId(),
    version: draftVersion,
    status: 'draft',
    note,
    template: cloneTemplate(template),
    createdAt: now
  };
}

export function createDocumentTemplateService(): DocumentTemplateService {
  hydrateStoreFromStorage();

  function ensureDraft(seedTemplate: DocumentTemplateSchema) {
    if (!store.draft) {
      store.draft = createDraftRecord(seedTemplate);
      persistStore();
    }
    return cloneRecord(store.draft);
  }

  function updateDraft(template: DocumentTemplateSchema, note = '更新草稿') {
    if (!store.draft) {
      store.draft = createDraftRecord(template);
    }

    store.draft = {
      ...store.draft,
      note,
      template: cloneTemplate(template)
    };
    persistStore();

    return cloneRecord(store.draft);
  }

  function publishDraft(note = '发布模板') {
    if (!store.draft) {
      throw new Error('当前无可发布草稿');
    }

    const now = getNowIso();
    const nextVersion = (store.published?.version ?? 0) + 1;
    const publishedRecord: DocumentTemplateRecord = {
      id: createRecordId(),
      version: nextVersion,
      status: 'published',
      note,
      template: cloneTemplate(store.draft.template),
      createdAt: store.draft.createdAt,
      publishedAt: now
    };

    store.published = publishedRecord;
    store.draft = {
      ...store.draft,
      version: nextVersion,
      note: `草稿基于发布 v${nextVersion}`
    };
    upsertHistory(publishedRecord);
    persistStore();
    return cloneRecord(publishedRecord);
  }

  function rollbackToPublished(version?: number) {
    const source =
      typeof version === 'number'
        ? (store.history.find((item) => item.version === version && item.status === 'published') ??
          null)
        : store.published;

    if (!source) {
      return null;
    }

    const nextDraft = createDraftRecord(source.template, `回滚到发布 v${source.version}`);
    nextDraft.version = source.version;
    store.draft = nextDraft;
    persistStore();
    return cloneRecord(nextDraft);
  }

  function getSnapshot() {
    return cloneSnapshot();
  }

  return {
    ensureDraft,
    updateDraft,
    publishDraft,
    rollbackToPublished,
    getSnapshot
  };
}

export function resetDocumentTemplateServiceForTesting() {
  const storage = getStorage();
  recordSeed = 0;
  hydrated = false;
  store.draft = null;
  store.published = null;
  store.history = [];
  if (storage) {
    storage.removeItem(DOCUMENT_TEMPLATE_STORAGE_KEY);
  }
}
