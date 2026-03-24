<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { message } from '@one-base-template/ui';
import PersonnelSelectorSourcePanel from './PersonnelSelectorSourcePanel.vue';
import PersonnelSelectorSelectedPanel from './PersonnelSelectorSelectedPanel.vue';
import type {
  PersonnelBreadcrumbNode,
  PersonnelFetchNodes,
  PersonnelNode,
  PersonnelNodeType,
  PersonnelOrgNode,
  PersonnelSearchNodes,
  PersonnelSelectedItem,
  PersonnelSelectedUser,
  PersonnelSelectionField,
  PersonnelSelectionModel,
  PersonnelSelectMode,
  PersonnelUserNode
} from './types';

const props = withDefaults(
  defineProps<{
    disabled: boolean;
    mode?: PersonnelSelectMode;
    fetchNodes: PersonnelFetchNodes;
    searchNodes: PersonnelSearchNodes;
    allowSelectOrg?: boolean;
    selectionField?: PersonnelSelectionField;
    initialSelectedUsers?: PersonnelSelectedUser[];
  }>(),
  {
    mode: 'person',
    allowSelectOrg: false,
    selectionField: 'userIds'
  }
);

const model = defineModel<PersonnelSelectionModel>({ required: true });

const loading = ref(false);
const searchKeyword = ref('');
const isSearchMode = ref(false);

const breadcrumbs = ref<PersonnelBreadcrumbNode[]>([
  {
    id: '0',
    title: '组织'
  }
]);
const currentNodes = ref<PersonnelNode[]>([]);
const rootNodes = ref<PersonnelNode[]>([]);
const nodeChildrenCache = new Map<string, PersonnelNode[]>();
const nodeChildrenLoadingMap = new Map<string, Promise<PersonnelNode[]>>();
const searchCache = new Map<string, PersonnelNode[]>();
const searchLoadingMap = new Map<string, Promise<PersonnelNode[]>>();
let dataLoadToken = 0;
let searchToken = 0;

const selectedMap = ref<Record<string, PersonnelSelectedItem>>({});

const searchPlaceholder = computed(() => {
  if (props.mode === 'org') {
    return '搜索组织';
  }
  if (props.mode === 'role') {
    return '搜索角色';
  }
  if (props.mode === 'position') {
    return '搜索岗位';
  }
  return props.allowSelectOrg ? '搜索人员或组织' : '搜索人员';
});

const emptyText = computed(() => {
  if (props.mode === 'org') {
    return '未选择组织';
  }
  if (props.mode === 'role') {
    return '未选择角色';
  }
  if (props.mode === 'position') {
    return '未选择岗位';
  }
  return '未选择人员';
});

const selectedItems = computed<PersonnelSelectedItem[]>(() =>
  getSelectedIds()
    .map((id) => selectedMap.value[id])
    .filter((item): item is PersonnelSelectedItem => Boolean(item))
);

const selectedIdSet = computed(() => new Set(getSelectedIds()));

function isUserNode(node: PersonnelNode): node is PersonnelUserNode {
  return node.nodeType === 'user';
}

function isOrgNode(node: PersonnelNode): node is PersonnelOrgNode {
  return node.nodeType === 'org';
}

function getUserId(node: Pick<PersonnelUserNode, 'id' | 'userId'>): string {
  return node.userId || node.id;
}

function getSelectedIds(): string[] {
  const ids = model.value?.[props.selectionField];
  return Array.isArray(ids) ? ids.filter(Boolean) : [];
}

function writeSelectedIds(ids: string[]) {
  if (!model.value) {
    return;
  }
  model.value[props.selectionField] = Array.from(new Set(ids.filter(Boolean)));
}

function getErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

function toSelectedUser(node: PersonnelUserNode): PersonnelSelectedUser {
  const title = node.nickName || node.title || node.userAccount;
  const subTitle = node.phone || node.userAccount || '--';
  return {
    id: getUserId(node),
    nodeType: 'user',
    title,
    subTitle,
    nickName: title,
    userAccount: node.userAccount || '',
    phone: node.phone || ''
  };
}

function toSelectedOrg(node: PersonnelOrgNode): PersonnelSelectedItem {
  return {
    id: node.id,
    nodeType: 'org',
    title: node.orgName || node.title || '组织'
  };
}

function keepSelectedMap(ids: string[]) {
  const patch: Record<string, PersonnelSelectedItem> = {};
  ids.forEach((id) => {
    const row = selectedMap.value[id];
    if (row) {
      patch[id] = row;
    }
  });
  selectedMap.value = {
    ...selectedMap.value,
    ...patch
  };
}

function toggleSelectedItem(item: PersonnelSelectedItem, checked: boolean) {
  const currentIds = new Set(getSelectedIds());

  if (checked) {
    currentIds.add(item.id);
    selectedMap.value = {
      ...selectedMap.value,
      [item.id]: item
    };
  } else {
    currentIds.delete(item.id);
    const patch = { ...selectedMap.value };
    delete patch[item.id];
    selectedMap.value = patch;
  }

  writeSelectedIds(Array.from(currentIds));
}

