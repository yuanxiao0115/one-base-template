import type { AppModuleManifest } from '@one-base-template/core';
import { moduleManifest } from './manifest';
import layoutRoutes from './routes';

const demoModule: AppModuleManifest = {
  ...moduleManifest,
  apiNamespace: 'demo',
  routes: {
    layout: layoutRoutes
  }
};

export default demoModule;
