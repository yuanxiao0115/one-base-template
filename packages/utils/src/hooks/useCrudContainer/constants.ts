import type { CrudContainerType, CrudMode } from './types'

export const DEFAULT_CONTAINER_TYPE: CrudContainerType = 'drawer'

export const DEFAULT_MODE: CrudMode = 'create'

export const DEFAULT_RESET_ON_CREATE_OPEN = true

export const DEFAULT_RESET_ON_CLOSE = true

const MODE_TITLE_MAP: Record<CrudMode, string> = {
  create: '新增',
  edit: '编辑',
  detail: '查看'
}

export function buildDefaultCrudTitle(mode: CrudMode, entityName: string): string {
  return `${MODE_TITLE_MAP[mode]}${entityName}`
}
