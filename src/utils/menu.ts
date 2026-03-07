import type { MenuItem, AppRouteRecordRaw } from '@/types'
import type { RouteRecordRaw } from 'vue-router'

/**
 * 从路由配置生成菜单数据
 */
export function generateMenus(routes: AppRouteRecordRaw[]): MenuItem[] {
  const menus: MenuItem[] = []
  
  for (const route of routes) {
    // 跳过隐藏的路由
    if (route.meta?.hidden) {
      continue
    }
    
    const menu = routeToMenu(route)
    
    // 递归处理子路由
    if (route.children && route.children.length > 0) {
      const childMenus = generateMenus(route.children)
      if (childMenus.length > 0) {
        menu.children = childMenus
      }
    }
    
    menus.push(menu)
  }
  
  // 按照order排序
  return menus.sort((a, b) => {
    const orderA = a.meta?.order ?? 999
    const orderB = b.meta?.order ?? 999
    return orderA - orderB
  })
}

/**
 * 将路由转换为菜单项
 */
function routeToMenu(route: AppRouteRecordRaw): MenuItem {
  return {
    key: route.name?.toString() ?? route.path,
    title: route.meta?.title ?? route.name?.toString() ?? route.path,
    icon: route.meta?.icon,
    path: route.path,
    name: route.name?.toString(),
    external: isExternalLink(route.redirect),
    meta: route.meta,
  }
}

/**
 * 判断是否为外部链接
 */
export function isExternalLink(path?: string): boolean {
  if (!path) return false
  return /^(https?:|mailto:|tel:)/.test(path)
}

/**
 * 扁平化菜单数据
 */
export function flattenMenus(menus: MenuItem[], parentPath = '', depth = 0): MenuItem[] {
  const result: MenuItem[] = []
  
  for (const menu of menus) {
    const fullPath = resolvePath(menu.path, parentPath)
    result.push({
      ...menu,
      path: fullPath,
    })
    
    if (menu.children && menu.children.length > 0) {
      result.push(...flattenMenus(menu.children, fullPath, depth + 1))
    }
  }
  
  return result
}

/**
 * 解析路径
 */
export function resolvePath(path?: string, basePath = ''): string {
  if (!path) return basePath
  
  // 外部链接直接返回
  if (isExternalLink(path)) {
    return path
  }
  
  // 绝对路径直接返回
  if (path.startsWith('/')) {
    return path
  }
  
  // 相对路径拼接
  if (basePath.endsWith('/')) {
    return `${basePath}${path}`
  }
  
  return `${basePath}/${path}`
}

/**
 * 查找菜单项
 */
export function findMenuByPath(menus: MenuItem[], path: string): MenuItem | null {
  for (const menu of menus) {
    if (menu.path === path) {
      return menu
    }
    
    if (menu.children) {
      const found = findMenuByPath(menu.children, path)
      if (found) return found
    }
  }
  
  return null
}

/**
 * 获取菜单的所有父级路径
 */
export function getMenuParentPaths(menus: MenuItem[], targetPath: string, parentPaths: string[] = []): string[] | null {
  for (const menu of menus) {
    const currentPath = menu.path ?? ''
    
    if (currentPath === targetPath) {
      return parentPaths
    }
    
    if (menu.children && menu.children.length > 0) {
      const result = getMenuParentPaths(menu.children, targetPath, [...parentPaths, currentPath])
      if (result) return result
    }
  }
  
  return null
}

/**
 * 过滤菜单（根据权限）
 */
export function filterMenusByAuth(menus: MenuItem[], userAuth: string[]): MenuItem[] {
  return menus
    .filter((menu) => {
      const auth = menu.meta?.auth
      if (!auth) return true
      
      const authList = Array.isArray(auth) ? auth : [auth]
      return authList.some((a) => userAuth.includes(a))
    })
    .map((menu) => {
      if (menu.children) {
        return {
          ...menu,
          children: filterMenusByAuth(menu.children, userAuth),
        }
      }
      return menu
    })
    .filter((menu) => {
      // 如果子菜单全部被过滤掉，则隐藏父菜单
      if (menu.children && menu.children.length === 0) {
        return false
      }
      return true
    })
}
