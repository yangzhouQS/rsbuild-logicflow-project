# BPMN 元素样式自定义指南

本文档详细介绍如何在 LogicFlow 中自定义 BPMN 元素的渲染样式。

## 概述

LogicFlow 的 BPMN 插件支持多层次的样式自定义：

1. **全局主题配置** - 通过 `lf.setTheme()` 统一设置所有元素的样式
2. **节点样式覆盖** - 在 Model 类中重写 `getNodeStyle()` 方法
3. **自定义渲染** - 在 View 类中重写 `getShape()` 方法实现完全自定义的 SVG 渲染
4. **图标自定义** - 通过工厂函数的 `icon` 参数自定义节点图标

## 一、全局主题配置

### 1.1 默认主题

BPMN 插件内置了默认主题配置（位于 [`constant.ts`](../packages/extension/src/bpmn/constant.ts)）：

```typescript
export const theme: Partial<LogicFlow.Theme> = {
  rect: {
    radius: 5,
    stroke: 'rgb(24, 125, 255)',
  },
  circle: {
    r: 18,
    stroke: 'rgb(24, 125, 255)',
  },
  polygon: {
    stroke: 'rgb(24, 125, 255)',
  },
  polyline: {
    stroke: 'rgb(24, 125, 255)',
    hoverStroke: 'rgb(24, 125, 255)',
    selectedStroke: 'rgb(24, 125, 255)',
  },
  edgeText: {
    textWidth: 100,
    overflowMode: 'default',
    fontSize: 12,
    background: {
      fill: 'white',
      height: 14,
      stroke: 'transparent',
      radius: 3,
    },
  },
}
```

### 1.2 自定义全局主题

在使用 BPMN 插件后，可以调用 `lf.setTheme()` 覆盖默认样式：

```typescript
import LogicFlow from '@logicflow/core'
import { BpmnElement } from '@logicflow/extension'

const lf = new LogicFlow({
  container: document.getElementById('container'),
})

// 安装 BPMN 插件
lf.use(BpmnElement)

// 自定义主题
lf.setTheme({
  rect: {
    radius: 8,
    stroke: '#1890ff',
    fill: '#e6f7ff',
    strokeWidth: 2,
  },
  circle: {
    r: 20,
    stroke: '#52c41a',
    fill: '#f6ffed',
    strokeWidth: 2,
  },
  polygon: {
    stroke: '#fa8c16',
    fill: '#fff7e6',
    strokeWidth: 2,
  },
  polyline: {
    stroke: '#1890ff',
    strokeWidth: 2,
    hoverStroke: '#40a9ff',
    selectedStroke: '#096dd9',
  },
})
```

### 1.3 可配置的主题属性

#### 矩形节点（rect）- 任务节点

| 属性 | 类型 | 说明 |
|------|------|------|
| radius | number | 圆角半径 |
| stroke | string | 边框颜色 |
| strokeWidth | number | 边框宽度 |
| fill | string | 填充颜色 |
| opacity | number | 透明度 (0-1) |

#### 圆形节点（circle）- 事件节点

| 属性 | 类型 | 说明 |
|------|------|------|
| r | number | 半径 |
| stroke | string | 边框颜色 |
| strokeWidth | number | 边框宽度 |
| fill | string | 填充颜色 |

#### 多边形节点（polygon）- 网关节点

| 属性 | 类型 | 说明 |
|------|------|------|
| stroke | string | 边框颜色 |
| strokeWidth | number | 边框宽度 |
| fill | string | 填充颜色 |

#### 折线边（polyline）- 顺序流

| 属性 | 类型 | 说明 |
|------|------|------|
| stroke | string | 线条颜色 |
| strokeWidth | number | 线条宽度 |
| hoverStroke | string | 悬停时颜色 |
| selectedStroke | string | 选中时颜色 |

## 二、节点样式覆盖

### 2.1 重写 getNodeStyle() 方法

通过继承 BPMN 元素的 Model 类，可以重写 `getNodeStyle()` 方法来实现节点级别的样式自定义：

```typescript
import { ExclusiveGatewayModel } from '@logicflow/extension'

class CustomExclusiveGatewayModel extends ExclusiveGatewayModel {
  getNodeStyle() {
    const style = super.getNodeStyle()
    
    // 自定义样式
    style.stroke = '#ff4d4f'      // 红色边框
    style.fill = '#fff1f0'        // 浅红填充
    style.strokeWidth = 3         // 加粗边框
    
    return style
  }
}

// 注册自定义节点
const CustomExclusiveGateway = {
  type: 'bpmn:exclusiveGateway',
  view: ExclusiveGatewayView,
  model: CustomExclusiveGatewayModel,
}

lf.register(CustomExclusiveGateway)
```

