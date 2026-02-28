import { ElMessage } from 'element-plus'
import { useCrudContainer as useCrudContainerCore } from '../../../utils/src/hooks/useCrudContainer'
import type {
  CrudBeforeOpenContext,
  CrudContainerType,
  CrudErrorContext,
  CrudFormLike,
  CrudLoadDetailContext,
  CrudMapDetailToFormContext,
  CrudMode,
  CrudOpenCreateOptions,
  CrudOpenRowOptions,
  CrudSubmitContext,
  CrudSuccessContext,
  UseCrudContainerOptions,
  UseCrudContainerReturn
} from '../../../utils/src/hooks/useCrudContainer'

function getDefaultErrorMessage(entityName: string, context: CrudErrorContext<unknown>): string {
  if (context.stage === 'beforeOpen') return `打开${entityName}弹窗失败`
  if (context.stage === 'loadDetail') return `加载${entityName}详情失败`
  return `保存${entityName}失败`
}

export function useCrudContainer<
  TForm extends Record<string, unknown>,
  TRow = Record<string, unknown>,
  TDetail = TRow,
  TPayload = TForm,
  TResult = unknown
>(
  options: UseCrudContainerOptions<TForm, TRow, TDetail, TPayload, TResult>
): UseCrudContainerReturn<TForm, TRow, TDetail, TResult> {
  const customOnError = options.onError
  const shouldRethrow = Boolean(customOnError)

  const crud = useCrudContainerCore<TForm, TRow, TDetail, TPayload, TResult>({
    ...options,
    onError: (error, context) => {
      if (customOnError) {
        customOnError(error, context)
        return
      }

      const fallbackMessage = getDefaultErrorMessage(options.entityName, context as CrudErrorContext<unknown>)
      const message = error instanceof Error ? error.message : fallbackMessage
      ElMessage.error(message)
    }
  })

  const rawConfirm = crud.confirm

  async function confirm() {
    try {
      return await rawConfirm()
    }
    catch (error) {
      if (shouldRethrow) throw error
      return undefined
    }
  }

  return {
    ...crud,
    confirm
  }
}

export type {
  CrudBeforeOpenContext,
  CrudContainerType,
  CrudErrorContext,
  CrudFormLike,
  CrudLoadDetailContext,
  CrudMapDetailToFormContext,
  CrudMode,
  CrudOpenCreateOptions,
  CrudOpenRowOptions,
  CrudSubmitContext,
  CrudSuccessContext,
  UseCrudContainerOptions,
  UseCrudContainerReturn
}
