<script setup lang="ts">
import { computed, type CSSProperties } from 'vue';

interface HelloCardSchema {
  content?: {
    basic?: {
      title?: string;
      description?: string;
      showBadge?: boolean;
      badgeText?: string;
    };
  };
  style?: {
    card?: {
      backgroundColor?: string;
      titleColor?: string;
      descriptionColor?: string;
      badgeBackgroundColor?: string;
      badgeTextColor?: string;
      borderColor?: string;
      borderRadius?: number;
      paddingY?: number;
      paddingX?: number;
    };
  };
}

const props = defineProps<{
  schema?: HelloCardSchema;
}>();

const basicContent = computed(() => props.schema?.content?.basic ?? {});
const cardStyle = computed(() => props.schema?.style?.card ?? {});

const titleText = computed(() => {
  const value = basicContent.value.title;
  return typeof value === 'string' && value.trim() ? value.trim() : '简易欢迎卡片';
});

const descriptionText = computed(() => {
  const value = basicContent.value.description;
  return typeof value === 'string' && value.trim()
    ? value.trim()
    : '这是一个最小注册示例物料，可直接拖拽到画布查看效果。';
});

const badgeVisible = computed(() => basicContent.value.showBadge === true);
const badgeText = computed(() => {
  const value = basicContent.value.badgeText;
  return typeof value === 'string' && value.trim() ? value.trim() : 'DEMO';
});

function clampNumber(value: unknown, fallback: number, min: number, max: number) {
  const normalized = Number(value);
  if (!Number.isFinite(normalized)) {
    return fallback;
  }
  return Math.min(max, Math.max(min, normalized));
}

const cardStyleObject = computed<CSSProperties>(() => ({
  border: `1px solid ${cardStyle.value.borderColor || '#cbd5e1'}`,
  borderRadius: `${clampNumber(cardStyle.value.borderRadius, 8, 0, 40)}px`,
  background:
    cardStyle.value.backgroundColor || 'linear-gradient(135deg, #eff6ff 0%, #f8fafc 100%)',
  padding: `${clampNumber(cardStyle.value.paddingY, 16, 0, 48)}px ${clampNumber(cardStyle.value.paddingX, 16, 0, 48)}px`
}));

const titleStyleObject = computed<CSSProperties>(() => ({
  color: cardStyle.value.titleColor || '#1e293b'
}));

const descriptionStyleObject = computed<CSSProperties>(() => ({
  color: cardStyle.value.descriptionColor || '#475569'
}));

const badgeStyleObject = computed<CSSProperties>(() => ({
  color: cardStyle.value.badgeTextColor || '#ffffff',
  background: cardStyle.value.badgeBackgroundColor || '#2563eb'
}));

defineOptions({
  name: 'portal-simple-hello-card-index'
});
</script>

<template>
  <section class="portal-simple-hello-card" :style="cardStyleObject">
    <div class="portal-simple-hello-card__header">
      <h3 class="portal-simple-hello-card__title" :style="titleStyleObject">{{ titleText }}</h3>
      <span v-if="badgeVisible" class="portal-simple-hello-card__badge" :style="badgeStyleObject">
        {{ badgeText }}
      </span>
    </div>
    <p class="portal-simple-hello-card__desc" :style="descriptionStyleObject">
      {{ descriptionText }}
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
