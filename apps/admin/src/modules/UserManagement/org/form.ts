import type { FormRules } from 'element-plus'
import type { OrgRecord, OrgSavePayload } from './api'

export type OrgForm = {
  id?: string
  parentId: string
  orgName: string
  briefName: string
  sort: number
  orgCategory: string
  orgLevel: number | null
  orgLevelName: string
  orgLevelId: string
  institutionalType: string
  uscc: string
  orgType: number
  isExternal: boolean
  remark: string
}

export type OrgTreeOption = {
  value: string
  label: string
  disabled?: boolean
  children?: OrgTreeOption[]
}

export const defaultOrgForm: OrgForm = {
  parentId: '',
  orgName: '',
  briefName: '',
  sort: 10,
  orgCategory: '',
  orgLevel: null,
  orgLevelName: '',
  orgLevelId: '',
  institutionalType: '',
  uscc: '',
  orgType: 0,
  isExternal: false,
  remark: ''
}

export const orgFormRules: FormRules<OrgForm> = {
  parentId: [{ required: true, message: '请选择上级组织', trigger: 'change' }],
  orgName: [
    { required: true, message: '请输入组织全称', trigger: 'blur' },
    { max: 30, message: '组织全称最长30字', trigger: 'blur' }
  ],
  briefName: [
    { required: true, message: '请输入组织简称', trigger: 'blur' },
    { max: 30, message: '组织简称最长30字', trigger: 'blur' }
  ],
  uscc: [
    { required: true, message: '请输入统一社会信用代码', trigger: 'blur' },
    { max: 30, message: '统一社会信用代码最长30字', trigger: 'blur' }
  ],
  orgType: [{ required: true, message: '请选择创建类型', trigger: 'change' }],
  orgCategory: [{ required: true, message: '请选择组织类型', trigger: 'change' }],
  orgLevel: [{ required: true, message: '请选择等级', trigger: 'change' }],
  sort: [
    { required: true, message: '请输入自然数显示排序', trigger: 'blur', type: 'number' },
    {
      validator: (_, value, callback) => {
        if (!Number.isFinite(value) || Number(value) < 0 || !Number.isInteger(Number(value))) {
          callback(new Error('格式错误，请输入自然数'))
          return
        }
        callback()
      },
      trigger: 'blur'
    }
  ]
}

function toSafeNumber(value: unknown, fallback = 0): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value)
    if (Number.isFinite(parsed)) return parsed
  }
  return fallback
}

function trimText(value: string | undefined): string {
  return (value || '').trim()
}

export function toOrgForm(detail: OrgRecord): OrgForm {
  return {
    id: detail.id,
    parentId: detail.parentId || '',
    orgName: detail.orgName || '',
    briefName: detail.briefName || '',
    sort: toSafeNumber(detail.sort, 0),
    orgCategory: detail.orgCategory || '',
    orgLevel: detail.orgLevel == null ? null : toSafeNumber(detail.orgLevel, 0),
    orgLevelName: detail.orgLevelName || '',
    orgLevelId: detail.orgLevelId || '',
    institutionalType: detail.institutionalType || '',
    uscc: detail.uscc || '',
    orgType: toSafeNumber(detail.orgType, 0),
    isExternal: Boolean(detail.isExternal),
    remark: detail.remark || ''
  }
}

export function toOrgPayload(form: OrgForm, rootParentId: string): OrgSavePayload {
  const parentId = trimText(form.parentId) || rootParentId || '0'

  return {
    id: form.id,
    parentId,
    orgName: trimText(form.orgName),
    briefName: trimText(form.briefName),
    sort: toSafeNumber(form.sort, 0),
    orgCategory: trimText(form.orgCategory),
    orgLevelName: trimText(form.orgLevelName),
    orgLevel: form.orgLevel == null ? null : toSafeNumber(form.orgLevel, 0),
    orgLevelId: trimText(form.orgLevelId),
    institutionalType: trimText(form.institutionalType),
    uscc: trimText(form.uscc),
    orgType: toSafeNumber(form.orgType, 0),
    isExternal: Boolean(form.isExternal),
    remark: trimText(form.remark)
  }
}
