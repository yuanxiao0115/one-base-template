import { reactive, ref } from 'vue';
import { useDictCrudSection } from './useDictCrudSection';
import {
  type DictItemSearchFormState,
  type DictPageRefs,
  type DictSearchFormState
} from './dict-page-shared';
import { useDictItemSection } from './useDictItemSection';
import { useDictSettingSection } from './useDictSettingSection';

export function useDictPageState() {
  const refs: DictPageRefs = {
    tableRef: ref<unknown>(null),
    searchRef: ref(),
    editFormRef: ref(),
    itemTableRef: ref<unknown>(null),
    itemSearchRef: ref(),
    itemEditFormRef: ref()
  };

  const searchForm = reactive<DictSearchFormState>({
    dictCode: '',
    dictName: ''
  });

  const itemSearchForm = reactive<DictItemSearchFormState>({
    dictId: '',
    itemName: '',
    itemValue: ''
  });

  const dictSection = useDictCrudSection({
    tableRef: refs.tableRef,
    searchRef: refs.searchRef,
    editFormRef: refs.editFormRef,
    searchForm
  });

  const itemSection = useDictItemSection({
    itemTableRef: refs.itemTableRef,
    itemSearchRef: refs.itemSearchRef,
    itemEditFormRef: refs.itemEditFormRef,
    itemSearchForm
  });

  const settingSection = useDictSettingSection({
    itemSearchForm,
    itemTable: itemSection.itemTable,
    itemEditor: itemSection.itemEditor
  });

  return {
    refs,
    table: dictSection.table,
    editor: dictSection.editor,
    setting: {
      ...settingSection.setting,
      ...itemSection.setting
    },
    actions: {
      ...dictSection.actions,
      ...settingSection.actions,
      ...itemSection.actions
    }
  };
}
