export interface ObApiWrapperResult<T> {
  code: number;
  data: T;
  message?: string;
  success?: boolean;
}

/**
 * API 错误处理包装器：
 *
 * - 保持与旧项目习惯一致：不会抛出异常，失败时返回标准结构
 * - 适合在“页面/业务层”快速兜底，避免到处 try/catch
 */
export async function apiWrapper<T>(
  apiCall: Promise<unknown>
): Promise<ObApiWrapperResult<T>> {
  try {
    const response = (await apiCall) as ObApiWrapperResult<T>;
    return response;
  } catch (error: unknown) {
    const message = error instanceof Error && error.message ? error.message : '未知错误';
    return {
      code: 500,
      data: null as unknown as T,
      message,
      success: false
    };
  }
}

