# LogicFlow BPMN Elements Adapter 总结

## 概述

`bpmn-elements-adapter` 是 LogicFlow 提的增强版 BPMN 数据适配器，相比基础版 `bpmn-adapter`，它提供了更强大的功能和：

## 主要区别

| 特性 | 基础适配器 (bpmn-adapter) | 增强适配器 (bpmn-elements-adapter) |
|------|------------------------|--------------------------|--------------------------------|
| 支持元素 | 基础元素 | 更多元素类型 | |
| 子流程支持 | 否 | 是 |
| 边界事件 | 否 | 是 |
| 中间事件 | 否 | 是 |
| 自定义转换器 | 常用转换器 | 支持自定义转换器配置 |
| 排除字段 | 固定排除 | 可配置 |
| 映射配置 | 否 | 是 |
| 类型映射 | 否 | 是 |

| 插件名称 | `bpmn-adapter` | `BPMNAdapter` |
| XML 支持 | 是 | 是 |
| JSON 支持 | 是 | 是 |

| 扩展属性 | 有限 | 更丰富 |

## 支持的所有元素类型

### 事件类型
- `bpmn:startEvent` - 开始事件
- `bpmn:endEvent` - 结束事件
- `bpmn:intermediateCatchEvent` - 中间捕获事件
- `bpmn:intermediateThrowEvent` - 中间抛出事件
- `bpmn:boundaryEvent` - 边界事件

### 任务类型
- `bpmn:userTask` - 用户任务
- `bpmn:serviceTask` - 服务任务
- `bpmn:subProcess` - 子流程

### 紻动类型
- `bpmn:sequenceFlow` - 顺序流

### 网关类型
- `bpmn:exclusiveGateway` - 排他网关
- `bpmn:parallelGateway` - 并行网关
- `bpmn:inclusiveGateway` - 包容网关

## 核心配置

### 1. 尺寸配置

```typescript
export const StartEventConfig = { width: 40, height: 40 }
export const EndEventConfig = { width: 40, height: 40 }
export const BoundaryEventConfig = { width: 100, height: 80 }
export const IntermediateEventConfig = { width: 100, height: 80 }
export const ParallelGatewayConfig = { width: 100, height: 80 }
export const InclusiveGatewayConfig = { width: 100, height: 80 }
export const ExclusiveGatewayConfig = { width: 100, height: 80 }
export const ServiceTaskConfig = { width: 100, height: 80 }
export const UserTaskConfig = { width: 100, height: 80 }
export const SubProcessConfig = { width: 100, height: 80 }
```

### 2. 类型定义

```typescript
enum BpmnElements {
  START = 'bpmn:startEvent',
  END = 'bpmn:endEvent',
  INTERMEDIATE_CATCH = 'bpmn:intermediateCatchEvent',
  INTERMEDIATE_THROW = 'bpmn:intermediateThrowEvent',
  BOUNDARY = 'bpmn:boundaryEvent',
  PARALLEL_GATEWAY = 'bpmn:parallelGateway',
  INCLUSIVE_GATEWAY = 'bpmn:inclusiveGateway',
  EXCLUSIVE_GATEWAY = 'bpmn:exclusiveGateway',
  USER = 'bpmn:userTask',
  SYSTEM = 'bpmn:serviceTask',
  FLOW = 'bpmn:sequenceFlow',
  SUBPROCESS = 'bpmn:subProcess',
}
```

### 3. 自定义配置

```typescript
type ExtraPropsType = {
  /**
   * 保留属性字段
   * 与 defaultRetainedProperties 合并
   */
  retainedAttrsFields?: string[]

  /**
   * 排除字段
   * 与 defaultExcludeFields 合并
   */
  excludeFields?: {
    in?: Set<string>
    out?: Set<string>
  }
  
  /**
   * 自定义转换器
   * 用于处理特殊节点的导入导出
   */
  transformer?: {
    [key: string]: {
      in?: (key: string, data: any) => any
      out?: (data: any) => any
    }
  }
  
  /**
   * 类型映射
   * 用于将自定义类型映射到标准类型
   */
  mapping?: {
    in?: { [key: string]: string }
    out?: { [key: string]: string }
  }
}
```

## 使用方法

### 基础使用

```typescript
import LogicFlow from '@logicflow/core'
import { BPMNAdapter } from '@logicflow/extension'

// 注册插件
lf.use(BPMNAdapter)
```

