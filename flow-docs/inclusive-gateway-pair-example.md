# 包容网关成对配置完整示例

本文档提供包容网关成对出现的完整实现方案，包括：
- 拖入画布时成对出现
- 自动创建普通分支和默认分支
- 默认分支禁止删除
- 删除网关时联动删除相关配置

## 一、完整实现代码

```typescript
import LogicFlow from '@logicflow/core'
import { BPMNElements } from '@logicflow/extension'

/**
 * 包容网关成对管理器
 */
class InclusiveGatewayPairManager {
  private lf: LogicFlow
  private gatewayPairs: Map<string, PairInfo>
  private branchConfigs: Map<string, BranchConfig>

  constructor(lf: LogicFlow) {
    this.lf = lf
    this.gatewayPairs = new Map()
    this.branchConfigs = new Map()
    this.init()
  }

  private init() {
    // 监听节点拖拽添加事件
    this.lf.on('node:dnd-add', this.handleNodeDndAdd.bind(this))
    
    // 监听节点删除事件
    this.lf.on('node:delete', this.handleNodeDelete.bind(this))
    
    // 监听边删除事件（保护默认分支）
    this.lf.on('edge:delete', this.handleEdgeDelete.bind(this))
    
    // 监听边添加事件
    this.lf.on('edge:add', this.handleEdgeAdd.bind(this))
  }

  /**
   * 处理节点拖拽添加
   */
  private handleNodeDndAdd({ data }: { data: any }) {
    if (data.type !== 'bpmn:inclusiveGateway') return
    
    // 创建成对的包容网关
    this.createInclusiveGatewayPair(data)
  }

  /**
   * 创建成对的包容网关
   */
  private createInclusiveGatewayPair(forkGateway: any) {
    const offsetX = 300// 分流和聚合网关之间的水平距离
    const timestamp = Date.now()
    
    //生成分流网关 ID
    const forkId = forkGateway.id || `Gateway_Fork_${timestamp}`
    // 生成聚合网关 ID
    const joinId = `Gateway_Join_${timestamp}`
    
    // 1. 更新分流网关属性
    this.lf.setProperties(forkId, {
      pairId: joinId,
      pairType: 'fork',
      gatewayRole: 'split',
    })
    
    // 2. 创建聚合网关
    this.lf.addNode({
      id: joinId,
      type: 'bpmn:inclusiveGateway',
      x: forkGateway.x + offsetX,
      y: forkGateway.y,
      text: '聚合',
      properties: {
        pairId: forkId,
        pairType: 'join',
        gatewayRole: 'merge',
      },
    })
    
    // 3. 创建普通分支任务节点
    const normalTaskId = `Task_Normal_${timestamp}`
    this.lf.addNode({
      id: normalTaskId,
      type: 'bpmn:userTask',
      x: forkGateway.x + offsetX / 2,
      y: forkGateway.y - 80,
      text: '普通分支',
      properties: {
        branchType: 'normal',
        forkGatewayId: forkId,
        joinGatewayId: joinId,
      },
    })
    
    // 4. 创建默认分支任务节点
    const defaultTaskId = `Task_Default_${timestamp}`
    this.lf.addNode({
      id: defaultTaskId,
      type: 'bpmn:userTask',
      x: forkGateway.x + offsetX / 2,
      y: forkGateway.y + 80,
      text: '默认分支',
      properties: {
        branchType: 'default',
        isDefault: true,
        forkGatewayId: forkId,
        joinGatewayId: joinId,
      },
    })
    
    // 5. 创建分流网关到普通分支的连线
    const normalFlowId = `Flow_Normal_${timestamp}`
    this.lf.addEdge({
      id: normalFlowId,
      type: 'bpmn:sequenceFlow',
      sourceNodeId: forkId,
      targetNodeId: normalTaskId,
      text: '条件A',
      properties: {
        condition: '${conditionA === true}',
        branchType: 'normal',
        isDefault: false,
      },
    })
    
    // 6. 创建分流网关到默认分支的连线（默认路径）
    const defaultFlowId = `Flow_Default_${timestamp}`
    this.lf.addEdge({
      id: defaultFlowId,
      type: 'bpmn:sequenceFlow',
      sourceNodeId: forkId,
      targetNodeId: defaultTaskId,
      text: '默认',
      properties: {
        isDefault: true,
        branchType: 'default',
        // 默认分支不需要条件
      },
    })
    
    // 7. 创建普通分支到聚合网关的连线
    const normalToJoinFlowId = `Flow_NormalToJoin_${timestamp}`
    this.lf.addEdge({
      id: normalToJoinFlowId,
      type: 'bpmn:sequenceFlow',
      sourceNodeId: normalTaskId,
      targetNodeId: joinId,
      properties: {
        branchType: 'normal',
      },
    })
    
    // 8. 创建默认分支到聚合网关的连线
    const defaultToJoinFlowId = `Flow_DefaultToJoin_${timestamp}`
    this.lf.addEdge({
      id: defaultToJoinFlowId,
      type: 'bpmn:sequenceFlow',
      sourceNodeId: defaultTaskId,
      targetNodeId: joinId,
      properties: {
        branchType: 'default',
        isDefault: true,
      },
    })
    
    // 9. 记录配对信息
    const pairInfo: PairInfo = {
      forkId,
      joinId,
      normalBranch: {
        taskId: normalTaskId,
        flowInId: normalFlowId,
        flowOutId: normalToJoinFlowId,
      },
      defaultBranch: {
        taskId: defaultTaskId,
        flowInId: defaultFlowId,
        flowOutId: defaultToJoinFlowId,
      },
      createdAt: new Date().toISOString(),
    }
    
    this.gatewayPairs.set(forkId, pairInfo)
    this.gatewayPairs.set(joinId, pairInfo)
    
    // 10. 记录分支配置
    this.branchConfigs.set(defaultFlowId, {
      isDefault: true,
      isDeletable: false,
      pairId: pairInfo,
    })
    this.branchConfigs.set(defaultToJoinFlowId, {
      isDefault: true,
      isDeletable: false,
      pairId: pairInfo,
    })
    
    console.log('包容网关成对创建完成:', pairInfo)
    return pairInfo
  }

  /**
   * 处理节点删除
   */
  private handleNodeDelete({ data }: { data: any }) {
    if (data.type !== 'bpmn:inclusiveGateway') return
    
    const pairInfo = this.gatewayPairs.get(data.id)
    if (!pairInfo) return
    
    // 删除配对的网关
    const pairId = data.properties?.pairId
    if (pairId) {
      // 临时移除监听，避免循环删除
      this.lf.off('node:delete', this.handleNodeDelete.bind(this))
      this.lf.deleteNode(pairId)
      this.lf.on('node:delete', this.handleNodeDelete.bind(this))
    }
    
    // 删除相关分支节点和连线
    this.deleteRelatedElements(pairInfo)
    
    // 清理记录
    this.gatewayPairs.delete(pairInfo.forkId)
    this.gatewayPairs.delete(pairInfo.joinId)
  }

  /**
   * 删除相关的分支节点和连线
   */
  private deleteRelatedElements(pairInfo: PairInfo) {
    const elementsToDelete = [
      pairInfo.normalBranch.taskId,
      pairInfo.normalBranch.flowInId,
      pairInfo.normalBranch.flowOutId,
      pairInfo.defaultBranch.taskId,
      pairInfo.defaultBranch.flowInId,
      pairInfo.defaultBranch.flowOutId,
    ]
    
    // 临时移除监听
    this.lf.off('edge:delete', this.handleEdgeDelete.bind(this))
    
    elementsToDelete.forEach(id => {
      // 尝试删除节点
      const node = this.lf.getNodeModelById(id)
      if (node) {
        this.lf.deleteNode(id)
      }
      // 尝试删除边
      const edge = this.lf.getEdgeModelById(id)
      if (edge) {
        this.lf.deleteEdge(id)
      }
    })
    
    // 恢复监听
    this.lf.on('edge:delete', this.handleEdgeDelete.bind(this))
    
    // 清理分支配置记录
    this.branchConfigs.delete(pairInfo.defaultBranch.flowInId)
    this.branchConfigs.delete(pairInfo.defaultBranch.flowOutId)
  }

  /**
   * 处理边删除（保护默认分支）
   */
  private handleEdgeDelete({ data }: { data: any }) {
    const branchConfig = this.branchConfigs.get(data.id)
    
    if (branchConfig && !branchConfig.isDeletable) {
      // 阻止删除默认分支
      console.warn('默认分支不能删除')
      
      // 重新添加被删除的边
      setTimeout(() => {
        this.lf.addEdge({
          id: data.id,
          type: data.type,
          sourceNodeId: data.sourceNodeId,
          targetNodeId: data.targetNodeId,
          text: data.text,
          properties: data.properties,
        })
      }, 0)
      
      return false
    }
    
    // 清理配置记录
    this.branchConfigs.delete(data.id)
  }

  /**
   * 处理边添加
   */
  private handleEdgeAdd({ data }: { data: any }) {
    // 检查是否是从分流网关出发的新分支
    const sourceNode = this.lf.getNodeModelById(data.sourceNodeId)
    if (sourceNode?.type === 'bpmn:inclusiveGateway' && 
        sourceNode.properties?.pairType === 'fork') {
      // 为新分支设置属性
      this.lf.setProperties(data.id, {
        branchType: 'normal',
        isDefault: false,
        forkGatewayId: data.sourceNodeId,
      })
    }
  }

  /**
   * 手动添加新分支
   */
  public addBranch(forkGatewayId: string, branchName: string, condition: string) {
    const pairInfo = this.gatewayPairs.get(forkGatewayId)
    if (!pairInfo) {
      console.error('未找到网关配对信息')
      return null
    }
    
    const timestamp = Date.now()
    const forkNode = this.lf.getNodeModelById(forkGatewayId)
    const joinNode = this.lf.getNodeModelById(pairInfo.joinId)
    
    if (!forkNode || !joinNode) return null
    
    // 计算新分支位置（在现有分支下方）
    const existingBranches = this.getExistingBranches(forkGatewayId)
    const yOffset = 80 * (existingBranches.length + 1)
    
    // 创建新任务节点
    const newTaskId = `Task_${branchName}_${timestamp}`
    this.lf.addNode({
      id: newTaskId,
      type: 'bpmn:userTask',
      x: (forkNode.x + joinNode.x) / 2,
      y: forkNode.y + yOffset,
      text: branchName,
      properties: {
        branchType: 'normal',
        isDefault: false,
        forkGatewayId: forkGatewayId,
        joinGatewayId: pairInfo.joinId,
      },
    })
    
    // 创建分流网关到新任务的连线
    const flowInId = `Flow_In_${timestamp}`
    this.lf.addEdge({
      id: flowInId,
      type: 'bpmn:sequenceFlow',
      sourceNodeId: forkGatewayId,
      targetNodeId: newTaskId,
      text: branchName,
      properties: {
        condition: condition,
        branchType: 'normal',
        isDefault: false,
      },
    })
    
    // 创建新任务到聚合网关的连线
    const flowOutId = `Flow_Out_${timestamp}`
    this.lf.addEdge({
      id: flowOutId,
      type: 'bpmn:sequenceFlow',
      sourceNodeId: newTaskId,
      targetNodeId: pairInfo.joinId,
      properties: {
        branchType: 'normal',
      },
    })
    
    return {
      taskId: newTaskId,
      flowInId,
      flowOutId,
    }
  }

  /**
   * 获取现有分支
   */
  private getExistingBranches(forkGatewayId: string) {
    const edges = this.lf.getGraphRawData().edges
    return edges.filter(edge => 
      edge.sourceNodeId === forkGatewayId && 
      edge.type === 'bpmn:sequenceFlow'
    )
  }

  /**
   * 获取配对信息
   */
  public getPairInfo(gatewayId: string): PairInfo | undefined {
    return this.gatewayPairs.get(gatewayId)
  }

  /**
   * 销毁管理器
   */
  public destroy() {
    this.lf.off('node:dnd-add', this.handleNodeDndAdd.bind(this))
    this.lf.off('node:delete', this.handleNodeDelete.bind(this))
    this.lf.off('edge:delete', this.handleEdgeDelete.bind(this))
    this.lf.off('edge:add', this.handleEdgeAdd.bind(this))
    this.gatewayPairs.clear()
    this.branchConfigs.clear()
  }
}

// 类型定义
interface PairInfo {
  forkId: string
  joinId: string
  normalBranch: {
    taskId: string
    flowInId: string
    flowOutId: string
  }
  defaultBranch: {
    taskId: string
    flowInId: string
    flowOutId: string
  }
  createdAt: string
}

interface BranchConfig {
  isDefault: boolean
  isDeletable: boolean
  pairId: PairInfo
}

// 导出
export { InclusiveGatewayPairManager, PairInfo, BranchConfig }
```

