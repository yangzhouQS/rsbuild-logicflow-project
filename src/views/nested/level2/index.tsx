import { defineComponent } from 'vue'
import './index.less'

export default defineComponent({
  name: 'Level2Page',
  setup() {
    return () => (
      <div class="level2-page">
        <el-card>
          {{
            header: () => '二级菜单页面',
            default: () => (
              <div class="content">
                <p>这是嵌套菜单的二级页面</p>
                <p>当前路径: /nested/level2</p>
                <el-alert
                  type="success"
                  title="提示"
                  description="这是二级嵌套菜单示例"
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
