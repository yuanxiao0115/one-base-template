<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
  type AppMenuItem,
  useAuthStore,
  useLayoutStore,
  useMenuStore,
  useSystemStore
} from '@one-base-template/core';
import { useTagStoreHook } from '@one-base-template/tag';
import { message } from '@one-base-template/ui';
import { ui } from '@/config';
import { routePaths } from '@/router/constants';
import authAccountService from '@/services/auth/auth-account-service';
import {
  buildAvatarFallbackText,
  isAvatarHidden
} from '@/services/auth/auth-avatar-preference-service';
import UserProfileDialog from './dialogs/UserProfileDialog.vue';
import ChangePasswordDialog from './dialogs/ChangePasswordDialog.vue';

interface TenantOption {
  id: string;
  tenantName: string;
}

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const layoutStore = useLayoutStore();
const menuStore = useMenuStore();
const systemStore = useSystemStore();
const tagStore = useTagStoreHook();

const profileDialogVisible = ref(false);
const changePasswordDialogVisible = ref(false);
const personalizationDrawerVisible = ref(false);
const tenantLoading = ref(false);
const tenantSwitching = ref(false);
const tenantOptions = ref<TenantOption[]>([]);
const currentTenantId = ref('');
const avatarTimestamp = ref(Date.now());
const avatarLoadErrorMap = ref<Record<string, boolean>>({});

const userName = computed(() => authStore.user?.name ?? '未登录');
const userDisplayName = computed(
  () =>
    authStore.user?.nickName ||
    authStore.user?.name ||
    authStore.user?.userAccount ||
    userName.value
);
const currentSystemCode = computed(() => systemStore.currentSystemCode);
const systems = computed(() => systemStore.systems);
const showSystemSwitcher = computed(() => systems.value.length > 1);
const systemSwitchStyle = computed(() => layoutStore.systemSwitchStyle);
const showSystemSwitcherDropdown = computed(
  () => showSystemSwitcher.value && systemSwitchStyle.value === 'dropdown'
);
const showSystemSwitcherMenu = computed(
  () => showSystemSwitcher.value && systemSwitchStyle.value === 'menu'
);
const currentSystemName = computed(() => systemStore.currentSystemName);
const title = computed(() => `${currentSystemName.value} | ${ui.topbar.titleSuffix}`);
const topbarHeight = computed(() => layoutStore.topbarHeight);

const isSuperAdmin = computed(() => {
  const user = authStore.user;
  if (!user) {
    return false;
  }

  if (Number(user.isSuperAdmin ?? 0) === 1) {
    return true;
  }

  const roleCodes = Array.isArray(user.roleCodes) ? user.roleCodes : [];
  return Number(user.tenantId ?? -1) === 0 && roleCodes.includes('super_admin');
});

const showTenantSwitcher = computed(() => {
  return (
    ui.topbar.tenantSwitcher && isSuperAdmin.value && tenantOptions.value.length > 0
  );
});
const userId = computed(() => {
  const id = authStore.user?.id;
  return id == null ? '' : String(id);
});

const userAvatar = computed(() => {
  const user = authStore.user;
  if (!user) {
    return '';
  }

  if (isAvatarHidden(user.id)) {
    return '';
  }

  const currentUserId = userId.value;
  if (currentUserId && avatarLoadErrorMap.value[currentUserId]) {
    return '';
  }

  if (currentUserId) {
    return `/cmict/file/user/avatar/${currentUserId}?timestamp=${avatarTimestamp.value}`;
  }
  return user.avatarUrl || user.avatar || '';
});

const userAvatarFallback = computed(() => {
  return buildAvatarFallbackText(
    authStore.user?.nickName,
    authStore.user?.name,
    authStore.user?.userAccount
  );
});

const headerStyle = computed(() => ({
  '--ob-topbar-height': topbarHeight.value
}));

watch(
  () => authStore.user?.tenantId,
  (tenantId) => {
    currentTenantId.value = tenantId == null ? '' : String(tenantId);
  },
  { immediate: true }
);

watch(
  () => authStore.user?.id,
  () => {
    avatarTimestamp.value = Date.now();
    if (userId.value) {
      delete avatarLoadErrorMap.value[userId.value];
    }
  }
);

