<template>
  <UnifiedContainerDisplay :content="containerContentConfig" :style="containerStyleConfig">
    <div class="mail-list-widget">
      <div class="mail-header" :style="headerStyleObj">
        <div class="mail-header-main">
          <span class="mail-header-icon" :style="headerIconStyleObj">
            <MenuIcon icon="ri:mail-line" />
          </span>
          <span class="mail-header-title" :style="headerTitleStyleObj">
            {{ containerContentConfig?.title || '我的邮件' }}
          </span>
          <span class="mail-header-badge" :style="badgeStyleObj">
            未读 <em :style="badgeAccentStyleObj">{{ unreadCount }}</em> 条
          </span>
        </div>

        <div class="mail-header-actions">
          <button
            v-for="action in headerActions"
            :key="action.key"
            class="mail-header-action"
            type="button"
          >
            <span>{{ action.label }}</span>
            <el-icon><component :is="action.icon" /></el-icon>
          </button>
        </div>
      </div>

      <el-skeleton v-if="loading" :rows="4" animated />

      <template v-else>
        <div v-if="displayRows.length" class="mail-list-body">
          <div
            v-for="(row, index) in displayRows"
            :key="resolveRowId(row, index)"
            class="mail-row"
            :class="{
              'row-with-divider': mailConfig.showRowDivider,
              'row-clickable': canNavigate(row)
            }"
            :style="rowStyleObj"
            @click="handleRowClick(row)"
          >
            <div class="mail-row-left">
              <div class="mail-avatar" :style="avatarStyleObj">
                {{ resolveAvatarText(resolveSenderName(row)) }}
              </div>

              <div class="mail-row-meta">
                <div class="mail-sender-line">
                  <span
                    v-if="mailConfig.showStatusDot"
                    class="mail-status-dot"
                    :class="{ 'is-unread': isUnread(row) }"
                    :style="resolveStatusDotStyle(row)"
                  />
                  <span class="mail-sender-name" :style="senderStyleObj">{{
                    resolveSenderName(row)
                  }}</span>
                </div>
                <div
                  class="mail-sender-address"
                  :title="`来自<${resolveSenderName(row)}<${resolveSenderEmail(row)}>>`"
                >
                  来自&lt;{{ resolveSenderName(row) }}&lt;{{ resolveSenderEmail(row) }}&gt;&gt;
                </div>
              </div>
            </div>

            <div class="mail-row-subject" :style="subjectStyleObj" :title="resolveSubject(row)">
              {{ resolveSubject(row) }}
            </div>
            <div class="mail-row-time" :style="timeStyleObj">{{ resolveSendTime(row) }}</div>
          </div>
        </div>

        <div v-else class="empty-text">暂无邮件数据</div>
      </template>
    </div>
  </UnifiedContainerDisplay>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch, type CSSProperties } from 'vue';
import { useRouter } from 'vue-router';
import { Expand, MoreFilled, Refresh } from '@element-plus/icons-vue';
import { MenuIcon } from '@one-base-template/ui';
import { UnifiedContainerDisplay } from '../../common/unified-container';
import type {
  UnifiedContainerContentConfigModel,
  UnifiedContainerStyleConfigModel
} from '../../common/unified-container';
import {
  loadPortalDataSourceRows,
  mergePortalDataSourceModel,
  type PortalDataSourceModel
} from '../../base/common/portal-data-source';
import {
  mergePortalLinkConfig,
  openPortalLink,
  resolvePortalLink,
  type PortalLinkConfig
} from '../../base/common/portal-link';
import { resolveValueByPath, toPositiveNumber } from '../../base/common/material-utils';

type MailRow = Record<string, unknown>;

