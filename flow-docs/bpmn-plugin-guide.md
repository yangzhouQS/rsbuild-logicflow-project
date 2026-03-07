# LogicFlow BPMN 插件使用指南

## 目录

1. [插件概述](#插件概述)
2. [插件架构](#插件架构)
3. [快速开始](#快速开始)
4. [基础插件 (bpmn)](#基础插件-bpmn)
5. [增强插件 (bpmn-elements)](#增强插件-bpmn-elements)
6. [数据适配器](#数据适配器)
7. [网关配置详解](#网关配置详解)
8. [自定义扩展](#自定义扩展)
9. [完整示例](#完整示例)

---

## 插件概述

LogicFlow 提供了两套 BPMN 相关的插件系统：

| 插件名称 | 路径 | 功能描述 |
|---------|------|---------|
| `bpmn` | `packages/extension/src/bpmn` | 基础BPMN元素，包含排他网关 |
| `bpmn-adapter` | `packages/extension/src/bpmn-adapter` | 基础数据适配器（JSON/XML） |
| `bpmn-elements` | `packages/extension/src/bpmn-elements` | 增强BPMN元素，包含三种网关 |
| `bpmn-elements-adapter` | `packages/extension/src/bpmn-elements-adapter` | 增强数据适配器 |

---

## 插件架构

```
┌─────────────────────────────────────────────────────────────┐
│LogicFlow Instance│
├─────────────────────────────────────────────────────────────┤
│┌─────────────────┐  ┌─────────────────┐│
││ bpmn (基础)│  │ bpmn-elements   ││
││- StartEvent│  │ - StartEvent│
││ - EndEvent│  │ - EndEvent│
││ - ExclusiveGateway│  │ - ExclusiveGateway│
││ - UserTask│  │ - ParallelGateway│
││ - ServiceTask│  │ - InclusiveGateway│
││ - SequenceFlow│  │ - UserTask│
│└─────────────────┘  │ - ServiceTask│
│┌─────────────────┐  │ - SubProcess│
││ bpmn-adapter│  │ - BoundaryEvent│
││ - JSON适配│  │ - IntermediateEvent│
││ - XML 适配│  │ - SequenceFlow│
│└─────────────────┘  └─────────────────┘│
│┌─────────────────┐  ┌─────────────────┐│
││bpmn-elements-   │  │                 ││
││ adapter│  │                 ││
││ - 增强JSON适配  │  │                 ││
││ - 增强XML 适配  │  │                 ││
│└─────────────────┘  └─────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

---

## 快速开始

### 安装

```bash
npm install @logicflow/core @logicflow/extension
```

### 基础使用

```typescript
import LogicFlow from '@logicflow/core'
import { BpmnElement } from '@logicflow/extension'
import '@logicflow/core/dist/style/index.css'
import '@logicflow/extension/lib/style/index.css'

// 创建 LogicFlow 实例
const lf = new LogicFlow({
  container: document.getElementById('container'),
  grid: true,
})

// 注册 BPMN 基础元素插件
lf.use(BpmnElement)

// 渲染图形
lf.render({
  nodes: [
    { id: 'start', type: 'bpmn:startEvent', x: 100, y: 100 },
    { id: 'gateway', type: 'bpmn:exclusiveGateway', x: 250, y: 100 },
    { id: 'end', type: 'bpmn:endEvent', x: 400, y: 100 },
  ],
  edges: [
    { id: 'e1', type: 'bpmn:sequenceFlow', sourceNodeId: 'start', targetNodeId: 'gateway' },
    { id: 'e2', type: 'bpmn:sequenceFlow', sourceNodeId: 'gateway', targetNodeId: 'end' },
  ],
})
```

---

## 基础插件 (bpmn)

### 支持的元素类型

| 元素类型 | type 值 | 描述 |
|---------|---------|------|
| 开始事件 | `bpmn:startEvent` | 流程开始节点 |
| 结束事件 | `bpmn:endEvent` | 流程结束节点 |
| 排他网关 | `bpmn:exclusiveGateway` | 条件分支 |
| 用户任务 | `bpmn:userTask` | 用户任务节点 |
| 服务任务 | `bpmn:serviceTask` | 系统服务任务 |
| 顺序流 | `bpmn:sequenceFlow` | 连接线 |

### 元素配置

```typescript
// 节点尺寸配置
export const StartEventConfig = { width: 40, height: 40 }
export const EndEventConfig = { width: 40, height: 40 }
export const ExclusiveGatewayConfig = { width: 40, height: 40 }
export const ServiceTaskConfig = { width: 100, height: 80 }
export const UserTaskConfig = { width: 100, height: 80 }
```

### 使用示例

```typescript
import { BpmnElement } from '@logicflow/extension'

// 注册插件
lf.use(BpmnElement)

// 添加排他网关
lf.addNode({
  type: 'bpmn:exclusiveGateway',
  x: 200,
  y: 150,
  text: '条件判断',
})
```

---

## 增强插件 (bpmn-elements)

### 支持的元素类型

增强插件在基础插件之上提供了更丰富的 BPMN 元素：

| 元素类型 | type 值 | 描述 |
|---------|---------|------|
| 开始事件 | `bpmn:startEvent` | 支持定时器等定义 |
| 结束事件 | `bpmn:endEvent` | 流程结束节点 |
| 中间捕获事件 | `bpmn:intermediateCatchEvent` | 中间捕获事件 |
| 中间抛出事件 | `bpmn:intermediateThrowEvent` | 中间抛出事件 |
| 边界事件 | `bpmn:boundaryEvent` | 附加在任务边界 |
| **排他网关** | `bpmn:exclusiveGateway` | 条件分支（X形） |
| **并行网关** | `bpmn:parallelGateway` | 并行分支（+形） |
| **包容网关** | `bpmn:inclusiveGateway` | 包容分支（O形） |
| 用户任务 | `bpmn:userTask` | 用户任务 |
| 服务任务 | `bpmn:serviceTask` | 服务任务 |
| 子流程 | `bpmn:subProcess` | 嵌入子流程 |
| 顺序流 | `bpmn:sequenceFlow` | 连接线 |

### 使用增强插件

```typescript
import { BPMNElements } from '@logicflow/extension'

// 注册增强插件
lf.use(BPMNElements)

// 现在可以使用三种网关
lf.addNode({ type: 'bpmn:exclusiveGateway', x: 200, y: 100 })
lf.addNode({ type: 'bpmn:parallelGateway', x: 350, y: 100 })
lf.addNode({ type: 'bpmn:inclusiveGateway', x: 500, y: 100 })
```

---

## 数据适配器

### 基础适配器 (bpmn-adapter)

```typescript
import { BpmnAdapter, BpmnXmlAdapter } from '@logicflow/extension'

// JSON 适配器
lf.use(BpmnAdapter)
const bpmnJson = lf.adapterOut(lf.getGraphData())

// XML 适配器
lf.use(BpmnXmlAdapter)
const bpmnXml = lf.adapterOut(lf.getGraphData())
```

### 增强适配器 (bpmn-elements-adapter)

增强适配器支持更多元素类型和自定义转换：

```typescript
import { BPMNAdapter } from '@logicflow/extension'

lf.use(BPMNAdapter, {
  props: {
    // 自定义保留字段
    retainedAttrsFields: ['panels'],
    // 排除字段
    excludeFields: {
      out: new Set(['runboost']),
    },
    // 自定义转换器
    transformer: {
      'bpmn:sequenceFlow': {
        out(data: any) {
          // 自定义导出逻辑
          return { json: '' }
        },
        in(key: string, data: any) {
          // 自定义导入逻辑
          return {}
        },
      },
    },
  },
})

// 导出 XML
const xml = lf.adapterOut(lf.getGraphRawData())

// 导入 XML
lf.adapterIn(xmlData)
```

---

## 网关配置详解

### 三种网关对比

| 网关类型 | type 值 | 图标 | 使用场景 |
|---------|---------|------|---------|
| 排他网关 | `bpmn:exclusiveGateway` | X 形 | 条件互斥分支，只走一条路径 |
| 并行网关 | `bpmn:parallelGateway` | + 形 | 并行执行所有分支 |
| 包容网关 | `bpmn:inclusiveGateway` | O 形 | 条件判断，可走多条路径 |

### 排他网关 (Exclusive Gateway)

排他网关用于根据条件选择一条路径执行。

```typescript
// 添加排他网关
const exclusiveGateway = {
  id: 'Gateway_1',
  type: 'bpmn:exclusiveGateway',
  x: 300,
  y: 200,
  text: '审批结果',
}

// 连接线设置条件
const conditionFlow = {
  id: 'Flow_1',
  type: 'bpmn:sequenceFlow',
  sourceNodeId: 'Gateway_1',
  targetNodeId: 'Task_Approved',
  properties: {
    condition: '${approved === true}',
    expressionType: 'cdata',
  },
}
```

**XML 输出示例：**

```xml
<bpmn:exclusiveGateway id="Gateway_1" name="审批结果">
  <bpmn:incoming>Flow_0</bpmn:incoming>
  <bpmn:outgoing>Flow_1</bpmn:outgoing>
</bpmn:exclusiveGateway>
<bpmn:sequenceFlow id="Flow_1" sourceRef="Gateway_1" targetRef="Task_Approved">
  <bpmn:conditionExpression xsi:type="bpmn2:tFormalExpression">
    <![CDATA[${approved === true}]]>
  </bpmn:conditionExpression>
</bpmn:sequenceFlow>
```

### 并行网关 (Parallel Gateway)

并行网关用于同时执行多个分支。

```typescript
// 添加并行网关
const parallelGateway = {
  id: 'Gateway_Parallel',
  type: 'bpmn:parallelGateway',
  x: 300,
  y: 200,
  text: '并行处理',
}

// 所有从并行网关出来的分支都会执行
```

**XML 输出示例：**

```xml
<bpmn:parallelGateway id="Gateway_Parallel" name="并行处理">
  <bpmn:incoming>Flow_0</bpmn:incoming>
  <bpmn:outgoing>Flow_1</bpmn:outgoing>
  <bpmn:outgoing>Flow_2</bpmn:outgoing>
</bpmn:parallelGateway>
```

### 包容网关 (Inclusive Gateway)

包容网关结合了排他网关和并行网关的特性，可以根据条件执行多条路径。

```typescript
// 添加包容网关
const inclusiveGateway = {
  id: 'Gateway_Inclusive',
  type: 'bpmn:inclusiveGateway',
  x: 300,
  y: 200,
  text: '条件分发',
}
```

**XML 输出示例：**

```xml
<bpmn:inclusiveGateway id="Gateway_Inclusive" name="条件分发">
  <bpmn:incoming>Flow_0</bpmn:incoming>
  <bpmn:outgoing>Flow_1</bpmn:outgoing>
  <bpmn:outgoing>Flow_2</bpmn:outgoing>
</bpmn:inclusiveGateway>
```

### 网关图标定义

```typescript
// 排他网关图标（X形）
export const exclusiveIcon = 
  'm 16,15 7.42857142857143,9.714285714285715 -7.42857142857143,9.714285714285715 3.428571428571429,0 5.714285714285715,-7.464228571428572 5.714285714285715,7.464228571428572 3.428571428571429,0 -7.42857142857143,-9.714285714285715 7.42857142857143,-9.714285714285715 -3.428571428571429,0 -5.714285714285715,7.464228571428572 -5.714285714285715,-7.464228571428572 -3.428571428571429,0 z'

// 并行网关图标（+形）
export const parallelIcon = 
  'm 23,10 0,12.5 -12.5,0 0,5 12.5,0 0,12.5 5,0 0,-12.5 12.5,0 0,-5 -12.5,0 0,-12.5 -5,0 z'

// 包容网关图标（O形）
export const inclusiveIcon = h('circle', {
  cx: 25,
  cy: 25,
  r: 13,
  style: 'stroke-linecap: round; stroke-linejoin: round; stroke: rgb(34, 36, 42); stroke-width: 2.5px; fill: white;',
})
```

---

## 自定义扩展

### 自定义网关

使用 `GatewayNodeFactory` 创建自定义网关：

```typescript
import { GatewayNodeFactory } from '@logicflow/extension'

// 自定义复杂网关
const complexIcon = 'm 23,13 0,7.116788321167883 -5.018248175182482,-5.018248175182482 -3.102189781021898,3.102189781021898 5.018248175182482,5.018248175182482 -7.116788321167883,0 0,4.37956204379562 7.116788321167883,0 -5.018248175182482,5.018248175182482 l 3.102189781021898,3.102189781021898 5.018248175182482,-5.018248175182482 0,7.116788321167883 4.37956204379562,0 0,-7.116788321167883 5.018248175182482,5.018248175182482 3.102189781021898,-3.102189781021898 -5.018248175182482,-5.018248175182482 7.116788321167883,0 0,-4.37956204379562 -7.116788321167883,0 5.018248175182482,-5.018248175182482 -3.102189781021898,-3.102189781021898 -5.018248175182482,5.018248175182482 0,-7.116788321167883 -4.37956204379562,0 z'

const complexGateway = GatewayNodeFactory(
  'bpmn:complexGateway',
  complexIcon,
  { customProperty: 'value' } // 可选属性
)

// 注册自定义网关
lf.register(complexGateway)
```

### 自定义任务节点

使用 `TaskNodeFactory` 创建自定义任务：

```typescript
import { TaskNodeFactory } from '@logicflow/extension'

// 自定义脚本任务
const scriptTaskIcon = 'M6.402,0.5H20.902C20.902,0.5,15.069,3.333,15.069,6.083S19.486,12.083,19.486,15.25S15.319,20.333,15.319,20.333H0.235C0.235,20.333,5.235,17.665999999999997,5.235,15.332999999999998S0.6520000000000001,8.582999999999998,0.6520000000000001,6.082999999999998S6.402,0.5,6.402,0.5ZM3.5,4.5L13.5,4.5M3.8,8.5L13.8,8.5M6.3,12.5L16.3,12.5M6.5,16.5L16.5,16.5'

const scriptTask = TaskNodeFactory(
  'bpmn:scriptTask',
  scriptTaskIcon,
  { scriptFormat: 'javascript' }
)

lf.register(scriptTask)
```

### 自定义事件定义

```typescript
// 使用 definition 扩展事件
const [definition, setDefinition] = lf.useDefinition()

const customDefinition = [
  {
    nodes: ['startEvent', 'intermediateCatchEvent', 'boundaryEvent'],
    definition: {
      type: 'bpmn:timerEventDefinition',
      icon: timerIcon, // 自定义图标
      properties: {
        definitionType: 'bpmn:timerEventDefinition',
        timerType: '', // 'timeCycle', 'timeDate', 'timeDuration'
        timerValue: '',
      },
    },
  },
]

setDefinition(customDefinition)
```

---

## 完整示例

### 完整的 BPMN 流程示例

```typescript
import LogicFlow from '@logicflow/core'
import { BPMNElements, BPMNAdapter } from '@logicflow/extension'
import '@logicflow/core/dist/style/index.css'
import '@logicflow/extension/lib/style/index.css'

// 初始化
const lf = new LogicFlow({
  container: document.getElementById('container'),
  grid: true,
})

// 注册插件
lf.use(BPMNElements)
lf.use(BPMNAdapter)

// 流程数据
const flowData = {
  nodes: [
    // 开始事件
    { id: 'StartEvent_1', type: 'bpmn:startEvent', x: 100, y: 200, text: '开始' },
    
    // 排他网关 - 条件判断
    { id: 'Gateway_1', type: 'bpmn:exclusiveGateway', x: 250, y: 200, text: '金额判断' },
    
    // 任务节点
    { id: 'Task_Small', type: 'bpmn:userTask', x: 400, y: 100, text: '主管审批' },
    { id: 'Task_Large', type: 'bpmn:userTask', x: 400, y: 300, text: '经理审批' },
    
    // 并行网关 - 汇聚
    { id: 'Gateway_2', type: 'bpmn:parallelGateway', x: 550, y: 200, text: '汇聚' },
    
    // 结束事件
    { id: 'EndEvent_1', type: 'bpmn:endEvent', x: 700, y: 200, text: '结束' },
  ],
  edges: [
    { id: 'Flow_1', type: 'bpmn:sequenceFlow', sourceNodeId: 'StartEvent_1', targetNodeId: 'Gateway_1' },
    { 
      id: 'Flow_2', 
      type: 'bpmn:sequenceFlow', 
      sourceNodeId: 'Gateway_1', 
      targetNodeId: 'Task_Small',
      text: '金额<1000',
      properties: { condition: '${amount < 1000}' }
    },
    { 
      id: 'Flow_3', 
      type: 'bpmn:sequenceFlow', 
      sourceNodeId: 'Gateway_1', 
      targetNodeId: 'Task_Large',
      text: '金额>=1000',
      properties: { condition: '${amount >= 1000}' }
    },
    { id: 'Flow_4', type: 'bpmn:sequenceFlow', sourceNodeId: 'Task_Small', targetNodeId: 'Gateway_2' },
    { id: 'Flow_5', type: 'bpmn:sequenceFlow', sourceNodeId: 'Task_Large', targetNodeId: 'Gateway_2' },
    { id: 'Flow_6', type: 'bpmn:sequenceFlow', sourceNodeId: 'Gateway_2', targetNodeId: 'EndEvent_1' },
  ],
}

// 渲染
lf.render(flowData)

// 导出 BPMN XML
document.getElementById('exportBtn').addEventListener('click', () => {
  const xml = lf.adapterOut(lf.getGraphRawData())
  console.log(xml)
  // 下载或发送到服务器
})

// 导入 BPMN XML
document.getElementById('importBtn').addEventListener('click', () => {
  const xmlData = '...' // BPMN XML 字符串
  const graphData = lf.adapterIn(xmlData)
  lf.render(graphData)
})
```

### 拖拽面板集成

```typescript
// 拖拽面板配置
const dndPanelItems = [
  {
    type: 'bpmn:startEvent',
    text: '开始事件',
    label: '开始',
    icon: 'data:image/svg+xml;base64,...',
  },
  {
    type: 'bpmn:endEvent',
    text: '结束事件',
    label: '结束',
    icon: 'data:image/svg+xml;base64,...',
  },
  {
    type: 'bpmn:exclusiveGateway',
    text: '排他网关',
    label: '排他',
    icon: 'data:image/svg+xml;base64,...',
  },
  {
    type: 'bpmn:parallelGateway',
    text: '并行网关',
    label: '并行',
    icon: 'data:image/svg+xml;base64,...',
  },
  {
    type: 'bpmn:inclusiveGateway',
    text: '包容网关',
    label: '包容',
    icon: 'data:image/svg+xml;base64,...',
  },
  {
    type: 'bpmn:userTask',
    text: '用户任务',
    label: '用户任务',
    icon: 'data:image/svg+xml;base64,...',
  },
  {
    type: 'bpmn:serviceTask',
    text: '服务任务',
    label: '服务任务',
    icon: 'data:image/svg+xml;base64,...',
  },
]

lf.extension.dndPanel.setPatternItems(dndPanelItems)
```

---

## API 参考

### BpmnElement 插件

```typescript
// 注册
lf.use(BpmnElement)

// 导出的元素
export {
  BpmnElement,
  StartEventModel,
  StartEventView,
  EndEventView,
  EndEventModel,
  ExclusiveGatewayView,
  ExclusiveGatewayModel,
  UserTaskView,
  UserTaskModel,
  ServiceTaskView,
  ServiceTaskModel,
  SequenceFlowView,
  SequenceFlowModel,
}
```

### BPMNElements 插件

```typescript
// 注册
lf.use(BPMNElements)

// 导出的工厂函数
export {
  GatewayNodeFactory,  // 网关工厂
  TaskNodeFactory,     // 任务工厂
  SubProcessFactory,   // 子流程工厂
  StartEventFactory,   // 开始事件工厂
  EndEventFactory,     // 结束事件工厂
  // ... 更多
}
```

### 适配器配置

```typescript
type ExtraPropsType = {
  // 保留属性字段
  retainedAttrsFields?: string[]
  
  // 排除字段
  excludeFields?: {
    in?: Set<string>
    out?: Set<string>
  }
  
  // 自定义转换器
  transformer?: {
    [key: string]: {
      in?: (key: string, data: any) => any
      out?: (data: any) => any
    }
  }
  
  // 类型映射
  mapping?: {
    in?: { [key: string]: string }
    out?: { [key: string]: string }
  }
}
```

---

## 常见问题

### 1. 如何选择使用基础插件还是增强插件？

- **基础插件 (bpmn)**：如果只需要简单的流程图，包含开始/结束事件、排他网关、用户/服务任务
- **增强插件 (bpmn-elements)**：如果需要完整的 BPMN 2.0 支持，包括三种网关、边界事件、子流程等

### 2. 如何设置顺序流的条件？

```typescript
// 方式一：通过 properties
lf.addEdge({
  type: 'bpmn:sequenceFlow',
  sourceNodeId: 'gateway',
  targetNodeId: 'task',
  properties: {
    condition: '${approved === true}',
    expressionType: 'cdata', // 或 'normal'
  },
})

// 方式二：通过文本
lf.addEdge({
  type: 'bpmn:sequenceFlow',
  sourceNodeId: 'gateway',
  targetNodeId: 'task',
  text: '条件描述',
})
```

### 3. 如何自定义网关样式？

```typescript
// 继承并重写
class CustomExclusiveGatewayModel extends ExclusiveGatewayModel {
  getNodeStyle() {
    const style = super.getNodeStyle()
    style.stroke = '#ff0000'
    style.fill = '#ffeeee'
    return style
  }
}
```

---

## 更新日志

- **v1.2.10**：增强适配器支持更多自定义配置
- **v1.2.0**：添加包容网关支持
- **v1.0.0**：初始版本，支持基础 BPMN 元素

---

## 相关链接

- [LogicFlow 官方文档](https://docs.logic-flow.cn)
- [BPMN 2.0 规范](https://www.omg.org/spec/BPMN/2.0/)
- [GitHub 仓库](https://github.com/didi/LogicFlow)
