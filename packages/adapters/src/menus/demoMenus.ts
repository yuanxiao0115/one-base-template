import type { AppMenuItem } from '@standard-base-tamplate/core';

/**
 * Demo 菜单：既可作为 remote mock 返回，也可作为 staticMenus 直接传给 core。
 */
export function createDemoMenus(): AppMenuItem[] {
  return [
    {
      path: '/home',
      title: '首页',
      order: 10,
      keepAlive: true
    },
    {
      path: '/demo',
      title: '示例',
      order: 20,
      children: [
        {
          path: '/demo/page-a',
          title: '页面 A',
          order: 1,
          keepAlive: true
        },
        {
          path: '/demo/page-b',
          title: '页面 B',
          order: 2,
          keepAlive: true
        }
      ]
    },
    {
      path: 'https://example.com',
      title: '外链示例',
      order: 30,
      external: true
    }
  ];
}
