import type { UseTableDefaults } from '@one-base-template/core';
import type { CrudContainerType } from '@one-base-template/ui';
import { appTableResponseAdapter } from '@/utils/table-response-adapter';

/**
 * template UI 侧公共配置。
 */
export const appCrudContainerDefaultType: CrudContainerType = 'drawer';

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
