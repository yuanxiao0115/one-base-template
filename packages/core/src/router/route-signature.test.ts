import { describe, expect, it } from 'vite-plus/test';
import type { RouteRecordRaw } from 'vue-router';
import { getRouteSignature } from './route-signature';

function createRoutes(): RouteRecordRaw[] {
  const routeComponent = {} as RouteRecordRaw['component'];
  const designerRoute = {
    path: 'design',
    name: 'PortalDesigner',
    component: routeComponent,
    meta: {
      title: '设计器',
      hiddenTab: true
    }
  } as RouteRecordRaw;

  const portalSettingRoute = {
    path: '/portal/setting',
    name: 'PortalSetting',
    component: routeComponent,
    meta: {
      title: '门户配置',
      activePath: '/portal/setting',
      skipMenuAuth: true
    },
    children: [designerRoute]
  } as RouteRecordRaw;

  const loginRoute = {
    path: '/login',
    name: 'Login',
    redirect: {
      path: '/login/index',
      query: {
        from: 'entry'
      }
    }
  } as RouteRecordRaw;

  return [portalSettingRoute, loginRoute];
}

describe('router/route-signature', () => {
  it('应对等价路由生成确定性签名', () => {
    const signatureA = getRouteSignature(createRoutes());
    const routeComponent = {} as RouteRecordRaw['component'];
    const designerRoute = {
      path: 'design',
      name: 'PortalDesigner',
      component: routeComponent,
      meta: {
        hiddenTab: true,
        title: '设计器'
      }
    } as RouteRecordRaw;
    const portalSettingRoute = {
      path: '/portal/setting',
      name: 'PortalSetting',
      component: routeComponent,
      meta: {
        skipMenuAuth: true,
        activePath: '/portal/setting',
        title: '门户配置'
      },
      children: [designerRoute]
    } as RouteRecordRaw;
    const loginRoute = {
      path: '/login',
      name: 'Login',
      redirect: {
        query: {
          from: 'entry'
        },
        path: '/login/index'
      }
    } as RouteRecordRaw;
    const signatureB = getRouteSignature([portalSettingRoute, loginRoute]);

    expect(signatureA).toBe(signatureB);
  });

  it('应对路由顺序变化生成不同签名', () => {
    const routes = createRoutes();
    const reversedRoutes = [...routes].reverse();

    expect(getRouteSignature(routes)).not.toBe(getRouteSignature(reversedRoutes));
  });
});
