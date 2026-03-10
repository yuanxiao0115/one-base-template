import type { ObHttp } from "@one-base-template/core";
import { getObHttpClient } from "@/infra/http";

export function getHttpClient(): ObHttp {
  return getObHttpClient();
}