watch(
  () => [isSuperAdmin.value, ui.topbar.tenantSwitcher] as const,
  async ([isSuperAdminEnabled, tenantSwitcherEnabled]) => {
    if (!(isSuperAdminEnabled && tenantSwitcherEnabled)) {
      tenantOptions.value = [];
      currentTenantId.value = '';
      return;
    }

    await loadTenantOptions();
  },
  { immediate: true }
);

function findFirstLeafPath(item: AppMenuItem): string | undefined {
  if (item.children?.length) {
    for (const child of item.children) {
      const leafPath = findFirstLeafPath(child);
      if (leafPath) {
        return leafPath;
      }
    }
    return undefined;
  }

  if (!item.external && item.path) {
    return item.path;
  }
  return undefined;
}

function findFirstLeafPathFromList(list: AppMenuItem[]): string | undefined {
  for (const item of list) {
    const leafPath = findFirstLeafPath(item);
    if (leafPath) {
      return leafPath;
    }
  }
  return undefined;
}

function normalizeTenantOptions(raw: unknown): TenantOption[] {
  const result = new Map<string, TenantOption>();
  result.set('0', { id: '0', tenantName: '平台管理员' });

  if (Array.isArray(raw)) {
    for (const item of raw) {
      if (!item || typeof item !== 'object') {
        continue;
      }
      const record = item as Record<string, unknown>;
      const rawId = record.id;
      const rawName = record.tenantName;
      if (rawId == null) {
        continue;
      }

      const id = String(rawId);
      const tenantName = typeof rawName === 'string' && rawName.trim() ? rawName.trim() : id;
      result.set(id, { id, tenantName });
    }
  }

  return Array.from(result.values());
}

