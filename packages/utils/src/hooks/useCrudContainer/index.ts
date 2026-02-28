import { computed, nextTick, ref, unref, type Ref } from 'vue'
import {
  DEFAULT_CONTAINER_TYPE,
  DEFAULT_MODE,
  DEFAULT_RESET_ON_CLOSE,
  DEFAULT_RESET_ON_CREATE_OPEN,
  buildDefaultCrudTitle
} from './constants'
import type {
  CrudContainerType,
  CrudErrorContext,
  CrudFormLike,
  CrudMode,
  CrudOpenCreateOptions,
  CrudOpenRowOptions,
  UseCrudContainerOptions,
  UseCrudContainerReturn
} from './types'

function isObjectRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function mergeFormState<TForm>(base: TForm, patch?: Partial<TForm>): TForm {
  if (!patch) return base
  if (!isObjectRecord(base) || !isObjectRecord(patch)) return base
  return {
    ...base,
    ...patch
  } as TForm
}

async function runValidate(formRef?: CrudFormLike): Promise<boolean> {
  if (!formRef?.validate) return true

  try {
    if (formRef.validate.length > 0) {
      const valid = await new Promise<boolean>((resolve) => {
        formRef.validate?.((result) => {
          resolve(Boolean(result))
        })
      })
      return valid
    }

    const validateResult = await formRef.validate()
    return typeof validateResult === 'boolean' ? validateResult : true
  }
  catch {
    return false
  }
}

/**
 * 通用 CRUD 容器 Hook。
 * 目标：业务页面只维护表单与接口，容器状态/模式切换/提交流程统一收敛。
 */
export function useCrudContainer<
  TForm extends Record<string, unknown>,
  TRow = Record<string, unknown>,
  TDetail = TRow,
  TPayload = TForm,
  TResult = unknown
