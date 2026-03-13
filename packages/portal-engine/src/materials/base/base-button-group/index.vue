<template>
  <UnifiedContainerDisplay :content="containerContentConfig" :style="containerStyleConfig">
    <div class="base-button-group" :style="wrapperStyleObj">
      <el-button
        v-for="item in normalizedItems"
        :key="item.id"
        :type="item.type"
        :plain="item.plain"
        :round="item.round || buttonStyle.round"
        :size="buttonStyle.size"
        @click="handleButtonClick(item)"
      >
        {{ item.text }}
      </el-button>
    </div>
  </UnifiedContainerDisplay>
</template>

<script setup lang="ts">
  import { computed, type CSSProperties } from 'vue';
  import { useRouter } from 'vue-router';
  import { UnifiedContainerDisplay } from '../../common/unified-container';
  import type {
    UnifiedContainerContentConfigModel,
    UnifiedContainerStyleConfigModel,
  } from '../../common/unified-container';
  import { resolveValueByPath, toNonNegativeNumber } from '../common/material-utils';
  import { mergePortalLinkConfig, openPortalLink, resolvePortalLink, type PortalLinkConfig } from '../common/portal-link';

  type ButtonType = 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info';
  type ButtonDirectionType = 'row' | 'column';
  type ButtonAlignType = 'left' | 'center' | 'right';
  type ButtonSizeType = 'large' | 'default' | 'small';

  interface ButtonItem {
    id?: string;
    text?: string;
    type?: ButtonType;
    plain?: boolean;
    round?: boolean;
    linkPath?: string;
    linkParamKey?: string;
    linkValueKey?: string;
    openType?: PortalLinkConfig['openType'];
    link?: Partial<PortalLinkConfig>;
  }

  interface BaseButtonGroupSchema {
    content?: {
      container?: Partial<UnifiedContainerContentConfigModel>;
      buttons?: {
        direction?: ButtonDirectionType;
        align?: ButtonAlignType;
        items?: ButtonItem[];
      };
    };
    style?: {
      container?: Partial<UnifiedContainerStyleConfigModel>;
      buttons?: {
        direction?: ButtonDirectionType;
        align?: ButtonAlignType;
        gap?: number;
        size?: ButtonSizeType;
        round?: boolean;
      };
    };
  }

  const props = defineProps<{
    schema: BaseButtonGroupSchema;
  }>();

  let router: ReturnType<typeof useRouter> | null = null;
  try {
    router = useRouter();
  } catch {
    router = null;
  }

  const containerContentConfig = computed(() => props.schema?.content?.container);
  const containerStyleConfig = computed(() => props.schema?.style?.container);
  const buttonsContent = computed(() => props.schema?.content?.buttons || {});

  const buttonStyle = computed(() => {
    const style = props.schema?.style?.buttons || {};
    return {
      direction: style.direction === 'column' ? 'column' : buttonsContent.value.direction === 'column' ? 'column' : 'row',
      align:
        style.align === 'center' || style.align === 'right'
          ? style.align
          : buttonsContent.value.align === 'center' || buttonsContent.value.align === 'right'
            ? buttonsContent.value.align
            : 'left',
      gap: toNonNegativeNumber(style.gap, 10),
      size: style.size === 'large' || style.size === 'small' ? style.size : 'default',
      round: style.round === true,
    } as const;
  });

  const normalizedItems = computed(() => {
    const items = Array.isArray(buttonsContent.value.items) ? buttonsContent.value.items : [];
    return items.map((item, index) => {
      const type: ButtonType =
        item.type === 'primary' ||
        item.type === 'success' ||
        item.type === 'warning' ||
        item.type === 'danger' ||
        item.type === 'info'
          ? item.type
          : 'default';

      return {
        id: String(item.id || `button-${index + 1}`),
        text: String(item.text || `按钮${index + 1}`),
        type,
        plain: item.plain === true,
        round: item.round === true,
        link: mergePortalLinkConfig(
          item.link || {
            path: item.linkPath,
            paramKey: item.linkParamKey,
            valueKey: item.linkValueKey,
            openType: item.openType,
          }
        ),
      };
    });
  });

  const wrapperStyleObj = computed<CSSProperties>(() => ({
    display: 'flex',
    flexDirection: buttonStyle.value.direction,
    flexWrap: buttonStyle.value.direction === 'row' ? 'wrap' : 'nowrap',
    justifyContent: resolveJustifyContent(buttonStyle.value.align),
    gap: `${buttonStyle.value.gap}px`,
  }));

  function resolveJustifyContent(align: ButtonAlignType): CSSProperties['justifyContent'] {
    if (align === 'center') {
      return 'center';
    }
    if (align === 'right') {
      return 'flex-end';
    }
    return 'flex-start';
  }

  function handleButtonClick(item: (typeof normalizedItems.value)[number]) {
    const valueKey = String(item.link?.valueKey || 'id');
    const paramValue = resolveValueByPath(item, valueKey);
    const link = resolvePortalLink(item.link, paramValue);
    openPortalLink({
      link,
      openType: item.link?.openType,
      routerPush: router ? (nextLink: string) => router!.push(nextLink) : null,
    });
  }

  defineOptions({
    name: 'base-button-group-index',
  });
</script>

<style scoped>
  .base-button-group {
    width: 100%;
  }
</style>
