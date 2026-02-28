import type { Ref } from 'vue'

export type CrudMode = 'create' | 'edit' | 'detail'

export type CrudContainerType = 'dialog' | 'drawer'

export interface CrudFormLike {
  validate?: (callback?: (valid: boolean) => void) => unknown
  resetFields?: () => void
  clearValidate?: () => void
}

export interface CrudBeforeOpenContext<TForm, TRow> {
  mode: CrudMode
  row: TRow | null
  form: TForm
}

export interface CrudLoadDetailContext<TRow> {
  mode: Exclude<CrudMode, 'create'>
  row: TRow
}

export interface CrudMapDetailToFormContext<TDetail, TRow> {
  mode: Exclude<CrudMode, 'create'>
  row: TRow
  detail: TDetail
}

export interface CrudBeforeSubmitContext<TForm, TRow> {
  mode: Exclude<CrudMode, 'detail'>
  form: TForm
  row: TRow | null
}

export interface CrudSubmitContext<TForm, TRow, TPayload> {
  mode: Exclude<CrudMode, 'detail'>
  form: TForm
  payload: TPayload
  row: TRow | null
}

export interface CrudSuccessContext<TForm, TRow, TPayload, TResult> {
  mode: Exclude<CrudMode, 'detail'>
  form: TForm
  payload: TPayload
  row: TRow | null
  result: TResult
}

export interface CrudErrorContext<TRow> {
  mode: CrudMode
  stage: 'beforeOpen' | 'loadDetail' | 'submit'
  row: TRow | null
}

export interface CrudOpenCreateOptions<TForm, TRow> {
  row?: TRow | null
  patchForm?: Partial<TForm>
}

export interface CrudOpenRowOptions<TForm> {
  patchForm?: Partial<TForm>
}

export interface UseCrudContainerOptions<TForm, TRow, TDetail, TPayload, TResult> {
  entityName: string
  container?: CrudContainerType
  createForm: () => TForm
  formRef?: Ref<CrudFormLike | undefined>
  beforeOpen?: (context: CrudBeforeOpenContext<TForm, TRow>) => Promise<void> | void
  loadDetail?: (context: CrudLoadDetailContext<TRow>) => Promise<TDetail> | TDetail
  mapDetailToForm?: (context: CrudMapDetailToFormContext<TDetail, TRow>) => Partial<TForm>
  beforeSubmit?: (context: CrudBeforeSubmitContext<TForm, TRow>) => Promise<TPayload> | TPayload
  submit?: (context: CrudSubmitContext<TForm, TRow, TPayload>) => Promise<TResult>
  onSuccess?: (context: CrudSuccessContext<TForm, TRow, TPayload, TResult>) => Promise<void> | void
  onError?: (error: unknown, context: CrudErrorContext<TRow>) => void
  buildTitle?: (context: { mode: CrudMode; entityName: string }) => string
  resetOnCreateOpen?: boolean
  resetOnClose?: boolean
}

export interface UseCrudContainerReturn<TForm, TRow, TDetail, TResult> {
  visible: Ref<boolean>
  mode: Ref<CrudMode>
  container: Ref<CrudContainerType>
  title: Ref<string>
  readonly: Ref<boolean>
  opening: Ref<boolean>
  submitting: Ref<boolean>
  form: Ref<TForm>
  currentRow: Ref<TRow | null>
  detailData: Ref<TDetail | null>
  openCreate: (options?: CrudOpenCreateOptions<TForm, TRow>) => Promise<void>
  openEdit: (row: TRow, options?: CrudOpenRowOptions<TForm>) => Promise<void>
  openDetail: (row: TRow, options?: CrudOpenRowOptions<TForm>) => Promise<void>
  confirm: () => Promise<TResult | void>
  close: () => void
  resetForm: () => void
  setFormRef: (formRef?: CrudFormLike) => void
}
