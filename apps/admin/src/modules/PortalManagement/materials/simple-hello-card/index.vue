<script setup lang="ts">
import { computed, type CSSProperties } from 'vue';
import {
  mergePortalSimpleHelloCardBasicConfig,
  mergePortalSimpleHelloCardStyleConfig
} from './defaults';

const props = defineProps<{
  schema?: {
    content?: { basic?: unknown };
    style?: { card?: unknown };
  };
}>();

const basicContent = computed(() =>
  mergePortalSimpleHelloCardBasicConfig(props.schema?.content?.basic)
);
const cardStyle = computed(() => mergePortalSimpleHelloCardStyleConfig(props.schema?.style?.card));

const cardStyleObject = computed<CSSProperties>(() => ({
  border: `1px solid ${cardStyle.value.borderColor}`,
  borderRadius: `${cardStyle.value.borderRadius}px`,
  background: cardStyle.value.backgroundColor,
  padding: `${cardStyle.value.paddingY}px ${cardStyle.value.paddingX}px`
}));

const titleStyleObject = computed<CSSProperties>(() => ({
  color: cardStyle.value.titleColor
}));

const descriptionStyleObject = computed<CSSProperties>(() => ({
  color: cardStyle.value.descriptionColor
}));

const badgeStyleObject = computed<CSSProperties>(() => ({
  color: cardStyle.value.badgeTextColor,
  background: cardStyle.value.badgeBackgroundColor
}));

defineOptions({
  name: 'portal-simple-hello-card-index'
});
</script>

<template>
  <section class="portal-simple-hello-card" :style="cardStyleObject">
    <div class="portal-simple-hello-card__header">
      <h3 class="portal-simple-hello-card__title" :style="titleStyleObject">
        {{ basicContent.title }}
      </h3>
      <span
        v-if="basicContent.showBadge"
        class="portal-simple-hello-card__badge"
        :style="badgeStyleObject"
      >
        {{ basicContent.badgeText }}
      </span>
    </div>
    <p class="portal-simple-hello-card__desc" :style="descriptionStyleObject">
      {{ basicContent.description }}
    </p>
  </section>
</template>

<style scoped>
.portal-simple-hello-card {
  width: 100%;
  min-height: 120px;
  box-sizing: border-box;
}

.portal-simple-hello-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.portal-simple-hello-card__title {
  margin: 0 0 8px;
  font-size: 16px;
  line-height: 24px;
}

.portal-simple-hello-card__desc {
  margin: 0;
  font-size: 13px;
  line-height: 20px;
}

.portal-simple-hello-card__badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 48px;
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 12px;
  line-height: 18px;
  font-weight: 600;
}
</style>
