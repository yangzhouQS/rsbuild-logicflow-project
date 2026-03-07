import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import type { ThemeMode, ThemeState } from '@/types/theme'

/** 本地存储键名 */
const THEME_STORAGE_KEY = 'app_theme_mode'

/** 获取系统主题偏好 */
function getSystemTheme(): ThemeMode {
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }
  return 'dark'
}

/** 从本地存储获取主题 */
function getStoredTheme(): ThemeMode {
  if (typeof localStorage !== 'undefined') {
    const stored = localStorage.getItem(THEME_STORAGE_KEY)
    if (stored === 'dark' || stored === 'light') {
      return stored
    }
  }
  return 'dark' // 默认深色主题
}

/** 保存主题到本地存储 */
function saveTheme(theme: ThemeMode): void {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(THEME_STORAGE_KEY, theme)
  }
}

export const useThemeStore = defineStore('theme', () => {
  /** 当前主题模式 */
  const mode = ref<ThemeMode>(getStoredTheme())

  /** 是否跟随系统 */
  const followSystem = ref(false)

  /** 是否为深色主题 */
  const isDark = ref(mode.value === 'dark')

  /** 应用主题到 DOM */
  function applyTheme(themeMode: ThemeMode): void {
    const html = document.documentElement

    if (themeMode === 'dark') {
      html.classList.add('dark')
      html.classList.remove('light')
    } else {
      html.classList.add('light')
      html.classList.remove('dark')
    }

    isDark.value = themeMode === 'dark'
  }

  /** 切换主题 */
  function toggleTheme(): void {
    const newMode = mode.value === 'dark' ? 'light' : 'dark'
    setTheme(newMode)
  }

  /** 设置主题 */
  function setTheme(themeMode: ThemeMode): void {
    mode.value = themeMode
    saveTheme(themeMode)
    applyTheme(themeMode)
  }

  /** 设置是否跟随系统 */
  function setFollowSystem(value: boolean): void {
    followSystem.value = value
    if (value) {
      const systemTheme = getSystemTheme()
      setTheme(systemTheme)
    }
  }

  /** 初始化主题 */
  function initTheme(): void {
    applyTheme(mode.value)

    // 监听系统主题变化
    if (typeof window !== 'undefined' && window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      mediaQuery.addEventListener('change', (e) => {
        if (followSystem.value) {
          setTheme(e.matches ? 'dark' : 'light')
        }
      })
    }
  }

  // 监听主题变化
  watch(mode, (newMode) => {
    applyTheme(newMode)
  })

  return {
    mode,
    isDark,
    followSystem,
    toggleTheme,
    setTheme,
    setFollowSystem,
    initTheme,
  }
})
