import { defineComponent } from 'vue'
import './index.less'

export default defineComponent({
  name: 'AnotherPage',
  setup() {
    return () => (
      <div class="another-page">
        <el-card>
          {{
            header: () => '另一个嵌套页面',
            default: () => (
              <div class="content">
                <p>这是另一个嵌套菜单页面</p>
                <p>当前路径: /nested/another</p>
                <el-alert
                  type="info"
                  title="提示"
                  description="这是另一个嵌套菜单分支的示例"
                  show-icon
                  closable={false}
                />
              </div>
            ),
          }}
        </el-card>
      </div>
    )
  },
})