### 2.2 动态样式

`getNodeStyle()` 方法可以根据节点属性返回不同的样式：

```typescript
import { UserTaskModel } from '@logicflow/extension'

class CustomUserTaskModel extends UserTaskModel {
  getNodeStyle() {
    const style = super.getNodeStyle()
    const { priority } = this.properties
    
    // 根据优先级设置不同颜色
    switch (priority) {
      case 'high':
        style.stroke = '#ff4d4f'
        style.fill = '#fff1f0'
        break
      case 'medium':
        style.stroke = '#fa8c16'
        style.fill = '#fff7e6'
        break
      case 'low':
        style.stroke = '#52c41a'
        style.fill = '#f6ffed'
        break
      default:
        style.stroke = '#1890ff'
        style.fill = '#e6f7ff'
    }
    
    return style
  }
}
```

### 2.3 任务节点样式示例

参考 [`task.ts`](../packages/extension/src/bpmn-elements/presets/Task/task.ts) 中的实现：

```typescript
class model extends RectNodeModel {
  getNodeStyle() {
    const style = super.getNodeStyle()
    
    // 当边界事件靠近任务节点时高亮显示
    const { isBoundaryEventTouchingTask } = this.properties
    if (isBoundaryEventTouchingTask) {
      style.stroke = '#00acff'
      style.strokeWidth = 2
    }
    
    return style
  }

  getOutlineStyle() {
    const style = super.getOutlineStyle()
    style.stroke = 'transparent'
    !style.hover && (style.hover = {})
    style.hover.stroke = 'transparent'
    return style
  }
}
```

## 三、自定义渲染

### 3.1 重写 getShape() 方法

View 类的 `getShape()` 方法返回 SVG 元素，可以通过重写此方法实现完全自定义的渲染效果。

#### 结束事件示例

参考 [`EndEvent.ts`](../packages/extension/src/bpmn/events/EndEvent.ts)：

```typescript
import { CircleNode, CircleNodeModel, h } from '@logicflow/core'

class EndEventView extends CircleNode {
  getShape(): h.JSX.Element {
    const { model } = this.props
    const style = model.getNodeStyle()
    const { x, y, r } = model as CircleNodeModel
    
    // 获取父类渲染的外圈
    const outCircle = super.getShape()
    
    // 返回一个组，包含外圈和内圈
    return h(
      'g',
      {},
      outCircle,
      h('circle', {
        ...style,
        cx: x,
        cy: y,
        r: r - 5,  // 内圈半径比外圈小 5px
      }),
    )
  }
}
```

#### 用户任务示例

参考 [`UserTask.ts`](../packages/extension/src/bpmn/tasks/UserTask.ts)：

```typescript
import { h, RectNode, RectNodeModel } from '@logicflow/core'

class UserTaskView extends RectNode {
  // 自定义图标渲染
  getLabelShape(): h.JSX.Element {
    const { model } = this.props
    const { x, y, width, height } = model
    const style = model.getNodeStyle()
    
    return h(
      'svg',
      {
        x: x - width / 2 + 5,
        y: y - height / 2 + 5,
        width: 25,
        height: 25,
        viewBox: '0 0 1274 1024',
      },
      h('path', {
        fill: style.stroke,
        d: 'M655.807326 287.35973m-223.989415 0a218.879 218.879 0 1 0 447.978829 0...', // SVG path
      }),
    )
  }

  getShape(): h.JSX.Element {
    const { model } = this.props
    const { x, y, width, height, radius } = model
    const style = model.getNodeStyle()
    
    return h('g', {}, [
      // 矩形背景
      h('rect', {
        ...style,
        x: x - width / 2,
        y: y - height / 2,
        rx: radius,
        ry: radius,
        width,
        height,
      }),
      // 图标
      this.getLabelShape(),
    ])
  }
}
```

### 3.2 网关自定义渲染

参考 [`gateway.ts`](../packages/extension/src/bpmn-elements/presets/Gateway/gateway.ts)：