async function loadNodeChildren(parentId = '0'): Promise<PersonnelNode[]> {
  const cachedRows = nodeChildrenCache.get(parentId);
  if (cachedRows) {
    return cachedRows;
  }

  const loadingPromise = nodeChildrenLoadingMap.get(parentId);
  if (loadingPromise) {
    return loadingPromise;
  }

  const request = props
    .fetchNodes({
      parentId,
      mode: props.mode
    })
    .then((rows) => {
      nodeChildrenCache.set(parentId, rows);
      if (parentId === '0') {
        rootNodes.value = rows;
      }
      return rows;
    })
    .finally(() => {
      nodeChildrenLoadingMap.delete(parentId);
    });

  nodeChildrenLoadingMap.set(parentId, request);
  return request;
}

async function loadRootNodes() {
  const currentToken = ++dataLoadToken;
  loading.value = true;
  isSearchMode.value = false;
  breadcrumbs.value = [
    {
      id: '0',
      title: '组织'
    }
  ];
  searchKeyword.value = '';

  try {
    const rows = await loadNodeChildren('0');
    if (currentToken !== dataLoadToken) {
      return;
    }
    currentNodes.value = rows;
  } finally {
    if (currentToken === dataLoadToken) {
      loading.value = false;
    }
  }
}

async function syncRootNodes() {
  try {
    await loadRootNodes();
  } catch (error) {
    message.error(getErrorMessage(error, '加载组织通讯录失败'));
  }
}

async function enterOrgNode(node: PersonnelOrgNode) {
  const currentToken = ++dataLoadToken;
  loading.value = true;
  try {
    const rows = await loadNodeChildren(node.id);
    if (currentToken !== dataLoadToken) {
      return;
    }
    currentNodes.value = rows;
    isSearchMode.value = false;

    const currentIndex = breadcrumbs.value.findIndex((item) => item.id === node.id);
    if (currentIndex >= 0) {
      breadcrumbs.value = breadcrumbs.value.slice(0, currentIndex + 1);
      return;
    }

    breadcrumbs.value.push({
      id: node.id,
      title: node.orgName || node.title || '组织'
    });
  } finally {
    if (currentToken === dataLoadToken) {
      loading.value = false;
    }
  }
}

async function gotoBreadcrumb(index: number) {
  const target = breadcrumbs.value[index];
  if (!target) {
    return;
  }

  const currentToken = ++dataLoadToken;
  loading.value = true;
  try {
    const rows = await loadNodeChildren(target.id);
    if (currentToken !== dataLoadToken) {
      return;
    }
    currentNodes.value = rows;
    isSearchMode.value = false;
    breadcrumbs.value = breadcrumbs.value.slice(0, index + 1);
  } finally {
    if (currentToken === dataLoadToken) {
      loading.value = false;
    }
  }
}

function onSearchClear() {
  searchKeyword.value = '';
  isSearchMode.value = false;
  breadcrumbs.value = [
    {
      id: '0',
      title: '组织'
    }
  ];
  currentNodes.value = rootNodes.value;
}

async function loadSearchRows(keyword: string): Promise<PersonnelNode[]> {
  const cacheKey = `${props.mode}:${keyword}`;
  const cachedRows = searchCache.get(cacheKey);
  if (cachedRows) {
    return cachedRows;
  }

  const loadingPromise = searchLoadingMap.get(cacheKey);
  if (loadingPromise) {
    return loadingPromise;
  }

  const request = props
    .searchNodes({
      keyword,
      mode: props.mode
    })
    .then((rows) => {
      searchCache.set(cacheKey, rows);
      return rows;
    })
    .finally(() => {
      searchLoadingMap.delete(cacheKey);
    });

  searchLoadingMap.set(cacheKey, request);
  return request;
}

async function onSearch() {
  const currentToken = ++searchToken;
  const keyword = searchKeyword.value.trim();
  if (!keyword) {
    onSearchClear();
    if (rootNodes.value.length === 0) {
      await loadRootNodes();
    }
    return;
  }

  loading.value = true;
  isSearchMode.value = true;
  try {
    const rows = await loadSearchRows(keyword);
    if (currentToken !== searchToken) {
      return;
    }

    const seen = new Set<string>();
    currentNodes.value = rows.filter((item) => {
      if (isUserNode(item)) {
        const userId = getUserId(item);
        if (!userId || seen.has(userId)) {
          return false;
        }
        seen.add(userId);
        return true;
      }

      if (isOrgNode(item) && props.allowSelectOrg) {
        if (!item.id || seen.has(item.id)) {
          return false;
        }
        seen.add(item.id);
        return true;
      }

      return false;
    });
  } finally {
    if (currentToken === searchToken) {
      loading.value = false;
    }
  }
}

function handleToggleUser(params: { node: PersonnelUserNode; checked: boolean }) {
  const { node, checked } = params;
  toggleSelectedItem(toSelectedUser(node), checked);
}

