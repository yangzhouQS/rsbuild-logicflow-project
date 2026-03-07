import { defineComponent } from 'vue'
import './index.less'

export default defineComponent({
  name: 'Level1Page',
  setup() {
    return () => (
      <div class="level1-page">
        <el-card>
          {{
            header: () => '一级菜单页面',
            default: () => (
              <div class="content">
                <p>这是嵌套菜单的一级页面</p>
                <p>当前路径: /nested/level1</p>
                <el-alert
                  type="info"
                  title="提示"
                  description="这是一个嵌套菜单示例，展示了无限级嵌套的能力"
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
