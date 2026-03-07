import { defineComponent } from 'vue'
import './index.less'

export default defineComponent({
  name: 'UserPage',
  setup() {
    return () => (
      <div class="page-container">
        <el-card>
          {{
            header: () => (
              <div class="card-header">
                <span>用户管理</span>
                <el-button type="primary">新增用户</el-button>
              </div>
            ),
            default: () => (
              <el-table data={[]} stripe>
                <el-table-column prop="username" label="用户名" />
                <el-table-column prop="email" label="邮箱" />
                <el-table-column prop="role" label="角色" />
                <el-table-column prop="status" label="状态" />
                <el-table-column label="操作" width="200">
                  {{
                    default: () => (
                      <el-button type="primary" size="small">
                        编辑
                      </el-button>
                    ),
                  }}
                </el-table-column>
              </el-table>
            ),
          }}
        </el-card>
      </div>
    )
  },
})
