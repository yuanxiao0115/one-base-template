import type { ObHttpRequestConfig } from './types';

export interface ClientSignatureParams {
  clientId?: string;
  timestamp?: number;
  salt?: string;
}

export type CreateClientSignature = (params?: ClientSignatureParams) => string;

export type CreateClientSignatureLoader =
  | (() => CreateClientSignature)
  | (() => Promise<CreateClientSignature>);

export interface CreateBasicClientSignatureBeforeRequestOptions {
  basicHeaders?: Record<string, string>;
  clientSignatureSalt?: string;
  clientSignatureClientId?: string;
  loadCreateClientSignature: CreateClientSignatureLoader;
}

function normalizeHeaders(input: ObHttpRequestConfig['headers']): Record<string, unknown> {
  if (!input || typeof input !== 'object') {
    return {};
  }
  return input as Record<string, unknown>;
}

export function createBasicClientSignatureBeforeRequest(
  options: CreateBasicClientSignatureBeforeRequestOptions
): (config: ObHttpRequestConfig) => Promise<void> {
  let cachedLoaderPromise: Promise<CreateClientSignature> | null = null;

  const resolveCreateClientSignature = async () => {
    if (!cachedLoaderPromise) {
      cachedLoaderPromise = Promise.resolve(options.loadCreateClientSignature());
    }
    return cachedLoaderPromise;
  };

  return async (config) => {
    const createClientSignature = await resolveCreateClientSignature();
    const signature = createClientSignature({
      salt: options.clientSignatureSalt,
      clientId: options.clientSignatureClientId
    });

    const prevHeaders = normalizeHeaders(config.headers);
    config.headers = {
      ...prevHeaders,
      ...options.basicHeaders,
      'Client-Signature': signature
    };
  };
}