## 二、使用示例

```typescript
import LogicFlow from '@logicflow/core'
import { BPMNElements } from '@logicflow/extension'
import { InclusiveGatewayPairManager } from './inclusive-gateway-pair-manager'

// 初始化 LogicFlow
const lf = new LogicFlow({
  container: document.getElementById('container'),
  grid: {
    size: 20,
    visible: true,
    type: 'dot',
  },
})

// 注册 BPMN 插件
lf.use(BPMNElements)

// 初始化包容网关成对管理器
const pairManager = new InclusiveGatewayPairManager(lf)

// 现在当您从拖拽面板拖入包容网关时，会自动：
// 1. 创建成对的分流和聚合网关
// 2. 创建一个普通分支（带条件）
// 3. 创建一个默认分支（禁止删除）
// 4. 自动连接所有节点

// 手动添加新分支
document.getElementById('addBranchBtn').addEventListener('click', () => {
  const forkGatewayId = 'Gateway_Fork_xxxxx' // 分流网关 ID
  pairManager.addBranch(
    forkGatewayId,
    '高级审批',
    '${amount > 10000}'
  )
})

// 获取配对信息
const pairInfo = pairManager.getPairInfo('Gateway_Fork_xxxxx')
console.log('配对信息:', pairInfo)

// 销毁管理器（组件卸载时调用）
// pairManager.destroy()
```

