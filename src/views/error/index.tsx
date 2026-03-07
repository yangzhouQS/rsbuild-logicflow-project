import { defineComponent } from 'vue'
import { useRouter } from 'vue-router'
import './index.less'

export default defineComponent({
  name: 'Error404Page',
  setup() {
    const router = useRouter()

    const goHome = () => {
      router.push('/')
    }

    return () => (
      <div class="error-page">
        <div class="error-content">
          <h1>404</h1>
          <h2>页面未找到</h2>
          <p>抱歉，您访问的页面不存在</p>
          <el-button type="primary" onClick={goHome}>
            返回首页
          </el-button>
        </div>
      </div>
    )
  },
})