interface MailListSchema {
  content?: {
    container?: Partial<UnifiedContainerContentConfigModel>;
    dataSource?: Partial<PortalDataSourceModel>;
    mail?: {
      unreadCount?: number;
      maxDisplayCount?: number;
      showRowDivider?: boolean;
      showStatusDot?: boolean;
      idKey?: string;
      senderNameKey?: string;
      senderEmailKey?: string;
      subjectKey?: string;
      sendTimeKey?: string;
      unreadKey?: string;
      linkPath?: string;
      linkParamKey?: string;
      linkValueKey?: string;
      openType?: PortalLinkConfig['openType'];
      link?: Partial<PortalLinkConfig>;
    };
  };
  style?: {
    container?: Partial<UnifiedContainerStyleConfigModel>;
    mail?: {
      headerBgColor?: string;
      headerIconBgColor?: string;
      headerIconColor?: string;
      headerTitleColor?: string;
      badgeBgColor?: string;
      badgeBorderColor?: string;
      badgeTextColor?: string;
      badgeAccentColor?: string;
      rowHoverBgColor?: string;
      dividerColor?: string;
      senderColor?: string;
      subjectColor?: string;
      timeColor?: string;
      unreadDotColor?: string;
      readDotColor?: string;
      titleFontSize?: number;
      subjectFontSize?: number;
      timeFontSize?: number;
      avatarBgColor?: string;
      avatarTextColor?: string;
    };
  };
}

const props = defineProps<{
  schema: MailListSchema;
}>();

let router: ReturnType<typeof useRouter> | null = null;
try {
  router = useRouter();
} catch {
  router = null;
}

const loading = ref(false);
const rows = ref<MailRow[]>([]);
let requestController: AbortController | null = null;

const headerActions = [
  { key: 'refresh', label: '刷新', icon: Refresh },
  { key: 'expand', label: '展开', icon: Expand },
  { key: 'more', label: '更多', icon: MoreFilled }
];

const containerContentConfig = computed(() => props.schema?.content?.container);
const containerStyleConfig = computed(() => props.schema?.style?.container);
const dataSource = computed(() => mergePortalDataSourceModel(props.schema?.content?.dataSource));
const mailStyle = computed(() => props.schema?.style?.mail || {});

const mailConfig = computed(() => {
  const raw = props.schema?.content?.mail || {};
  return {
    unreadCount: Number.isFinite(Number(raw.unreadCount)) ? Number(raw.unreadCount) : -1,
    maxDisplayCount: Math.max(1, toPositiveNumber(raw.maxDisplayCount, 7)),
    showRowDivider: raw.showRowDivider !== false,
    showStatusDot: raw.showStatusDot !== false,
    idKey: String(raw.idKey || 'id'),
    senderNameKey: String(raw.senderNameKey || 'senderName'),
    senderEmailKey: String(raw.senderEmailKey || 'senderEmail'),
    subjectKey: String(raw.subjectKey || 'subject'),
    sendTimeKey: String(raw.sendTimeKey || 'sendTime'),
    unreadKey: String(raw.unreadKey || 'unread'),
    link: mergePortalLinkConfig(
      raw.link || {
        path: raw.linkPath,
        paramKey: raw.linkParamKey,
        valueKey: raw.linkValueKey,
        openType: raw.openType
      }
    )
  };
});

const displayRows = computed(() => rows.value.slice(0, mailConfig.value.maxDisplayCount));

const unreadCount = computed(() => {
  if (mailConfig.value.unreadCount >= 0) {
    return Math.floor(mailConfig.value.unreadCount);
  }

  return displayRows.value.reduce((total, row) => {
    return total + (isUnread(row) ? 1 : 0);
  }, 0);
});

const headerStyleObj = computed<CSSProperties>(() => ({
  background: mailStyle.value.headerBgColor || '#ffffff'
}));

const headerIconStyleObj = computed<CSSProperties>(() => ({
  background: mailStyle.value.headerIconBgColor || '#e7f2ff',
  color: mailStyle.value.headerIconColor || '#1f87ff'
}));

const headerTitleStyleObj = computed<CSSProperties>(() => ({
  color: mailStyle.value.headerTitleColor || '#1d2129',
  fontSize: `${Math.max(12, toPositiveNumber(mailStyle.value.titleFontSize, 18))}px`
}));

const badgeStyleObj = computed<CSSProperties>(() => ({
  background: mailStyle.value.badgeBgColor || '#ffffff',
  borderColor: mailStyle.value.badgeBorderColor || '#e5e6eb',
  color: mailStyle.value.badgeTextColor || '#86909c'
}));

