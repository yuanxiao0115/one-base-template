import type { Ref } from 'vue';

export type CrudMode = 'create' | 'edit' | 'detail';

export type CrudContainerType = 'dialog' | 'drawer';

export interface CrudFormLike {
  validate?: (callback?: (valid: boolean) => void) => unknown;
  resetFields?: () => void;
  clearValidate?: () => void;
}

export interface CrudBeforeOpenContext<TForm, TRow> {
  mode: CrudMode;
  row: TRow | null;
  form: TForm;
}

export interface CrudLoadDetailContext<TRow> {
  mode: Exclude<CrudMode, 'create'>;
  row: TRow;
}

export interface CrudMapDetailToFormContext<TDetail, TRow> {
  mode: Exclude<CrudMode, 'create'>;
  row: TRow;
  detail: TDetail;
}

export interface CrudBuildPayloadContext<TForm, TRow> {
  mode: Exclude<CrudMode, 'detail'>;
  form: TForm;
  row: TRow | null;
}

export interface CrudSaveContext<TForm, TRow, TPayload> {
  mode: Exclude<CrudMode, 'detail'>;
  form: TForm;
  payload: TPayload;
  row: TRow | null;
}

export interface CrudSaveSuccessContext<TForm, TRow, TPayload, TResult> {
  mode: Exclude<CrudMode, 'detail'>;
  form: TForm;
  payload: TPayload;
  row: TRow | null;
  result: TResult;
}

export interface CrudErrorContext<TRow> {
  mode: CrudMode;
  stage: 'beforeOpen' | 'loadDetail' | 'save';
  row: TRow | null;
}

export interface CrudOpenCreateOptions<TForm, TRow> {
  row?: TRow | null;
  patchForm?: Partial<TForm>;
}

export interface CrudOpenRowOptions<TForm> {
  patchForm?: Partial<TForm>;
}

export interface CrudEntityOptions {
  name: string;
  container?: CrudContainerType;
  buildTitle?: (context: { mode: CrudMode; entityName: string }) => string;
}

export interface CrudFormOptions<TForm> {
  create: () => TForm;
  ref?: Ref<CrudFormLike | undefined>;
  resetOnCreateOpen?: boolean;
  resetOnClose?: boolean;
}

export interface CrudDetailOptions<TForm, TRow, TDetail> {
  beforeOpen?: (context: CrudBeforeOpenContext<TForm, TRow>) => Promise<void> | void;
  load?: (context: CrudLoadDetailContext<TRow>) => Promise<TDetail> | TDetail;
  mapToForm?: (context: CrudMapDetailToFormContext<TDetail, TRow>) => Partial<TForm>;
}

export interface CrudSaveOptions<TForm, TRow, TPayload, TResult> {
  buildPayload?: (context: CrudBuildPayloadContext<TForm, TRow>) => Promise<TPayload> | TPayload;
  request?: (context: CrudSaveContext<TForm, TRow, TPayload>) => Promise<TResult>;
  onSuccess?: (
    context: CrudSaveSuccessContext<TForm, TRow, TPayload, TResult>
  ) => Promise<void> | void;
}

export interface UseEntityEditorOptions<TForm, TRow, TDetail, TPayload, TResult> {
  entity: CrudEntityOptions;
  form: CrudFormOptions<TForm>;
  detail?: CrudDetailOptions<TForm, TRow, TDetail>;
  save?: CrudSaveOptions<TForm, TRow, TPayload, TResult>;
  onError?: (error: unknown, context: CrudErrorContext<TRow>) => void;
}

export interface UseEntityEditorReturn<TForm, TRow, TDetail, TResult> {
  visible: Ref<boolean>;
  mode: Ref<CrudMode>;
  container: Ref<CrudContainerType>;
  title: Ref<string>;
  readonly: Ref<boolean>;
  opening: Ref<boolean>;
  submitting: Ref<boolean>;
  form: Ref<TForm>;
  currentRow: Ref<TRow | null>;
  detailData: Ref<TDetail | null>;
  openCreate: (options?: CrudOpenCreateOptions<TForm, TRow>) => Promise<void>;
  openEdit: (row: TRow, options?: CrudOpenRowOptions<TForm>) => Promise<void>;
  openDetail: (row: TRow, options?: CrudOpenRowOptions<TForm>) => Promise<void>;
  confirm: () => Promise<TResult | undefined>;
  close: () => void;
  resetForm: () => void;
  setFormRef: (formRef?: CrudFormLike) => void;
}
