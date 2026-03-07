import type { PaginationData, PaginationParams } from '@/types/http'

/** 用户信息 */
export interface UserInfo {
  id: number
  username: string
  nickname: string
  email: string
  phone: string
  avatar: string
  status: 0 | 1// 0: 禁用, 1: 启用
  roles: string[]
  deptId: number
  createdAt: string
  updatedAt: string
}

/** 登录请求参数 */
export interface LoginParams {
  username: string
  password: string
  captcha?: string
  uuid?: string
}

/** 登录响应数据 */
export interface LoginResult {
  token: string
  refreshToken: string
  expiresIn: number
  user: UserInfo
}

/** 用户列表查询参数 */
export interface UserListParams extends PaginationParams {
  username?: string
  status?: number
  deptId?: number
  startTime?: string
  endTime?: string
}

/** 创建用户参数 */
export interface CreateUserParams {
  username: string
  password: string
  nickname: string
  email: string
  phone: string
  roleIds: number[]
  deptId: number
}

/** 更新用户参数 */
export interface UpdateUserParams {
  id: number
  nickname?: string
  email?: string
  phone?: string
  roleIds?: number[]
  deptId?: number
  status?: 0 | 1
}

/** 角色信息 */
export interface RoleInfo {
  id: number
  name: string
  code: string
  description: string
  permissions: string[]
  status: 0 | 1
  createdAt: string
  updatedAt: string
}

/** 角色列表查询参数 */
export interface RoleListParams extends PaginationParams {
  name?: string
  code?: string
  status?: number
}

/** 菜单信息 */
export interface MenuInfo {
  id: number
  parentId: number
  name: string
  path: string
  component: string
  icon: string
  sort: number
  visible: boolean
  status: 0 | 1
  children?: MenuInfo[]
}

/** 仪表盘统计数据 */
export interface DashboardStats {
  totalUsers: number
  activeUsers: number
  totalOrders: number
  totalRevenue: number
  userGrowth: number
  orderGrowth: number
  revenueGrowth: number
}

/** 图表数据 */
export interface ChartData {
  dates: string[]
  values: number[]
}
