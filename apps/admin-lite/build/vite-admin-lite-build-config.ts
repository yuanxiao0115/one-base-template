import {
  createOneAppCodeSplitting,
  createOneAppPreloadDependenciesResolver
} from '../../../scripts/vite/manual-chunks';

const adminLiteFeatureChunks = [
  {
    name: 'admin-lite-home',
    patterns: ['/apps/admin-lite/src/modules/home/']
  },
  {
    name: 'admin-lite-log-management',
    patterns: ['/apps/admin-lite/src/modules/LogManagement/']
  },
  {
    name: 'admin-lite-system-management',
    patterns: ['/apps/admin-lite/src/modules/SystemManagement/']
  },
  {
    name: 'admin-management',
    patterns: [
      '/apps/admin-lite/src/modules/adminManagement/',
      '/apps/admin-lite/src/components/PersonnelSelector/'
    ]
  }
];

export const adminLiteBuildConfig = {
  chunkSizeWarningLimit: 3000,
  modulePreload: {
    resolveDependencies: createOneAppPreloadDependenciesResolver({
      appName: 'admin-lite'
    })
  },
  rollupOptions: {
    output: {
      codeSplitting: createOneAppCodeSplitting({
        appName: 'admin-lite',
        featureChunks: adminLiteFeatureChunks
      })
    }
  }
};