## 三、拖拽面板配置

```typescript
import { DndPanel } from '@logicflow/extension'

lf.use(DndPanel)

// 配置拖拽面板
lf.extension.dndPanel.setPatternItems([
  {
    type: 'bpmn:startEvent',
    text: '开始事件',
    icon: 'data:image/svg+xml;base64,...',
  },
  {
    type: 'bpmn:endEvent',
    text: '结束事件',
    icon: 'data:image/svg+xml;base64,...',
  },
  {
    type: 'bpmn:inclusiveGateway',
    text: '包容网关（成对）',
    icon: 'data:image/svg+xml;base64,...',// 包容网关图标
    className: 'inclusive-gateway-item', // 自定义样式
  },
  {
    type: 'bpmn:userTask',
    text: '用户任务',
    icon: 'data:image/svg+xml;base64,...',
  },
])
```

## 四、样式配置

```css
/* 包容网关拖拽项样式 */
.inclusive-gateway-item {
  position: relative;
}

.inclusive-gateway-item::after {
  content: '成对';
  position: absolute;
  top: -5px;
  right: -5px;
  background: #1890ff;
  color: white;
  font-size: 10px;
  padding: 2px 4px;
  border-radius: 4px;
}

/* 默认分支样式（不可删除标识）*/
.default-branch {
  stroke: #52c41a;
  stroke-width: 2;
}

.default-branch::before {
  content: '默认';
  background: #52c41a;
  color: white;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 12px;
}
```

## 五、删除保护提示

```typescript
// 扩展删除保护逻辑
lf.on('edge:delete', ({ data }) => {
  if (data.properties?.isDefault) {
    // 显示提示消息
    const message = document.createElement('div')
    message.className = 'delete-warning-toast'
    message.textContent = '默认分支不能删除，它是流程的保底路径'
    document.body.appendChild(message)
    
    setTimeout(() => {
      message.remove()
    }, 3000)
    
    return false
  }
})
```

## 六、流程图示例

```
                    ┌─────────────────┐
                    │   普通分支      │
                    │  (条件A=true)   │
                    └────────┬────────┘
                             │
┌──────────┐    ┌────────────┴────────────┐    ┌──────────┐
│  开始    ├───►│      包容网关(分流)      ├───►│  ...     │
└──────────┘    └────────────┬────────────┘    └──────────┘
                             │
                    ┌────────┴────────┐
                    │   默认分支      │
                    │   (禁止删除)    │
                    └────────┬────────┘
                             │
                    ┌────────┴────────┐
                    │  包容网关(聚合)  │
                    └────────┬────────┘
                             │
                    ┌────────┴────────┐
                    │      结束       │
                    └─────────────────┘
```

## 七、API 参考

### InclusiveGatewayPairManager

| 方法 | 参数 | 返回值 | 说明 |
|------|------|--------|------|
| `constructor(lf)` | lf: LogicFlow | - | 创建管理器实例 |
| `addBranch(forkId, name, condition)` | forkId: string, name: string, condition: string | BranchResult \| null | 手动添加新分支 |
| `getPairInfo(gatewayId)` | gatewayId: string | PairInfo \| undefined | 获取配对信息 |
| `destroy()` | - | void | 销毁管理器 |

### PairInfo 类型

```typescript
interface PairInfo {
  forkId: string          // 分流网关 ID
  joinId: string          // 聚合网关 ID
  normalBranch: {
    taskId: string        // 普通分支任务 ID
    flowInId: string      // 分流到任务的边 ID
    flowOutId: string     // 任务到聚合的边 ID
  }
  defaultBranch: {
    taskId: string        // 默认分支任务 ID
    flowInId: string      // 分流到任务的边 ID
    flowOutId: string     // 任务到聚合的边 ID
  }
  createdAt: string       // 创建时间
}
```

## 八、默认分支连线禁止设置条件

默认分支是包容网关的保底路径，不应该设置条件。以下是禁用编辑的几种实现方式：

### 方式一：监听边属性变化事件

```typescript
// 在 InclusiveGatewayPairManager 类中添加
private init() {
  // ... 其他监听
  
  // 监听边属性变化，阻止默认分支设置条件
  this.lf.on('edge:properties-change', this.handleEdgePropertiesChange.bind(this))
}

/**
 * 处理边属性变化（阻止默认分支设置条件）
 */
private handleEdgePropertiesChange({ data, key, value }: any) {
  const branchConfig = this.branchConfigs.get(data.id)
  
  // 如果是默认分支，且尝试修改条件相关属性
  if (branchConfig?.isDefault && (key === 'condition' || key === 'text')) {
    console.warn('默认分支不能设置条件')
    
    // 恢复原始值
    setTimeout(() => {
      this.lf.setProperties(data.id, {
        condition: undefined,
      })
      // 恢复文本为"默认"
      const edgeModel = this.lf.getEdgeModelById(data.id)
      if (edgeModel) {
        edgeModel.setText('默认')
      }
    }, 0)
    
    return false
  }
}

// 销毁时移除监听
public destroy() {
  // ... 其他清理
  this.lf.off('edge:properties-change', this.handleEdgePropertiesChange.bind(this))
}
```

