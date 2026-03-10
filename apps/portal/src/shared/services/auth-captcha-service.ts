import { getObHttpClient } from "@one-base-template/core";

interface BizResponse<T> {
  code?: unknown;
  data?: T;
  message?: string;
}

interface CaptchaBlockPuzzleData {
  originBase64?: string;
  jigsawBase64?: string;
  captchaKey?: string;
  [k: string]: unknown;
}

export async function loadCaptcha(params: { captchaKey: string }) {
  const http = getObHttpClient();
  return http.get<BizResponse<CaptchaBlockPuzzleData>>("/cmict/auth/captcha/block-puzzle", {
    params,
    $noErrorAlert: true,
  });
}

export async function checkCaptcha(params: { captcha: string; captchaKey: string }) {
  const http = getObHttpClient();
  return http.get<BizResponse<unknown>>("/cmict/auth/captcha/check", {
    params,
    $noErrorAlert: true,
  });
}
