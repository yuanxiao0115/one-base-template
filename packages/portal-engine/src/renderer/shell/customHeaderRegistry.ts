import type { Component } from 'vue';

import NewsGovernmentHeader from './custom/NewsGovernmentHeader.vue';

export const customHeaderRegistry: Record<string, Component> = {
  'news-government-v1': NewsGovernmentHeader
};
