import { defineComponent, reactive } from 'vue'
import { useRouter } from 'vue-router'
import './index.less'

export default defineComponent({
  name: 'LoginPage',
  setup() {
    const router = useRouter()

    const form = reactive({
      username: '',
      password: '',
    })

    const handleLogin = () => {
      // 模拟登录
      router.push('/')
    }

    return () => (
      <div class="login-page">
        <el-card class="login-card">
          {{
            header: () => <h2>登录</h2>,
            default: () => (
              <el-form model={form} label-width="80px">
                <el-form-item label="用户名">
                  <el-input v-model={form.username} placeholder="请输入用户名" />
                </el-form-item>
                <el-form-item label="密码">
                  <el-input
                    v-model={form.password}
                    type="password"
                    placeholder="请输入密码"
                  />
                </el-form-item>
                <el-form-item>
                  <el-button type="primary" onClick={handleLogin}>
                    登录
                  </el-button>
                </el-form-item>
              </el-form>
            ),
          }}
        </el-card>
      </div>
    )
  },
})
