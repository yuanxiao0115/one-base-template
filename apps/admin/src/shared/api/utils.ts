import { getAppHttpClient } from './http-client';

export function getHttpClient() {
  return getAppHttpClient();
}

export function trimText(value: string | undefined): string {
  return (value || '').trim();
}
