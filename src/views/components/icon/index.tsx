import { defineComponent } from 'vue'
import { Document, Setting, User, View } from '@element-plus/icons-vue'
import './index.less'

export default defineComponent({
  name: 'IconPage',
  setup() {
    return () => (
      <div class="icon-page">
        <el-card>
          {{
            header: () => '图标组件',
            default: () => (
              <div class="icon-grid">
                <el-icon size={40}><Document /></el-icon>
                <el-icon size={40}><Setting /></el-icon>
                <el-icon size={40}><User /></el-icon>
                <el-icon size={40}><View /></el-icon>
              </div>
            ),
          }}
        </el-card>
      </div>
    )
  },
})
