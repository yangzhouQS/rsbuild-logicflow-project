# BPMN 网关配置详解

本文档详细介绍 LogicFlow BPMN 插件中三种网关的配置和使用方法。

## 目录

1. [网关概述](#网关概述)
2. [排他网关 (Exclusive Gateway)](#排他网关-exclusive-gateway)
3. [并行网关 (Parallel Gateway)](#并行网关-parallel-gateway)
4. [包容网关 (Inclusive Gateway)](#包容网关-inclusive-gateway)
5. [网关工厂函数](#网关工厂函数)
6. [自定义网关](#自定义网关)
7. [完整示例](#完整示例)

---

## 网关概述

BPMN 2.0 定义了以下几种网关类型：

| 网关类型 | type 值 | 图标 | 用途 |
|---------|---------|------|------|
| 排他网关 | `bpmn:exclusiveGateway` | X 形 | 条件分支，只选择一条路径 |
| 并行网关 | `bpmn:parallelGateway` | + 形 | 并行执行，所有路径同时执行 |
| 包容网关 | `bpmn:inclusiveGateway` | O 形 | 条件分支，可选择多条路径 |

### 网关图标定义

```typescript
// 排他网关图标 - X 形
export const exclusiveIcon =
  'm 16,15 7.42857142857143,9.714285714285715 -7.42857142857143,9.714285714285715 3.428571428571429,0 5.714285714285715,-7.464228571428572 5.714285714285715,7.464228571428572 3.428571428571429,0 -7.42857142857143,-9.714285714285715 7.42857142857143,-9.714285714285715 -3.428571428571429,0 -5.714285714285715,7.464228571428572 -5.714285714285715,-7.464228571428572 -3.428571428571429,0 z'

// 并行网关图标 - + 形
export const parallelIcon =
  'm 23,10 0,12.5 -12.5,0 0,5 12.5,0 0,12.5 5,0 0,-12.5 12.5,0 0,-5 -12.5,0 0,-12.5 -5,0 z'

// 包容网关图标 - O 形
export const inclusiveIcon = h('circle', {
  cx: 25,
  cy: 25,
  r: 13,
  style: 'stroke-linecap: round; stroke-linejoin: round; stroke: rgb(34, 36, 42); stroke-width: 2.5px; fill: white;',
})
```

---

## 排他网关 (Exclusive Gateway)

### 概述

排他网关（也称为 XOR 网关）用于根据条件选择**一条**执行路径。当流程到达排他网关时，会评估所有出口顺序流的条件，选择第一个条件为真的路径执行。

### 使用场景

- 根据审批结果选择不同路径
- 根据金额大小选择不同审批流程
- 根据状态选择不同处理逻辑

### 代码示例

```typescript
import LogicFlow from '@logicflow/core'
import { BpmnElement } from '@logicflow/extension'

const lf = new LogicFlow({
  container: document.getElementById('container'),
})

lf.use(BpmnElement)

// 创建排他网关流程
lf.render({
  nodes: [
    { id: 'start', type: 'bpmn:startEvent', x: 100, y: 200, text: '开始' },
    { id: 'gateway', type: 'bpmn:exclusiveGateway', x: 250, y: 200, text: '金额判断' },
    { id: 'task1', type: 'bpmn:userTask', x: 400, y: 100, text: '主管审批' },
    { id: 'task2', type: 'bpmn:userTask', x: 400, y: 300, text: '经理审批' },
    { id: 'end', type: 'bpmn:endEvent', x: 550, y: 200, text: '结束' },
  ],
  edges: [
    { id: 'e1', type: 'bpmn:sequenceFlow', sourceNodeId: 'start', targetNodeId: 'gateway' },
    { 
      id: 'e2', 
      type: 'bpmn:sequenceFlow', 
      sourceNodeId: 'gateway', 
      targetNodeId: 'task1',
      text: '金额<1000',
      properties: { condition: '${amount < 1000}' }
    },
    { 
      id: 'e3', 
      type: 'bpmn:sequenceFlow', 
      sourceNodeId: 'gateway', 
      targetNodeId: 'task2',
      text: '金额>=1000',
      properties: { condition: '${amount >= 1000}' }
    },
    { id: 'e4', type: 'bpmn:sequenceFlow', sourceNodeId: 'task1', targetNodeId: 'end' },
    { id: 'e5', type: 'bpmn:sequenceFlow', sourceNodeId: 'task2', targetNodeId: 'end' },
  ],
})
```

### XML 输出示例

```xml
<bpmn:exclusiveGateway id="Gateway_1" name="金额判断">
  <bpmn:incoming>Flow_1</bpmn:incoming>
  <bpmn:outgoing>Flow_2</bpmn:outgoing>
  <bpmn:outgoing>Flow_3</bpmn:outgoing>
</bpmn:exclusiveGateway>

<bpmn:sequenceFlow id="Flow_2" sourceRef="Gateway_1" targetRef="Task_1" name="金额<1000">
  <bpmn:conditionExpression xsi:type="bpmn:tFormalExpression">
    <![CDATA[${amount < 1000}]]>
  </bpmn:conditionExpression>
</bpmn:sequenceFlow>
```

---

## 并行网关 (Parallel Gateway)

### 概述

并行网关用于**同时**执行多条路径。当流程到达并行网关（分叉）时，所有出口顺序流都会被同时执行；当所有并行路径都完成后，会在并行网关（汇聚）处汇合。

### 使用场景

- 多个部门同时审批
- 并行执行多个独立任务
- 需要等待多个任务完成后继续

### 代码示例

```typescript
import LogicFlow from '@logicflow/core'
import { BPMNElements } from '@logicflow/extension'

const lf = new LogicFlow({
  container: document.getElementById('container'),
})

// 使用增强插件（包含并行网关）
lf.use(BPMNElements)

// 创建并行网关流程
lf.render({
  nodes: [
    { id: 'start', type: 'bpmn:startEvent', x: 100, y: 200, text: '开始' },
    { id: 'fork', type: 'bpmn:parallelGateway', x: 250, y: 200, text: '分叉' },
    { id: 'task1', type: 'bpmn:userTask', x: 400, y: 100, text: '财务审批' },
    { id: 'task2', type: 'bpmn:userTask', x: 400, y: 300, text: '技术审批' },
    { id: 'join', type: 'bpmn:parallelGateway', x: 550, y: 200, text: '汇聚' },
    { id: 'end', type: 'bpmn:endEvent', x: 700, y: 200, text: '结束' },
  ],
  edges: [
    { id: 'e1', type: 'bpmn:sequenceFlow', sourceNodeId: 'start', targetNodeId: 'fork' },
    { id: 'e2', type: 'bpmn:sequenceFlow', sourceNodeId: 'fork', targetNodeId: 'task1' },
    { id: 'e3', type: 'bpmn:sequenceFlow', sourceNodeId: 'fork', targetNodeId: 'task2' },
    { id: 'e4', type: 'bpmn:sequenceFlow', sourceNodeId: 'task1', targetNodeId: 'join' },
    { id: 'e5', type: 'bpmn:sequenceFlow', sourceNodeId: 'task2', targetNodeId: 'join' },
    { id: 'e6', type: 'bpmn:sequenceFlow', sourceNodeId: 'join', targetNodeId: 'end' },
  ],
})
```

### XML 输出示例

```xml
<bpmn:parallelGateway id="Gateway_Fork" name="分叉">
  <bpmn:incoming>Flow_1</bpmn:incoming>
  <bpmn:outgoing>Flow_2</bpmn:outgoing>
  <bpmn:outgoing>Flow_3</bpmn:outgoing>
</bpmn:parallelGateway>

<bpmn:parallelGateway id="Gateway_Join" name="汇聚">
  <bpmn:incoming>Flow_4</bpmn:incoming>
  <bpmn:incoming>Flow_5</bpmn:incoming>
  <bpmn:outgoing>Flow_6</bpmn:outgoing>
</bpmn:parallelGateway>
```

---

## 包容网关 (Inclusive Gateway)

### 概述

包容网关（也称为 OR 网关）结合了排他网关和并行网关的特点。它会评估所有出口顺序流的条件，**选择所有条件为真的路径**并行执行。

### 使用场景

- 根据条件选择一条或多条路径
- 可选的并行任务执行
- 复杂的条件分支逻辑

### 代码示例

```typescript
import LogicFlow from '@logicflow/core'
import { BPMNElements } from '@logicflow/extension'

const lf = new LogicFlow({
  container: document.getElementById('container'),
})

// 使用增强插件（包含包容网关）
lf.use(BPMNElements)

// 创建包容网关流程
lf.render({
  nodes: [
    { id: 'start', type: 'bpmn:startEvent', x: 100, y: 200, text: '开始' },
    { id: 'gateway', type: 'bpmn:inclusiveGateway', x: 250, y: 200, text: '服务选择' },
    { id: 'task1', type: 'bpmn:serviceTask', x: 400, y: 50, text: '短信通知' },
    { id: 'task2', type: 'bpmn:serviceTask', x: 400, y: 200, text: '邮件通知' },
    { id: 'task3', type: 'bpmn:serviceTask', x: 400, y: 350, text: '推送通知' },
    { id: 'end', type: 'bpmn:endEvent', x: 550, y: 200, text: '结束' },
  ],
  edges: [
    { id: 'e1', type: 'bpmn:sequenceFlow', sourceNodeId: 'start', targetNodeId: 'gateway' },
    { 
      id: 'e2', 
      type: 'bpmn:sequenceFlow', 
      sourceNodeId: 'gateway', 
      targetNodeId: 'task1',
      text: '需要短信',
      properties: { condition: '${needSMS === true}' }
    },
    { 
      id: 'e3', 
      type: 'bpmn:sequenceFlow', 
      sourceNodeId: 'gateway', 
      targetNodeId: 'task2',
      text: '需要邮件',
      properties: { condition: '${needEmail === true}' }
    },
    { 
      id: 'e4', 
      type: 'bpmn:sequenceFlow', 
      sourceNodeId: 'gateway', 
      targetNodeId: 'task3',
      text: '需要推送',
      properties: { condition: '${needPush === true}' }
    },
    { id: 'e5', type: 'bpmn:sequenceFlow', sourceNodeId: 'task1', targetNodeId: 'end' },
    { id: 'e6', type: 'bpmn:sequenceFlow', sourceNodeId: 'task2', targetNodeId: 'end' },
    { id: 'e7', type: 'bpmn:sequenceFlow', sourceNodeId: 'task3', targetNodeId: 'end' },
  ],
})
```

### XML 输出示例

```xml
<bpmn:inclusiveGateway id="Gateway_1" name="服务选择">
  <bpmn:incoming>Flow_1</bpmn:incoming>
  <bpmn:outgoing>Flow_2</bpmn:outgoing>
  <bpmn:outgoing>Flow_3</bpmn:outgoing>
  <bpmn:outgoing>Flow_4</bpmn:outgoing>
</bpmn:inclusiveGateway>
```

---

## 网关工厂函数

### GatewayNodeFactory

`GatewayNodeFactory` 是用于创建网关节点的工厂函数。

#### 函数签名

```typescript
function GatewayNodeFactory(
  type: string,           // 网关类型，如 'bpmn:exclusiveGateway'
  icon: string | object,  // 网关图标，SVG path 字符串或 h 函数生成的 SVG
  props?: any             // 可选的网关属性
): {
  type: string,
  model: any,
  view: any,
}
```

#### 源码解析

```typescript
// packages/extension/src/bpmn-elements/presets/Gateway/gateway.ts

export function GatewayNodeFactory(
  type: string,
  icon: string | object,
  props?: any,
): {
  type: string
  model: any
  view: any
} {
  // 视图类 - 负责渲染
  class view extends PolygonNode {
    getShape() {
      const { model } = this.props
      const { x, y, width, height, points } = model as PolygonNodeModel
      const style = model.getNodeStyle()
      
      return h(
        'g',
        {
          transform: `matrix(1 0 0 1 ${x - width / 2} ${y - height / 2})`,
        },
        // 绘制菱形外框
        h(Polygon, {
          ...style,
          x,
          y,
          points,
        }),
        // 绘制网关图标
        typeof icon === 'string'
          ? h('path', {
              d: icon,
              ...style,
              fill: 'rgb(34, 36, 42)',
              strokeWidth: 1,
            })
          : icon,
      )
    }
  }

  // 模型类 - 负责数据和逻辑
  class model extends PolygonNodeModel {
    constructor(data: NodeConfig, graphModel: GraphModel) {
      if (!data.id) {
        data.id = `Gateway_${genBpmnId()}`
      }
      if (!data.text) {
        data.text = ''
      }
      if (data.text && typeof data.text === 'string') {
        data.text = {
          value: data.text,
          x: data.x,
          y: data.y + 40,
        }
      }
      data.properties = {
        ...(props || {}),
        ...data.properties,
      }
      super(data, graphModel)
      // 定义菱形顶点
      this.points = [
        [25, 0],
        [50, 25],
        [25, 50],
        [0, 25],
      ]
      groupRule.call(this)
    }
  }

  return {
    type,
    view,
    model,
  }
}
```

#### 内置网关注册

```typescript
// packages/extension/src/bpmn-elements/presets/Gateway/index.ts

import { exclusiveIcon, parallelIcon, inclusiveIcon } from '../icons'
import { GatewayNodeFactory } from './gateway'

export function registerGatewayNodes(lf: LogicFlow) {
  // 排他网关
  const ExclusiveGateway = GatewayNodeFactory(
    'bpmn:exclusiveGateway',
    exclusiveIcon,
  )

  // 并行网关
  const ParallelGateway = GatewayNodeFactory(
    'bpmn:parallelGateway',
    parallelIcon,
  )

  // 包容网关
  const InclusiveGateway = GatewayNodeFactory(
    'bpmn:inclusiveGateway',
    inclusiveIcon,
  )
  
  lf.register(ExclusiveGateway)
  lf.register(InclusiveGateway)
  lf.register(ParallelGateway)
}
```

---

## 自定义网关

### 创建自定义网关

```typescript
import { GatewayNodeFactory } from '@logicflow/extension'
import { h } from '@logicflow/core'

// 自定义复杂网关图标
const complexIcon = 'm 23,13 0,7.116788321167883 -5.018248175182482,-5.018248175182482 -3.102189781021898,3.102189781021898 5.018248175182482,5.018248175182482 -7.116788321167883,0 0,4.37956204379562 7.116788321167883,0 -5.018248175182482,5.018248175182482 3.102189781021898,3.102189781021898 5.018248175182482,-5.018248175182482 0,7.116788321167883 4.37956204379562,0 0,-7.116788321167883 5.018248175182482,5.018248175182482 3.102189781021898,-3.102189781021898 -5.018248175182482,-5.018248175182482 7.116788321167883,0 0,-4.37956204379562 -7.116788321167883,0 5.018248175182482,-5.018248175182482 -3.102189781021898,-3.102189781021898 -5.018248175182482,5.018248175182482 0,-7.116788321167883 -4.37956204379562,0 z'

// 创建复杂网关
const ComplexGateway = GatewayNodeFactory(
  'bpmn:complexGateway',
  complexIcon,
  {
    // 自定义属性
    customProperty: 'value',
  }
)

// 注册到 LogicFlow
lf.register(ComplexGateway)
```

### 使用 h 函数创建图标

```typescript
import { h } from '@logicflow/core'

// 使用 h 函数创建自定义图标
const customIcon = h('g', {}, [
  h('circle', {
    cx: 25,
    cy: 25,
    r: 10,
    style: 'fill: white; stroke: rgb(34, 36, 42); stroke-width: 2px;',
  }),
  h('path', {
    d: 'M 20,25 L 25,30 L 30,20',
    style: 'fill: none; stroke: rgb(34, 36, 42); stroke-width: 2px;',
  }),
])

const CustomGateway = GatewayNodeFactory(
  'bpmn:customGateway',
  customIcon
)
```

### 继承并扩展网关模型

```typescript
import { ExclusiveGatewayModel, ExclusiveGatewayView } from '@logicflow/extension'

// 自定义排他网关模型
class CustomExclusiveGatewayModel extends ExclusiveGatewayModel {
  constructor(data, graphModel) {
    super(data, graphModel)
    // 自定义初始化逻辑
  }

  // 重写样式
  getNodeStyle() {
    const style = super.getNodeStyle()
    style.stroke = '#1890ff'
    style.strokeWidth = 2
    return style
  }

  // 自定义属性
  getProperties() {
    return {
      ...super.getProperties(),
      customField: 'custom value',
    }
  }
}

// 注册自定义网关
lf.register({
  type: 'bpmn:customExclusiveGateway',
  model: CustomExclusiveGatewayModel,
  view: ExclusiveGatewayView,
})
```

---

## 完整示例

### 完整的审批流程示例

```typescript
import LogicFlow from '@logicflow/core'
import { BPMNElements, BPMNAdapter } from '@logicflow/extension'
import '@logicflow/core/dist/style/index.css'
import '@logicflow/extension/lib/style/index.css'

// 初始化 LogicFlow
const lf = new LogicFlow({
  container: document.getElementById('container'),
  grid: {
    size: 20,
    visible: true,
    type: 'dot',
  },
  keyboard: {
    enabled: true,
  },
})

// 注册插件
lf.use(BPMNElements)
lf.use(BPMNAdapter)

// 审批流程数据
const approvalFlowData = {
  nodes: [
    // 开始事件
    {
      id: 'StartEvent_1',
      type: 'bpmn:startEvent',
      x: 120,
      y: 200,
      text: '提交申请',
    },
    // 排他网关 - 判断金额
    {
      id: 'Gateway_1',
      type: 'bpmn:exclusiveGateway',
      x: 280,
      y: 200,
      text: '金额判断',
    },
    // 主管审批（金额 < 5000）
    {
      id: 'UserTask_1',
      type: 'bpmn:userTask',
      x: 450,
      y: 100,
      text: '主管审批',
      properties: {
        assignee: 'supervisor',
      },
    },
    // 经理审批（金额 >= 5000）
    {
      id: 'UserTask_2',
      type: 'bpmn:userTask',
      x: 450,
      y: 300,
      text: '经理审批',
      properties: {
        assignee: 'manager',
      },
    },
    // 并行网关 - 分叉
    {
      id: 'Gateway_2',
      type: 'bpmn:parallelGateway',
      x: 620,
      y: 200,
      text: '并行处理',
    },
    // 财务确认
    {
      id: 'ServiceTask_1',
      type: 'bpmn:serviceTask',
      x: 790,
      y: 100,
      text: '财务确认',
    },
    // 系统通知
    {
      id: 'ServiceTask_2',
      type: 'bpmn:serviceTask',
      x: 790,
      y: 300,
      text: '系统通知',
    },
    // 并行网关 - 汇聚
    {
      id: 'Gateway_3',
      type: 'bpmn:parallelGateway',
      x: 960,
      y: 200,
      text: '汇聚',
    },
    // 结束事件
    {
      id: 'EndEvent_1',
      type: 'bpmn:endEvent',
      x: 1100,
      y: 200,
      text: '流程结束',
    },
  ],
  edges: [
    // 开始 -> 金额判断
    {
      id: 'Flow_1',
      type: 'bpmn:sequenceFlow',
      sourceNodeId: 'StartEvent_1',
      targetNodeId: 'Gateway_1',
    },
    // 金额判断 -> 主管审批
    {
      id: 'Flow_2',
      type: 'bpmn:sequenceFlow',
      sourceNodeId: 'Gateway_1',
      targetNodeId: 'UserTask_1',
      text: '金额<5000',
      properties: {
        condition: '${amount < 5000}',
        expressionType: 'cdata',
      },
    },
    // 金额判断 -> 经理审批
    {
      id: 'Flow_3',
      type: 'bpmn:sequenceFlow',
      sourceNodeId: 'Gateway_1',
      targetNodeId: 'UserTask_2',
      text: '金额>=5000',
      properties: {
        condition: '${amount >= 5000}',
        expressionType: 'cdata',
      },
    },
    // 主管审批 -> 并行分叉
    {
      id: 'Flow_4',
      type: 'bpmn:sequenceFlow',
      sourceNodeId: 'UserTask_1',
      targetNodeId: 'Gateway_2',
    },
    // 经理审批 -> 并行分叉
    {
      id: 'Flow_5',
      type: 'bpmn:sequenceFlow',
      sourceNodeId: 'UserTask_2',
      targetNodeId: 'Gateway_2',
    },
    // 并行分叉 -> 财务确认
    {
      id: 'Flow_6',
      type: 'bpmn:sequenceFlow',
      sourceNodeId: 'Gateway_2',
      targetNodeId: 'ServiceTask_1',
    },
    // 并行分叉 -> 系统通知
    {
      id: 'Flow_7',
      type: 'bpmn:sequenceFlow',
      sourceNodeId: 'Gateway_2',
      targetNodeId: 'ServiceTask_2',
    },
    // 财务确认 -> 并行汇聚
    {
      id: 'Flow_8',
      type: 'bpmn:sequenceFlow',
      sourceNodeId: 'ServiceTask_1',
      targetNodeId: 'Gateway_3',
    },
    // 系统通知 -> 并行汇聚
    {
      id: 'Flow_9',
      type: 'bpmn:sequenceFlow',
      sourceNodeId: 'ServiceTask_2',
      targetNodeId: 'Gateway_3',
    },
    // 并行汇聚 -> 结束
    {
      id: 'Flow_10',
      type: 'bpmn:sequenceFlow',
      sourceNodeId: 'Gateway_3',
      targetNodeId: 'EndEvent_1',
    },
  ],
}

// 渲染流程
lf.render(approvalFlowData)

// 导出 XML
document.getElementById('exportBtn').addEventListener('click', () => {
  const xml = lf.adapterOut(lf.getGraphRawData())
  console.log(xml)
})

// 导入 XML
document.getElementById('importBtn').addEventListener('click', () => {
  const xml = '...' // BPMN XML 字符串
  const data = lf.adapterIn(xml)
  lf.render(data)
})
```

---

## 网关对比表

| 特性 | 排他网关 | 并行网关 | 包容网关 |
|-----|---------|---------|---------|
| 图标 | X 形 | + 形 | O 形 |
| 条件评估 | 是 | 否 | 是 |
| 执行路径 | 单条 | 所有 | 多条 |
| 典型场景 | 条件分支 | 并行任务 | 可选并行 |
| BPMN 元素 | `exclusiveGateway` | `parallelGateway` | `inclusiveGateway` |

---

## 注意事项

1. **排他网关**必须至少有一个出口条件为真，否则流程会中断
2. **并行网关**的分叉和汇聚必须成对出现
3. **包容网关**需要设置默认路径，以防所有条件都不满足
4. 网关的 ID 会自动生成，格式为 `Gateway_xxxxxxx`
5. 网关的文本位置默认在节点下方 40px 处

---

## 成对网关配置

### 概述

在 BPMN 流程中，并行网关和包容网关通常需要成对出现：**分流网关（Fork）** 和 **聚合网关（Join）**。分流网关将流程分成多条并行路径，聚合网关等待所有路径完成后汇合。

### 当前插件支持情况

**当前 LogicFlow BPMN 插件不直接支持拖拽时自动创建成对网关**。但是，您可以通过以下方式实现这个功能：

### 方案一：监听拖拽事件自动创建成对网关

```typescript
import LogicFlow from '@logicflow/core'
import { BPMNElements } from '@logicflow/extension'

const lf = new LogicFlow({
  container: document.getElementById('container'),
})

lf.use(BPMNElements)

// 成对网关配置
const pairGatewayConfig = {
  'bpmn:parallelGateway': {
    forkText: '分叉',
    joinText: '汇聚',
    offset: 200, // 分流和聚合网关之间的水平距离
  },
  'bpmn:inclusiveGateway': {
    forkText: '分流',
    joinText: '聚合',
    offset: 200,
  },
}

// 监听节点拖拽添加事件
lf.on('node:dnd-add', ({ data }) => {
  const config = pairGatewayConfig[data.type]
  if (!config) return
  
  // 创建成对的聚合网关
  const joinGateway = {
    id: `${data.id}_join`,
    type: data.type,
    x: data.x + config.offset,
    y: data.y,
    text: config.joinText,
    properties: {
      pairId: data.id,          // 关联的分流网关 ID
      pairType: 'join',         // 标识为聚合网关
    },
  }
  
  // 更新当前网关（分流网关）的属性
  lf.setProperties(data.id, {
    pairId: joinGateway.id,     // 关联的聚合网关 ID
    pairType: 'fork',           // 标识为分流网关
  })
  
  // 添加聚合网关
  lf.addNode(joinGateway)
})
```

### 方案二：自定义成对网关节点

创建专门用于成对出现的网关节点：

```typescript
import { GatewayNodeFactory } from '@logicflow/extension'
import { h } from '@logicflow/core'

// 并行分流网关
const ParallelForkGateway = GatewayNodeFactory(
  'bpmn:parallelForkGateway',
  'm 23,10 0,12.5 -12.5,0 0,5 12.5,0 0,12.5 5,0 0,-12.5 12.5,0 0,-5 -12.5,0 0,-12.5 -5,0 z',
  {
    gatewayType: 'fork',
    panels: ['base'],
  }
)

// 并行聚合网关
const ParallelJoinGateway = GatewayNodeFactory(
  'bpmn:parallelJoinGateway',
  'm 23,10 0,12.5 -12.5,0 0,5 12.5,0 0,12.5 5,0 0,-12.5 12.5,0 0,-5 -12.5,0 0,-12.5 -5,0 z',
  {
    gatewayType: 'join',
    panels: ['base'],
  }
)

// 注册自定义网关
lf.register(ParallelForkGateway)
lf.register(ParallelJoinGateway)
```

### 方案三：使用 DndPanel 插件实现成对拖拽

```typescript
import { DndPanel } from '@logicflow/extension'

lf.use(DndPanel)

// 自定义拖拽面板项
lf.extension.dndPanel.setPatternItems([
  {
    type: 'bpmn:parallelGateway',
    text: '并行网关（成对）',
    icon: 'data:image/svg+xml;base64,...',
    callback: (lf) => {
      // 获取当前画布中心点
      const { x, y } = lf.getPointByClient(
        document.getElementById('container').clientWidth / 2,
        document.getElementById('container').clientHeight / 2
      )
      
      // 同时创建分流和聚合网关
      const forkId = `Gateway_Fork_${Date.now()}`
      const joinId = `Gateway_Join_${Date.now()}`
      
      // 添加分流网关
      lf.addNode({
        id: forkId,
        type: 'bpmn:parallelGateway',
        x: x - 100,
        y,
        text: '分叉',
        properties: {
          pairId: joinId,
          pairType: 'fork',
        },
      })
      
      // 添加聚合网关
      lf.addNode({
        id: joinId,
        type: 'bpmn:parallelGateway',
        x: x + 100,
        y,
        text: '汇聚',
        properties: {
          pairId: forkId,
          pairType: 'join',
        },
      })
    },
  },
])
```

### 方案四：完整的成对网关管理器

```typescript
/**
 * 成对网关管理器
 */
class PairGatewayManager {
  constructor(lf) {
    this.lf = lf
    this.pairs = new Map() // 存储网关对关系
  }

  /**
   * 创建成对网关
   */
  createPair(type, x, y, options = {}) {
    const {
      offsetX = 200,
      forkText = '分叉',
      joinText = '汇聚',
    } = options

    const forkId = `Gateway_Fork_${Date.now()}`
    const joinId = `Gateway_Join_${Date.now()}`

    // 创建分流网关
    const forkNode = this.lf.addNode({
      id: forkId,
      type,
      x,
      y,
      text: forkText,
      properties: {
        pairId: joinId,
        pairType: 'fork',
      },
    })

    // 创建聚合网关
    const joinNode = this.lf.addNode({
      id: joinId,
      type,
      x: x + offsetX,
      y,
      text: joinText,
      properties: {
        pairId: forkId,
        pairType: 'join',
      },
    })

    // 记录配对关系
    this.pairs.set(forkId, joinId)
    this.pairs.set(joinId, forkId)

    return { forkNode, joinNode }
  }

  /**
   * 获取配对网关
   */
  getPair(gatewayId) {
    const pairId = this.pairs.get(gatewayId)
    if (pairId) {
      return this.lf.getNodeModelById(pairId)
    }
    return null
  }

  /**
   * 删除网关时同时删除配对网关
   */
  deleteWithPair(gatewayId) {
    const pairId = this.pairs.get(gatewayId)
    if (pairId) {
      this.lf.deleteNode(pairId)
      this.pairs.delete(pairId)
    }
    this.pairs.delete(gatewayId)
  }

  /**
   * 移动网关时同步移动配对网关
   */
  moveWithPair(gatewayId, deltaX, deltaY) {
    const pairId = this.pairs.get(gatewayId)
    if (pairId) {
      const pairNode = this.lf.getNodeModelById(pairId)
      if (pairNode) {
        this.lf.setProperties(pairId, {
          _disablePairSync: true, // 防止循环同步
        })
        this.lf.moveNode(pairId, deltaX, deltaY)
      }
    }
  }
}

// 使用示例
const pairManager = new PairGatewayManager(lf)

// 创建成对并行网关
pairManager.createPair('bpmn:parallelGateway', 300, 200, {
  offsetX: 250,
  forkText: '并行分叉',
  joinText: '并行汇聚',
})

// 监听节点删除事件
lf.on('node:delete', ({ data }) => {
  if (data.type.includes('Gateway')) {
    pairManager.deleteWithPair(data.id)
  }
})

// 监听节点移动事件
lf.on('node:drag', ({ data, deltaX, deltaY }) => {
  if (data.type.includes('Gateway') && !data.properties?._disablePairSync) {
    pairManager.moveWithPair(data.id, deltaX, deltaY)
  }
})
```

### 网关组合规则

源码中定义了网关组合规则（[`gateway.ts`](../packages/extension/src/bpmn-elements/presets/Gateway/gateway.ts)）：

```typescript
/**
 * index 0 排他网关
 * index 1 包容网关
 * index 2 并行网关
 */
export const gatewayComposable = [
  [1, 1, 0],  // 排他网关可以与排他、包容组合
  [0, 0, 1],  // 包容网关只能与包容、并行组合
  [0, 1, 1],  // 并行网关可以与包容、并行组合
]
```

这个规则定义了不同类型网关之间的组合兼容性，可以在验证流程时使用。

### 最佳实践

1. **统一管理**：使用 `properties.pairId` 存储配对关系
2. **视觉提示**：为分流和聚合网关使用不同的文本或颜色
3. **验证机制**：在导出前验证网关是否成对出现
4. **用户体验**：拖拽时显示虚线连接配对网关

```typescript
// 验证网关配对
function validateGatewayPairs(lf) {
  const nodes = lf.getGraphRawData().nodes
  const gateways = nodes.filter(n => 
    n.type === 'bpmn:parallelGateway' || n.type === 'bpmn:inclusiveGateway'
  )
  
  const errors = []
  const paired = new Set()
  
  gateways.forEach(gateway => {
    const pairId = gateway.properties?.pairId
    if (!pairId) {
      errors.push(`网关 ${gateway.id} 没有配对网关`)
    } else {
      const pair = gateways.find(g => g.id === pairId)
      if (!pair) {
        errors.push(`网关 ${gateway.id} 的配对网关 ${pairId} 不存在`)
      } else {
        paired.add(gateway.id)
        paired.add(pairId)
      }
    }
  })
  
  return errors
}
```

---

## 包容网关成对配置进阶

> 📖 **完整示例文档**：[包容网关成对配置完整示例](./inclusive-gateway-pair-example.md)
>
> 包含：成对出现、普通分支、默认分支（禁止删除）、删除联动等完整实现

### 核心功能概述

包容网关拖入画布时，可以实现以下功能：

1. **成对出现**：自动创建分流网关和聚合网关
2. **普通分支**：自动创建一个带条件的普通分支
3. **默认分支**：自动创建一个默认分支（禁止删除）
4. **删除联动**：删除任一网关时自动删除相关配置

### 快速使用

```typescript
import { InclusiveGatewayPairManager } from './inclusive-gateway-pair-manager'

// 初始化管理器
const pairManager = new InclusiveGatewayPairManager(lf)

// 拖入包容网关时会自动：
// 1. 创建分流和聚合网关
// 2. 创建普通分支（条件A）
// 3. 创建默认分支（禁止删除）
// 4. 自动连接所有节点

// 手动添加新分支
pairManager.addBranch(
  'Gateway_Fork_xxxxx',
  '高级审批',
  '${amount > 10000}'
)
```

### 流程图示例

```
                    ┌─────────────────┐
                    │   普通分支      │
                    │  (条件A=true)   │
                    └────────┬────────┘
                             │
┌──────────┐    ┌────────────┴────────────┐    ┌──────────┐
│  上游    ├───►│    包容网关(分流)        ├───►│  下游    │
└──────────┘    └────────────┬────────────┘    └──────────┘
                             │
                    ┌────────┴────────┐
                    │   默认分支      │
                    │   (禁止删除)    │
                    └────────┬────────┘
                             │
                    ┌────────┴────────┐
                    │  包容网关(聚合)  │
                    └─────────────────┘
```

---

## 相关文档

- [包容网关成对配置完整示例](./inclusive-gateway-pair-example.md) - 包含完整实现代码
- [BPMN 插件使用指南](./bpmn-plugin-guide.md)
- [BPMN 样式自定义指南](./bpmn-style-customization.md)
- [LogicFlow 官方文档](https://docs.logic-flow.cn)
- [BPMN 2.0 规范](https://www.omg.org/spec/BPMN/2.0/)
