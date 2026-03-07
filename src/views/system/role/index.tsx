import { defineComponent } from 'vue'
import './index.less'

export default defineComponent({
  name: 'RolePage',
  setup() {
    return () => (
      <div class="role-page">
        <el-card>
          {{
            header: () => '角色管理',
            default: () => (
              <el-form inline>
                <el-form-item label="角色名称">
                  <el-input placeholder="请输入角色名称" />
                </el-form-item>
                <el-form-item label="角色描述">
                  <el-input placeholder="请输入角色描述" />
                </el-form-item>
                <el-form-item>
                  <el-button type="primary">查询</el-button>
                  <el-button>重置</el-button>
                </el-form-item>
              </el-form>
            ),
          }}
        </el-card>
      </div>
    )
  },
})
