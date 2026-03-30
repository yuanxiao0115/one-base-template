import vue from '@vitejs/plugin-vue';
import AutoImport from 'unplugin-auto-import/vite';
import Components from 'unplugin-vue-components/vite';
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers';
import { createAdminLitePruneLoginHtmlAssetsPlugin } from './vite-prune-login-plugin';

export function createAdminLitePlugins() {
  return [
    vue(),
    AutoImport({
      imports: [
        'vue',
        'vue-router',
        'pinia',
        {
          '@one-base-template/core': ['useTable', 'useCrudPage']
        },
        {
          '@one-base-template/ui': ['obConfirm', 'message', 'closeAllMessage', 'useEntityEditor']
        },
        {
          from: '@one-base-template/core',
          imports: ['CrudErrorContext', 'CrudFormLike'],
          type: true
        },
        {
          from: '@one-base-template/ui',
          imports: ['TablePagination'],
          type: true
        }
      ],
      dts: 'src/types/auto-imports.d.ts',
      resolvers: [ElementPlusResolver()]
    }),
    Components({
      dts: 'src/types/components.d.ts',
      resolvers: [ElementPlusResolver({ importStyle: 'css' })]
    }),
    createAdminLitePruneLoginHtmlAssetsPlugin()
  ];
}
