import { ElMessage } from 'element-plus';
import { useEntityEditor as useEntityEditorCore } from '@one-base-template/core';
import type {
  CrudBeforeOpenContext,
  CrudBuildPayloadContext,
  CrudContainerType,
  CrudDetailOptions,
  CrudEntityOptions,
  CrudErrorContext,
  CrudFormOptions,
  CrudFormLike,
  CrudLoadDetailContext,
  CrudMapDetailToFormContext,
  CrudMode,
  CrudOpenCreateOptions,
  CrudOpenRowOptions,
  CrudSaveOptions,
  CrudSaveContext,
  CrudSaveSuccessContext,
  UseEntityEditorOptions,
  UseEntityEditorReturn
} from '@one-base-template/core';

function getDefaultErrorMessage(entityName: string, context: CrudErrorContext<unknown>): string {
  if (context.stage === 'beforeOpen') {
    return `打开${entityName}弹窗失败`;
  }
  if (context.stage === 'loadDetail') {
    return `加载${entityName}详情失败`;
  }
  return `保存${entityName}失败`;
}

export function useEntityEditor<
  TForm extends object,
  TRow = Record<string, unknown>,
  TDetail = TRow,
  TPayload = TForm,
  TResult = unknown
>(
  options: UseEntityEditorOptions<TForm, TRow, TDetail, TPayload, TResult>
): UseEntityEditorReturn<TForm, TRow, TDetail, TResult> {
  const customOnError = options.onError;
  const shouldRethrow = Boolean(customOnError);

  const crud = useEntityEditorCore<TForm, TRow, TDetail, TPayload, TResult>({
    ...options,
    onError: (error, context) => {
      if (customOnError) {
        customOnError(error, context);
        return;
      }

      const fallbackMessage = getDefaultErrorMessage(
        options.entity.name,
        context as CrudErrorContext<unknown>
      );
      const message = error instanceof Error ? error.message : fallbackMessage;
      ElMessage.error(message);
    }
  });

  const rawConfirm = crud.confirm;

  async function confirm() {
    try {
      return await rawConfirm();
    } catch (error) {
      if (shouldRethrow) {
        throw error;
      }
      return undefined;
    }
  }

  return {
    ...crud,
    confirm
  };
}

export type {
  CrudBeforeOpenContext,
  CrudContainerType,
  CrudDetailOptions,
  CrudEntityOptions,
  CrudErrorContext,
  CrudFormOptions,
  CrudFormLike,
  CrudLoadDetailContext,
  CrudMapDetailToFormContext,
  CrudMode,
  CrudOpenCreateOptions,
  CrudOpenRowOptions,
  CrudSaveOptions,
  CrudSaveContext,
  CrudSaveSuccessContext,
  CrudBuildPayloadContext,
  UseEntityEditorOptions,
  UseEntityEditorReturn
};
