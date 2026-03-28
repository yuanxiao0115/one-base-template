import { ImportUpload } from '@one-base-template/ui';
import type { Component } from 'vue';

import PersonnelSelector from '@/components/PersonnelSelector/PersonnelSelector.vue';
import ObRichTextEditor from '@/components/rich-text/ObRichTextEditor.vue';

import {
  type DocumentFormEngineAdminContext,
  getDocumentFormEngineAdminContext,
  resetDocumentFormEngineAdminContextForTesting
} from './context';
import {
  createDocumentTemplateService,
  type DocumentTemplateService
} from '../services/template-service';

const DOCUMENT_FORM_ADMIN_ADAPTERS_KEY = Symbol('document-form-admin-adapters');
const DOCUMENT_FORM_ADMIN_SERVICES_KEY = Symbol('document-form-admin-services');

export interface DocumentFormAdminAdapters {
  personnelSelector: Component;
  attachmentUpload: Component;
  richTextEditor: Component;
}

export interface DocumentFormEngineAdminRegisterOptions {
  adapters?: Partial<DocumentFormAdminAdapters>;
  services?: Partial<DocumentFormAdminServices>;
}

export interface DocumentFormAdminServices {
  templateService: DocumentTemplateService;
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

function createDefaultServices(): DocumentFormAdminServices {
  return {
    templateService: createDocumentTemplateService()
  };
}

function writeServices(
  context: DocumentFormEngineAdminContext,
  services: DocumentFormAdminServices
): DocumentFormAdminServices {
  context.values.set(DOCUMENT_FORM_ADMIN_SERVICES_KEY, services);
  return services;
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

export function getDocumentFormAdminServices(
  context: DocumentFormEngineAdminContext = getDocumentFormEngineAdminContext()
): DocumentFormAdminServices {
  const stored = context.values.get(DOCUMENT_FORM_ADMIN_SERVICES_KEY);
  if (stored) {
    return stored as DocumentFormAdminServices;
  }
  return writeServices(context, createDefaultServices());
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
  const nextServices = {
    ...getDocumentFormAdminServices(context),
    ...options.services
  };

  writeAdapters(context, nextAdapters);
  writeServices(context, nextServices);

  return context;
}

export function resetDocumentFormEngineAdminSetupForTesting() {
  initialized = false;
  resetDocumentFormEngineAdminContextForTesting();
}