### 方式二：自定义边模型禁用编辑

```typescript
import { PolylineEdge, PolylineEdgeModel } from '@logicflow/core'

// 自定义默认分支边模型
class DefaultSequenceFlowModel extends PolylineEdgeModel {
  // 禁止设置条件
  setAttributes() {
    // 如果尝试设置条件，忽略
  }
  
  // 重写文本编辑
  getTextEditable() {
    return false // 禁止编辑文本
  }
  
  // 重写属性设置
  setProperties(properties: Record<string, any>) {
    // 过滤掉条件相关的属性
    const filteredProperties = { ...properties }
    delete filteredProperties.condition
    delete filteredProperties.expression
    
    super.setProperties({
      ...filteredProperties,
      isDefault: true,
    })
  }
  
  // 自定义样式（可选，用于视觉区分）
  getEdgeStyle() {
    const style = super.getEdgeStyle()
    style.stroke = '#52c41a' // 绿色表示默认分支
    style.strokeWidth = 2
    return style
  }
}

class DefaultSequenceFlowView extends PolylineEdge {
  // 自定义渲染（可选）
}

// 注册自定义边
const DefaultSequenceFlow = {
  type: 'bpmn:defaultSequenceFlow',
  view: DefaultSequenceFlowView,
  model: DefaultSequenceFlowModel,
}

lf.register(DefaultSequenceFlow)

// 创建默认分支时使用自定义边类型
this.lf.addEdge({
  id: defaultFlowId,
  type: 'bpmn:defaultSequenceFlow', // 使用自定义边类型
  sourceNodeId: forkId,
  targetNodeId: defaultTaskId,
  text: '默认',
  properties: {
    isDefault: true,
    branchType: 'default',
  },
})
```

### 方式三：通过 UI 禁用编辑

```typescript
// 在属性面板中禁用默认分支的条件编辑
function renderPropertyPanel(edgeData: any) {
  const isDefault = edgeData.properties?.isDefault
  
  if (isDefault) {
    return `
      <div class="property-panel">
        <div class="property-item disabled">
          <label>条件表达式</label>
          <input type="text" disabled value="默认分支无需条件" />
          <span class="hint">默认分支是保底路径，不需要设置条件</span>
        </div>
        <div class="property-item">
          <label>分支类型</label>
          <span class="badge badge-default">默认分支</span>
        </div>
      </div>
    `
  }
  
  // 普通分支显示条件编辑
  return `
    <div class="property-panel">
      <div class="property-item">
        <label>条件表达式</label>
        <input type="text" value="${edgeData.properties?.condition || ''}" />
      </div>
    </div>
  `
}
```

### 方式四：完整的条件编辑保护

```typescript
/**
 * 完整的条件编辑保护（添加到管理器中）
 */
class InclusiveGatewayPairManager {
  // ... 其他代码
  
  /**
   * 禁止默认分支编辑条件
   */
  public disableDefaultBranchEditing(edgeId: string) {
    const edge = this.lf.getEdgeModelById(edgeId)
    if (!edge) return
    
    const branchConfig = this.branchConfigs.get(edgeId)
    if (!branchConfig?.isDefault) return
    
    // 1. 禁止文本编辑
    edge.setTextEditable(false)
    
    // 2. 设置只读属性
    this.lf.setProperties(edgeId, {
      isDefault: true,
      editable: false,
      condition: undefined, // 确保没有条件
    })
    
    // 3. 添加视觉标识
    this.addDefaultBranchIndicator(edgeId)
  }
  
  /**
   * 添加默认分支视觉标识
   */
  private addDefaultBranchIndicator(edgeId: string) {
    const edge = this.lf.getEdgeModelById(edgeId)
    if (!edge) return
    
    // 设置特殊样式
    edge.setStyle({
      stroke: '#52c41a',
      strokeWidth: 2,
      strokeDasharray: '5,5', // 虚线
    })
    
    // 设置文本
    edge.setText('默认（无需条件）')
  }
  
  /**
   * 验证边的条件设置
   */
  public validateEdgeCondition(edgeId: string): boolean {
    const edge = this.lf.getEdgeModelById(edgeId)
    if (!edge) return true
    
    const branchConfig = this.branchConfigs.get(edgeId)
    
    // 如果是默认分支，不允许有条件
    if (branchConfig?.isDefault && edge.properties?.condition) {
      console.error('默认分支不能设置条件')
      return false
    }
    
    // 如果是普通分支，必须有条件
    if (!branchConfig?.isDefault && !edge.properties?.condition) {
      console.warn('普通分支建议设置条件')
      return true // 只是警告，不阻止
    }
    
    return true
  }
}

// 使用示例
const pairManager = new InclusiveGatewayPairManager(lf)

// 在属性面板保存时验证
document.getElementById('saveConditionBtn').addEventListener('click', () => {
  const edgeId = getCurrentSelectedEdgeId()
  
  if (!pairManager.validateEdgeCondition(edgeId)) {
    showToast('默认分支不能设置条件！')
    return
  }
  
  // 保存条件...
})
```

### CSS 样式配合

```css
/* 默认分支样式 */
.default-branch-edge {
  stroke: #52c41a;
  stroke-width: 2;
  stroke-dasharray: 5, 5;
}

/* 禁用编辑的输入框 */
.property-item.disabled input {
  background-color: #f5f5f5;
  color: #999;
  cursor: not-allowed;
}

.property-item.disabled .hint {
  color: #999;
  font-size: 12px;
  margin-top: 4px;
}

/* 默认分支标识 */
.badge-default {
  background-color: #52c41a;
  color: white;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
}
```

## 九、节点和连线名称双击编辑

LogicFlow 支持双击节点和连线在原地编辑名称。以下是完整的配置方法：

### 9.1 基础配置

```typescript
import LogicFlow from '@logicflow/core'
import { BPMNElements } from '@logicflow/extension'

const lf = new LogicFlow({
  container: document.getElementById('container'),
  // 启用文本编辑
  edgeTextEdit: true,   // 允许边文本编辑
  nodeTextEdit: true,   // 允许节点文本编辑
})
```

