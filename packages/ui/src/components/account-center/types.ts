import type { AppUser } from '@one-base-template/core';

export interface AccountCenterResponse<T = unknown> {
  code?: number | string;
  data?: T;
  message?: string;
  [key: string]: unknown;
}

export type AccountCenterEncryptPassword = (plainText: string) => string;

export type AccountCenterResolveSuccess = (response: AccountCenterResponse) => boolean;

export type AccountCenterIsAvatarHidden = (userId: string | number | null | undefined) => boolean;

export type AccountCenterSetAvatarHidden = (
  userId: string | number | null | undefined,
  hidden: boolean
) => boolean;

export interface AccountCenterAvatarUrlResolverParams {
  userId: string;
  timestamp: number;
  version: number;
}

export type AccountCenterAvatarUrlResolver = (
  params: AccountCenterAvatarUrlResolverParams
) => string;

export interface AccountCenterUploadAvatarPayload {
  file: File;
  userId: string;
}

export type AccountCenterUploadAvatar = (
  payload: AccountCenterUploadAvatarPayload
) => Promise<AccountCenterResponse>;

export type AccountCenterCheckPassword = (payload: {
  oldPassword: string;
}) => Promise<AccountCenterResponse<boolean>>;

export type AccountCenterChangePassword = (payload: {
  oldPassword: string;
  newPassword: string;
}) => Promise<AccountCenterResponse<boolean>>;

export type AccountCenterUser = AppUser;
