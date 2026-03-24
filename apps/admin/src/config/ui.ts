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