```typescript
import { h, Polygon, PolygonNode, PolygonNodeModel } from '@logicflow/core'

class GatewayView extends PolygonNode {
  getShape() {
    const { model } = this.props
    const { x, y, width, height, points } = model as PolygonNodeModel
    const style = model.getNodeStyle()
    
    return h(
      'g',
      {
        transform: `matrix(1 0 0 1 ${x - width / 2} ${y - height / 2})`,
      },
      // 菱形背景
      h(Polygon, {
        ...style,
        x,
        y,
        points,
      }),
      // 图标（可以是 SVG path 字符串或 h 函数生成的元素）
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
```

### 3.3 SVG h() 函数说明

LogicFlow 使用虚拟 DOM 库 snabbdom 的 `h()` 函数来创建 SVG 元素：

```typescript
// 基本语法
h(tagName, attributes, children)

// 示例
h('rect', {
  x: 10,
  y: 10,
  width: 100,
  height: 50,
  fill: '#fff',
  stroke: '#000',
})

h('g', {}, [
  h('circle', { cx: 50, cy: 50, r: 20 }),
  h('text', { x: 50, y: 55 }, 'Label'),
])
```

## 四、图标自定义

### 4.1 使用工厂函数自定义图标

BPMN 元素工厂函数支持自定义图标：

#### 网关图标

```typescript
import { GatewayNodeFactory } from '@logicflow/extension'

// 自定义排他网关图标（X 形）
const customExclusiveIcon = 'M 10 10 L 40 40 M 40 10 L 10 40'

// 自定义并行网关图标（+ 形）
const customParallelIcon = 'M 25 10 L 25 40 M 10 25 L 40 25'

// 自定义包容网关图标（O 形）
const customInclusiveIcon = 'M 25 10 A 15 15 0 1 1 24.9 10'

// 创建自定义网关
const CustomExclusiveGateway = GatewayNodeFactory(
  'bpmn:customExclusiveGateway',
  customExclusiveIcon,
  {
    // 可选：自定义属性
    panels: ['property'],
  },
)

lf.register(CustomExclusiveGateway)
```

#### 任务图标

```typescript
import { TaskNodeFactory } from '@logicflow/extension'

// 自定义任务图标（SVG path）
const customTaskIcon = 'M 0 0 L 25 0 L 25 25 L 0 25 Z'

// 创建自定义任务
const CustomTask = TaskNodeFactory(
  'bpmn:customTask',
  customTaskIcon,
  {
    // 可选：自定义属性
    assignee: '',
  },
)

lf.register(CustomTask)
```

### 4.2 使用 h() 函数创建复杂图标

```typescript
import { h } from '@logicflow/core'

// 使用 h() 函数创建复杂的 SVG 图标
const complexIcon = h('g', {}, [
  h('circle', { cx: 12.5, cy: 12.5, r: 10, fill: 'none', stroke: 'currentColor' }),
  h('path', { d: 'M 8 12 L 17 12', stroke: 'currentColor' }),
  h('path', { d: 'M 12.5 8 L 12.5 17', stroke: 'currentColor' }),
])

const CustomGateway = GatewayNodeFactory(
  'bpmn:customGateway',
  complexIcon,
)
```

## 五、完整示例

### 5.1 自定义高亮网关

```typescript
import { ExclusiveGatewayModel, ExclusiveGatewayView } from '@logicflow/extension'
import { h, PolygonNode } from '@logicflow/core'

// 自定义 Model
class HighlightGatewayModel extends ExclusiveGatewayModel {
  getNodeStyle() {
    const style = super.getNodeStyle()
    const { isHighlighted } = this.properties
    
    if (isHighlighted) {
      style.stroke = '#ff4d4f'
      style.fill = '#fff1f0'
      style.strokeWidth = 3
      // 添加阴影效果
      style.filter = 'drop-shadow(0 0 5px rgba(255, 77, 79, 0.5))'
    }
    
    return style
  }
}

// 自定义 View
class HighlightGatewayView extends PolygonNode {
  getShape() {
    const { model } = this.props
    const { x, y, width, height, points } = model
    const style = model.getNodeStyle()
    
    return h(
      'g',
      {
        transform: `matrix(1 0 0 1 ${x - width / 2} ${y - height / 2})`,
      },
      h('polygon', {
        points: points.map(p => p.join(',')).join(' '),
        ...style,
      }),
      h('path', {
        d: 'M 10 10 L 40 40 M 40 10 L 10 40',
        fill: 'none',
        stroke: style.stroke,
        strokeWidth: 3,
      }),
    )
  }
}

const HighlightGateway = {
  type: 'bpmn:highlightGateway',
  view: HighlightGatewayView,
  model: HighlightGatewayModel,
}

lf.register(HighlightGateway)
```

