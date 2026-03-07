import type { AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios'

/**
 * 响应数据通用结构
 */
export interface ApiResponse<T = unknown> {
  code: number
  message: string
  data: T
  timestamp?: number
}

/**
 * 分页请求参数
 */
export interface PaginationParams {
  page: number
  pageSize: number
}

/**
 * 分页响应数据
 */
export interface PaginationData<T> {
  list: T[]
  total: number
  page: number
  pageSize: number
}

/**
 * 请求配置扩展
 */
export interface RequestConfig extends AxiosRequestConfig {
  /** 是否显示 loading */
  showLoading?: boolean
  /** 是否显示错误提示 */
  showError?: boolean
  /** 是否携带 Token */
  withToken?: boolean
  /** 重试次数 */
  retryCount?: number
  /** 重试间隔(ms) */
  retryInterval?: number
  /** 是否缓存响应(仅 GET 请求) */
  cache?: boolean
  /** 缓存过期时间(ms) */
  cacheTimeout?: number
  /** 请求标识(用于取消请求) */
  requestKey?: string
  /** 是否取消重复请求 */
  cancelDuplicate?: boolean
}

/**
 * 扩展的内部请求配置
 */
export interface InternalRequestConfig extends InternalAxiosRequestConfig {
  showLoading?: boolean
  showError?: boolean
  withToken?: boolean
  retryCount?: number
  retryInterval?: number
  cache?: boolean
  cacheTimeout?: number
  requestKey?: string
  cancelDuplicate?: boolean
}

/**
 * 错误类型枚举
 */
export enum ErrorType {
  /** 网络错误 */
  NETWORK = 'NETWORK',
  /** HTTP 状态码错误 */
  HTTP = 'HTTP',
  /** 业务错误 */
  BIZ = 'BIZ',
  /** 超时错误 */
  TIMEOUT = 'TIMEOUT',
  /** 取消请求 */
  CANCEL = 'CANCEL',
  /** 未知错误 */
  UNKNOWN = 'UNKNOWN',
}

/**
 * 自定义错误类
 */
export interface HttpError extends Error {
  type: ErrorType
  code?: number
  response?: AxiosResponse
  config?: InternalRequestConfig
}

/**
 * 缓存项结构
 */
export interface CacheItem<T = unknown> {
  data: T
  timestamp: number
  expires: number
}

/**
 * 待处理请求映射
 */
export type PendingRequests = Map<string, AbortController>

/**
 * HTTP 方法类型
 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'

/**
 * 请求参数类型
 */
export type RequestData = Record<string, unknown> | FormData | URLSearchParams

/**
 * 创建 HttpError 的工厂函数
 */
export function createHttpError(
  message: string,
  type: ErrorType,
  code?: number,
  response?: AxiosResponse,
  config?: InternalRequestConfig,
): HttpError {
  const error = new Error(message) as HttpError
  error.type = type
  error.code = code
  error.response = response
  error.config = config
  return error
}