### 9.2 节点文本编辑

#### 默认行为
节点文本默认支持双击编辑。双击节点后，会在文本位置出现输入框。

#### 自定义节点文本编辑

```typescript
import { RectNode, RectNodeModel } from '@logicflow/core'

class CustomTaskModel extends RectNodeModel {
  // 设置文本可编辑
  getTextEditable() {
    return true  // 允许编辑
  }
  
  // 设置文本位置
  getTextPosition() {
    const { x, y, width, height } = this
    return {
      x: x,
      y: y - height / 2 - 10,  // 文本在节点上方
    }
  }
  
  // 设置文本样式
  getTextStyle() {
    const style = super.getTextStyle()
    return {
      ...style,
      fontSize: 14,
      color: '#333',
      // 编辑时的样式
      hover: {
        fontSize: 14,
        color: '#1890ff',
      },
    }
  }
}

// 注册自定义节点
lf.register({
  type: 'bpmn:customTask',
  model: CustomTaskModel,
  view: RectNode,
})
```

### 9.3 连线文本编辑

#### 默认行为
连线文本也支持双击编辑。双击连线后，会在连线中点出现输入框。

#### 自定义连线文本编辑

```typescript
import { PolylineEdge, PolylineEdgeModel } from '@logicflow/core'

class CustomSequenceFlowModel extends PolylineEdgeModel {
  // 设置文本可编辑
  getTextEditable() {
    return true  // 允许编辑
  }
  
  // 设置文本位置（连线中点）
  getTextPosition() {
    const { startPoint, endPoint } = this
    return {
      x: (startPoint.x + endPoint.x) / 2,
      y: (startPoint.y + endPoint.y) / 2,
    }
  }
  
  // 设置文本样式
  getTextStyle() {
    const style = super.getTextStyle()
    return {
      ...style,
      fontSize: 12,
      color: '#666',
      background: {
        fill: '#fff',
        stroke: 'transparent',
        radius: 4,
      },
    }
  }
  
  // 获取文本编辑器样式
  getEditStyle() {
    return {
      background: '#fff',
      border: '1px solid #1890ff',
      borderRadius: '4px',
      padding: '4px 8px',
      fontSize: '12px',
    }
  }
}

// 注册自定义边
lf.register({
  type: 'bpmn:customSequenceFlow',
  model: CustomSequenceFlowModel,
  view: PolylineEdge,
})
```

### 9.4 监听文本编辑事件

```typescript
// 监听节点文本编辑完成
lf.on('node:text-update', ({ data }) => {
  console.log('节点文本更新:', data.id, data.text)
  
  // 可以在这里做验证或保存
  if (!data.text || data.text.trim() === '') {
    console.warn('节点名称不能为空')
    // 恢复默认值
    lf.setProperties(data.id, { text: '未命名节点' })
  }
})

// 监听边文本编辑完成
lf.on('edge:text-update', ({ data }) => {
  console.log('边文本更新:', data.id, data.text)
  
  // 验证条件格式
  if (data.properties?.condition) {
    const condition = data.text?.value || data.text
    if (!condition.startsWith('${') || !condition.endsWith('}')) {
      console.warn('条件格式不正确，应使用 ${expression} 格式')
    }
  }
})

// 监听文本编辑开始
lf.on('text:update-start', ({ data, type }) => {
  console.log('开始编辑:', type, data.id)
})

// 监听文本编辑取消
lf.on('text:update-cancel', ({ data, type }) => {
  console.log('取消编辑:', type, data.id)
})
```

### 9.5 程序化控制文本编辑

```typescript
// 手动开始编辑节点文本
function startEditNodeText(nodeId: string) {
  const node = lf.getNodeModelById(nodeId)
  if (node) {
    // 触发编辑模式
    lf.editText(nodeId)
  }
}

// 手动更新节点文本
function updateNodeText(nodeId: string, newText: string) {
  const node = lf.getNodeModelById(nodeId)
  if (node) {
    node.setText(newText)
  }
}

// 手动更新边文本
function updateEdgeText(edgeId: string, newText: string) {
  const edge = lf.getEdgeModelById(edgeId)
  if (edge) {
    edge.setText(newText)
  }
}

// 批量更新文本
function batchUpdateTexts(updates: Array<{ id: string, text: string, type: 'node' | 'edge' }>) {
  updates.forEach(({ id, text, type }) => {
    if (type === 'node') {
      updateNodeText(id, text)
    } else {
      updateEdgeText(id, text)
    }
  })
}
```

### 9.6 完整的文本编辑配置示例

```typescript
import LogicFlow from '@logicflow/core'
import { BPMNElements } from '@logicflow/extension'

// 初始化 LogicFlow
const lf = new LogicFlow({
  container: document.getElementById('container'),
  grid: { size: 20, visible: true, type: 'dot' },
  // 文本编辑配置
  edgeTextEdit: true,
  nodeTextEdit: true,
  // 键盘配置（用于确认编辑）
  keyboard: { enabled: true },
})

// 注册插件
lf.use(BPMNElements)

// 设置主题（文本样式）
lf.setTheme({
  nodeText: {
    fontSize: 14,
    color: '#333',
    overflowMode: 'ellipsis',
    textWidth: 100,
    background: {
      fill: 'transparent',
    },
  },
  edgeText: {
    fontSize: 12,
    color: '#666',
    overflowMode: 'ellipsis',
    textWidth: 100,
    background: {
      fill: '#fff',
      stroke: '#e8e8e8',
      radius: 4,
    },
  },
})

// 监听文本更新事件
lf.on('node:text-update', ({ data }) => {
  // 保存到后端
  saveNodeText(data.id, data.text?.value || data.text)
})

lf.on('edge:text-update', ({ data }) => {
  // 保存到后端
  saveEdgeText(data.id, data.text?.value || data.text)
})

// 渲染初始数据
lf.render({
  nodes: [
    {
      id: 'node1',
      type: 'bpmn:userTask',
      x: 200,
      y: 200,
      text: '用户任务',  // 初始文本
    },
  ],
  edges: [
    {
      id: 'edge1',
      type: 'bpmn:sequenceFlow',
      sourceNodeId: 'node1',
      targetNodeId: 'node2',
      text: '条件A',  // 初始文本
    },
  ],
})

// 双击节点或连线即可编辑文本
// 按 Enter 确认编辑
// 按 Escape 取消编辑
```

### 9.7 文本编辑样式自定义

