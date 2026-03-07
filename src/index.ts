import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App'
import './styles/theme.less'
import './index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import { setupRouter } from './router'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)

// 注册所有 Element Plus 图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

// 使用 Element Plus
app.use(ElementPlus)

// 设置路由
setupRouter(app)

// 挂载应用
app.mount('#root')
