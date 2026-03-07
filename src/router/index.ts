import type { App } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import { constantRoutes, asyncRoutes } from './routes'

/** 合并路由 */
const routes = [...constantRoutes, ...asyncRoutes]

/** 创建路由实例 */
export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior: () => ({ left: 0, top: 0 }),
})

/** 路由守卫 - 前置 */
router.beforeEach((to, _from, next) => {
  // 设置页面标题
  const title = to.meta?.title
  if (title) {
    document.title = `${title} | Vue3 Admin`
  }
  next()
})

/** 路由守卫 - 后置 */
router.afterEach(() => {
  // 可以在这里添加进度条结束等逻辑
})

/** 重置路由 */
export function resetRouter(): void {
  router.getRoutes().forEach((route) => {
    const { name } = route
    if (name) {
      router.removeRoute(name)
    }
  })
}

/** 注册路由 */
export function setupRouter(app: App): void {
  app.use(router)
}

export * from './routes'