async function loadTenantOptions() {
  tenantLoading.value = true;
  try {
    const response = await authAccountService.listTenants();
    if (response.code !== 200) {
      throw new Error(response.message || '获取租户列表失败');
    }

    tenantOptions.value = normalizeTenantOptions(response.data);
    if (!tenantOptions.value.find((item) => item.id === currentTenantId.value)) {
      const firstTenant = tenantOptions.value[0];
      currentTenantId.value = firstTenant ? firstTenant.id : '';
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '获取租户列表失败';
    message.error(errorMessage);
    tenantOptions.value = [];
  } finally {
    tenantLoading.value = false;
  }
}

async function onLogout() {
  let logoutError: unknown = null;
  try {
    await authStore.logout();
  } catch (error) {
    logoutError = error;
  } finally {
    menuStore.reset();
    systemStore.reset();
    tagStore.handleTags('equal', []);
    await router.replace(routePaths.login);
  }

  if (logoutError) {
    message.warning('退出接口异常，已清理本地登录状态');
  }
}

async function onSwitchSystem(systemCode: string) {
  if (!systemCode || systemCode === systemStore.currentSystemCode) {
    return;
  }

  systemStore.setCurrentSystem(systemCode);

  if (!(menuStore.loaded || menuStore.remoteSynced)) {
    await menuStore.loadMenus();
  }

  let home = systemStore.resolveHomePath(systemCode);
  if (!(home && menuStore.isAllowed(home))) {
    const firstLeaf = findFirstLeafPathFromList(menuStore.menus);
    if (firstLeaf) {
      home = firstLeaf;
    }
  }

  if (home) {
    await router.replace(home);
  }
}

function onSelectSystemMenu(systemCode: string) {
  void onSwitchSystem(systemCode);
}

function onAvatarImageError() {
  if (!userId.value) {
    return;
  }
  avatarLoadErrorMap.value[userId.value] = true;
}

function resolveCurrentMenuKey() {
  const activePath = route.meta.activePath;
  return typeof activePath === 'string' && activePath.startsWith('/') ? activePath : route.path;
}

function resolveFallbackPathAfterTenantSwitch() {
  const currentMenuKey = resolveCurrentMenuKey();
  if (menuStore.isAllowed(currentMenuKey)) {
    return route.fullPath;
  }

  let home = systemStore.resolveHomePath(systemStore.currentSystemCode);
  if (!(home && menuStore.isAllowed(home))) {
    const firstLeaf = findFirstLeafPathFromList(menuStore.menus);
    if (firstLeaf) {
      home = firstLeaf;
    }
  }

  return home || '';
}

async function redirectToLoginForNoSystem() {
  message.warning('切换租户后暂无可访问系统，请重新登录');
  await router.replace(routePaths.login);
}

async function rebuildMenusAndRouteAfterTenantSwitch() {
  menuStore.reset();
  await menuStore.loadMenus();
  tagStore.handleTags('equal', []);

  if (!systemStore.systems.length || !systemStore.currentSystemCode) {
    await redirectToLoginForNoSystem();
    return false;
  }

  const fallbackPath = resolveFallbackPathAfterTenantSwitch();
  if (!fallbackPath) {
    await redirectToLoginForNoSystem();
    return false;
  }

  await router.replace(fallbackPath);
  return true;
}

async function refreshCurrentUser() {
  await authStore.fetchMe();
  avatarTimestamp.value = Date.now();
}

async function onSwitchTenant(tenantId: string) {
  if (tenantSwitching.value || !tenantId) {
    return;
  }

  const previousTenantId = authStore.user?.tenantId == null ? '' : String(authStore.user.tenantId);
  if (tenantId === previousTenantId) {
    return;
  }

  tenantSwitching.value = true;
  try {
    const response = await authAccountService.switchTenant({ tenantId });
    if (response.code !== 200) {
      throw new Error(response.message || '切换租户失败');
    }

    await refreshCurrentUser();
    await loadTenantOptions();
    const switched = await rebuildMenusAndRouteAfterTenantSwitch();
    if (switched) {
      message.success('切换租户成功');
    }
  } catch (error) {
    currentTenantId.value = previousTenantId;
    const errorMessage = error instanceof Error ? error.message : '切换租户失败';
    message.error(errorMessage);
  } finally {
    tenantSwitching.value = false;
  }
}
</script>

<template>
  <div class="ob-topbar" :style="headerStyle">
    <div class="ob-topbar__left">
      <p class="ob-topbar__title" :title="title">{{ title }}</p>

      <el-dropdown
        v-if="showSystemSwitcherDropdown"
        class="ob-topbar__system"
        @command="onSwitchSystem"
      >
        <span class="ob-topbar__system-trigger" :title="currentSystemName">
          切换系统：{{ currentSystemName }}
        </span>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item
              v-for="sys in systemStore.systems"
              :key="sys.code"
              :command="sys.code"
            >
              {{ sys.name }}
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>

      <el-menu
        v-if="showSystemSwitcherMenu"
        class="ob-topbar__system-menu"
        mode="horizontal"
        :ellipsis="true"
        :default-active="currentSystemCode"
        aria-label="系统切换菜单"
        @select="onSelectSystemMenu"
      >
        <el-menu-item
          v-for="sys in systems"
          :key="sys.code"
          :index="sys.code"
          class="ob-topbar__system-menu-item"
          :title="sys.name"
        >
          {{ sys.name }}
        </el-menu-item>
      </el-menu>

      <el-select
        v-if="showTenantSwitcher"
        v-model="currentTenantId"
        class="ob-topbar__tenant-select"
        :clearable="false"
        :loading="tenantLoading || tenantSwitching"
        :disabled="tenantSwitching"
        placeholder="请选择租户"
        @change="onSwitchTenant"
      >
        <el-option
          v-for="tenant in tenantOptions"
          :key="tenant.id"
          :label="tenant.tenantName"
          :value="tenant.id"
        />
      </el-select>
    </div>

    <div class="ob-topbar__right">
      <el-dropdown class="ob-topbar__user">
        <span class="ob-topbar__user-trigger">
          <span class="ob-topbar__avatar" role="img" :aria-label="userDisplayName">
            <img
              v-if="userAvatar"
              class="ob-topbar__avatar-image"
              :src="userAvatar"
              :alt="userDisplayName"
              @error="onAvatarImageError"
            />
            <span v-else class="ob-topbar__avatar-text">{{ userAvatarFallback }}</span>
          </span>
          <span class="ob-topbar__user-name" :title="userDisplayName">{{ userDisplayName }}</span>
        </span>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item
              v-if="ui.topbar.profileDialog"
              @click="profileDialogVisible = true"
            >
              用户信息
            </el-dropdown-item>
            <el-dropdown-item
              v-if="ui.topbar.changePassword"
              @click="changePasswordDialogVisible = true"
            >
              修改密码
            </el-dropdown-item>
            <el-dropdown-item
              v-if="ui.topbar.personalization"
              @click="personalizationDrawerVisible = true"
            >
              个性设置
            </el-dropdown-item>
            <el-dropdown-item divided @click="onLogout">退出登录</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>

  <el-drawer
    v-if="ui.topbar.personalization"
    v-model="personalizationDrawerVisible"
    title="个性设置"
    size="520"
    append-to-body
    :with-header="true"
  >
    <ObThemeSwitcher />
  </el-drawer>

  <UserProfileDialog
    v-if="ui.topbar.profileDialog"
    v-model="profileDialogVisible"
    :user="authStore.user"
    @refresh="refreshCurrentUser"
  />
  <ChangePasswordDialog
    v-if="ui.topbar.changePassword"
    v-model="changePasswordDialogVisible"
  />
</template>

<style scoped>
.ob-topbar {
  height: var(--ob-topbar-height, 64px);
  padding: 0 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: rgb(255 255 255 / 92%);
  background: var(--el-color-primary);
}

.ob-topbar__left {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  min-width: 0;
}

.ob-topbar__title {
  margin: 0;
  padding-right: 14px;
  font-size: 20px;
  font-weight: 500;
  color: #fff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.ob-topbar__system-trigger {
  cursor: pointer;
  user-select: none;
  font-size: 14px;
  padding: 6px 10px;
  border-radius: 999px;
  color: #fff;
  background: rgb(255 255 255 / 14%);
  border: 1px solid rgb(255 255 255 / 22%);
  transition:
    background-color 150ms ease,
    border-color 150ms ease;
}

.ob-topbar__system-trigger:hover {
  background: rgb(255 255 255 / 18%);
  border-color: rgb(255 255 255 / 28%);
}

.ob-topbar__right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.ob-topbar__system-menu {
  min-width: 0;
  flex: 1;
  max-width: 58%;
  border-bottom: 0;
  background: transparent;
  --el-menu-bg-color: transparent;
  --el-menu-text-color: rgb(255 255 255 / 94%);
  --el-menu-active-color: #fff;
  --el-menu-hover-bg-color: rgb(255 255 255 / 12%);
  --el-menu-item-font-size: 14px;
  --el-menu-horizontal-height: var(--ob-topbar-height, 64px);
}

.ob-topbar__system-menu-item {
  font-size: 14px;
  font-weight: 500;
  white-space: nowrap;
}

.ob-topbar__tenant-select {
  width: 240px;
}

.ob-topbar__user-trigger {
  cursor: pointer;
  user-select: none;
  color: #fff;
  padding: 2px 10px;
  border-radius: 999px;
  transition: background-color 150ms ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.ob-topbar__avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: var(--one-color-primary-light-1, var(--el-color-primary-light-9));
  color: var(--one-color-primary, var(--el-color-primary));
  overflow: hidden;
}

.ob-topbar__avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.ob-topbar__avatar-text {
  font-size: 12px;
  line-height: 1;
  font-weight: 600;
}

.ob-topbar__user-name {
  font-size: 14px;
  color: #fff;
  max-width: 180px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.ob-topbar :deep(.ob-topbar__system-menu.el-menu--horizontal) {
  border-bottom: 0;
}

.ob-topbar :deep(.ob-topbar__system-menu.el-menu--horizontal > .el-menu-item),
.ob-topbar :deep(.ob-topbar__system-menu.el-menu--horizontal > .el-sub-menu .el-sub-menu__title) {
  height: var(--ob-topbar-height, 64px);
  line-height: var(--ob-topbar-height, 64px);
  border-bottom: 0;
  padding: 0 28px;
  transition: background-color 180ms ease;
}

.ob-topbar :deep(.ob-topbar__system-menu.el-menu--horizontal > .el-menu-item:hover),
.ob-topbar
  :deep(.ob-topbar__system-menu.el-menu--horizontal > .el-sub-menu .el-sub-menu__title:hover) {
  background: rgb(255 255 255 / 12%);
}

.ob-topbar :deep(.ob-topbar__system-menu.el-menu--horizontal > .el-menu-item.is-active) {
  background: var(--one-color-primary-light-9, var(--el-color-primary-dark-2));
  color: #fff;
  border-bottom: 0;
}

.ob-topbar :deep(.ob-topbar__tenant-select .el-select__wrapper) {
  border-radius: 999px;
  background: rgb(255 255 255 / 12%);
  box-shadow: none;
  border: 1px solid rgb(255 255 255 / 20%);
}

.ob-topbar :deep(.ob-topbar__tenant-select .el-select__placeholder),
.ob-topbar :deep(.ob-topbar__tenant-select .el-select__selected-item),
.ob-topbar :deep(.ob-topbar__tenant-select .el-select__caret) {
  color: #fff;
}
</style>