```css
/* 文本编辑输入框样式 */
.lf-text-editor {
  background: #fff;
  border: 1px solid #1890ff;
  border-radius: 4px;
  padding: 4px 8px;
  font-size: 14px;
  outline: none;
  min-width: 100px;
}

.lf-text-editor:focus {
  border-color: #40a9ff;
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
}

/* 节点文本样式 */
.lf-node-text {
  cursor: text;
}

.lf-node-text:hover {
  color: #1890ff;
}

/* 边文本样式 */
.lf-edge-text {
  cursor: text;
}

.lf-edge-text:hover {
  color: #1890ff;
}

/* 文本背景 */
.lf-text-background {
  fill: #fff;
  stroke: #e8e8e8;
  stroke-width: 1;
  rx: 4;
  ry: 4;
}
```

### 9.8 禁用特定元素的文本编辑

```typescript
// 禁用特定节点的文本编辑
class ReadOnlyNodeModel extends RectNodeModel {
  getTextEditable() {
    return false  // 禁止编辑
  }
}

// 禁用特定边的文本编辑
class ReadOnlyEdgeModel extends PolylineEdgeModel {
  getTextEditable() {
    return false  // 禁止编辑
  }
}

// 动态控制文本编辑
function setEditable(elementId: string, editable: boolean) {
  const node = lf.getNodeModelById(elementId)
  const edge = lf.getEdgeModelById(elementId)
  
  if (node) {
    node.setTextEditable(editable)
  }
  if (edge) {
    edge.setTextEditable(editable)
  }
}

// 使用示例：禁用默认分支的文本编辑
lf.on('edge:add', ({ data }) => {
  if (data.properties?.isDefault) {
    const edge = lf.getEdgeModelById(data.id)
    if (edge) {
      edge.setTextEditable(false)  // 默认分支禁止编辑文本
    }
  }
})
```

### 9.9 文本编辑快捷键

| 快捷键 | 功能 |
|--------|------|
| `Enter` | 确认编辑 |
| `Escape` | 取消编辑 |
| `Ctrl/Cmd + Z` | 撤销（需要启用 history 插件） |

### 9.10 文本编辑验证

```typescript
// 文本验证函数
function validateNodeText(text: string): { valid: boolean, message?: string } {
  if (!text || text.trim() === '') {
    return { valid: false, message: '节点名称不能为空' }
  }
  if (text.length > 50) {
    return { valid: false, message: '节点名称不能超过50个字符' }
  }
  return { valid: true }
}

function validateEdgeText(text: string, isDefault: boolean): { valid: boolean, message?: string } {
  // 默认分支不需要条件
  if (isDefault) {
    return { valid: true }
  }
  
  // 普通分支需要条件
  if (!text || text.trim() === '') {
    return { valid: false, message: '请输入条件表达式' }
  }
  
  // 验证条件格式
  if (!text.startsWith('${') || !text.endsWith('}')) {
    return { valid: false, message: '条件格式应为 ${expression}' }
  }
  
  return { valid: true }
}

// 应用验证
lf.on('node:text-update', ({ data }) => {
  const text = data.text?.value || data.text || ''
  const result = validateNodeText(text)
  
  if (!result.valid) {
    showToast(result.message || '验证失败')
    // 恢复旧值
    // lf.undo() // 如果启用了 history
  }
})

lf.on('edge:text-update', ({ data }) => {
  const text = data.text?.value || data.text || ''
  const isDefault = data.properties?.isDefault
  const result = validateEdgeText(text, isDefault)
  
  if (!result.valid) {
    showToast(result.message || '验证失败')
  }
})
```

## 十、节点之间连线唯一性卡控

在 BPMN 流程图中，通常需要限制两个节点之间只能有一条连线。以下是完整的实现方案：

### 10.1 使用 LogicFlow 内置规则

LogicFlow 提供了 `silenceMode` 和连接规则来控制连线行为：

```typescript
import LogicFlow from '@logicflow/core'

const lf = new LogicFlow({
  container: document.getElementById('container'),
  // 允许重复连线设置为 false（默认为 true）
  allowRotation: false,
  // 自定义连接规则
  edgeGenerator: (sourceNode, targetNode, currentEdge) => {
    // 检查是否已存在相同方向的连线
    const edges = lf.getGraphRawData().edges
    const existingEdge = edges.find(edge => 
      edge.sourceNodeId === sourceNode.id && 
      edge.targetNodeId === targetNode.id
    )
    
    if (existingEdge) {
      // 已存在连线，返回 null 阻止创建
      return null
    }
    
    // 返回默认边类型
    return 'bpmn:sequenceFlow'
  },
})
```

### 10.2 监听连线事件阻止重复连线

```typescript
/**
 * 连线唯一性管理器
 */
class EdgeUniquenessManager {
  private lf: LogicFlow
  private edgeMap: Map<string, string> // 存储 sourceId->targetId 的映射

  constructor(lf: LogicFlow) {
    this.lf = lf
    this.edgeMap = new Map()
    this.init()
  }

  private init() {
    // 监听连线添加前事件
    this.lf.on('edge:add', this.handleEdgeAdd.bind(this))
    
    // 监听连线删除事件
    this.lf.on('edge:delete', this.handleEdgeDelete.bind(this))
    
    // 监听连线创建前事件（更早的拦截点）
    this.lf.on('connection:before-add', this.handleBeforeAdd.bind(this))
  }

  /**
   * 生成连线唯一标识
   */
  private getEdgeKey(sourceId: string, targetId: string): string {
    return `${sourceId}->${targetId}`
  }

  /**
   * 连线创建前拦截
   */
  private handleBeforeAdd({ data }: { data: any }) {
    const key = this.getEdgeKey(data.sourceNodeId, data.targetNodeId)
    
    if (this.edgeMap.has(key)) {
      // 已存在相同连线，阻止创建
      console.warn('节点之间已存在连线，不能重复创建')
      return false
    }
    
    return true
  }

  /**
   * 处理连线添加
   */
  private handleEdgeAdd({ data }: { data: any }) {
    const key = this.getEdgeKey(data.sourceNodeId, data.targetNodeId)
    this.edgeMap.set(key, data.id)
    console.log('连线已添加:', key)
  }

  /**
   * 处理连线删除
   */
  private handleEdgeDelete({ data }: { data: any }) {
    const key = this.getEdgeKey(data.sourceNodeId, data.targetNodeId)
    this.edgeMap.delete(key)
    console.log('连线已删除:', key)
  }

  /**
   * 检查两个节点之间是否已存在连线
   */
  public hasEdge(sourceId: string, targetId: string): boolean {
    const key = this.getEdgeKey(sourceId, targetId)
    return this.edgeMap.has(key)
  }

  /**
   * 获取两个节点之间的连线
   */
  public getEdge(sourceId: string, targetId: string): string | undefined {
    const key = this.getEdgeKey(sourceId, targetId)
    return this.edgeMap.get(key)
  }

  /**
   * 销毁管理器
   */
  public destroy() {
    this.lf.off('edge:add', this.handleEdgeAdd.bind(this))
    this.lf.off('edge:delete', this.handleEdgeDelete.bind(this))
    this.lf.off('connection:before-add', this.handleBeforeAdd.bind(this))
    this.edgeMap.clear()
  }
}

// 使用示例
const edgeUniquenessManager = new EdgeUniquenessManager(lf)
```

