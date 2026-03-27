import { ImportUpload } from '@one-base-template/ui';
import type { Component } from 'vue';

import PersonnelSelector from '@/components/PersonnelSelector/PersonnelSelector.vue';
import ObRichTextEditor from '@/components/rich-text/ObRichTextEditor.vue';

import {
  type DocumentFormEngineAdminContext,
  getDocumentFormEngineAdminContext,
  resetDocumentFormEngineAdminContextForTesting
} from './context';

const DOCUMENT_FORM_ADMIN_ADAPTERS_KEY = Symbol('document-form-admin-adapters');

export interface DocumentFormAdminAdapters {
  personnelSelector: Component;
  attachmentUpload: Component;
  richTextEditor: Component;
}

export interface DocumentFormEngineAdminRegisterOptions {
  adapters?: Partial<DocumentFormAdminAdapters>;
}

let initialized = false;

function createDefaultAdapters(): DocumentFormAdminAdapters {
  return {
    personnelSelector: PersonnelSelector,
    attachmentUpload: ImportUpload,
    richTextEditor: ObRichTextEditor
  };
}

function writeAdapters(
  context: DocumentFormEngineAdminContext,
  adapters: DocumentFormAdminAdapters
): DocumentFormAdminAdapters {
  context.values.set(DOCUMENT_FORM_ADMIN_ADAPTERS_KEY, adapters);
  return adapters;
}

export function getDocumentFormAdminAdapters(
  context: DocumentFormEngineAdminContext = getDocumentFormEngineAdminContext()
): DocumentFormAdminAdapters {
  const stored = context.values.get(DOCUMENT_FORM_ADMIN_ADAPTERS_KEY);
  if (stored) {
    return stored as DocumentFormAdminAdapters;
  }
  return writeAdapters(context, createDefaultAdapters());
}

export function setupDocumentFormEngineForAdmin(
  options: DocumentFormEngineAdminRegisterOptions = {}
): DocumentFormEngineAdminContext {
  const context = getDocumentFormEngineAdminContext();

  if (!initialized) {
    initialized = true;
  }

  const nextAdapters = {
    ...getDocumentFormAdminAdapters(context),
    ...options.adapters
  };

  writeAdapters(context, nextAdapters);

  return context;
}

export function resetDocumentFormEngineAdminSetupForTesting() {
  initialized = false;
  resetDocumentFormEngineAdminContextForTesting();
}
