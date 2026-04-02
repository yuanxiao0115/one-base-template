import { createAuthRouteMeta, defineRouteMeta } from '@/router/meta';
import type { RouteRecordRaw } from 'vue-router';

interface LegacyLeafRoute {
  path: string;
  name: string;
  title: string;
}

interface LegacyGroupRoute {
  rootPath: string;
  rootName: string;
  rootTitle: string;
  icon: string;
  rank: number;
  redirect: string;
  children: LegacyLeafRoute[];
}

const legacyPageComponent = () => import('./pages/SystemSfssLegacyPage.vue');

const legacyRouteGroups: LegacyGroupRoute[] = [
  {
    rootPath: '/law-supervison/sunshine-petition',
    rootName: 'SystemSfssSunshinePetition',
    rootTitle: '阳光信访',
    icon: 'system',
    rank: 52,
    redirect: '/law-supervison/sunshine-petition/shi',
    children: [
      {
        path: '/law-supervison/sunshine-petition/shi',
        name: 'SystemSfssSunshinePetitionCity',
        title: '到市访'
      },
      {
        path: '/law-supervison/sunshine-petition/sheng',
        name: 'SystemSfssSunshinePetitionProvince',
        title: '赴省访'
      },
      {
        path: '/law-supervison/sunshine-petition/jing',
        name: 'SystemSfssSunshinePetitionCapital',
        title: '进京访'
      }
    ]
  },
  {
    rootPath: '/law-supervison/petition-supervision',
    rootName: 'SystemSfssPetitionSupervision',
    rootTitle: '信访督查',
    icon: 'application',
    rank: 53,
    redirect: '/law-supervison/petition-supervision/collaboration-statistics',
    children: [
      {
        path: '/law-supervison/petition-supervision/collaboration-statistics',
        name: 'SystemSfssPetitionSupervisionCollaboration',
        title: '协同信访指标统计'
      },
      {
        path: '/law-supervison/petition-supervision/petition-topic-contrast',
        name: 'SystemSfssPetitionSupervisionTopicContrast',
        title: '信访专题对比'
      },
      {
        path: '/law-supervison/petition-supervision/dispute-type-contrast',
        name: 'SystemSfssPetitionSupervisionDisputeContrast',
        title: '纠纷类型对比'
      }
    ]
  },
  {
    rootPath: '/law-supervison/petition-processing',
    rootName: 'SystemSfssPetitionProcessing',
    rootTitle: '信访件处理',
    icon: 'application',
    rank: 54,
    redirect: '/law-supervison/petition-processing/petition-evaluation',
    children: [
      {
        path: '/law-supervison/petition-processing/petition-evaluation',
        name: 'SystemSfssPetitionProcessingEvaluation',
        title: '信访件评估'
      },
      {
        path: '/law-supervison/petition-processing/petition-urge',
        name: 'SystemSfssPetitionProcessingUrge',
        title: '信访件督办'
      },
      {
        path: '/law-supervison/petition-processing/petition-transfer',
        name: 'SystemSfssPetitionProcessingTransfer',
        title: '信访件转办交办'
      },
      {
        path: '/law-supervison/petition-processing/petition-assist',
        name: 'SystemSfssPetitionProcessingAssist',
        title: '信访件协办'
      },
      {
        path: '/law-supervison/petition-processing/petition-feedback',
        name: 'SystemSfssPetitionProcessingFeedback',
        title: '信访件反馈'
      },
      {
        path: '/law-supervison/petition-processing/petition-close',
        name: 'SystemSfssPetitionProcessingClose',
        title: '信访件终结'
      },
      {
        path: '/law-supervison/petition-processing/petition-archive',
        name: 'SystemSfssPetitionProcessingArchive',
        title: '信访件归档'
      }
    ]
  },
  {
    rootPath: '/law-supervison/special-petition-management',
    rootName: 'SystemSfssSpecialPetitionManagement',
    rootTitle: '特殊信访件管理',
    icon: 'application',
    rank: 55,
    redirect: '/law-supervison/special-petition-management/judicial-assistance',
    children: [
      {
        path: '/law-supervison/special-petition-management/judicial-assistance',
        name: 'SystemSfssSpecialPetitionJudicialAssistance',
        title: '司法救助'
      },
      {
        path: '/law-supervison/special-petition-management/case-closure-management',
        name: 'SystemSfssSpecialPetitionCaseClosure',
        title: '终结案件管理'
      }
    ]
  },
  {
    rootPath: '/law-supervison/petition-query',
    rootName: 'SystemSfssPetitionQuery',
    rootTitle: '信访件查询',
    icon: 'application',
    rank: 56,
    redirect: '/law-supervison/petition-query/query-statistics',
    children: [
      {
        path: '/law-supervison/petition-query/query-statistics',
        name: 'SystemSfssPetitionQueryStatistics',
        title: '查询统计'
      }
    ]
  },
  {
    rootPath: '/lawsuit-petitions/litigation-related/relatedMenu',
    rootName: 'SystemSfssLitigationRelated',
    rootTitle: '涉法涉诉',
    icon: 'role-permission',
    rank: 2,
    redirect: '/lawsuit-petitions/litigation-related/police',
    children: [
      {
        path: '/lawsuit-petitions/litigation-related/police',
        name: 'SystemSfssLitigationPolice',
        title: '公安涉法涉诉'
      },
      {
        path: '/lawsuit-petitions/litigation-related/prosecution',
        name: 'SystemSfssLitigationProsecution',
        title: '检察涉法涉诉'
      },
      {
        path: '/lawsuit-petitions/litigation-related/court',
        name: 'SystemSfssLitigationCourt',
        title: '法院涉法涉诉'
      }
    ]
  }
];

function createGroupRoutes(group: LegacyGroupRoute): RouteRecordRaw[] {
  const parentRoute: RouteRecordRaw = {
    path: group.rootPath,
    name: group.rootName,
    redirect: group.redirect,
    meta: defineRouteMeta({
      title: group.rootTitle,
      icon: group.icon,
      rank: group.rank
    })
  };

  const childRoutes = group.children.map((item) => ({
    path: item.path,
    name: item.name,
    component: legacyPageComponent,
    meta: defineRouteMeta({
      title: item.title,
      keepAlive: true
    })
  }));

  return [parentRoute, ...childRoutes];
}

const legacyRoutes = legacyRouteGroups.flatMap((group) => createGroupRoutes(group));

export default [
  {
    path: '/system-sfss/index',
    name: 'SystemSfssIndex',
    component: () => import('./pages/SystemSfssIndexPage.vue'),
    meta: createAuthRouteMeta({
      title: '涉法涉诉系统',
      hideInMenu: true,
      keepAlive: true
    })
  },
  ...legacyRoutes
] satisfies RouteRecordRaw[];
