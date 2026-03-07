/**
 * 环境配置
 * 根据不同环境自动切换 API 基础地址
 */

/** 环境类型 */
type EnvType = 'development' | 'test' | 'production'

/** 获取当前环境 */
export const getEnv = (): EnvType => {
  // Rsbuild 使用 import.meta.env
  const mode = import.meta.env.MODE
  if (mode === 'production') return 'production'
  if (mode === 'test') return 'test'
  return 'development'
}

/** 环境配置接口 */
interface EnvConfig {
  /** API 基础地址 */
  baseURL: string
  /** 请求超时时间(ms) */
  timeout: number
  /** 应用标题 */
  title: string
  /** 是否开启 Mock */
  enableMock: boolean
}

/** 各环境配置 */
const envConfigs: Record<EnvType, EnvConfig> = {
  development: {
    baseURL: '/api',
    timeout: 30000,
    title: '开发环境',
    enableMock: true,
  },
  test: {
    baseURL: 'https://test-api.example.com',
    timeout: 30000,
    title: '测试环境',
    enableMock: false,
  },
  production: {
    baseURL: 'https://api.example.com',
    timeout: 30000,
    title: '生产环境',
    enableMock: false,
  },
}

/** 获取当前环境配置 */
export const getEnvConfig = (): EnvConfig => {
  const env = getEnv()
  return envConfigs[env]
}

/** 导出常用配置 */
export const { baseURL, timeout, title, enableMock } = getEnvConfig()

/** Token 存储相关 */
export const TOKEN_KEY = 'access_token'
export const REFRESH_TOKEN_KEY = 'refresh_token'

/** 获取 Token */
export const getToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY)
}

/** 设置 Token */
export const setToken = (token: string): void => {
  localStorage.setItem(TOKEN_KEY, token)
}

/** 移除 Token */
export const removeToken = (): void => {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(REFRESH_TOKEN_KEY)
}

/** 获取刷新 Token */
export const getRefreshToken = (): string | null => {
  return localStorage.getItem(REFRESH_TOKEN_KEY)
}

/** 设置刷新 Token */
export const setRefreshToken = (token: string): void => {
  localStorage.setItem(REFRESH_TOKEN_KEY, token)
}

/** 业务状态码配置 */
export const BIZ_CODE = {
  SUCCESS: 200,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  SERVER_ERROR: 500,
  TOKEN_EXPIRED: 10401,
  TOKEN_INVALID: 10402,
} as const

/** HTTP 状态码消息 */
export const HTTP_STATUS_MESSAGE: Record<number, string> = {
  200: '请求成功',
  201: '创建成功',
  204: '删除成功',
  400: '请求参数错误',
  401: '未授权，请登录',
  403: '拒绝访问',
  404: '请求资源不存在',
  405: '请求方法不允许',
  408: '请求超时',
  500: '服务器内部错误',
  501: '服务未实现',
  502: '网关错误',
  503: '服务不可用',
  504: '网关超时',
  505: 'HTTP版本不受支持',
}
