import http from '@/utils/http'
import type { PaginationData } from '@/types/http'
import type {
  UserInfo,
  LoginParams,
  LoginResult,
  UserListParams,
  CreateUserParams,
  UpdateUserParams,
} from './types'

/** API 路径前缀 */
const API_PREFIX = '/user'

/**
 * 用户登录
 * @param data 登录参数
 */
export function login(data: LoginParams) {
  return http.post<LoginResult>('/auth/login', data, {
    showLoading: true,
    showError: true,
    withToken: false,
  })
}

/**
 * 用户登出
 */
export function logout() {
  return http.post<void>('/auth/logout')
}

/**
 * 刷新 Token
 */
export function refreshToken(refreshToken: string) {
  return http.post<LoginResult>('/auth/refresh', { refreshToken }, {
    withToken: false,
  })
}

/**
 * 获取当前用户信息
 */
export function getCurrentUser() {
  return http.get<UserInfo>('/auth/current')
}

/**
 * 获取用户列表
 * @param params 查询参数
 */
export function getUserList(params: UserListParams) {
  return http.get<PaginationData<UserInfo>>(`${API_PREFIX}/list`, params, {
    showLoading: true,
  })
}

/**
 * 获取用户详情
 * @param id 用户ID
 */
export function getUserDetail(id: number) {
  return http.get<UserInfo>(`${API_PREFIX}/${id}`)
}

/**
 * 创建用户
 * @param data 用户数据
 */
export function createUser(data: CreateUserParams) {
  return http.post<UserInfo>(API_PREFIX, data, {
    showLoading: true,
    showErrorMessage: true,
  })
}

/**
 * 更新用户
 * @param data 用户数据
 */
export function updateUser(data: UpdateUserParams) {
  const { id, ...params } = data
  return http.put<UserInfo>(`${API_PREFIX}/${id}`, params, {
    showLoading: true,
  })
}

/**
 * 删除用户
 * @param id 用户ID
 */
export function deleteUser(id: number) {
  return http.delete<void>(`${API_PREFIX}/${id}`, undefined, {
    showLoading: true,
  })
}

/**
 * 批量删除用户
 * @param ids 用户ID列表
 */
export function batchDeleteUsers(ids: number[]) {
  return http.post<void>(`${API_PREFIX}/batch-delete`, { ids }, {
    showLoading: true,
  })
}

/**
 * 修改密码
 * @param data 密码数据
 */
export function changePassword(data: { oldPassword: string; newPassword: string }) {
  return http.put<void>(`${API_PREFIX}/password`, data)
}

/**
 * 重置密码
 * @param id 用户ID
 */
export function resetPassword(id: number) {
  return http.put<void>(`${API_PREFIX}/${id}/reset-password`)
}

/**
 * 导出用户数据
 */
export function exportUsers(params?: UserListParams) {
  return http.download(`${API_PREFIX}/export`, params, 'users.xlsx', {
    showLoading: true,
  })
}

/**
 * 导入用户数据
 * @param file 文件
 */
export function importUsers(file: File) {
  return http.upload<{ success: number; failed: number }>(`${API_PREFIX}/import`, file, {
    showLoading: true,
    onProgress: (percent) => {
      console.log(`上传进度: ${percent}%`)
    },
  })
}
