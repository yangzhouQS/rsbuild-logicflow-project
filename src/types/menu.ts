import type { Component, Raw } from 'vue'
import type { RouteRecordRaw } from 'vue-router'

/**
 * 菜单项图标类型
 */
export type MenuItemIcon = string | Component

/**
 * 菜单项接口定义
 */
export interface MenuItem {
  /** 菜单唯一标识 */
  key: string
  /** 菜单标题 */
  title: string
  /** 菜单图标 */
  icon?: MenuItemIcon
  /** 路由路径 */
  path?: string
  /** 路由名称 */
  name?: string
  /** 是否禁用 */
  disabled?: boolean
  /** 是否隐藏菜单项 */
  hidden?: boolean
  /** 外部链接 */
  external?: boolean
  /** 子菜单 */
  children?: MenuItem[]
  /** 菜单元数据 */
  meta?: MenuMeta
}

/**
 * 菜单元数据
 */
export interface MenuMeta {
  /** 菜单标题 */
  title: string
  /** 菜单图标 */
  icon?: MenuItemIcon
  /** 是否缓存页面 */
  keepAlive?: boolean
  /** 是否隐藏菜单 */
  hidden?: boolean
  /** 是否固定在tab栏 */
  affix?: boolean
  /** 权限标识 */
  auth?: string | string[]
  /** 面包屑是否显示 */
  breadcrumb?: boolean
  /** 排序权重 */
  order?: number
}

/**
 * 扩展的路由记录类型
 */
export interface AppRouteRecordRaw extends Omit<Raw<RouteRecordRaw>, 'children'> {
  /** 路由名称 */
  name?: string
  /** 路由路径 */
  path: string
  /** 路由元信息 */
  meta?: MenuMeta
  /** 子路由 */
  children?: AppRouteRecordRaw[]
  /** 路由组件 */
  component?: Raw<RouteRecordRaw>['component']
  /** 重定向 */
  redirect?: string
}

/**
 * 侧边栏菜单组件 Props
 */
export interface SidebarMenuProps {
  /** 菜单数据 */
  items: MenuItem[]
  /** 是否折叠 */
  collapsed?: boolean
  /** 默认激活的菜单项 */
  defaultActive?: string
  /** 默认展开的子菜单 */
  defaultOpeneds?: string[]
  /** 背景颜色 */
  backgroundColor?: string
  /** 文字颜色 */
  textColor?: string
  /** 激活项文字颜色 */
  activeTextColor?: string
  /** 是否唯一展开 */
  uniqueOpened?: boolean
  /** 菜单宽度 */
  menuWidth?: string
}

/**
 * 递归子菜单组件 Props
 */
export interface SubMenuProps {
  /** 菜单项 */
  item: MenuItem
  /** 基础路径 */
  basePath?: string
  /** 菜单层级 */
  level?: number
}

/**
 * 菜单渲染项（用于扁平化处理后的菜单）
 */
export interface FlattenedMenuItem extends MenuItem {
  /** 完整路径 */
  fullPath: string
  /** 父级路径 */
  parentPath?: string
  /** 层级深度 */
  depth: number
}
