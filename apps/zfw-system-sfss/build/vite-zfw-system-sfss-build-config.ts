import {
  createOneAppCodeSplitting,
  createOneAppPreloadDependenciesResolver
} from '../../../scripts/vite/manual-chunks';

const adminLiteFeatureChunks = [
  {
    name: 'zfw-system-sfss-home',
    patterns: ['/apps/zfw-system-sfss/src/modules/home/']
  },
  {
    name: 'zfw-system-sfss-log-management',
    patterns: ['/apps/zfw-system-sfss/src/modules/LogManagement/']
  },
  {
    name: 'zfw-system-sfss-system-management',
    patterns: ['/apps/zfw-system-sfss/src/modules/SystemManagement/']
  },
  {
    name: 'admin-management',
    patterns: [
      '/apps/zfw-system-sfss/src/modules/adminManagement/',
      '/apps/zfw-system-sfss/src/components/PersonnelSelector/'
    ]
  }
];

export const ZfwSystemSfssBuildConfig = {
  chunkSizeWarningLimit: 3000,
  modulePreload: {
    resolveDependencies: createOneAppPreloadDependenciesResolver({
      appName: 'zfw-system-sfss'
    })
  },
  rollupOptions: {
    output: {
      codeSplitting: createOneAppCodeSplitting({
        appName: 'zfw-system-sfss',
        featureChunks: adminLiteFeatureChunks
      })
    }
  }
};
