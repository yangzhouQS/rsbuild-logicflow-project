import { defineComponent, computed, type PropType } from 'vue'
import { ElScrollbar, ElIcon } from 'element-plus'
import { Fold, Expand } from '@element-plus/icons-vue'
import type { MenuItem } from '@/types'
import RecursiveMenu from '../menu/RecursiveMenu'
import './Sidebar.less'

export const Sidebar = defineComponent({
  name: 'Sidebar',
  props: {
    /** 菜单数据 */
    menus: {
      type: Array as PropType<MenuItem[]>,
      required: true,
    },
    /** 是否折叠 */
    collapsed: {
      type: Boolean,
      default: false,
    },
    /** Logo 图片 */
    logo: {
      type: String,
      default: '',
    },
    /** 标题 */
    title: {
      type: String,
      default: 'Vue3 Admin',
    },
    /** 是否显示折叠按钮 */
    showCollapse: {
      type: Boolean,
      default: true,
    },
  },
  emits: ['toggle-collapse'],
  setup(props, { emit }) {
    /** 切换折叠状态 */
    const handleToggle = () => {
      emit('toggle-collapse')
    }

    /** 计算侧边栏宽度样式 */
    const sidebarStyle = computed(() => ({
      width: props.collapsed ? '64px' : '210px',
    }))

    return () => (
      <div class={['sidebar', { 'sidebar--collapsed': props.collapsed }]} style={sidebarStyle.value}>
        {/* Logo 区域 */}
        <div class="sidebar__logo">
          {props.logo ? (
            <img src={props.logo} alt="logo" class="sidebar__logo-img" />
          ) : (
            <div class="sidebar__logo-text">
              {props.collapsed ? props.title.charAt(0) : props.title}
            </div>
          )}
        </div>

        {/* 菜单区域 */}
        <ElScrollbar class="sidebar__menu-wrapper">
          <RecursiveMenu
            items={props.menus}
            collapsed={props.collapsed}
            backgroundColor="#304156"
            textColor="#bfcbd9"
            activeTextColor="#409EFF"
          />
        </ElScrollbar>

        {/* 折叠按钮 */}
        {props.showCollapse && (
          <div class="sidebar__collapse" onClick={handleToggle}>
            <ElIcon size={20}>
              {props.collapsed ? <Expand /> : <Fold />}
            </ElIcon>
          </div>
        )}
      </div>
    )
  },
})

export default Sidebar
