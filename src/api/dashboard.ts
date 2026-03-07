import http from '@/utils/http'
import type { DashboardStats, ChartData } from './types'

/**
 * 获取仪表盘统计数据
 */
export function getDashboardStats() {
  return http.get<DashboardStats>('/dashboard/stats', undefined, {
    cache: true,
    cacheTimeout: 60000, // 缓存1分钟
  })
}

/**
 * 获取用户增长趋势
 * @param days 天数
 */
export function getUserTrend(days: number = 7) {
  return http.get<ChartData>('/dashboard/user-trend', { days }, {
    cache: true,
  })
}

/**
 * 获取订单增长趋势
 * @param days 天数
 */
export function getOrderTrend(days: number = 7) {
  return http.get<ChartData>('/dashboard/order-trend', { days }, {
    cache: true,
  })
}

/**
 * 获取收入增长趋势
 * @param days 天数
 */
export function getRevenueTrend(days: number = 7) {
  return http.get<ChartData>('/dashboard/revenue-trend', { days }, {
    cache: true,
  })
}