const badgeAccentStyleObj = computed<CSSProperties>(() => ({
  color: mailStyle.value.badgeAccentColor || '#1f87ff'
}));

const rowStyleObj = computed<CSSProperties>(() => ({
  '--mail-row-hover-bg': mailStyle.value.rowHoverBgColor || '#f7f8fa',
  '--mail-divider-color': mailStyle.value.dividerColor || '#e5e6eb'
}));

const avatarStyleObj = computed<CSSProperties>(() => ({
  background: mailStyle.value.avatarBgColor || '#2f88e6',
  color: mailStyle.value.avatarTextColor || '#ffffff'
}));

const senderStyleObj = computed<CSSProperties>(() => ({
  color: mailStyle.value.senderColor || '#1d2129'
}));

const subjectStyleObj = computed<CSSProperties>(() => ({
  color: mailStyle.value.subjectColor || '#1d2129',
  fontSize: `${Math.max(12, toPositiveNumber(mailStyle.value.subjectFontSize, 16))}px`
}));

const timeStyleObj = computed<CSSProperties>(() => ({
  color: mailStyle.value.timeColor || '#86909c',
  fontSize: `${Math.max(12, toPositiveNumber(mailStyle.value.timeFontSize, 14))}px`
}));

function resolveStatusDotStyle(row: MailRow): CSSProperties {
  return {
    backgroundColor: isUnread(row)
      ? mailStyle.value.unreadDotColor || '#ff7d00'
      : mailStyle.value.readDotColor || '#c9cdd4'
  };
}

function resolveRowId(row: MailRow, rowIndex: number): string {
  const rowId = resolveValueByPath(row, mailConfig.value.idKey);
  if (rowId !== undefined && rowId !== null && `${rowId}`.trim()) {
    return String(rowId);
  }
  return `mail-${rowIndex + 1}`;
}

function resolveSenderName(row: MailRow): string {
  return String(resolveValueByPath(row, mailConfig.value.senderNameKey) || '--');
}

function resolveSenderEmail(row: MailRow): string {
  return String(resolveValueByPath(row, mailConfig.value.senderEmailKey) || '--');
}

function resolveSubject(row: MailRow): string {
  return String(resolveValueByPath(row, mailConfig.value.subjectKey) || '无主题');
}

function resolveSendTime(row: MailRow): string {
  return String(resolveValueByPath(row, mailConfig.value.sendTimeKey) || '');
}

function resolveAvatarText(value: string): string {
  const text = String(value || '').trim();
  if (!text) {
    return '--';
  }
  return text.slice(-2);
}

function isUnread(row: MailRow): boolean {
  const value = resolveValueByPath(row, mailConfig.value.unreadKey);
  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'number') {
    return value > 0;
  }

  const normalized = String(value || '')
    .trim()
    .toLowerCase();
  return (
    normalized === 'true' || normalized === '1' || normalized === 'yes' || normalized === 'unread'
  );
}

function resolveRowLink(row: MailRow): string {
  const value = resolveValueByPath(row, mailConfig.value.link.valueKey);
  return resolvePortalLink(mailConfig.value.link, value);
}

function canNavigate(row: MailRow): boolean {
  return Boolean(resolveRowLink(row));
}

function handleRowClick(row: MailRow) {
  const link = resolveRowLink(row);
  if (!link) {
    return;
  }

  openPortalLink({
    link,
    openType: mailConfig.value.link.openType,
    routerPush: router ? (nextLink: string) => router!.push(nextLink) : null
  });
}

function cancelRequest() {
  if (requestController) {
    requestController.abort();
    requestController = null;
  }
}

async function loadRows() {
  cancelRequest();
  requestController = new AbortController();

  loading.value = true;
  const result = await loadPortalDataSourceRows(dataSource.value, {
    page: 1,
    pageSize: mailConfig.value.maxDisplayCount,
    signal: requestController.signal
  });

  if (!result.success && result.errorMessage !== '请求已取消') {
    console.warn('[portal-engine] cms-mail-list 数据加载失败：', result.errorMessage);
  }

  rows.value = result.rows;
  loading.value = false;
}

