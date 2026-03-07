import axios, { type AxiosInstance, type AxiosResponse } from 'axios'
import { ElMessage, ElLoading } from 'element-plus'
import type {
  ApiResponse,
  RequestConfig,
  InternalRequestConfig,
  HttpError,
  CacheItem,
  PendingRequests,
} from '@/types/http'
import { ErrorType, createHttpError } from '@/types/http'
import {
  baseURL,
  timeout,
  getToken,
  removeToken,
  BIZ_CODE,
  HTTP_STATUS_MESSAGE,
} from '@/config/env'
import router from '@/router'

/** 默认配置 */
const DEFAULT_CONFIG: RequestConfig = {
  showLoading: false,
  showError: true,
  withToken: true,
  retryCount: 0,
  retryInterval: 1000,
  cache: false,
  cacheTimeout: 5 * 60 * 1000, // 5分钟
  cancelDuplicate: false,
}

/** 缓存存储 */
const cacheStore = new Map<string, CacheItem>()

/** 待处理请求 */
const pendingRequests: PendingRequests = new Map()

/** Loading 实例 */
let loadingInstance: ReturnType<typeof ElLoading.service> | null = null
let loadingCount = 0

/**
 * 生成请求唯一标识
 */
function generateRequestKey(config: InternalRequestConfig): string {
  const { method, url, params, data } = config
  return [method, url, JSON.stringify(params), JSON.stringify(data)].join('&')
}

/**
 * 添加待处理请求
 */
function addPendingRequest(config: InternalRequestConfig): void {
  if (!config.cancelDuplicate) return

  const key = generateRequestKey(config)
  if (pendingRequests.has(key)) {
    const controller = pendingRequests.get(key)
    controller?.abort()
  }

  const controller = new AbortController()
  config.signal = controller.signal
  pendingRequests.set(key, controller)
}

/**
 * 移除待处理请求
 */
function removePendingRequest(config: InternalRequestConfig): void {
  const key = generateRequestKey(config)
  pendingRequests.delete(key)
}

/**
 * 显示 Loading
 */
function showLoading(): void {
  if (loadingCount === 0) {
    loadingInstance = ElLoading.service({
      lock: true,
      text: '加载中...',
      background: 'rgba(0, 0, 0, 0.7)',
    })
  }
  loadingCount++
}

/**
 * 隐藏 Loading
 */
function hideLoading(): void {
  loadingCount--
  if (loadingCount <= 0) {
    loadingInstance?.close()
    loadingInstance = null
    loadingCount = 0
  }
}

/**
 * 显示错误消息(防抖)
 */
let messageTimer: ReturnType<typeof setTimeout> | null = null
function showErrorMessage(message: string): void {
  if (messageTimer) return
  messageTimer = setTimeout(() => {
    messageTimer = null
  }, 3000)

  ElMessage.error(message)
}

/**
 * 处理权限失效
 */
function handleAuthError(): void {
  removeToken()
  router.push('/login')
}

/**
 * 从缓存获取数据
 */
function getCache<T>(key: string): T | null {
  const item = cacheStore.get(key)
  if (!item) return null

  if (Date.now() > item.expires) {
    cacheStore.delete(key)
    return null
  }

  return item.data as T
}

/**
 * 设置缓存
 */
function setCache<T>(key: string, data: T, timeout: number): void {
  cacheStore.set(key, {
    data,
    timestamp: Date.now(),
    expires: Date.now() + timeout,
  })
}

/**
 * 清除缓存
 */
export function clearCache(pattern?: string): void {
  if (!pattern) {
    cacheStore.clear()
    return
  }

  for (const key of cacheStore.keys()) {
    if (key.includes(pattern)) {
      cacheStore.delete(key)
    }
  }
}

/**
 * 取消所有请求
 */
export function cancelAllRequests(): void {
  for (const controller of pendingRequests.values()) {
    controller.abort()
  }
  pendingRequests.clear()
}

