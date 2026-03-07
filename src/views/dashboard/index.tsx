import { defineComponent } from 'vue'
import { User, Document, ChatDotRound, View, TrendCharts, Plus, Setting } from '@element-plus/icons-vue'
import './index.less'

export default defineComponent({
  name: 'DashboardPage',
  setup() {
    return () => (
      <div class="dashboard-page">
        <el-row gutter={20}>
          <el-col span={6}>
            <el-card shadow="hover" class="stat-card">
              <div class="stat-card__content">
                <div class="stat-card__icon stat-card__icon--primary">
                  <el-icon><User /></el-icon>
                </div>
                <div class="stat-card__info">
                  <div class="stat-card__value">1,234</div>
                  <div class="stat-card__label">用户总数</div>
                </div>
              </div>
            </el-card>
          </el-col>
          <el-col span={6}>
            <el-card shadow="hover" class="stat-card">
              <div class="stat-card__content">
                <div class="stat-card__icon stat-card__icon--success">
                  <el-icon><Document /></el-icon>
                </div>
                <div class="stat-card__info">
                  <div class="stat-card__value">567</div>
                  <div class="stat-card__label">文章数量</div>
                </div>
              </div>
            </el-card>
          </el-col>
          <el-col span={6}>
            <el-card shadow="hover" class="stat-card">
              <div class="stat-card__content">
                <div class="stat-card__icon stat-card__icon--warning">
                  <el-icon><ChatDotRound /></el-icon>
                </div>
                <div class="stat-card__info">
                  <div class="stat-card__value">8,901</div>
                  <div class="stat-card__label">评论数量</div>
                </div>
              </div>
            </el-card>
          </el-col>
          <el-col span={6}>
            <el-card shadow="hover" class="stat-card">
              <div class="stat-card__content">
                <div class="stat-card__icon stat-card__icon--danger">
                  <el-icon><View /></el-icon>
                </div>
                <div class="stat-card__info">
                  <div class="stat-card__value">23,456</div>
                  <div class="stat-card__label">浏览量</div>
                </div>
              </div>
            </el-card>
          </el-col>
        </el-row>

        <el-row gutter={20} style={{ marginTop: '20px' }}>
          <el-col span={16}>
            <el-card shadow="hover">
              {{
                header: () => <span>访问趋势</span>,
                default: () => (
                  <div class="chart-placeholder">
                    <el-icon size={60} color="#409EFF"><TrendCharts /></el-icon>
                    <p>图表区域（可集成 ECharts）</p>
                  </div>
                ),
              }}
            </el-card>
          </el-col>
          <el-col span={8}>
            <el-card shadow="hover">
              {{
                header: () => <span>快捷操作</span>,
                default: () => (
                  <div class="quick-actions">
                    <el-button type="primary" icon={<Plus />}>新建文章</el-button>
                    <el-button type="success" icon={<User />}>添加用户</el-button>
                    <el-button type="warning" icon={<Setting />}>系统设置</el-button>
                    <el-button type="info" icon={<Document />}>查看文档</el-button>
                  </div>
                ),
              }}
            </el-card>
          </el-col>
        </el-row>
      </div>
    )
  },
})
