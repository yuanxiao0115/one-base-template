import {
  definePortalMaterial,
  definePortalMaterialCategory,
  definePortalMaterialExtension,
  type PortalMaterialExtension
} from '@one-base-template/portal-engine';
import PortalSimpleHelloCardIndex from '../simple-hello-card/index.vue';

// admin 侧唯一扩展入口：直接在这里罗列“需要注册到 PortalManagement 的物料扩展”。
// 约束：不保留 examples/demo 分叉目录，新增物料时只维护这个数组。
const portalAdminDemoCategory = definePortalMaterialCategory({
  id: 'portal-admin',
  title: '管理端示例',
  name: '管理端示例',
  cmptTypeName: '管理端示例'
});

const portalSimpleHelloCardMaterial = definePortalMaterial({
  id: 'portal-simple-hello-card',
  type: 'portal-simple-hello-card',
  name: '简易欢迎卡片',
  icon: 'ri:chat-smile-2-line',
  width: 12,
  height: 8,
  config: {
    index: {
      name: 'portal-simple-hello-card-index'
    }
  },
  components: {
    index: PortalSimpleHelloCardIndex
  }
});

export const PORTAL_ADMIN_MATERIAL_EXTENSIONS = [
  definePortalMaterialExtension({
    category: portalAdminDemoCategory,
    materials: [portalSimpleHelloCardMaterial]
  })
] satisfies PortalMaterialExtension[];
