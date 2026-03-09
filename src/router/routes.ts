import type { AppRouteRecordRaw } from '../types';
import { FlowDesign } from '../views/flow/design/flow-design.tsx';

/** 基础路由 */
export const constantRoutes: AppRouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    meta: {
      title: '登录',
      hidden: true,
    },
    component: () => import('@/views/login'),
  },
  {
    path: '/404',
    name: 'NotFound',
    meta: {
      title: '404',
      hidden: true,
    },
    component: () => import('@/views/error'),
  },
]

/** 动态路由（需要权限） */
export const asyncRoutes: AppRouteRecordRaw[] = [
  {
    path: '/',
    name: 'Root',
    redirect: '/dashboard',
    meta: {
      title: '首页',
      icon: 'HomeFilled',
    },
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        meta: {
          title: '仪表盘',
          icon: 'Odometer',
          affix: true,
        },
        component: () => import('@/views/dashboard'),
      },
    ],
  },

	{
		path: '/flow',
		name: 'FlowPage',
		redirect: '/flow/design',
		meta: {
			title: '流程管理',
			icon: 'Setting',
			order: 100,
		},
		children: [
			{
				path: 'design',
				name: 'FlowDesign',
				meta: {
					title: '流程设计',
					icon: 'User',
					auth: ['admin', 'user:view'],
				},
				component: FlowDesign,
			},
		],
	},
  {
    path: '/system',
    name: 'System',
    redirect: '/system/user',
    meta: {
      title: '系统管理',
      icon: 'Setting',
      order: 100,
    },
    children: [
      {
        path: 'user',
        name: 'UserManagement',
        meta: {
          title: '用户管理',
          icon: 'User',
          auth: ['admin', 'user:view'],
        },
        component: () => import('@/views/system/user'),
      },
      {
        path: 'role',
        name: 'RoleManagement',
        meta: {
          title: '角色管理',
          icon: 'UserFilled',
          auth: ['admin'],
        },
        component: () => import('@/views/system/role'),
      },
      {
        path: 'menu',
        name: 'MenuManagement',
        meta: {
          title: '菜单管理',
          icon: 'Menu',
          auth: ['admin'],
        },
        component: () => import('@/views/system/menu'),
      },
    ],
  },
  {
    path: '/components',
    name: 'Components',
    redirect: '/components/icon',
    meta: {
      title: '组件示例',
      icon: 'Grid',
      order: 50,
    },
    children: [
      {
        path: 'icon',
        name: 'IconExample',
        meta: {
          title: '图标',
          icon: 'Collection',
        },
        component: () => import('@/views/components/icon'),
      },
      {
        path: 'table',
        name: 'TableExample',
        meta: {
          title: '表格',
          icon: 'Grid',
        },
        component: () => import('@/views/components/table'),
      },
      {
        path: 'form',
        name: 'FormExample',
        meta: {
          title: '表单',
          icon: 'Document',
        },
        component: () => import('@/views/components/form'),
      },
    ],
  },
  {
    path: '/nested',
    name: 'Nested',
    redirect: '/nested/level1',
    meta: {
      title: '多级菜单',
      icon: 'Files',
      order: 30,
    },
    children: [
      {
        path: 'level1',
        name: 'NestedLevel1',
        meta: {
          title: '一级菜单',
          icon: 'Folder',
        },
        component: () => import('@/views/nested/level1'),
        children: [
          {
            path: 'level2',
            name: 'NestedLevel2',
            meta: {
              title: '二级菜单',
              icon: 'FolderOpened',
            },
            component: () => import('@/views/nested/level2'),
            children: [
              {
                path: 'level3',
                name: 'NestedLevel3',
                meta: {
                  title: '三级菜单',
                  icon: 'Document',
                },
                component: () => import('@/views/nested/level3'),
              },
            ],
          },
        ],
      },
      {
        path: 'another',
        name: 'NestedAnother',
        meta: {
          title: '另一嵌套',
          icon: 'Document',
        },
        component: () => import('@/views/nested/another'),
      },
    ],
  },
  // 404 页面必须放在最后
  {
    path: '/:pathMatch(.*)*',
    name: 'CatchAll',
    redirect: '/404',
    meta: {
      hidden: true,
    },
  },
]
