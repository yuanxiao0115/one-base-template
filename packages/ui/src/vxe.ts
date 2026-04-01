import './styles/iconfont.css';

export { default as VxeTable } from './components/table/VxeTable.vue';
export {
  OneUiPlugin as OneUiVxePlugin,
  registerOneUiComponents as registerOneVxeUiComponents,
  type OneUiPluginOptions as OneUiVxePluginOptions,
  type OneUiComponentName as OneUiVxeComponentName
} from './plugin';
export {
  OneUiPlugin,
  registerOneUiComponents,
  type OneUiPluginOptions,
  type OneUiComponentName
} from './plugin';
export { default } from './plugin';
