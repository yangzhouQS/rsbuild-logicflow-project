import { defineComponent } from 'vue'
import { BasicLayout } from '@/layouts'
import { useThemeStore } from '@/stores/theme'
import './styles/theme.less'
import './App.less'

export default defineComponent({
  name: 'App',
  setup() {
    const themeStore = useThemeStore()
    
    // 初始化主题
    themeStore.initTheme()
    
    return () => (
      <BasicLayout />
    )
  },
})
