/// <reference types="vue/macros-global" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue';
  const component: DefineComponent<{}, {}, any>;
  export default component;
}

declare module '*.png' {
  const src: string;
  export default src;
}

declare module '*.jpg' {
  const src: string;
  export default src;
}

declare module '*.jpeg' {
  const src: string;
  export default src;
}

declare module '*.webp' {
  const src: string;
  export default src;
}

declare module 'parser_x.js' {
  export interface ParserXApi {
    initOFDViewer: (config: Record<string, unknown>) => void;
    openOFD: (file: string | File | ArrayBuffer | Blob) => void;
    setScale?: (scale: number) => void;
    [key: string]: unknown;
  }

  const parserX: ParserXApi;
  export default parserX;
}

declare module 'ofdview-vue3' {
  import type { App, DefineComponent } from 'vue';

  export const Ofdview: DefineComponent<Record<string, unknown>, Record<string, unknown>, any>;
  const plugin: {
    install: (app: App) => void;
  };

  export default plugin;
}

declare module '@wangeditor/editor-for-vue' {
  import type { DefineComponent } from 'vue';

  export const Editor: DefineComponent<Record<string, unknown>, Record<string, unknown>, any>;
  export const Toolbar: DefineComponent<Record<string, unknown>, Record<string, unknown>, any>;
}

declare module '@vue-office/docx/lib/v3/index.js' {
  import type { DefineComponent } from 'vue';

  const VueOfficeDocx: DefineComponent<Record<string, unknown>, Record<string, unknown>, any>;
  export default VueOfficeDocx;
}

declare module '@vue-office/excel/lib/v3/index.js' {
  import type { DefineComponent } from 'vue';

  const VueOfficeExcel: DefineComponent<Record<string, unknown>, Record<string, unknown>, any>;
  export default VueOfficeExcel;
}

declare module '@vue-office/pptx/lib/v3/index.js' {
  import type { DefineComponent } from 'vue';

  const VueOfficePptx: DefineComponent<Record<string, unknown>, Record<string, unknown>, any>;
  export default VueOfficePptx;
}

declare module '@vue-office/pdf/lib/v3/index.js' {
  import type { DefineComponent } from 'vue';

  const VueOfficePdf: DefineComponent<Record<string, unknown>, Record<string, unknown>, any>;
  export default VueOfficePdf;
}