>(
  options: UseCrudContainerOptions<TForm, TRow, TDetail, TPayload, TResult>
): UseCrudContainerReturn<TForm, TRow, TDetail, TResult> {
  const {
    entityName,
    createForm,
    beforeOpen,
    loadDetail,
    mapDetailToForm,
    beforeSubmit,
    submit,
    onSuccess,
    onError,
    buildTitle,
    resetOnCreateOpen = DEFAULT_RESET_ON_CREATE_OPEN,
    resetOnClose = DEFAULT_RESET_ON_CLOSE
  } = options

  const externalFormRef = options.formRef
  const innerFormRef: Ref<CrudFormLike | undefined> = ref(unref(externalFormRef))

  const visible: Ref<boolean> = ref(false)
  const mode: Ref<CrudMode> = ref(DEFAULT_MODE)
  const container: Ref<CrudContainerType> = ref(options.container ?? DEFAULT_CONTAINER_TYPE)
  const opening: Ref<boolean> = ref(false)
  const submitting: Ref<boolean> = ref(false)
  const currentRow: Ref<TRow | null> = ref(null)
  const detailData: Ref<TDetail | null> = ref(null)
  const form = ref(createForm() as TForm) as Ref<TForm>

  const readonly = computed(() => mode.value === 'detail')

  const title = computed(() => {
    const buildFn = buildTitle ?? ((ctx: { mode: CrudMode; entityName: string }) => buildDefaultCrudTitle(ctx.mode, ctx.entityName))
    return buildFn({ mode: mode.value, entityName })
  })

  function resolveFormRef(): CrudFormLike | undefined {
    return unref(externalFormRef) ?? innerFormRef.value
  }

  function setFormRef(nextFormRef?: CrudFormLike): void {
    innerFormRef.value = nextFormRef
  }

  function resetForm(): void {
    form.value = createForm() as TForm
    detailData.value = null

    // 仅清理校验态，避免 resetFields 覆盖我们通过 createForm 写入的新初始值。
    nextTick(() => {
      resolveFormRef()?.clearValidate?.()
    })
  }

  function close(): void {
    visible.value = false
    if (!resetOnClose) return

    resetForm()
    currentRow.value = null
  }

  function emitError(error: unknown, context: CrudErrorContext<TRow>): void {
    onError?.(error, context)
  }

  async function runBeforeOpen(nextMode: CrudMode, row: TRow | null): Promise<void> {
    if (!beforeOpen) return

    try {
      await beforeOpen({
        mode: nextMode,
        row,
        form: form.value
      })
    }
    catch (error) {
      emitError(error, {
        mode: nextMode,
        stage: 'beforeOpen',
        row
      })
    }
  }

  function patchFormState(patchForm?: Partial<TForm>): void {
    if (!patchForm) return
    form.value = mergeFormState(form.value, patchForm)
  }

  async function assignDetailToForm(nextMode: Exclude<CrudMode, 'create'>, row: TRow): Promise<void> {
    let detail: TDetail

    try {
      detail = loadDetail
        ? await loadDetail({ mode: nextMode, row })
        : (row as unknown as TDetail)
    }
    catch (error) {
      emitError(error, {
        mode: nextMode,
        stage: 'loadDetail',
        row
      })
      detail = row as unknown as TDetail
    }

    detailData.value = detail

    if (mapDetailToForm) {
      const mapped = mapDetailToForm({
        mode: nextMode,
        row,
        detail
      })
      form.value = mergeFormState(form.value, mapped)
      return
    }

    if (isObjectRecord(detail)) {
      form.value = mergeFormState(form.value, detail as Partial<TForm>)
    }
  }

  async function openByMode(
    nextMode: CrudMode,
    row: TRow | null,
    patchForm?: Partial<TForm>
  ): Promise<void> {
    mode.value = nextMode
    currentRow.value = row

    if (nextMode === 'create') {
      if (resetOnCreateOpen) {
        resetForm()
      }
      patchFormState(patchForm)
    }
    else {
      form.value = createForm() as TForm
      patchFormState(patchForm)
    }

    opening.value = true

    await runBeforeOpen(nextMode, row)

    if (nextMode !== 'create' && row) {
      await assignDetailToForm(nextMode, row)
    }

    visible.value = true

    await nextTick()
    resolveFormRef()?.clearValidate?.()

    opening.value = false
  }

  async function openCreate(openOptions: CrudOpenCreateOptions<TForm, TRow> = {}): Promise<void> {
    await openByMode('create', openOptions.row ?? null, openOptions.patchForm)
  }

  async function openEdit(row: TRow, openOptions: CrudOpenRowOptions<TForm> = {}): Promise<void> {
    await openByMode('edit', row, openOptions.patchForm)
  }

  async function openDetail(row: TRow, openOptions: CrudOpenRowOptions<TForm> = {}): Promise<void> {
    await openByMode('detail', row, openOptions.patchForm)
  }

  async function confirm(): Promise<TResult | void> {
    if (mode.value === 'detail') {
      close()
      return
    }

    const valid = await runValidate(resolveFormRef())
    if (!valid) return

    const submitMode = mode.value === 'create' ? 'create' : 'edit'
    const rowSnapshot = currentRow.value
    const formSnapshot = form.value

    submitting.value = true

    try {
      const payload = beforeSubmit
        ? await beforeSubmit({
          mode: submitMode,
          form: formSnapshot,
          row: rowSnapshot
        })
        : (formSnapshot as unknown as TPayload)

      const result = submit
        ? await submit({
          mode: submitMode,
          form: formSnapshot,
          payload,
          row: rowSnapshot
        })
        : (undefined as TResult)

      close()

      if (onSuccess) {
        await onSuccess({
          mode: submitMode,
          form: formSnapshot,
          payload,
          row: rowSnapshot,
          result
        })
      }

      return result
    }
    catch (error) {
      emitError(error, {
        mode: submitMode,
        stage: 'submit',
        row: rowSnapshot
      })
      throw error
    }
    finally {
      submitting.value = false
    }
  }

  return {
    visible,
    mode,
    container,
    title,
    readonly,
    opening,
    submitting,
    form,
    currentRow,
    detailData,
    openCreate,
    openEdit,
    openDetail,
    confirm,
    close,
    resetForm,
    setFormRef
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
} from './types'

export default useCrudContainer