### 5.2 自定义带状态的任务节点

```typescript
import { UserTaskModel, UserTaskView } from '@logicflow/extension'
import { h, RectNode } from '@logicflow/core'

class StatusTaskModel extends UserTaskModel {
  getNodeStyle() {
    const style = super.getNodeStyle()
    const { status } = this.properties
    
    switch (status) {
      case 'running':
        style.stroke = '#1890ff'
        style.fill = '#e6f7ff'
        break
      case 'completed':
        style.stroke = '#52c41a'
        style.fill = '#f6ffed'
        break
      case 'failed':
        style.stroke = '#ff4d4f'
        style.fill = '#fff1f0'
        break
      case 'pending':
      default:
        style.stroke = '#d9d9d9'
        style.fill = '#fafafa'
    }
    
    return style
  }
}

class StatusTaskView extends RectNode {
  getShape() {
    const { model } = this.props
    const { x, y, width, height, radius, properties } = model
    const style = model.getNodeStyle()
    
    const children = [
      h('rect', {
        ...style,
        x: x - width / 2,
        y: y - height / 2,
        rx: radius,
        ry: radius,
        width,
        height,
      }),
    ]
    
    // 如果任务正在运行，添加动画效果
    if (properties.status === 'running') {
      children.push(
        h('rect', {
          x: x - width / 2,
          y: y - height / 2,
          rx: radius,
          ry: radius,
          width,
          height,
          fill: 'none',
          stroke: '#1890ff',
          strokeWidth: 2,
          strokeDasharray: '5 5',
          className: 'animate-dash',  // 需要配合 CSS 动画
        }),
      )
    }
    
    return h('g', {}, children)
  }
}

const StatusTask = {
  type: 'bpmn:statusTask',
  view: StatusTaskView,
  model: StatusTaskModel,
}

lf.register(StatusTask)
```

## 六、样式相关 API

### 6.1 lf.setTheme(theme)

设置全局主题。

```typescript
lf.setTheme({
  rect: { stroke: '#1890ff', fill: '#e6f7ff' },
  circle: { stroke: '#52c41a', fill: '#f6ffed' },
  polygon: { stroke: '#fa8c16', fill: '#fff7e6' },
})
```

### 6.2 model.getNodeStyle()

获取节点样式，可在子类中重写。

```typescript
class CustomModel extends RectNodeModel {
  getNodeStyle() {
    const style = super.getNodeStyle()
    style.stroke = '#ff4d4f'
    return style
  }
}
```

### 6.3 model.setStyles(styles)

设置节点样式（会覆盖原有样式）。

```typescript
model.setStyles({
  stroke: '#ff4d4f',
  fill: '#fff1f0',
})
```

### 6.4 lf.getNodeStyleById(id)

根据节点 ID 获取样式。

```typescript
const style = lf.getNodeStyleById('node_1')
```

## 七、注意事项

1. **样式优先级**：节点级别样式 > 全局主题 > 默认样式
2. **性能考虑**：避免在 `getShape()` 中进行复杂计算，该方法会频繁调用
3. **SVG 属性**：确保使用正确的 SVG 属性名（如 `strokeWidth` 而非 `stroke-width`）
4. **样式继承**：重写方法时建议先调用 `super.getNodeStyle()` 获取基础样式
5. **响应式更新**：修改属性后需要触发重新渲染

```typescript
// 修改属性后触发重新渲染
model.setProperties({ status: 'running' })
```

## 八、相关文件

- [`packages/extension/src/bpmn/constant.ts`](../packages/extension/src/bpmn/constant.ts) - 默认主题配置
- [`packages/extension/src/bpmn/events/EndEvent.ts`](../packages/extension/src/bpmn/events/EndEvent.ts) - 结束事件渲染示例
- [`packages/extension/src/bpmn/tasks/UserTask.ts`](../packages/extension/src/bpmn/tasks/UserTask.ts) - 用户任务渲染示例
- [`packages/extension/src/bpmn-elements/presets/Gateway/gateway.ts`](../packages/extension/src/bpmn-elements/presets/Gateway/gateway.ts) - 网关工厂函数
- [`packages/extension/src/bpmn-elements/presets/Task/task.ts`](../packages/extension/src/bpmn-elements/presets/Task/task.ts) - 任务工厂函数