function handleToggleOrg(params: { node: PersonnelOrgNode; checked: boolean }) {
  if (!props.allowSelectOrg) {
    return;
  }
  const { node, checked } = params;
  toggleSelectedItem(toSelectedOrg(node), checked);
}

function removeSelected(selectedId: string) {
  writeSelectedIds(getSelectedIds().filter((item) => item !== selectedId));
  const patch = { ...selectedMap.value };
  delete patch[selectedId];
  selectedMap.value = patch;
}

function clearSelected() {
  writeSelectedIds([]);
  selectedMap.value = {};
}

function reorderSelected(payload: { oldIndex: number; newIndex: number }) {
  const { oldIndex, newIndex } = payload;
  const ids = [...getSelectedIds()];
  if (oldIndex < 0 || newIndex < 0 || oldIndex >= ids.length || newIndex >= ids.length) {
    return;
  }

  const [moved] = ids.splice(oldIndex, 1);
  if (!moved) {
    return;
  }
  ids.splice(newIndex, 0, moved);
  writeSelectedIds(ids);
}

function resetViewState() {
  dataLoadToken += 1;
  searchToken += 1;
  nodeChildrenCache.clear();
  nodeChildrenLoadingMap.clear();
  searchCache.clear();
  searchLoadingMap.clear();
  currentNodes.value = [];
  rootNodes.value = [];
  isSearchMode.value = false;
  searchKeyword.value = '';
  breadcrumbs.value = [
    {
      id: '0',
      title: '组织'
    }
  ];
  loading.value = false;
}

watch(
  () => props.selectionField,
  () => {
    if (!Array.isArray(model.value?.[props.selectionField])) {
      writeSelectedIds([]);
    }
  },
  { immediate: true }
);

watch(
  () => props.mode,
  () => {
    resetViewState();
    void syncRootNodes();
  },
  { immediate: true }
);

watch(
  () => getSelectedIds().join(','),
  () => {
    keepSelectedMap(getSelectedIds());
  },
  { immediate: true }
);

watch(
  () => props.allowSelectOrg,
  (enabled) => {
    if (enabled) {
      return;
    }

    const currentIds = getSelectedIds();
    const nextIds = currentIds.filter((id) => selectedMap.value[id]?.nodeType !== 'org');
    if (nextIds.length === currentIds.length) {
      return;
    }

    writeSelectedIds(nextIds);
    keepSelectedMap(nextIds);
  }
);

watch(
  () => props.initialSelectedUsers,
  (users) => {
    if (!Array.isArray(users)) {
      return;
    }

    const selectedUsers = users.map((item) => ({
      ...item,
      nodeType: 'user' as PersonnelNodeType,
      title: item.nickName || item.title,
      subTitle: item.phone || item.userAccount || '--'
    }));

    setSelectedItems(selectedUsers);
  },
  {
    immediate: true,
    deep: true
  }
);

function setSelectedItems(items: PersonnelSelectedItem[]) {
  const patch = { ...selectedMap.value };
  items.forEach((item) => {
    patch[item.id] = {
      ...item
    };
  });
  selectedMap.value = patch;
  writeSelectedIds(items.map((item) => item.id));
}

defineExpose({
  loadRootNodes,
  setSelectedItems,
  getSelectedItems: () => [...selectedItems.value]
});
</script>

<template>
  <div class="personnel-selector">
    <div class="personnel-selector__left">
      <PersonnelSelectorSourcePanel
        :loading
        :disabled="props.disabled"
        :search-keyword
        :search-placeholder
        :is-search-mode
        :breadcrumbs
        :nodes="currentNodes"
        :selected-id-set
        :allow-select-org="props.allowSelectOrg"
        @update:search-keyword="(value) => (searchKeyword = value)"
        @search="onSearch"
        @search-clear="onSearchClear"
        @breadcrumb-click="gotoBreadcrumb"
        @enter-org="enterOrgNode"
        @toggle-org="handleToggleOrg"
        @toggle-user="handleToggleUser"
      />
    </div>

    <div class="personnel-selector__right">
      <PersonnelSelectorSelectedPanel
        :disabled="props.disabled"
        :selected-items
        :empty-text
        :sort-enabled="props.mode === 'person'"
        @remove="removeSelected"
        @clear="clearSelected"
        @reorder="reorderSelected"
      />
    </div>
  </div>
</template>

<style scoped>
.personnel-selector {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 38%;
  width: 100%;
  min-height: 420px;
  height: clamp(420px, calc(100vh - 360px), 520px);
  border: 1px solid var(--el-border-color);
  border-radius: 4px;
  overflow: hidden;
  background: var(--el-bg-color);
}

.personnel-selector__left,
.personnel-selector__right {
  min-height: 0;
}

.personnel-selector__left {
  border-right: 1px solid var(--el-border-color);
}

@media (width <= 1400px) {
  .personnel-selector {
    grid-template-columns: minmax(0, 1fr) 42%;
  }
}
</style>
