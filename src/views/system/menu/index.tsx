import { defineComponent } from 'vue'
import './index.less'

export default defineComponent({
  name: 'MenuPage',
  setup() {
    return () => (
      <div class="menu-page">
        <el-card>
          {{
            header: () => '菜单管理',
            default: () => (
              <el-form inline>
                <el-form-item label="菜单名称">
                  <el-input placeholder="请输入菜单名称" />
                </el-form-item>
                <el-form-item label="状态">
                  <el-select placeholder="请选择状态" style={{ width: '200px' }}>
                    <el-option label="启用" value="1" />
                    <el-option label="禁用" value="0" />
                  </el-select>
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
