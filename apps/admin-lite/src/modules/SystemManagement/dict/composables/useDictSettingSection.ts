import { computed, ref } from 'vue';
import type { DictRecord } from '../types';
import type { DictItemSearchFormState } from './dict-page-shared';

interface DictItemTableLike {
  onSearch: (resetPage?: boolean) => Promise<void>;
}

interface DictItemEditorLike {
  close: () => void;
}

interface UseDictSettingSectionOptions {
  itemSearchForm: DictItemSearchFormState;
  itemTable: DictItemTableLike;
  itemEditor: DictItemEditorLike;
}

export function useDictSettingSection(options: UseDictSettingSectionOptions) {
  const { itemSearchForm, itemTable, itemEditor } = options;

  const settingVisible = ref(false);
  const currentDict = ref<DictRecord | null>(null);

  const settingTitle = computed(() => {
    const dictName = currentDict.value?.dictName || '字典配置';
    return `字典配置 - ${dictName}`;
  });

  const currentDictInfo = computed(() => ({
    dictCode: currentDict.value?.dictCode || '--',
    dictName: currentDict.value?.dictName || '--'
  }));

  async function openSetting(row: DictRecord) {
    currentDict.value = row;
    itemSearchForm.dictId = row.id;
    itemSearchForm.itemName = '';
    itemSearchForm.itemValue = '';
    settingVisible.value = true;
    await itemTable.onSearch(true);
  }

  function closeSetting() {
    settingVisible.value = false;
    currentDict.value = null;
    itemSearchForm.dictId = '';
    itemSearchForm.itemName = '';
    itemSearchForm.itemValue = '';
    itemEditor.close();
  }

  return {
    setting: {
      settingVisible,
      settingTitle,
      currentDictInfo
    },
    actions: {
      openSetting,
      closeSetting
    }
  };
}