### 带配置使用
```typescript
import LogicFlow from '@logicflow/core'
import { BPMNAdapter } from '@logicflow/extension'

import '@logicflow/core/dist/style/index.css'
import '@logicflow/extension/lib/style/index.css'

// 创建实例
const lf = new LogicFlow({
  container: document.getElementById('container'),
})

// 注册插件并传入配置
lf.use(BPMNAdapter, {
  // 保留属性字段
  retainedAttrsFields: ['customField1', 'customField2'],
  // 排除字段
  excludeFields: {
    out: new Set(['internalField1', 'internalField2']),
  },
  // 自定义转换器
  transformer: {
    'bpmn:customElement': {
      in: (key, data) => {
        // 自定义导入逻辑
        return {
          customProperty: data.customProperty,
        }
      },
      out: (data) => {
        // 自定义导出逻辑
        return {
          json: `<bpmn:customElement>${data.customProperty}</bpmn:customElement>`,
          extraProp: data.extraProperty
        }
      },
    },
  },
})
```

### 导出数据
```typescript
// 导出为 JSON
const jsonData = lf.adapterOut(lf.getGraphRawData())

console.log(jsonData)

// 导出为 XML
const xmlData = lf.adapterOut(lf.getGraphRawData())
console.log(xmlData)
`` }
})
```

### 导入数据
```typescript
// 从 JSON 导入
const graphData = lf.adapterIn(jsonData)
lf.render(graphData)

// 从 XML 导入
const graphData = lf.adapterIn(xmlData)
lf.render(graphData)
`` }
})
```

## 内置转换器

### 顺序流条件转换器

```typescript
// 默认的顺序流转换器
const defaultTransformer = {
  'bpmn:sequenceFlow': {
    out(data: any) {
      const { properties: { expressionType, condition } } data
      if (condition) {
        if (expressionType === 'cdata') {
          return {
            json: `<bpmn:conditionExpression xsi:type="bpmn2:tFormalExpression"><![CDATA[\${${condition}}]]></bpmn:conditionExpression>`,
          }
        }
        return {
          json: `<bpmn:conditionExpression xsi:type="bpmn2:tFormalExpression">${condition}</bpmn:conditionExpression>`,
        }
      }
      return {
        json: '',
      }
    },
  },
}
```

### 定时器事件转换器
```typescript
'bpmn:timerEventDefinition': {
    out(data: any) {
      const { properties: { timerType, timerValue, definitionId } } = data
      const typeFunc = () => 
        `<bpmn:${timerType} xsi:type="bpmn:tFormalExpression">${timerValue}</bpmn:${timerType}>`

      return {
        json: `<bpmn:timerEventDefinition id="${definitionId}$${
          timerType && timerValue
            ? `>${typeFunc()}</bpmn:timerEventDefinition>`
            : '/>'
          }`,
      }
    },
    in(key: string, data: any) {
      const definitionType = key
      const definitionId = data['-id']
      let timerType = ''
      let timerValue = ''
      for (const key of Object.keys(data)) {
        if (key.includes('bpmn:')) {
          ;[, timerType] = key.split(':')
          timerValue = data[key]?.['#text']
        }
      }
      return {
        '-definitionId': definitionId,
        '-definitionType': definitionType,
        '-timerType': timerType,
        '-timerValue': timerValue,
      }
    },
  },
}
```

### 条件表达式转换器
```typescript
'bpmn:conditionExpression': {
    in(_key: string, data: any) {
      let condition = ''
      let expressionType = ''
      if (data['#cdata-section']) {
        expressionType = 'cdata'
        condition = /^\$\{(.*)\}$/g.exec(data['#cdata-section'])?.[1] || ''
      } else if (data['#text']) {
        expressionType = 'normal'
        condition = data['#text']
      }
      return {
        '-condition': condition,
        '-expressionType': expressionType,
      }
    },
  },
}
```

## 高级功能

### 1. 子流程支持

增强适配器支持子流程的导入导出，， 会自动将子流程内的节点提升到 process层， 然后重新组织数据结构。

### 2. 边界事件支持
边界事件会被正确处理， 并与附加的任务节点建立关联关系。

### 3. 中间事件支持
中间捕获事件和中间抛出事件都有专门的处理逻辑。

### 4. 自定义排除字段
可以配置 `excludeFields` 来排除不需要导出的字段：