### 10.3 完整的连线唯一性验证方案

```typescript
import LogicFlow from '@logicflow/core'
import { BPMNElements } from '@logicflow/extension'

/**
 * 完整的连线唯一性验证
 */
class EdgeValidationManager {
  private lf: LogicFlow

  constructor(lf: LogicFlow) {
    this.lf = lf
    this.init()
  }

  private init() {
    // 方式一：监听边添加事件，检测到重复时删除
    this.lf.on('edge:add', this.validateAndRemoveDuplicate.bind(this))
    
    // 方式二：使用自定义规则（推荐）
    this.setupConnectionRules()
  }

  /**
   * 设置连接规则
   */
  private setupConnectionRules() {
    // 获取默认的连接规则
    const graphModel = this.lf.graphModel
    
    // 重写边的创建方法
    const originalAddEdge = graphModel.addEdge.bind(graphModel)
    graphModel.addEdge = (edgeConfig: any) => {
      // 检查是否已存在相同连线
      if (this.checkDuplicateEdge(edgeConfig.sourceNodeId, edgeConfig.targetNodeId)) {
        this.showDuplicateWarning()
        return null
      }
      return originalAddEdge(edgeConfig)
    }
  }

  /**
   * 检查是否存在重复连线
   */
  private checkDuplicateEdge(sourceId: string, targetId: string): boolean {
    const graphData = this.lf.getGraphRawData()
    const edges = graphData.edges
    
    return edges.some(edge => 
      edge.sourceNodeId === sourceId && 
      edge.targetNodeId === targetId
    )
  }

  /**
   * 验证并删除重复连线
   */
  private validateAndRemoveDuplicate({ data }: { data: any }) {
    const graphData = this.lf.getGraphRawData()
    const edges = graphData.edges
    
    // 查找相同源和目标的连线
    const duplicateEdges = edges.filter(edge => 
      edge.sourceNodeId === data.sourceNodeId && 
      edge.targetNodeId === data.targetNodeId &&
      edge.id !== data.id
    )
    
    if (duplicateEdges.length > 0) {
      // 删除新创建的重复连线
      setTimeout(() => {
        this.lf.deleteEdge(data.id)
        this.showDuplicateWarning()
      }, 0)
    }
  }

  /**
   * 显示重复连线警告
   */
  private showDuplicateWarning() {
    // 方式一：使用 alert
    // alert('节点之间已存在连线，不能重复创建')
    
    // 方式二：使用自定义提示（推荐）
    const toast = document.createElement('div')
    toast.className = 'edge-duplicate-toast'
    toast.innerHTML = `
      <div class="toast-content">
        <span class="toast-icon">⚠️</span>
        <span class="toast-message">节点之间已存在连线，不能重复创建</span>
      </div>
    `
    document.body.appendChild(toast)
    
    setTimeout(() => {
      toast.classList.add('fade-out')
      setTimeout(() => toast.remove(), 300)
    }, 2000)
  }

  /**
   * 验证整个图的连线唯一性
   */
  public validateGraph(): { valid: boolean; duplicates: Array<{ sourceId: string; targetId: string; count: number }> } {
    const graphData = this.lf.getGraphRawData()
    const edgeCount = new Map<string, number>()
    
    // 统计每对节点之间的连线数量
    graphData.edges.forEach(edge => {
      const key = `${edge.sourceNodeId}->${edge.targetNodeId}`
      edgeCount.set(key, (edgeCount.get(key) || 0) + 1)
    })
    
    // 找出重复的连线
    const duplicates: Array<{ sourceId: string; targetId: string; count: number }> = []
    edgeCount.forEach((count, key) => {
      if (count > 1) {
        const [sourceId, targetId] = key.split('->')
        duplicates.push({ sourceId, targetId, count })
      }
    })
    
    return {
      valid: duplicates.length === 0,
      duplicates,
    }
  }

  /**
   * 销毁管理器
   */
  public destroy() {
    this.lf.off('edge:add', this.validateAndRemoveDuplicate.bind(this))
  }
}

// 使用示例
const lf = new LogicFlow({
  container: document.getElementById('container'),
})

lf.use(BPMNElements)

const edgeValidationManager = new EdgeValidationManager(lf)

// 在保存前验证
document.getElementById('saveBtn').addEventListener('click', () => {
  const result = edgeValidationManager.validateGraph()
  if (!result.valid) {
    console.error('存在重复连线:', result.duplicates)
    alert('流程图存在重复连线，请检查')
    return
  }
  // 保存流程图
  saveGraph()
})
```

### 10.4 自定义边模型实现唯一性

```typescript
import { PolylineEdge, PolylineEdgeModel } from '@logicflow/core'

/**
 * 自定义顺序流边模型（带唯一性检查）
 */
class UniqueSequenceFlowModel extends PolylineEdgeModel {
  /**
   * 重写初始化方法，添加唯一性检查
   */
  initEdgeData(data: any) {
    super.initEdgeData(data)
    
    // 检查是否已存在相同连线
    const graphData = this.graphModel.getGraphRawData()
    const existingEdge = graphData.edges.find((edge: any) => 
      edge.sourceNodeId === data.sourceNodeId && 
      edge.targetNodeId === data.targetNodeId &&
      edge.id !== data.id
    )
    
    if (existingEdge) {
      // 标记为重复，稍后删除
      this.isDuplicate = true
    }
  }
  
  /**
   * 设置属性后检查
   */
  setAttributes() {
    super.setAttributes()
    
    if (this.isDuplicate) {
      // 延迟删除，避免在初始化过程中删除
      setTimeout(() => {
        this.graphModel.deleteEdgeById(this.id)
      }, 0)
    }
  }
}

// 注册自定义边
lf.register({
  type: 'bpmn:uniqueSequenceFlow',
  model: UniqueSequenceFlowModel,
  view: PolylineEdge,
})
```

