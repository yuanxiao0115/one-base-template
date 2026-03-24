import {
  createOneAppCodeSplitting,
  createOneAppPreloadDependenciesResolver
} from '../../../scripts/vite/manual-chunks';

const adminFeatureChunks = [
  {
    name: 'admin-home',
    patterns: ['/apps/admin/src/modules/home/']
  },
  {
    name: 'admin-log-management',
    patterns: ['/apps/admin/src/modules/LogManagement/']
  },
  {
    name: 'admin-system-management',
    patterns: ['/apps/admin/src/modules/SystemManagement/']
  },
  {
    name: 'admin-management',
    patterns: [
      '/apps/admin/src/modules/adminManagement/',
      '/apps/admin/src/components/PersonnelSelector/'
    ]
  },
  {
    name: 'admin-portal',
    patterns: ['/apps/admin/src/modules/PortalManagement/']
  }
];

export const adminBuildConfig = {
  chunkSizeWarningLimit: 3000,
  modulePreload: {
    resolveDependencies: createOneAppPreloadDependenciesResolver({
      appName: 'admin'
    })
  },
  rollupOptions: {
    output: {
      codeSplitting: createOneAppCodeSplitting({
        appName: 'admin',
        featureChunks: adminFeatureChunks
      })
    }
  }
};
