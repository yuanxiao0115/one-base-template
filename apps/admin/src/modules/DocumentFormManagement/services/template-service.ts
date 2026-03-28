import type { DocumentTemplateSchema } from '@one-base-template/document-form-engine';

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

let recordSeed = 0;
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
  function ensureDraft(seedTemplate: DocumentTemplateSchema) {
    if (!store.draft) {
      store.draft = createDraftRecord(seedTemplate);
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
  recordSeed = 0;
  store.draft = null;
  store.published = null;
  store.history = [];
}