watch(
  () => [dataSource.value, mailConfig.value.maxDisplayCount],
  () => {
    loadRows();
  },
  {
    deep: true,
    immediate: true
  }
);

onBeforeUnmount(() => {
  cancelRequest();
});

defineOptions({
  name: 'cms-mail-list-index'
});
</script>

<style scoped lang="scss">
.mail-list-widget {
  display: flex;
  overflow: hidden;
  width: 100%;
  min-height: 260px;
  flex-direction: column;
  background-color: #fff;
}

.mail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 16px 12px;
  gap: 12px;
}

.mail-header-main {
  display: flex;
  align-items: center;
  min-width: 0;
  gap: 12px;
}

.mail-header-icon {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  border-radius: 8px;
  width: 28px;
  height: 28px;
  font-size: 16px;
  flex-shrink: 0;
}

.mail-header-title {
  overflow: hidden;
  min-width: 0;
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;
  line-height: 28px;
}

.mail-header-badge {
  border: 1px solid;
  border-radius: 8px;
  padding: 4px 12px;
  white-space: nowrap;
  line-height: 22px;
  flex-shrink: 0;

  em {
    margin: 0 4px;
    font-weight: 600;
    font-style: normal;
  }
}

.mail-header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.mail-header-action {
  display: inline-flex;
  align-items: center;
  border: 1px solid #e5e6eb;
  border-radius: 8px;
  padding: 0 14px;
  height: 36px;
  font-size: 14px;
  color: #4e5969;
  background: #fff;
  gap: 6px;
  line-height: 1;
  cursor: pointer;
}

.mail-list-body {
  overflow: auto;
  padding: 0 16px 10px;
}

.mail-row {
  display: flex;
  align-items: center;
  padding: 8px 0;
  min-height: 74px;
  gap: 16px;

  &.row-clickable {
    cursor: pointer;
  }

  &.row-clickable:hover {
    border-radius: 8px;
    background-color: var(--mail-row-hover-bg, #f7f8fa);
  }
}

.row-with-divider {
  border-bottom: 1px solid var(--mail-divider-color, #e5e6eb);
}

.mail-row-left {
  display: flex;
  align-items: center;
  width: 360px;
  min-width: 280px;
  max-width: 360px;
  gap: 14px;
}

.mail-avatar {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  border-radius: 50%;
  width: 52px;
  height: 52px;
  font-size: 22px;
  line-height: 1;
  flex-shrink: 0;
}

.mail-row-meta {
  overflow: hidden;
  min-width: 0;
  flex: 1;
}

.mail-sender-line {
  display: flex;
  align-items: center;
  min-width: 0;
  gap: 8px;
}

.mail-status-dot {
  border-radius: 50%;
  width: 10px;
  height: 10px;
  flex-shrink: 0;
}

.mail-sender-name {
  overflow: hidden;
  min-width: 0;
  font-size: 16px;
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;
  line-height: 24px;
}

.mail-sender-address {
  overflow: hidden;
  margin-top: 2px;
  font-size: 14px;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: #4e5969;
  line-height: 22px;
}

.mail-row-subject {
  overflow: hidden;
  min-width: 0;
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
  line-height: 24px;
}

.mail-row-time {
  width: 170px;
  text-align: right;
  flex-shrink: 0;
  line-height: 22px;
}

.empty-text {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 120px;
  font-size: 14px;
  color: #909399;
}

@media (width <= 1200px) {
  .mail-row-left {
    width: 320px;
    min-width: 240px;
  }

  .mail-row-time {
    width: 140px;
  }
}

@media (width <= 992px) {
  .mail-header {
    flex-wrap: wrap;
    align-items: flex-start;
  }

  .mail-row {
    flex-wrap: wrap;
    align-items: flex-start;
    gap: 10px;
  }

  .mail-row-left {
    width: 100%;
    min-width: 0;
    max-width: 100%;
  }

  .mail-row-subject {
    width: 100%;
    flex: 0 0 100%;
  }

  .mail-row-time {
    margin-left: auto;
    width: auto;
  }
}
</style>
