import { defineComponent, ref, computed, onMounted } from 'vue'
import { ElContainer, ElHeader, ElMain, ElBreadcrumb, ElBreadcrumbItem, ElDropdown, ElDropdownMenu, ElDropdownItem, ElAvatar, ElIcon } from 'element-plus'
import { User, SwitchButton, Setting } from '@element-plus/icons-vue'
import { useRouter, useRoute } from 'vue-router'
import { Sidebar } from '@/components'
import ThemeSwitch from '@/components/theme/ThemeSwitch'
import { generateMenus } from '@/utils/menu'
import { asyncRoutes } from '@/router/routes'
import { useThemeStore } from '@/stores/theme'
import type { MenuItem } from '@/types'
import './BasicLayout.less'

/** 面包屑项 */
interface BreadcrumbItem {
  title: string
  path?: string
}

export const BasicLayout = defineComponent({
  name: 'BasicLayout',
  setup() {
    const router = useRouter()
    const route = useRoute()
    const themeStore = useThemeStore()
    
    /** 侧边栏折叠状态 */
    const collapsed = ref(false)
    
    /** 菜单数据 */
    const menus = computed<MenuItem[]>(() => {
      return generateMenus(asyncRoutes)
    })
    
    /** 主内容区域样式 */
    const mainStyle = computed(() => ({
      marginLeft: collapsed.value ? '64px' : '210px',
    }))
    
    /** 面包屑数据 */
    const breadcrumbs = computed<BreadcrumbItem[]>(() => {
      const matched = route.matched.filter((item) => item.meta?.title)
      return matched.map((item) => ({
        title: item.meta?.title as string,
        path: item.path,
      }))
    })
    
    /** 切换侧边栏折叠状态 */
    const toggleCollapse = () => {
      collapsed.value = !collapsed.value
    }
    
    /** 处理下拉菜单命令 */
    const handleCommand = (command: string) => {
      switch (command) {
        case 'profile':
          router.push('/profile')
          break
        case 'settings':
          router.push('/settings')
          break
        case 'logout':
          router.push('/login')
          break
      }
    }
    
    /** 初始化主题 */
    onMounted(() => {
      themeStore.initTheme()
    })
    
    return () => (
      <ElContainer class="basic-layout">
        {/* 侧边栏 */}
        <Sidebar
          menus={menus.value}
          collapsed={collapsed.value}
          title="Vue3 Admin"
          onToggle-collapse={toggleCollapse}
        />
        
        {/* 主内容区域 */}
        <ElContainer class="basic-layout__main" style={mainStyle.value}>
          {/* 头部 */}
          <ElHeader class="basic-layout__header">
            {/* 面包屑 */}
            <ElBreadcrumb separator="/" class="basic-layout__breadcrumb">
              {breadcrumbs.value.map((item, index) => (
                <ElBreadcrumbItem key={item.path ?? index}>
                  {item.path && index < breadcrumbs.value.length - 1 ? (
                    <a href={item.path}>{item.title}</a>
                  ) : (
                    item.title
                  )}
                </ElBreadcrumbItem>
              ))}
            </ElBreadcrumb>
            
            {/* 右侧工具栏 */}
            <div class="basic-layout__toolbar">
              {/* 主题切换 */}
              <ThemeSwitch />
              
              {/* 用户信息 */}
              <ElDropdown onCommand={handleCommand}>
                {{
                  default: () => (
                    <div class="basic-layout__user-info">
                      <ElAvatar size={32} icon={<ElIcon><User /></ElIcon>} />
                      <span class="basic-layout__username">Admin</span>
                    </div>
                  ),
                  dropdown: () => (
                    <ElDropdownMenu>
                      <ElDropdownItem command="profile">
                        <ElIcon><User /></ElIcon>
                        个人中心
                      </ElDropdownItem>
                      <ElDropdownItem command="settings">
                        <ElIcon><Setting /></ElIcon>
                        系统设置
                      </ElDropdownItem>
                      <ElDropdownItem command="logout" divided>
                        <ElIcon><SwitchButton /></ElIcon>
                        退出登录
                      </ElDropdownItem>
                    </ElDropdownMenu>
                  ),
                }}
              </ElDropdown>
            </div>
          </ElHeader>
          
          {/* 内容区域 */}
          <ElMain class="basic-layout__content">
            <router-view />
          </ElMain>
        </ElContainer>
      </ElContainer>
    )
  },
})

export default BasicLayout
