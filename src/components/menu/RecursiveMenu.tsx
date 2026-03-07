import { defineComponent, type PropType, type VNode } from 'vue'
import { ElMenu, ElSubMenu, ElMenuItem, ElIcon } from 'element-plus'
import * as ElementPlusIcons from '@element-plus/icons-vue'
import type { MenuItem } from '@/types'
import { isExternalLink, resolvePath } from '@/utils/menu'
import { useRouter } from 'vue-router'

/** 获取图标组件 */
function getIconComponent(icon?: string): VNode | null {
  if (!icon) return null
  const iconComponent = (ElementPlusIcons as Record<string, unknown>)[icon]
  if (iconComponent) {
    return <ElIcon>{<iconComponent />}</ElIcon>
  }
  return null
}

/** 递归渲染菜单项 */
function renderMenuItem(item: MenuItem, basePath: string): VNode {
  const router = useRouter()
  
  // 处理外部链接
  if (item.external && item.path) {
    const fullPath = isExternalLink(item.path) ? item.path : resolvePath(item.path, basePath)
    return (
      <ElMenuItem
        key={item.key}
        index={item.key}
        onClick={() => {
          window.open(fullPath, '_blank')
        }}
      >
        {{
          default: () => (
            <>
              {item.icon && getIconComponent(item.icon as string)}
              <span>{item.title}</span>
            </>
          ),
        }}
      </ElMenuItem>
    )
  }
  
  // 有子菜单的情况
  if (item.children && item.children.length > 0) {
    return (
      <ElSubMenu key={item.key} index={item.key}>
        {{
          title: () => (
            <>
              {item.icon && getIconComponent(item.icon as string)}
              <span>{item.title}</span>
            </>
          ),
          default: () => item.children!.map((child) => renderMenuItem(child, resolvePath(item.path, basePath))),
        }}
      </ElSubMenu>
    )
  }
  
  // 普通菜单项
  const fullPath = resolvePath(item.path, basePath)
  
  return (
    <ElMenuItem
      key={item.key}
      index={fullPath}
      disabled={item.disabled}
      onClick={() => {
        router.push(fullPath)
      }}
    >
      {{
        default: () => (
          <>
            {item.icon && getIconComponent(item.icon as string)}
            <span>{item.title}</span>
          </>
        ),
      }}
    </ElMenuItem>
  )
}

/** 递归菜单组件 */
export const RecursiveMenu = defineComponent({
  name: 'RecursiveMenu',
  props: {
    /** 菜单数据 */
    items: {
      type: Array as PropType<MenuItem[]>,
      required: true,
    },
    /** 是否折叠 */
    collapsed: {
      type: Boolean,
      default: false,
    },
    /** 默认激活的菜单项 */
    defaultActive: {
      type: String,
      default: '',
    },
    /** 默认展开的子菜单 */
    defaultOpeneds: {
      type: Array as PropType<string[]>,
      default: () => [],
    },
    /** 背景颜色 */
    backgroundColor: {
      type: String,
      default: '#304156',
    },
    /** 文字颜色 */
    textColor: {
      type: String,
      default: '#bfcbd9',
    },
    /** 激活项文字颜色 */
    activeTextColor: {
      type: String,
      default: '#409EFF',
    },
    /** 是否唯一展开 */
    uniqueOpened: {
      type: Boolean,
      default: true,
    },
    /** 菜单宽度 */
    menuWidth: {
      type: String,
      default: '210px',
    },
  },
  emits: ['select'],
  setup(props, { emit }) {
    const router = useRouter()
    const route = router.currentRoute
    
    /** 处理菜单选择 */
    const handleSelect = (index: string) => {
      emit('select', index)
    }
    
    return () => {
      const currentPath = route.value.path
      
      return (
        <ElMenu
          defaultActive={props.defaultActive || currentPath}
          defaultOpeneds={props.defaultOpeneds}
          collapse={props.collapsed}
          backgroundColor={props.backgroundColor}
          textColor={props.textColor}
          activeTextColor={props.activeTextColor}
          uniqueOpened={props.uniqueOpened}
          collapseTransition={false}
          mode="vertical"
          style={{ width: props.collapsed ? '64px' : props.menuWidth }}
          onSelect={handleSelect}
        >
          {props.items.map((item) => renderMenuItem(item, ''))}
        </ElMenu>
      )
    }
  },
})

export default RecursiveMenu
