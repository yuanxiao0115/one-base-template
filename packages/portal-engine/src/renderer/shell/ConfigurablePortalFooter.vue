<script setup lang="ts">
import { computed } from 'vue';

import type { PortalFooterConfig } from '../../shell/template-details';

const props = defineProps<{
  config: PortalFooterConfig;
  fixed?: boolean | null;
}>();

const footerContainerWidth = computed(() => {
  const width = props.config.tokens.containerWidth;
  if (width === '100%') {
    return '100%';
  }
  const normalized = Number(width);
  return `${Math.max(320, Number.isFinite(normalized) ? normalized : 1200)}px`;
});

const footerStyle = computed(() => ({
  '--portal-footer-bg': props.config.tokens.bgColor,
  '--portal-footer-text': props.config.tokens.textColor,
  '--portal-footer-muted-text': props.config.tokens.mutedTextColor,
  '--portal-footer-link': props.config.tokens.linkColor,
  '--portal-footer-height': `${Math.max(56, props.config.tokens.height)}px`,
  '--portal-footer-container-width': footerContainerWidth.value,
  '--portal-footer-border': props.config.tokens.borderTopColor
}));

const isFixed = computed(() =>
  typeof props.fixed === 'boolean' ? props.fixed : props.config.behavior.fixedMode === 'fixed'
);
const showRecord = computed(
  () =>
    props.config.behavior.showRecord &&
    Boolean(
      props.config.content.copyright ||
      props.config.content.icp ||
      props.config.content.policeRecord
    )
);
const showContact = computed(
  () =>
    props.config.behavior.showContact &&
    Boolean(
      props.config.content.servicePhone ||
      props.config.content.serviceEmail ||
      props.config.content.address
    )
);
</script>

<template>
  <footer class="footer" :class="{ 'footer--fixed': isFixed }" :style="footerStyle">
    <div class="footer-inner">
      <div v-if="props.config.content.description" class="footer-desc">
        {{ props.config.content.description }}
      </div>

      <div
        v-if="props.config.behavior.showLinks && props.config.content.links.length"
        class="footer-links"
      >
        <a
          v-for="item in props.config.content.links"
          :key="`${item.label}-${item.url}`"
          class="footer-link"
          :href="item.url || 'javascript:void(0)'"
          target="_blank"
          rel="noopener noreferrer"
        >
          {{ item.label || item.url }}
        </a>
      </div>

      <div v-if="showRecord" class="footer-meta">
        <span v-if="props.config.content.copyright">{{ props.config.content.copyright }}</span>
        <span v-if="props.config.content.icp">{{ props.config.content.icp }}</span>
        <span v-if="props.config.content.policeRecord">{{
          props.config.content.policeRecord
        }}</span>
      </div>

      <div v-if="showContact" class="footer-contact">
        <div class="contact-lines">
          <span v-if="props.config.content.servicePhone"
            >电话：{{ props.config.content.servicePhone }}</span
          >
          <span v-if="props.config.content.serviceEmail"
            >邮箱：{{ props.config.content.serviceEmail }}</span
          >
          <span v-if="props.config.content.address">地址：{{ props.config.content.address }}</span>
        </div>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  background: var(--portal-footer-bg);
  color: var(--portal-footer-text);
  border-top: 1px solid var(--portal-footer-border);
}

.footer--fixed {
  position: sticky;
  bottom: 0;
  z-index: 18;
}

.footer-inner {
  width: min(100%, var(--portal-footer-container-width));
  min-height: var(--portal-footer-height);
  margin: 0 auto;
  padding: 10px 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  box-sizing: border-box;
  text-align: center;
}

.footer-desc {
  font-size: 13px;
  color: var(--portal-footer-muted-text);
  line-height: 1.45;
}

.footer-links {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px 14px;
}

.footer-link {
  color: var(--portal-footer-link);
  font-size: 13px;
  text-decoration: none;
}

.footer-link:hover {
  text-decoration: underline;
}

.footer-meta {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 8px 12px;
  font-size: 12px;
  color: var(--portal-footer-muted-text);
}

.footer-contact {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  justify-content: center;
}

.contact-lines {
  display: inline-flex;
  align-items: center;
  gap: 8px 12px;
  flex-wrap: wrap;
  justify-content: center;
  font-size: 12px;
  color: var(--portal-footer-muted-text);
}
</style>
