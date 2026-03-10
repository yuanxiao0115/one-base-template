import { getHttpClient } from "@/shared/api/http-client";
import type { ApiResponse } from "@/shared/api/types";

interface CaptchaBlockPuzzleData {
  originBase64?: string;
  jigsawBase64?: string;
  captchaKey?: string;
  [k: string]: unknown;
}

export async function loadCaptcha(params: { captchaKey: string }) {
  const http = getHttpClient();
  return http.get<ApiResponse<CaptchaBlockPuzzleData>>("/cmict/auth/captcha/block-puzzle", {
    params,
    $noErrorAlert: true,
  });
}

export async function fetchCaptchaCheck(params: { captcha: string; captchaKey: string }) {
  const http = getHttpClient();
  return http.get<ApiResponse<unknown>>("/cmict/auth/captcha/check", {
    params,
    $noErrorAlert: true,
  });
}