```typescript
const extraProps = {
  excludeFields: {
    out: new Set([
      'properties.panels',
      'properties.nodeSize',
      'properties.definitionId',
      'properties.timerValue',
      'properties.timerType',
      'properties.definitionType',
      'properties.parent',
      'properties.isBoundaryEventTouchingTask',
    ]),
  },
}
```

### 5. 类型映射
支持将自定义节点类型映射到标准 BPMN 类型
```typescript
const extraProps = {
  mapping: {
    out: {
      'bpmn:myCustomTask': 'bpmn:userTask',
    },
    in: {
      'bpmn:userTask': 'bpmn:myCustomTask',
    },
  },
}
```

## 完整示例

```typescript
import LogicFlow from '@logicflow/core'
import { BPMNAdapter } from '@logicflow/extension'
import '@logicflow/core/dist/style/index.css'
import '@logicflow/extension/lib/style/index.css'

// 创建实例
const lf = new LogicFlow({
  container: document.getElementById('container'),
})

// 注册插件
lf.use(BPMNAdapter, {
  // 自定义转换器
  transformer: {
    'bpmn:customTask': {
      in: (key, string, data: any) => {
        return {
          customProperty: data.customProperty,
        }
      },
      out: (data: any) => {
        return {
          json: `<bpmn:customTask>${data.customProperty}</bpmn:customTask>`,
          extraProp: data.extraProperty,
        }
      },
    },
  },
  // 自定义任务节点
  const CustomTask = {
    type: 'bpmn:customTask',
    view: RectNode,
    model: RectNodeModel,
  }
  lf.register(CustomTask)
    // 渲染流程
    lf.render({
    nodes: [
      { id: 'task1', type: 'bpmn:customTask', x: 200, y: 200, text: '自定义任务' },
    ],
  })
    // 导出
    const xmlData = lf.adapterOut(lf.getGraphRawData())
    console.log(xmlData)
    // 导入
    const newXmlData = '...'
    const graphData = lf.adapterIn(newXmlData)
    lf.render(graphData)
  })
})
```

## 数据转换流程

### 导出流程
1. LogicFlow 图数据转换为 BPMN JSON
2. 调用 `convertNormalToXml` 函数
3. 通过 `convertLf2ProcessData` 处理节点数据
4. 通过 `convertLf2DiagramData` 处理图形数据
5. 返回 BPMN JSON

### 导入流程
1. BPMN JSON 转换为 LogicFlow 图数据
2. 调用 `convertBpmn2LfData` 函数
3. 通过 `convertXmlToNormal` 处理属性
4. 通过 `getLfNodes` 和 `getLfEdges` 处理节点和边
### 节点转换
- 坐标转换： BPMN 使用左上角，LogicFlow 使用中心点，需要转换
- `text` 处理: 从 `-name` 属性读取，并进行 XML 实体反转义
- `properties` 处理: 将额外属性放入 `properties` 中
### 边处理
- 边界事件需要处理 `attachedToRef` 属性
- 子流程需要递归处理子节点
- 自定义元素需要特殊处理
### 边处理
- 顺序流条件表达式处理
- 定时器事件定义处理
- 其他定义类型按需特殊处理

### 图形数据处理
- 坐标从左上角基准转换为中心点基准
- Bounds 计算并应用
- 文本位置优先使用 BPMNLabel 的 Bounds
- 文本进行 XML 实体反转义

### 类型映射
- 支持将自定义节点类型映射到标准类型
```typescript
// 示例：将自定义类型 'bpmn:myTask' 映射到 'bpmn:userTask'
const extraProps = {
  mapping: {
    out: {
      'bpmn:myTask': 'bpmn:userTask',
    },
    in: {
      'bpmn:userTask': 'bpmn:myTask',
    },
  },
}
```

## 与基础适配器的对比

| 特性 | 基础适配器 | 增强适配器 |
|------|------------------------|--------------------------|--------------------------------|
| 子流程支持 | ❕ 是 |
| 边界事件 | 否 | 是 |
| 中间事件 | 否 | 是 |
| 自定义转换器 | 常用转换器 | 支持自定义转换器 |
| 排除字段 | 固定 | 可配置 |
| 类型映射 | 否 | 是 |
| 扩展属性 | 有限 | 更丰富 |
| XML 支持 | 是 | 是 |
| JSON 支持 | 是 | 是 |
| 增强版 `Bpmn-elements-adapter` | 推荐用于需要完整 BPMN 2.0 支持的场景。

