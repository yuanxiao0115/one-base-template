import useTable from '../../../../packages/utils/src/hooks/useTable'
import type {
  CacheInvalidationStrategy,
  PaginationConfig,
  UseTableDefaults,
  UseTablePaginationAlias,
  UseTablePaginationKey,
  UseTableCacheInfo,
  UseTableConfig,
  UseTableOptions,
  UseTableReturn,
  UseTableStandardResponse
} from '../../../../packages/utils/src/hooks/useTable'
import { getUseTableDefaults, setUseTableDefaults } from '../../../../packages/utils/src/hooks/useTable'

export {
  useTable,
  getUseTableDefaults,
  setUseTableDefaults,
  type UseTableOptions,
  type UseTableConfig,
  type UseTableReturn,
  type PaginationConfig,
  type UseTablePaginationKey,
  type UseTablePaginationAlias,
  type UseTableDefaults,
  type UseTableStandardResponse,
  type UseTableCacheInfo,
  type CacheInvalidationStrategy
}

export default useTable
