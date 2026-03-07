import { defineComponent, ref } from 'vue'
import { Delete, Edit } from '@element-plus/icons-vue'
import './index.less'

export default defineComponent({
  name: 'TablePage',
  setup() {
    const tableData = ref([
      { id: 1, name: '张三', age: 28, address: '北京市' },
      { id: 2, name: '李四', age: 32, address: '上海市' },
      { id: 3, name: '王五', age: 25, address: '广州市' },
    ])

    return () => (
      <div class="table-page">
        <el-card>
          {{
            header: () => '表格组件',
            default: () => (
              <el-table data={tableData.value} style={{ width: '100%' }}>
                <el-table-column prop="id" label="ID" width="80" />
                <el-table-column prop="name" label="姓名" />
                <el-table-column prop="age" label="年龄" />
                <el-table-column prop="address" label="地址" />
                <el-table-column label="操作" width="150">
                  {{
                    default: ({ row }: { row: any }) => (
                      <div>
                        <el-button type="primary" size="small" icon={<Edit />} />
                        <el-button type="danger" size="small" icon={<Delete />} />
                      </div>
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
