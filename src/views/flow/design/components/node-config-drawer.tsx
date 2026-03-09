/**
 * 节点配置抽屉组件
 * 用于配置节点属性：名称修改、关联审批用户等
 */
import { defineComponent, ref, computed, watch } from 'vue';
import type { NodeData } from '@logicflow/core';

export interface NodeConfig {
  id: string;
  type: string;
  name: string;
  approver?: string;
  [key: string]: unknown;
}

export const NodeConfigDrawer = defineComponent({
  name: 'NodeConfigDrawer',
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    nodeData: {
      type: Object as () => NodeData | null,
      default: null,
    },
  },
  emits: ['update:visible', 'save', 'cancel'],
  setup(props, { emit }) {
    // 表单数据
    const formData = ref<NodeConfig>({
      id: '',
      type: '',
      name: '',
      approver: '',
    });

    // 监听节点数据变化，更新表单
    watch(
      () => props.nodeData,
      (newData) => {
        if (newData) {
          formData.value = {
            id: newData.id || '',
            type: newData.type || '',
            name: (newData.text as { value?: string })?.value || newData.text || '',
            approver: (newData.properties as { approver?: string })?.approver || '',
          };
        }
      },
      { immediate: true }
    );

    // 抽屉可见性
    const drawerVisible = computed({
      get: () => props.visible,
      set: (val) => emit('update:visible', val),
    });

    // 是否是开始或结束节点（不允许编辑名称）
    const isEventNode = computed(() => {
      return formData.value.type === 'start' || formData.value.type === 'end';
    });

    // 节点类型中文名
    const nodeTypeLabel = computed(() => {
      const typeMap: Record<string, string> = {
        'start': '开始节点',
        'end': '结束节点',
        'exclusiveGateway': '排他网关',
        'inclusiveGateway': '包容网关',
      };
      return typeMap[formData.value.type] || formData.value.type;
    });

    // 关闭抽屉
    const handleClose = () => {
      drawerVisible.value = false;
    };

    // 取消
    const handleCancel = () => {
      emit('cancel');
      handleClose();
    };

    // 保存
    const handleSave = () => {
      emit('save', { ...formData.value });
      handleClose();
    };

    return () => (
      <el-drawer
        v-model={drawerVisible.value}
        title="节点配置"
        direction="rtl"
        size="400px"
        onClose={handleClose}
      >
        <div class="node-config-form">
          {/* 节点类型 */}
          <el-form label-width="100px">
            <el-form-item label="节点类型">
              <el-tag>{nodeTypeLabel.value}</el-tag>
            </el-form-item>

            {/* 节点名称 */}
            <el-form-item label="节点名称">
              {isEventNode.value ? (
                <el-tag type="info">{formData.value.name}</el-tag>
              ) : (
                <el-input
                  v-model={formData.value.name}
                  placeholder="请输入节点名称"
                  clearable
                />
              )}
              {isEventNode.value && (
                <div class="form-tip">开始/结束节点不支持修改名称</div>
              )}
            </el-form-item>

            {/* 审批用户 - 仅对网关节点显示 */}
            {(formData.value.type === 'exclusiveGateway' || formData.value.type === 'inclusiveGateway') && (
              <el-form-item label="审批用户">
                <el-input
                  v-model={formData.value.approver}
                  placeholder="请输入审批用户"
                  clearable
                />
              </el-form-item>
            )}
          </el-form>

          {/* 底部按钮 */}
          <div class="drawer-footer">
            <el-button onClick={handleCancel}>取消</el-button>
            <el-button type="primary" onClick={handleSave}>
              保存
            </el-button>
          </div>
        </div>
      </el-drawer>
    );
  },
});

export default NodeConfigDrawer;
