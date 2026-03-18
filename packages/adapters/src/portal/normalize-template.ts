interface PortalTemplateLike {
  whiteDTOS?: unknown[];
  whiteList?: unknown;
}

interface ResponseWithData<TData> {
  data?: TData;
}

export function normalizePortalTemplateWhiteList<
  TData extends PortalTemplateLike,
  TResponse extends ResponseWithData<TData>
>(res: TResponse): TResponse {
  const { data } = res;
  if (!data || typeof data !== 'object') {
    return res;
  }

  const { whiteDTOS, whiteList } = data;
  if ((Array.isArray(whiteDTOS) && whiteDTOS.length > 0) || !whiteList) {
    return res;
  }

  return {
    ...res,
    data: {
      ...data,
      whiteDTOS: Array.isArray(whiteList) ? [...whiteList] : [whiteList]
    }
  } as TResponse;
}