### 10.5 使用插件方式实现

```typescript
import LogicFlow from '@logicflow/core'

/**
 * 连线唯一性插件
 */
class EdgeUniquenessPlugin {
  private lf: LogicFlow
  private static pluginName = 'edgeUniqueness'

  constructor({ lf }: { lf: LogicFlow }) {
    this.lf = lf
    this.init()
  }

  private init() {
    // 监听连线前事件
    this.lf.on('edge:before-add', ({ data }: { data: any }) => {
      return this.checkUniqueness(data.sourceNodeId, data.targetNodeId)
    })
  }

  private checkUniqueness(sourceId: string, targetId: string): boolean {
    const edges = this.lf.getGraphRawData().edges
    const exists = edges.some((edge: any) => 
      edge.sourceNodeId === sourceId && 
      edge.targetNodeId === targetId
    )
    
    if (exists) {
      this.showTip('节点之间已存在连线')
      return false
    }
    
    return true
  }

  private showTip(message: string) {
    // 显示提示信息
    console.warn(message)
  }

  public destroy() {
    this.lf.off('edge:before-add')
  }
}

// 使用插件
const lf = new LogicFlow({
  container: document.getElementById('container'),
  plugins: [EdgeUniquenessPlugin],
})
```

### 10.6 完整使用示例

```typescript
import LogicFlow from '@logicflow/core'
import { BPMNElements } from '@logicflow/extension'

// 初始化 LogicFlow
const lf = new LogicFlow({
  container: document.getElementById('container'),
  grid: { size: 20, visible: true, type: 'dot' },
  // 启用键盘快捷键
  keyboard: { enabled: true },
})

// 注册 BPMN 插件
lf.use(BPMNElements)

// 创建连线唯一性管理器
const edgeUniquenessManager = new EdgeUniquenessManager(lf)

// 或者使用验证管理器
const edgeValidationManager = new EdgeValidationManager(lf)

// 渲染初始数据
lf.render({
  nodes: [
    { id: 'node1', type: 'bpmn:startEvent', x: 100, y: 200, text: '开始' },
    { id: 'node2', type: 'bpmn:userTask', x: 300, y: 200, text: '任务A' },
    { id: 'node3', type: 'bpmn:endEvent', x: 500, y: 200, text: '结束' },
  ],
  edges: [
    { id: 'edge1', type: 'bpmn:sequenceFlow', sourceNodeId: 'node1', targetNodeId: 'node2' },
    { id: 'edge2', type: 'bpmn:sequenceFlow', sourceNodeId: 'node2', targetNodeId: 'node3' },
  ],
})

// 检查是否存在重复连线
console.log('node1->node2 是否已存在连线:', edgeUniquenessManager.hasEdge('node1', 'node2'))

// 保存前验证
function saveGraph() {
  const result = edgeValidationManager.validateGraph()
  if (!result.valid) {
    alert(`流程图存在 ${result.duplicates.length} 处重复连线`)
    return false
  }
  
  const graphData = lf.getGraphRawData()
  console.log('保存流程图:', graphData)
  return true
}

// 销毁管理器（组件卸载时）
// edgeUniquenessManager.destroy()
// edgeValidationManager.destroy()
```

### 10.7 CSS 样式

```css
/* 重复连线提示样式 */
.edge-duplicate-toast {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  background: #fff2f0;
  border: 1px solid #ffccc7;
  border-radius: 4px;
  padding: 10px 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  z-index: 10000;
  transition: opacity 0.3s;
}

.edge-duplicate-toast.fade-out {
  opacity: 0;
}

.toast-content {
  display: flex;
  align-items: center;
  gap: 8px;
}

.toast-icon {
  font-size: 16px;
}

.toast-message {
  color: #cf1322;
  font-size: 14px;
}

/* 连线时的视觉反馈 */
.lf-edge-duplicate {
  stroke: #ff4d4f !important;
  stroke-width: 3px !important;
  animation: pulse 1s infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}
```

### 10.8 API 参考

#### EdgeUniquenessManager

| 方法 | 参数 | 返回值 | 说明 |
|------|------|--------|------|
| `hasEdge(sourceId, targetId)` | sourceId: string, targetId: string | boolean | 检查两节点间是否已存在连线 |
| `getEdge(sourceId, targetId)` | sourceId: string, targetId: string | string \| undefined | 获取两节点间的连线 ID |
| `destroy()` | - | void | 销毁管理器 |

#### EdgeValidationManager

| 方法 | 参数 | 返回值 | 说明 |
|------|------|--------|------|
| `validateGraph()` | - | ValidationResult | 验证整个图的连线唯一性 |
| `destroy()` | - | void | 销毁管理器 |

#### ValidationResult 类型

```typescript
interface ValidationResult {
  valid: boolean
  duplicates: Array<{
    sourceId: string
    targetId: string
    count: number
  }>
}
```

## 十一、注意事项

1. **默认分支保护**：默认分支是流程的保底路径，当所有条件都不满足时执行
2. **默认分支无条件**：默认分支连线**禁止设置条件**，它是无条件执行的保底路径
3. **删除联动**：删除任一网关会自动删除配对网关和所有相关分支
4. **条件表达式**：普通分支使用 `${expression}` 格式定义条件
5. **ID 命名规范**：建议使用 `Gateway_Fork_`、`Gateway_Join_`、`Task_`、`Flow_` 等前缀
6. **编辑保护**：建议同时实现后端验证，防止通过 API 绕过前端限制
7. **文本编辑**：节点和连线默认支持双击编辑，可通过 `getTextEditable()` 控制是否可编辑
8. **文本验证**：建议在 `text-update` 事件中进行文本验证
9. **连线唯一性**：两个节点之间只能有一条连线，使用管理器或插件实现控制

## 十二、相关文档

- [BPMN 网关配置详解](./gateway-configuration.md)
- [BPMN 插件使用指南](./bpmn-plugin-guide.md)
- [BPMN 样式自定义指南](./bpmn-style-customization.md)
