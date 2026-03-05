import { ref } from 'vue';
import {
  type DictItem,
  orgApi,
  type OrgLevelItem
} from '../api';

export function useOrgDictionaryOptions () {
  const orgCategoryOptions = ref<DictItem[]>([]);
  const institutionalTypeOptions = ref<DictItem[]>([]);
  const orgLevelOptions = ref<OrgLevelItem[]>([]);

  async function loadDictOptions () {
    const [orgCategoryRes, institutionalTypeRes] = await Promise.all([
      orgApi.dictDataList({ dictCode: 'org_category' }),
      orgApi.dictDataList({ dictCode: 'institutional_type' })
    ]);

    if (orgCategoryRes.code !== 200) {
      throw new Error(orgCategoryRes.message || '加载组织类型失败');
    }

    if (institutionalTypeRes.code !== 200) {
      throw new Error(institutionalTypeRes.message || '加载机构类别失败');
    }

    orgCategoryOptions.value = Array.isArray(orgCategoryRes.data) ? orgCategoryRes.data : [];
    institutionalTypeOptions.value = Array.isArray(institutionalTypeRes.data)
      ? institutionalTypeRes.data
      : [];
  }

  async function loadOrgLevelOptions () {
    const response = await orgApi.getOrgLevelList();
    if (response.code !== 200) {
      throw new Error(response.message || '加载等级列表失败');
    }

    orgLevelOptions.value = Array.isArray(response.data) ? response.data : [];
  }

  return {
    orgCategoryOptions,
    institutionalTypeOptions,
    orgLevelOptions,
    loadDictOptions,
    loadOrgLevelOptions
  };
}
