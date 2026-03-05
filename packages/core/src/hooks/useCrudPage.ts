import type { Ref } from 'vue';
import { useEntityEditor, type UseEntityEditorOptions, type UseEntityEditorReturn } from './useEntityEditor';
import { useTable, type UseTableOptions, type UseTableReturn } from './useTable';

export type CrudPageRefreshAfterSave = 'current' | 'first' | 'none';

export type CrudPageRefreshAfterDelete = 'auto' | 'none';

export interface UseCrudPageBehavior {
  refreshAfterSave?: CrudPageRefreshAfterSave;
  refreshAfterDelete?: CrudPageRefreshAfterDelete;
}

export interface UseCrudPageOptions<TForm extends object, TRow, TDetail, TPayload, TResult> {
  table: UseTableOptions;
  editor: UseEntityEditorOptions<TForm, TRow, TDetail, TPayload, TResult>;
  tableRef?: Ref<unknown>;
  behavior?: UseCrudPageBehavior;
}

export interface UseCrudPageReturn<TForm extends object, TRow, TDetail, TResult> {
  table: UseTableReturn;
  editor: UseEntityEditorReturn<TForm, TRow, TDetail, TResult>;
  actions: {
    openCreate: UseEntityEditorReturn<TForm, TRow, TDetail, TResult>['openCreate'];
    openEdit: UseEntityEditorReturn<TForm, TRow, TDetail, TResult>['openEdit'];
    openDetail: UseEntityEditorReturn<TForm, TRow, TDetail, TResult>['openDetail'];
    confirm: UseEntityEditorReturn<TForm, TRow, TDetail, TResult>['confirm'];
    remove: (row: TRow) => Promise<void>;
  };
}

export function useCrudPage<
  TForm extends object,
  TRow = Record<string, unknown>,
  TDetail = TRow,
  TPayload = TForm,
  TResult = unknown,
>(
  options: UseCrudPageOptions<TForm, TRow, TDetail, TPayload, TResult>
): UseCrudPageReturn<TForm, TRow, TDetail, TResult> {
  const behavior = options.behavior || {};
  const refreshAfterSave = behavior.refreshAfterSave || 'current';
  const refreshAfterDelete = behavior.refreshAfterDelete;

  const tableOptions: UseTableOptions = {
    ...options.table,
    remove: {
      ...options.table.remove,
      ...(refreshAfterDelete ? { refreshAfterDelete } : {}),
    },
  };

  const table = useTable(tableOptions, options.tableRef);

  const editorSave = options.editor.save;
  const editorOptions = editorSave
    ? {
        ...options.editor,
        save: {
          ...editorSave,
          onSuccess: async (context: Parameters<NonNullable<typeof editorSave.onSuccess>>[0]) => {
            await editorSave.onSuccess?.(context);

            if (refreshAfterSave === 'none') {
              return;
            }
            if (refreshAfterSave === 'first') {
              await table.onSearch(true);
              return;
            }

            await table.onSearch(false);
          },
        },
      }
    : options.editor;

  const editor = useEntityEditor<TForm, TRow, TDetail, TPayload, TResult>(editorOptions);

  async function remove(row: TRow) {
    await table.deleteRow(row);
  }

  return {
    table,
    editor,
    actions: {
      openCreate: editor.openCreate,
      openEdit: editor.openEdit,
      openDetail: editor.openDetail,
      confirm: editor.confirm,
      remove,
    },
  };
}

export default useCrudPage;
