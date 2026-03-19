import type { FormRules } from 'element-plus';
import type { ColumnRecord, ColumnSavePayload } from './types';

export interface ColumnTreeOption {
  value: string;
  label: string;
  disabled?: boolean;
  children?: ColumnTreeOption[];
}

export interface ColumnForm {
  id?: string;
  categoryName: string;
  parentCategoryId: string;
  isShow: number;
  sort: number;
}

export const defaultColumnForm: ColumnForm = {
  categoryName: '',
  parentCategoryId: '',
  isShow: 1,
  sort: 0
};

export const columnFormRules: FormRules<ColumnForm> = {
  categoryName: [
    {
      required: true,
      message: '请输入栏目名称',
      trigger: 'blur'
    },
    {
      max: 50,
      message: '栏目名称不超过 50 个字符',
      trigger: 'blur'
    }
  ],
  isShow: [
    {
      required: true,
      message: '请选择显示状态',
      trigger: 'change'
    }
  ],
  sort: [
    {
      required: true,
      message: '请输入排序值',
      trigger: 'blur',
      type: 'number'
    },
    {
      validator: (_, value, callback) => {
        if (!Number.isInteger(Number(value)) || Number(value) < 0) {
          callback(new Error('排序必须是大于等于 0 的整数'));
          return;
        }
        callback();
      },
      trigger: 'blur'
    }
  ]
};

export function toColumnForm(detail: ColumnRecord): ColumnForm {
  return {
    id: detail.id,
    categoryName: detail.categoryName || '',
    parentCategoryId: detail.parentCategoryId || '',
    isShow: Number(detail.isShow ?? 1),
    sort: Number(detail.sort ?? 0)
  };
}

export function toColumnPayload(form: ColumnForm): ColumnSavePayload {
  return {
    id: form.id,
    categoryName: form.categoryName.trim(),
    parentCategoryId: form.parentCategoryId ? form.parentCategoryId : null,
    isShow: Number(form.isShow ?? 1),
    sort: Number(form.sort ?? 0)
  };
}
