import { defineComponent, computed } from 'vue'
import { useThemeStore } from '@/stores/theme'
import { storeToRefs } from 'pinia'
import { ElTooltip } from 'element-plus'
import type { PropType } from 'vue'
import './ThemeSwitch.less'

export default defineComponent({
  name: 'ThemeSwitch',
  props: {
    /** 是否显示文字提示 */
    showTooltip: {
      type: Boolean as PropType<boolean>,
      default: true,
    },
    /** 尺寸 */
    size: {
      type: String as PropType<'small' | 'default' | 'large'>,
      default: 'default',
    },
  },
  setup(props) {
    const themeStore = useThemeStore()
    // 使用 storeToRefs 确保响应式追踪
    const { isDark } = storeToRefs(themeStore)

    const handleToggle = () => {
      themeStore.toggleTheme()
    }

    const sunIcon = (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        class="theme-icon theme-icon--sun"
      >
        <circle cx="12" cy="12" r="4" fill="currentColor" />
        <path
          d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
        />
      </svg>
    )

    const moonIcon = (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        class="theme-icon theme-icon--moon"
      >
        <path
          d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"
          fill="currentColor"
        />
      </svg>
    )

    return () => {
      const dark = isDark.value

      const button = (
        <div
          class={['theme-switch', `theme-switch--${props.size}`]}
          onClick={handleToggle}
        >
          <div class="theme-switch__track">
            <div class={['theme-switch__thumb', { 'theme-switch__thumb--dark': dark }]}>
              <span class="theme-switch__icon">{dark ? sunIcon : moonIcon}</span>
            </div>
          </div>
        </div>
      )

      if (props.showTooltip) {
        return (
          <ElTooltip
            content={dark ? '切换到浅色模式' : '切换到深色模式'}
            placement="bottom"
          >
            {button}
          </ElTooltip>
        )
      }

      return button
    }
  },
})
