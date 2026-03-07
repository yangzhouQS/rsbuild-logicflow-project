/**
 * 主题模式类型
 */
export type ThemeMode = 'dark' | 'light'

/**
 * 主题配置接口
 */
export interface ThemeConfig {
  /** 主题模式 */
  mode: ThemeMode
  /** 主题色 */
  primaryColor: string
  /** 是否跟随系统 */
  followSystem: boolean
}

/**
 * 主题状态接口
 */
export interface ThemeState {
  /** 当前主题模式 */
  mode: ThemeMode
  /** 是否跟随系统 */
  followSystem: boolean
}

/**
 * CSS 变量映射接口
 */
export interface ThemeVariables {
  // 背景色
  '--bg-color': string
  '--bg-color-page': string
  '--bg-color-overlay': string

  // 文字色
  '--text-color-primary': string
  '--text-color-regular': string
  '--text-color-secondary': string
  '--text-color-placeholder': string

  // 边框色
  '--border-color': string
  '--border-color-light': string
  '--border-color-lighter': string
  '--border-color-extra-light': string

  // 填充色
  '--fill-color': string
  '--fill-color-light': string
  '--fill-color-lighter': string
  '--fill-color-extra-light': string

  // 主题色
  '--color-primary': string
  '--color-primary-light-3': string
  '--color-primary-light-5': string
  '--color-primary-light-7': string
  '--color-primary-light-8': string
  '--color-primary-light-9': string

  // 功能色
  '--color-success': string
  '--color-warning': string
  '--color-danger': string
  '--color-info': string

  // 阴影
  '--box-shadow': string
  '--box-shadow-light': string
  '--box-shadow-lighter': string
  '--box-shadow-dark': string

  // 侧边栏
  '--sidebar-bg-color': string
  '--sidebar-text-color': string
  '--sidebar-active-text-color': string
  '--sidebar-hover-bg-color': string

  // 头部
  '--header-bg-color': string
  '--header-text-color': string
  '--header-height': string

  // 卡片
  '--card-bg-color': string
  '--card-border-color': string
}