/**
 * 创建 Axios 实例
 */
const instance: AxiosInstance = axios.create({
  baseURL,
  timeout,
  headers: {
    'Content-Type': 'application/json',
  },
})

/**
 * 请求拦截器
 */
instance.interceptors.request.use(
  (config: InternalRequestConfig) => {
    // 合并默认配置
    config = { ...DEFAULT_CONFIG, ...config } as InternalRequestConfig

    // 添加到待处理请求
    addPendingRequest(config)

    // 显示 Loading
    if (config.showLoading) {
      showLoading()
    }

    // 添加 Token
    if (config.withToken) {
      const token = getToken()
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    }

    return config
  },
  (error) => {
    hideLoading()
    return Promise.reject(error)
  },
)

/**
 * 响应拦截器
 */
instance.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    const config = response.config as InternalRequestConfig

    // 移除待处理请求
    removePendingRequest(config)

    // 隐藏 Loading
    if (config.showLoading) {
      hideLoading()
    }

    const { data } = response

    // 检查缓存
    if (config.cache && config.method?.toLowerCase() === 'get') {
      const key = generateRequestKey(config)
      setCache(key, data, config.cacheTimeout || DEFAULT_CONFIG.cacheTimeout!)
    }

    // 业务状态码判断
    if (data.code === BIZ_CODE.SUCCESS) {
      return data as unknown as AxiosResponse
    }

    // Token 过期或无效
    if (data.code === BIZ_CODE.TOKEN_EXPIRED || data.code === BIZ_CODE.TOKEN_INVALID) {
      handleAuthError()
      const error = createHttpError(
        '登录已过期，请重新登录',
        ErrorType.BIZ,
        data.code,
        response,
        config,
      )
      return Promise.reject(error)
    }

    // 其他业务错误
    if (config.showError) {
      showErrorMessage(data.message || '请求失败')
    }

    const error = createHttpError(
      data.message || '请求失败',
      ErrorType.BIZ,
      data.code,
      response,
      config,
    )
    return Promise.reject(error)
  },
  async (error) => {
    const config = error.config as InternalRequestConfig

    // 隐藏 Loading
    if (config?.showLoading) {
      hideLoading()
    }

    // 移除待处理请求
    if (config) {
      removePendingRequest(config)
    }

    // 请求被取消
    if (axios.isCancel(error) || error.name === 'AbortError' || error.code === 'ERR_CANCELED') {
      const httpError = createHttpError('请求已取消', ErrorType.CANCEL, undefined, undefined, config)
      return Promise.reject(httpError)
    }

    // 超时错误
    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      if (config?.showError) {
        showErrorMessage('请求超时，请稍后重试')
      }

      // 重试逻辑
      if (config && config.retryCount && config.retryCount > 0) {
        config.retryCount--
        await new Promise((resolve) => setTimeout(resolve, config.retryInterval || 1000))
        return instance.request(config)
      }

      const httpError = createHttpError('请求超时', ErrorType.TIMEOUT, undefined, undefined, config)
      return Promise.reject(httpError)
    }

    // 网络错误
    if (!error.response) {
      if (config?.showError) {
        showErrorMessage('网络连接失败，请检查网络')
      }

      // 重试逻辑
      if (config && config.retryCount && config.retryCount > 0) {
        config.retryCount--
        await new Promise((resolve) => setTimeout(resolve, config.retryInterval || 1000))
        return instance.request(config)
      }

      const httpError = createHttpError('网络连接失败', ErrorType.NETWORK, undefined, undefined, config)
      return Promise.reject(httpError)
    }

    // HTTP 状态码错误
    const { status } = error.response
    const message = HTTP_STATUS_MESSAGE[status] || `请求失败(${status})`

    // 401 未授权
    if (status === 401) {
      handleAuthError()
      const httpError = createHttpError(message, ErrorType.HTTP, status, error.response, config)
      return Promise.reject(httpError)
    }

    // 403 禁止访问
    if (status === 403) {
      if (config?.showError) {
        showErrorMessage('没有权限访问该资源')
      }
      const httpError = createHttpError(message, ErrorType.HTTP, status, error.response, config)
      return Promise.reject(httpError)
    }

    // 5xx 服务器错误 - 重试
    if (status >= 500 && config && config.retryCount && config.retryCount > 0) {
      config.retryCount--
      await new Promise((resolve) => setTimeout(resolve, config.retryInterval || 1000))
      return instance.request(config)
    }

    if (config?.showError) {
      showErrorMessage(message)
    }

    const httpError = createHttpError(message, ErrorType.HTTP, status, error.response, config)
    return Promise.reject(httpError)
  },
)

