import type { AppModuleManifest } from '@one-base-template/core';
import { moduleManifest } from './manifest';
import layoutRoutes from './routes';

const homeModule: AppModuleManifest = {
  ...moduleManifest,
  apiNamespace: 'home',
  routes: {
    layout: layoutRoutes
  }
};

export default homeModule;
