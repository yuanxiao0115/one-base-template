import type { CrudContainerType } from '@one-base-template/ui';
import type { UseTableDefaults } from '@one-base-template/core';
import { appTableResponseAdapter } from '@/utils/table-response-adapter';

/**
 * admin UI 侧公共配置。
 *
 * 维护建议：
 * - 仅保留“开发者可直接维护”的配置项；
 * - 解析逻辑请放在 `utils/*`，避免在 config 目录混入行为代码。
 */

/**
 * CRUD 容器默认形态：
 * - 未传 container 时生效
 * - 组件 props.container 始终优先于该默认值
 */
export const appCrudContainerDefaultType: CrudContainerType = 'drawer';

/**
 * useTable 全局默认配置：
 * - 当前页字段统一为 currentPage
 * - 每页条数字段统一为 pageSize
 * - 兼容 current/page 与 size 作为别名
 */
export const appTableDefaults: UseTableDefaults = {
  paginationKey: {
    current: 'currentPage',
    size: 'pageSize'
  },
  paginationAlias: {
    current: ['current', 'page'],
    size: ['size']
  },
  responseAdapter: appTableResponseAdapter
};

export interface MaterialImageCacheConfig {
  enabled: boolean;
  enableInDev: boolean;
  maxEntries: number;
  ttlMs: number;
}

/**
 * 素材图片 Service Worker 缓存配置。
 *
 * 说明：
 * - 仅针对 `/cmict/file/resource/show?id=...` 图片请求生效；
 * - 默认仅生产环境开启，开发环境保持关闭；
 * - maxEntries 与 ttlMs 控制缓存上限与过期清理。
 */
export const appMaterialImageCacheConfig: MaterialImageCacheConfig = {
  enabled: true,
  enableInDev: false,
  maxEntries: 240,
  ttlMs: 7 * 24 * 60 * 60 * 1000
};
