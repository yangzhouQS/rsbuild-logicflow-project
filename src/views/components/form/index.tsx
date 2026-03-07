import { defineComponent, reactive } from 'vue'
import './index.less'

export default defineComponent({
  name: 'FormPage',
  setup() {
    const formData = reactive({
      name: '',
      email: '',
      phone: '',
      region: '',
      desc: '',
    })

    const handleSubmit = () => {
      console.log('提交表单:', formData)
    }

    const handleReset = () => {
      formData.name = ''
      formData.email = ''
      formData.phone = ''
      formData.region = ''
      formData.desc = ''
    }

    return () => (
      <div class="form-page">
        <el-card>
          {{
            header: () => '表单组件',
            default: () => (
              <el-form model={formData} label-width="100px">
                <el-form-item label="姓名">
                  <el-input v-model={formData.name} placeholder="请输入姓名" />
                </el-form-item>
                <el-form-item label="邮箱">
                  <el-input v-model={formData.email} placeholder="请输入邮箱" />
                </el-form-item>
                <el-form-item label="手机号">
                  <el-input v-model={formData.phone} placeholder="请输入手机号" />
                </el-form-item>
                <el-form-item label="地区">
                  <el-select v-model={formData.region} placeholder="请选择地区" style={{ width: '100%' }}>
                    <el-option label="北京" value="beijing" />
                    <el-option label="上海" value="shanghai" />
                    <el-option label="广州" value="guangzhou" />
                    <el-option label="深圳" value="shenzhen" />
                  </el-select>
                </el-form-item>
                <el-form-item label="描述">
                  <el-input
                    v-model={formData.desc}
                    type="textarea"
                    rows={4}
                    placeholder="请输入描述"
                  />
                </el-form-item>
                <el-form-item>
                  <el-button type="primary" onClick={handleSubmit}>
                    提交
                  </el-button>
                  <el-button onClick={handleReset}>重置</el-button>
                </el-form-item>
              </el-form>
            ),
          }}
        </el-card>
      </div>
    )
  },
})
