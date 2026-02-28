import type { FormRules } from 'element-plus'
import type { PositionRecord, PositionSavePayload } from './api'

export type PositionForm = {
  id?: string
  postName: string
  sort: number
  remark: string
}

export const defaultPositionForm: PositionForm = {
  postName: '',
  sort: 10,
  remark: ''
}

export const positionFormRules: FormRules<PositionForm> = {
  postName: [{ required: true, message: '请输入职位名称', trigger: 'blur' }],
  sort: [{ required: true, message: '请输入排序值', trigger: 'blur', type: 'number' }]
}

export function toPositionForm(detail: PositionRecord): PositionForm {
  return {
    id: detail.id,
    postName: detail.postName || '',
    sort: Number(detail.sort || 0),
    remark: detail.remark || ''
  }
}

export function toPositionPayload(form: PositionForm): PositionSavePayload {
  return {
    id: form.id,
    postName: form.postName.trim(),
    sort: Number(form.sort || 0),
    remark: form.remark.trim()
  }
}
