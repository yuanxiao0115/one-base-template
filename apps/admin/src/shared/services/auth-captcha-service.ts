import { obHttp } from '@one-base-template/core';
import type { ApiResponse } from '@/shared/api/types';

interface CaptchaBlockPuzzleData {
  originBase64?: string;
  jigsawBase64?: string;
  captchaKey?: string;
  [k: string]: unknown;
}

export async function loadCaptcha(params: { captchaKey: string }) {
  return obHttp().get<ApiResponse<CaptchaBlockPuzzleData>>('/cmict/auth/captcha/block-puzzle', {
    params,
    $noErrorAlert: true
  });
}

export async function fetchCaptchaCheck(params: { captcha: string; captchaKey: string }) {
  return obHttp().get<ApiResponse<unknown>>('/cmict/auth/captcha/check', {
    params,
    $noErrorAlert: true
  });
}
