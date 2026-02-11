import { getObHttpClient } from '@/infra/http';

type BizResponse<T> = {
  code?: unknown;
  data?: T;
  message?: string;
};

type CaptchaBlockPuzzleData = {
  originBase64?: string;
  jigsawBase64?: string;
  captchaKey?: string;
  [k: string]: unknown;
};

/**
 * 获取滑块拼图验证码
 */
export async function reqGet(params: { captchaKey: string }) {
  const http = getObHttpClient();
  return await http.get<BizResponse<CaptchaBlockPuzzleData>>('/cmict/auth/captcha/block-puzzle', {
    params,
    $noErrorAlert: true
  });
}

/**
 * 校验验证码
 */
export async function reqCheck(params: { captcha: string; captchaKey: string }) {
  const http = getObHttpClient();
  return await http.get<BizResponse<unknown>>('/cmict/auth/captcha/check', {
    params,
    $noErrorAlert: true
  });
}

