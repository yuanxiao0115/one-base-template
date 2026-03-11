import { obHttp } from '@one-base-template/core'
import type { PortalFrontConfig } from '@one-base-template/core'

interface BizResponse<T> {
  code?: unknown
  success?: boolean
  message?: string
  data?: T
  encrypted?: boolean
}

interface LoginPageConfig {
  webLogoText?: string
  loginPageFodders?: string[]
  [k: string]: unknown
}

export async function getLoginPageConfig() {
  return obHttp().get<BizResponse<LoginPageConfig>>('/cmict/portal/getLoginPage', {
    $noErrorAlert: true
  })
}

export async function getPortalFrontConfig() {
  return obHttp().get<BizResponse<PortalFrontConfig>>('/cmict/admin/front-config/portal', {
    $noErrorAlert: true
  })
}