/**
 * 通用请求方法
 */
async function request<T = unknown>(config: RequestConfig): Promise<ApiResponse<T>> {
  // 检查缓存(仅 GET 请求)
  if (config.cache && config.method?.toLowerCase() === 'get') {
    const key = generateRequestKey(config as InternalRequestConfig)
    const cached = getCache<ApiResponse<T>>(key)
    if (cached) {
      return cached
    }
  }

  const response = await instance.request<unknown, ApiResponse<T>>(config)
  return response
}

/**
 * GET 请求
 */
async function get<T = unknown>(
  url: string,
  params?: Record<string, unknown>,
  config?: RequestConfig,
): Promise<ApiResponse<T>> {
  return request<T>({
    url,
    method: 'GET',
    params,
    ...config,
  })
}

/**
 * POST 请求
 */
async function post<T = unknown>(
  url: string,
  data?: Record<string, unknown> | FormData,
  config?: RequestConfig,
): Promise<ApiResponse<T>> {
  return request<T>({
    url,
    method: 'POST',
    data,
    ...config,
  })
}

/**
 * PUT 请求
 */
async function put<T = unknown>(
  url: string,
  data?: Record<string, unknown>,
  config?: RequestConfig,
): Promise<ApiResponse<T>> {
  return request<T>({
    url,
    method: 'PUT',
    data,
    ...config,
  })
}

/**
 * DELETE 请求
 */
async function del<T = unknown>(
  url: string,
  params?: Record<string, unknown>,
  config?: RequestConfig,
): Promise<ApiResponse<T>> {
  return request<T>({
    url,
    method: 'DELETE',
    params,
    ...config,
  })
}

/**
 * PATCH 请求
 */
async function patch<T = unknown>(
  url: string,
  data?: Record<string, unknown>,
  config?: RequestConfig,
): Promise<ApiResponse<T>> {
  return request<T>({
    url,
    method: 'PATCH',
    data,
    ...config,
  })
}

/**
 * 上传文件
 */
async function upload<T = unknown>(
  url: string,
  file: File | FormData,
  config?: RequestConfig & { onProgress?: (percent: number) => void },
): Promise<ApiResponse<T>> {
  const formData = file instanceof FormData ? file : new FormData()
  if (file instanceof File) {
    formData.append('file', file)
  }

  return request<T>({
    url,
    method: 'POST',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    ...config,
    onUploadProgress: (progressEvent) => {
      if (progressEvent.total && config?.onProgress) {
        const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total)
        config.onProgress(percent)
      }
    },
  })
}

/**
 * 下载文件
 */
async function download(
  url: string,
  params?: Record<string, unknown>,
  filename?: string,
  config?: RequestConfig,
): Promise<void> {
  const response = await instance.request<Blob>({
    url,
    method: 'GET',
    params,
    responseType: 'blob',
    ...config,
  })

  const blob = new Blob([response.data])
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = filename || 'download'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(link.href)
}

// 导出 HTTP 实例和方法
const http = {
  request,
  get,
  post,
  put,
  delete: del,
  patch,
  upload,
  download,
  clearCache,
  cancelAllRequests,
  instance,
}

export default http
export { request, get, post, put, del as delete, patch, upload, download }
