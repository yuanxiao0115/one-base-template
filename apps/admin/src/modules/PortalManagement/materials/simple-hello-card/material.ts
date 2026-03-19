import {
  definePortalMaterial,
  definePortalMaterialCategory
} from '@one-base-template/portal-engine';

import PortalSimpleHelloCardContent from './content.vue';
import PortalSimpleHelloCardIndex from './index.vue';
import PortalSimpleHelloCardStyle from './style.vue';

import { createPortalSimpleHelloCardMaterialConfig } from './defaults';

const portalSimpleHelloCardCategory = definePortalMaterialCategory({
  id: 'portal-admin',
  title: '管理端示例',
  name: '管理端示例',
  cmptTypeName: '管理端示例'
});

export const PORTAL_ADMIN_MATERIAL = definePortalMaterial({
  id: 'portal-simple-hello-card',
  type: 'portal-simple-hello-card',
  name: '简易欢迎卡片',
  icon: 'ri:chat-smile-2-line',
  width: 12,
  height: 8,
  category: portalSimpleHelloCardCategory,
  config: createPortalSimpleHelloCardMaterialConfig(),
  components: {
    index: PortalSimpleHelloCardIndex,
    content: PortalSimpleHelloCardContent,
    style: PortalSimpleHelloCardStyle
  }
});
