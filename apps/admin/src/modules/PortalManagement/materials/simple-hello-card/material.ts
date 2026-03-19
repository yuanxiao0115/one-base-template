import {
  definePortalMaterial,
  definePortalMaterialCategory
} from '@one-base-template/portal-engine';

import PortalSimpleHelloCardContent from './content.vue';
import {
  createPortalSimpleHelloCardMaterialConfig,
  PORTAL_SIMPLE_HELLO_CARD_CATEGORY,
  PORTAL_SIMPLE_HELLO_CARD_MATERIAL_ID,
  PORTAL_SIMPLE_HELLO_CARD_MATERIAL_TYPE
} from './defaults';
import PortalSimpleHelloCardIndex from './index.vue';
import PortalSimpleHelloCardStyle from './style.vue';

const portalSimpleHelloCardCategory = definePortalMaterialCategory(
  PORTAL_SIMPLE_HELLO_CARD_CATEGORY
);

export const PORTAL_ADMIN_MATERIAL = definePortalMaterial({
  id: PORTAL_SIMPLE_HELLO_CARD_MATERIAL_ID,
  type: PORTAL_SIMPLE_HELLO_CARD_MATERIAL_TYPE,
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
