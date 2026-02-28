import { ref } from 'vue'
import { describe, expect, it, vi } from 'vitest'
import { useCrudContainer } from './index'

describe('useCrudContainer', () => {
  it('openCreate 会重置表单并应用 patch', async () => {
    const crud = useCrudContainer({
      entityName: '权限',
      createForm: () => ({
        name: '',
        parentId: '0'
      })
    })

    crud.form.value.name = '历史值'

    await crud.openCreate({ patchForm: { parentId: '1001' } })

    expect(crud.visible.value).toBe(true)
    expect(crud.mode.value).toBe('create')
    expect(crud.form.value).toEqual({
      name: '',
      parentId: '1001'
    })
    expect(crud.title.value).toBe('新增权限')
  })

  it('openEdit 会执行 beforeOpen/loadDetail/mapDetailToForm', async () => {
    const beforeOpen = vi.fn(async () => {})
    const loadDetail = vi.fn(async () => ({
      id: 'row-1',
      name: '详情名称',
      parentId: '2001'
    }))
    const mapDetailToForm = vi.fn(({ detail }: { detail: { name: string; parentId: string } }) => ({
      name: detail.name,
      parentId: detail.parentId
    }))

    const crud = useCrudContainer({
      entityName: '权限',
      createForm: () => ({
        name: '',
        parentId: '0'
      }),
      beforeOpen,
      loadDetail,
      mapDetailToForm
    })

    await crud.openEdit({ id: 'row-1', name: '列表名称' })

    expect(beforeOpen).toHaveBeenCalledTimes(1)
    expect(loadDetail).toHaveBeenCalledTimes(1)
    expect(mapDetailToForm).toHaveBeenCalledTimes(1)
    expect(crud.mode.value).toBe('edit')
    expect(crud.form.value).toEqual({
      name: '详情名称',
      parentId: '2001'
    })
  })

  it('confirm(create/edit) 会先校验再提交并触发成功回调', async () => {
    const validate = vi.fn(async () => true)
    const beforeSubmit = vi.fn(async ({ form }: { form: { name: string } }) => ({ payloadName: form.name }))
    const submit = vi.fn(async () => ({ id: 'saved-1' }))
    const onSuccess = vi.fn(async () => {})

    const crud = useCrudContainer({
      entityName: '权限',
      createForm: () => ({ name: '' }),
      beforeSubmit,
      submit,
      onSuccess
    })

    crud.setFormRef({ validate })

    await crud.openCreate()
    crud.form.value.name = '菜单权限'
    await crud.confirm()

    expect(validate).toHaveBeenCalledTimes(1)
    expect(beforeSubmit).toHaveBeenCalledTimes(1)
    expect(submit).toHaveBeenCalledTimes(1)
    expect(onSuccess).toHaveBeenCalledTimes(1)
    expect(crud.visible.value).toBe(false)
  })

  it('校验失败时不会提交', async () => {
    const validate = vi.fn(async () => false)
    const submit = vi.fn(async () => ({ id: 'saved-1' }))

    const crud = useCrudContainer({
      entityName: '权限',
      createForm: () => ({ name: '' }),
      submit
    })

    crud.setFormRef({ validate })

    await crud.openCreate()
    await crud.confirm()

    expect(validate).toHaveBeenCalledTimes(1)
    expect(submit).not.toHaveBeenCalled()
    expect(crud.visible.value).toBe(true)
  })

  it('confirm(detail) 仅关闭容器不提交', async () => {
    const submit = vi.fn(async () => ({ id: 'saved-1' }))

    const crud = useCrudContainer({
      entityName: '权限',
      createForm: () => ({ name: '' }),
      submit
    })

    await crud.openDetail({ id: 'row-1', name: '详情项' })
    await crud.confirm()

    expect(submit).not.toHaveBeenCalled()
    expect(crud.visible.value).toBe(false)
  })

  it('beforeOpen 报错时会触发 onError 且仍可打开容器', async () => {
    const onError = vi.fn()

    const crud = useCrudContainer({
      entityName: '权限',
      createForm: () => ({ name: '' }),
      beforeOpen: async () => {
        throw new Error('字典加载失败')
      },
      onError
    })

    await crud.openCreate()

    expect(onError).toHaveBeenCalledTimes(1)
    expect(crud.visible.value).toBe(true)
  })

  it('支持通过外部 formRef 引用触发校验', async () => {
    const formRef = ref({
      validate: vi.fn(async () => true),
      clearValidate: vi.fn()
    })
    const submit = vi.fn(async () => ({ id: 'saved-2' }))

    const crud = useCrudContainer({
      entityName: '权限',
      createForm: () => ({ name: '' }),
      formRef,
      submit
    })

    await crud.openCreate()
    await crud.confirm()

    expect(formRef.value.validate).toHaveBeenCalledTimes(1)
    expect(submit).toHaveBeenCalledTimes(1)
  })

  it('resetOnClose=false 时关闭后保留表单值', async () => {
    const crud = useCrudContainer({
      entityName: '权限',
      createForm: () => ({ name: '' }),
      resetOnClose: false
    })

    await crud.openCreate()
    crud.form.value.name = '保留值'
    crud.close()

    expect(crud.form.value.name).toBe('保留值')
  })

  it('resetOnCreateOpen=false 时再次打开新增不重置', async () => {
    const crud = useCrudContainer({
      entityName: '权限',
      createForm: () => ({ name: '' }),
      resetOnCreateOpen: false,
      resetOnClose: false
    })

    await crud.openCreate()
    crud.form.value.name = '第一次录入'
    crud.close()
    await crud.openCreate()

    expect(crud.form.value.name).toBe('第一次录入')
  })
})
