import { defineComponent } from 'vue'
import './index.less'

export default defineComponent({
  name: 'Level3Page',
  setup() {
    return () => (
      <div class="level3-page">
        <el-card>
          {{
            header: () => '三级菜单页面',
            default: () => (
              <div class="content">
                <p>这是嵌套菜单的三级页面</p>
                <p>当前路径: /nested/level3</p>
                <el-alert
                  type="warning"
                  title="提示"
                  description="这是三级嵌套菜单示例，展示了深层嵌套的能力"
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
