# LogicFlow 流程可视化项目深度分析文档

## 目录

1. [项目概述](#项目概述)
2. [Packages 目录分析](#packages-目录分析)
3. [Examples 目录分析](#examples-目录分析)
4. [不同框架集成方式对比](#不同框架集成方式对比)
5. [最佳实践与配置要点](#最佳实践与配置要点)
6. [如何构建自己的流程可视化应用](#如何构建自己的流程可视化应用)

---

## 项目概述

LogicFlow 是一款由滴滴开源的流程图编辑框架，专注于业务流程图编辑场景。它提供了流程图交互、编辑所必需的功能和灵活的节点自定义、插件扩展机制。

### 核心特性

- **🛠 高拓展性**: 兼容各种产品自定义的流程编辑需求，绝大部分模块以插件形式实现
- **🚀 重执行**: 流程图能完备地表达业务逻辑，不受流程引擎限制
- **🎯 专业**: 专注于业务流程图编辑的框架

### 技术栈

- **核心**: Preact + MobX (轻量级响应式方案)
- **构建**: TypeScript + Rollup/Vite
- **样式**: Less

---

## Packages 目录分析

项目包含 6 个核心子包，形成了完整的流程可视化生态系统。

### 1. @logicflow/core - 核心库

**路径**: [`packages/core/`](packages/core/)

**版本**: 2.2.0-alpha.7

**功能描述**: LogicFlow 的核心包，提供流程图编辑的基础能力。

#### 核心模块结构

```
packages/core/src/
├── LogicFlow.tsx          # 主入口类，51780 chars
├── options.ts             # 配置选项定义
├── model/                 # 数据模型层
│   ├── GraphModel.ts      # 图模型（核心状态管理）
│   ├── BaseModel.ts       # 元素基类
│   ├── node/              # 节点模型
│   │   ├── BaseNodeModel.ts
│   │   ├── RectNodeModel.ts
│   │   ├── CircleNodeModel.ts
│   │   ├── DiamondNodeModel.ts
│   │   ├── EllipseNodeModel.ts
│   │   ├── PolygonNodeModel.ts
│   │   ├── HtmlNodeModel.ts
│   │   └── TextNodeModel.ts
│   └── edge/              # 边模型
│       ├── BaseEdgeModel.ts
│       ├── LineEdgeModel.ts
│       ├── BezierEdgeModel.ts
│       └── PolylineEdgeModel.ts
├── view/                  # 视图层
│   ├── node/              # 节点视图
│   ├── edge/              # 边视图
│   ├── shape/             # SVG 形状组件
│   └── overlay/           # 覆盖层组件
├── event/                 # 事件系统
├── keyboard/              # 键盘快捷键
├── history/               # 历史记录（撤销/重做）
├── algorithm/             # 算法工具
├── util/                  # 工具函数
└── constant/              # 常量定义
```

#### 主要 API

```typescript
import LogicFlow from '@logicflow/core'

// 创建实例
const lf = new LogicFlow({
  container: document.querySelector('#container'),
  width: 700,
  height: 600,
  // ... 其他配置
})

// 渲染数据
lf.render(data)

// 获取数据
const graphData = lf.getGraphData()

// 事件监听
lf.on('node:click', (data) => { /* ... */ })
```

#### 依赖关系

```json
{
  "dependencies": {
    "lodash-es": "^4.17.21",
    "classnames": "^2.3.2",
    "mobx": "^5.15.7",
    "mobx-preact": "^3.0.0",
    "mobx-utils": "^5.6.1",
    "mousetrap": "^1.6.5",
    "preact": "^10.17.1",
    "uuid": "^9.0.0"
  }
}
```

#### 导出内容

```typescript
// packages/core/src/index.ts
export { LogicFlow, h, createRef, Component, LogicFlowUtil }
export * from './util'
export * from './tool'
export * from './view'
export * from './model'
export * from './options'
export * from './keyboard'
export * from './constant'
export * from './algorithm'
export * from './event/eventEmitter'
export { ElementState, ModelType, ElementType, EventType } from './constant'
```

---

### 2. @logicflow/extension - 扩展插件库

**路径**: [`packages/extension/`](packages/extension/)

**版本**: 2.2.0-alpha.7

**功能描述**: 提供丰富的扩展插件，包括 BPMN 支持、UI 组件、工具类等。

#### 插件模块结构

```
packages/extension/src/
├── bpmn/                    # BPMN 基础元素
│   ├── events/              # 事件节点
│   ├── gateways/            # 网关节点
│   ├── tasks/               # 任务节点
│   └── flow/                # 流程连线
├── bpmn-adapter/            # BPMN XML 适配器（旧版）
├── bpmn-elements/           # BPMN 元素（新版）
├── bpmn-elements-adapter/   # BPMN 元素适配器（新版）
├── components/              # UI 组件
│   ├── control/             # 控制面板
│   ├── menu/                # 右键菜单
│   ├── context-menu/        # 上下文菜单
│   ├── dnd-panel/           # 拖拽面板
│   ├── mini-map/            # 小地图
│   ├── selection-select/    # 框选
│   └── highlight/           # 高亮
├── tools/                   # 工具
│   ├── snapshot/            # 快照导出
│   ├── label/               # 标签工具
│   ├── flow-path/           # 流程路径
│   ├── auto-layout/         # 自动布局
│   └── proximity-connect/   # 邻近连接
├── dynamic-group/           # 动态分组
├── materials/               # 物料
│   ├── curved-edge/         # 曲线边
│   ├── group/               # 分组（已废弃）
│   └── node-selection/      # 节点选择
├── pool/                    # 泳道
├── NodeResize/              # 节点缩放（已废弃）
└── turbo-adapter/           # Turbo 适配器
```

#### 主要插件说明

| 插件名 | 功能 | 使用场景 |
|--------|------|----------|
| `Control` | 控制面板 | 缩放、撤销、重做等操作 |
| `DndPanel` | 拖拽面板 | 从面板拖拽节点到画布 |
| `Menu` | 右键菜单 | 自定义节点/边的右键菜单 |
| `MiniMap` | 小地图 | 显示整个流程图的缩略图 |
| `SelectionSelect` | 框选 | 框选多个元素 |
| `DynamicGroup` | 动态分组 | 创建可折叠的节点分组 |
| `Snapshot` | 快照 | 导出图片 |
| `BpmnElement` | BPMN 元素 | BPMN 2.0 规范支持 |

#### 使用示例

```typescript
import LogicFlow from '@logicflow/core'
import { Control, DndPanel, Menu, MiniMap } from '@logicflow/extension'
import '@logicflow/extension/es/index.css'

const lf = new LogicFlow({
  container: document.querySelector('#container'),
  plugins: [Control, DndPanel, Menu, MiniMap],
})
```

---

### 3. @logicflow/engine - 流程引擎

**路径**: [`packages/engine/`](packages/engine/)

**版本**: 0.1.1

**功能描述**: JavaScript 流程执行引擎，支持浏览器和 Node.js 环境。

#### 特性

- 跨平台执行（浏览器/Node.js）
- 支持流程编排和执行
- 可扩展的执行上下文

#### 依赖

```json
{
  "dependencies": {
    "uuid": "^8.2.0",
    "@nyariv/sandboxjs": "^0.8.23"
  }
}
```

---

### 4. @logicflow/layout - 布局库

**路径**: [`packages/layout/`](packages/layout/)

**版本**: 2.1.0-alpha.7

**功能描述**: 提供自动布局算法，支持多种布局方式。

#### 支持的布局算法

- **dagre**: 有向图层次布局
- **elkjs**: Eclipse Layout Kernel（更复杂的布局算法）

#### 依赖

```json
{
  "dependencies": {
    "@logicflow/core": "workspace:*",
    "dagre": "^0.8.5",
    "elkjs": "^0.11.0"
  }
}
```

---

### 5. @logicflow/react-node-registry - React 节点注册

**路径**: [`packages/react-node-registry/`](packages/react-node-registry/)

**版本**: 1.2.0-alpha.7

**功能描述**: 支持在 LogicFlow 中使用 React 组件作为自定义节点。

#### 使用示例

```tsx
import { register } from '@logicflow/react-node-registry'
import '@logicflow/react-node-registry/es/index.css'

const NodeComponent: FC<ReactNodeProps> = ({ node }) => {
  const data = node.getData()
  return (
    <div className="react-algo-node">
      <img src={icon} alt="icon" />
      <span>{data.properties.name}</span>
    </div>
  )
}

// 注册 React 节点
register(
  {
    type: 'custom-react-node',
    component: NodeComponent,
  },
  lf,
)
```

---

### 6. @logicflow/vue-node-registry - Vue 节点注册

**路径**: [`packages/vue-node-registry/`](packages/vue-node-registry/)

**版本**: 1.2.0-alpha.7

**功能描述**: 支持在 LogicFlow 中使用 Vue 组件作为自定义节点，支持 Vue 2 和 Vue 3。

#### 使用示例

```vue
<script setup lang="ts">
import { register, getTeleport } from '@logicflow/vue-node-registry'
import ProgressNode from '@/components/ProgressNode.vue'

const TeleportContainer = getTeleport()

onMounted(() => {
  const lf = new LogicFlow({ /* config */ })
  
  // 注册 Vue 节点
  register(
    {
      type: 'custom-vue-node',
      component: ProgressNode,
    },
    lf,
  )
})
</script>

<template>
  <div ref="containerRef" id="graph"></div>
  <TeleportContainer :flow-id="flowId" />
</template>
```

---

### 包依赖关系图

```
                    @logicflow/core
                          │
          ┌───────────────┼───────────────┐
          │               │               │
          ▼               ▼               ▼
    @logicflow/    @logicflow/    @logicflow/
     extension      layout      react-node-registry
          │                               │
          ▼                               │
    @logicflow/                           │
    vue-node-registry ◄───────────────────┘
```

---

## Examples 目录分析

项目提供了丰富的示例应用，覆盖多种主流框架和技术栈。

### 示例项目概览

| 项目名 | 框架 | 构建工具 | 特点 |
|--------|------|----------|------|
| feature-examples | React | Umi 4 | 功能最全的示例 |
| vue3-app | Vue 3 | Vite | Vue 3 + Element Plus |
| next-app | React | Next.js 14 | SSR 支持 |
| engine-browser-examples | React | Vite | 流程引擎示例 |
| engine-node-examples | Node.js | - | Node.js 环境执行 |
| material-ui-demo | React | CRA | Material UI 集成 |

---

### 1. feature-examples - 功能示例（Umi + React）

**路径**: [`examples/feature-examples/`](examples/feature-examples/)

**技术栈**: Umi 4 + React 18 + Ant Design 5

#### 依赖配置

```json
{
  "dependencies": {
    "@logicflow/core": "workspace:*",
    "@logicflow/engine": "workspace:*",
    "@logicflow/extension": "workspace:*",
    "@logicflow/react-node-registry": "workspace:*",
    "@logicflow/layout": "workspace:*",
    "antd": "^5.4.0",
    "umi": "^4.2.1"
  }
}
```

#### 示例页面结构

```
src/pages/
├── graph/              # 基础图形示例
├── grid/               # 网格示例
├── theme/              # 主题配置
├── nodes/              # 自定义节点
│   ├── custom/         # 各种自定义节点
│   └── native/         # 原生节点
├── edges/              # 自定义边
│   └── custom/
├── extensions/         # 扩展插件示例
│   ├── bpmn/           # BPMN 示例
│   ├── control/        # 控制面板
│   ├── dnd-panel/      # 拖拽面板
│   ├── menu/           # 右键菜单
│   ├── mini-map/       # 小地图
│   ├── dynamic-group/  # 动态分组
│   ├── snapshot/       # 快照导出
│   └── ...
├── layout/             # 布局示例
│   ├── default/        # 默认布局
│   └── custom/         # 自定义布局
├── react/              # React 节点示例
└── performance/        # 性能测试
```

#### 核心代码示例

```tsx
// examples/feature-examples/src/pages/graph/index.tsx
import LogicFlow, { ElementState, OverlapMode, ModelType } from '@logicflow/core'
import '@logicflow/core/es/index.css'
import {
  Control,
  DndPanel,
  DynamicGroup,
  SelectionSelect,
  Menu,
  MiniMap,
} from '@logicflow/extension'
import '@logicflow/extension/es/index.css'
import { register } from '@logicflow/react-node-registry'

export default function BasicNode() {
  const lfRef = useRef<LogicFlow>()
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const lf = new LogicFlow({
      container: containerRef.current!,
      multipleSelectKey: 'shift',
      autoExpand: true,
      adjustEdgeStartAndEnd: true,
      allowRotate: true,
      allowResize: true,
      keyboard: { enabled: true },
      background: { color: '#FFFFFF' },
      grid: true,
      edgeType: 'polyline',
      plugins: [Control, DndPanel, DynamicGroup, SelectionSelect, Menu, MiniMap],
    })

    // 注册自定义元素
    registerElements(lf)
    registerEvents(lf)
    
    // 注册 React 节点
    register({ type: 'custom-react-node', component: NodeComponent }, lf)

    lf.render(data)
    lfRef.current = lf
  }, [])

  return <div ref={containerRef} id="graph" />
}
```

---

### 2. vue3-app - Vue 3 示例

**路径**: [`examples/vue3-app/`](examples/vue3-app/)

**技术栈**: Vue 3 + Vite + Element Plus + TailwindCSS

#### 依赖配置

```json
{
  "dependencies": {
    "@logicflow/core": "workspace:*",
    "@logicflow/engine": "workspace:*",
    "@logicflow/extension": "workspace:*",
    "@logicflow/vue-node-registry": "workspace:*",
    "element-plus": "^2.0.4",
    "vue": "^3.4.21",
    "vue-router": "^4.3.0"
  }
}
```

#### Vue 3 集成特点

```vue
<script setup lang="ts">
import { onMounted, ref } from 'vue'
import LogicFlow from '@logicflow/core'
import { register, getTeleport } from '@logicflow/vue-node-registry'
import '@logicflow/core/es/index.css'
import '@logicflow/vue-node-registry/es/index.css'

const lfRef = ref<LogicFlow | null>(null)
const containerRef = ref<HTMLDivElement | null>(null)
const flowId = ref('')
const TeleportContainer = getTeleport()

onMounted(() => {
  if (containerRef.value) {
    const lf = new LogicFlow({
      container: containerRef.value,
      // ... 配置
    })

    // 注册 Vue 组件节点
    register(
      {
        type: 'custom-vue-node',
        component: ProgressNode,
      },
      lf,
    )

    lf.on('graph:rendered', ({ graphModel }) => {
      flowId.value = graphModel.flowId!
    })

    lf.render(data)
    lfRef.value = lf
  }
})
</script>

<template>
  <div ref="containerRef" id="graph" class="viewport"></div>
  <!-- Vue 节点容器，必须放在模板中 -->
  <TeleportContainer :flow-id="flowId" />
</template>
```

#### Vue 3 集成注意事项

1. **TeleportContainer**: 必须在模板中放置 `<TeleportContainer />`，用于渲染 Vue 组件节点
2. **flowId**: 需要监听 `graph:rendered` 事件获取 flowId 并传递给 TeleportContainer
3. **响应式引用**: 使用 `ref` 管理 LogicFlow 实例

---

### 3. next-app - Next.js 示例

**路径**: [`examples/next-app/`](examples/next-app/)

**技术栈**: Next.js 14 + React 18 + Ant Design 5 + TailwindCSS

#### 依赖配置

```json
{
  "dependencies": {
    "@logicflow/core": "workspace:*",
    "@logicflow/engine": "workspace:*",
    "@logicflow/extension": "workspace:*",
    "antd": "^5.4.0",
    "react": "^18",
    "react-dom": "^18",
    "next": "14.2.3"
  }
}
```

#### Next.js 集成特点

```tsx
// examples/next-app/src/app/page.tsx
'use client'  // 必须标记为客户端组件

import LogicFlow from '@logicflow/core'
import '@logicflow/core/es/index.css'
import { useEffect, useRef } from 'react'

export default function Graph() {
  const lfRef = useRef<LogicFlow>()
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!lfRef.current) {
      const lf = new LogicFlow({
        container: containerRef.current as HTMLElement,
        // ... 配置
      })
      lf.render(data)
      lfRef.current = lf
    }
  }, [])

  return (
    <Card title="Graph">
      <div ref={containerRef} id="graph" className="viewport"></div>
    </Card>
  )
}
```

#### Next.js 集成注意事项

1. **'use client'**: 页面组件必须标记为客户端组件
2. **SSR 兼容**: LogicFlow 只在客户端初始化，需要用 `useEffect` 包裹
3. **样式导入**: 需要在客户端组件中导入 CSS

---

### 4. engine-browser-examples - 流程引擎示例

**路径**: [`examples/engine-browser-examples/`](examples/engine-browser-examples/)

**技术栈**: Vite + React 18 + React Router

#### 功能演示

- 流程执行引擎的使用
- 条件分支执行
- 执行记录和回放

---

## 不同框架集成方式对比

### 集成方式对比表

| 特性 | React (Umi/Vite) | Vue 3 | Next.js |
|------|------------------|-------|---------|
| 初始化方式 | useEffect | onMounted | useEffect + 'use client' |
| 自定义节点 | react-node-registry | vue-node-registry | react-node-registry |
| 节点容器 | 不需要 | TeleportContainer | 不需要 |
| SSR 兼容 | 无需处理 | 无需处理 | 需要 'use client' |
| 状态管理 | useRef | ref | useRef |
| 样式导入 | 直接导入 | 直接导入 | 客户端组件内导入 |

### React 集成模式

```tsx
// React 标准集成
import { useEffect, useRef } from 'react'
import LogicFlow from '@logicflow/core'
import '@logicflow/core/es/index.css'

function FlowChart() {
  const containerRef = useRef<HTMLDivElement>(null)
  const lfRef = useRef<LogicFlow>()

  useEffect(() => {
    if (containerRef.current && !lfRef.current) {
      const lf = new LogicFlow({
        container: containerRef.current,
        // 配置项
      })
      lf.render(data)
      lfRef.current = lf
    }
  }, [])

  return <div ref={containerRef} className="viewport" />
}
```

### Vue 3 集成模式

```vue
<script setup lang="ts">
import { onMounted, ref } from 'vue'
import LogicFlow from '@logicflow/core'
import { getTeleport } from '@logicflow/vue-node-registry'

const containerRef = ref<HTMLDivElement | null>(null)
const lfRef = ref<LogicFlow | null>(null)
const flowId = ref('')
const TeleportContainer = getTeleport()

onMounted(() => {
  if (containerRef.value) {
    const lf = new LogicFlow({
      container: containerRef.value,
    })
    lf.on('graph:rendered', ({ graphModel }) => {
      flowId.value = graphModel.flowId!
    })
    lf.render(data)
    lfRef.value = lf
  }
})
</script>

<template>
  <div ref="containerRef" class="viewport"></div>
  <TeleportContainer :flow-id="flowId" />
</template>
```

### Next.js 集成模式

```tsx
// Next.js 页面组件
'use client'

import { useEffect, useRef } from 'react'
import LogicFlow from '@logicflow/core'
import '@logicflow/core/es/index.css'

export default function FlowPage() {
  const containerRef = useRef<HTMLDivElement>(null)
  const lfRef = useRef<LogicFlow>()

  useEffect(() => {
    if (containerRef.current && !lfRef.current) {
      const lf = new LogicFlow({
        container: containerRef.current,
      })
      lf.render(data)
      lfRef.current = lf
    }
  }, [])

  return <div ref={containerRef} className="viewport" />
}
```

---

## 最佳实践与配置要点

### 1. 基础配置

```typescript
const config: Partial<LogicFlow.Options> = {
  // 交互模式
  isSilentMode: false,           // 是否为静默模式（只读）
  stopScrollGraph: false,        // 禁止滚动
  stopZoomGraph: false,          // 禁止缩放
  
  // 编辑配置
  edgeTextDraggable: true,       // 边文本可拖拽
  allowRotate: true,             // 允许旋转
  allowResize: true,             // 允许调整大小
  autoExpand: true,              // 自动扩展画布
  adjustEdgeStartAndEnd: true,   // 允许调整边的起点和终点
  
  // 多选配置
  multipleSelectKey: 'shift',    // 多选按键
  
  // 键盘快捷键
  keyboard: {
    enabled: true,
    shortcuts: [
      {
        keys: ['backspace'],
        callback: () => {
          // 删除选中元素
        },
      },
    ],
  },
  
  // 背景配置
  background: {
    color: '#FFFFFF',
    // backgroundImage: "url('...')"
  },
  
  // 网格配置
  grid: {
    size: 20,
    visible: true,
    type: 'dot',
    config: {
      color: '#ababab',
      thickness: 1,
    },
  },
  
  // 边类型
  edgeType: 'polyline',          // 'line' | 'polyline' | 'bezier'
  
  // ID 生成器
  idGenerator(type) {
    return `${type}_${Date.now()}_${Math.random()}`
  },
}
```

### 2. 主题配置

```typescript
const theme: Partial<LogicFlow.Theme> = {
  // 基础节点样式
  baseNode: {
    stroke: '#4E93F5',
    strokeWidth: 2,
  },
  
  // 节点文本
  nodeText: {
    overflowMode: 'ellipsis',
    lineHeight: 1.5,
    fontSize: 13,
    color: '#333',
  },
  
  // 边文本
  edgeText: {
    overflowMode: 'ellipsis',
    lineHeight: 1.5,
    fontSize: 13,
    textWidth: 100,
  },
  
  // 矩形节点
  rect: {
    width: 200,
    height: 40,
    rx: 5,
    ry: 5,
  },
  
  // 箭头
  arrow: {
    offset: 4,
    verticalLength: 2,
  },
  
  // 锚点
  anchor: {
    stroke: '#4E93F5',
    fill: '#fff',
    r: 4,
    hover: {
      fill: '#4E93F5',
      fillOpacity: 0.5,
      stroke: '#4E93F5',
      r: 6,
    },
  },
}

lf.setTheme(theme)
```

### 3. 事件处理

```typescript
// 节点事件
lf.on('node:click', ({ data }) => console.log('节点点击', data))
lf.on('node:dblclick', ({ data }) => console.log('节点双击', data))
lf.on('node:mousedown', ({ data }) => console.log('节点鼠标按下'))
lf.on('node:mouseup', ({ data }) => console.log('节点鼠标抬起'))
lf.on('node:mousemove', ({ data }) => console.log('节点鼠标移动'))
lf.on('node:mouseenter', ({ data }) => console.log('鼠标进入节点'))
lf.on('node:mouseleave', ({ data }) => console.log('鼠标离开节点'))
lf.on('node:dragstart', ({ data }) => console.log('开始拖拽节点'))
lf.on('node:drag', ({ data }) => console.log('拖拽节点中'))
lf.on('node:drop', ({ data }) => console.log('节点拖拽结束'))
lf.on('node:contextmenu', ({ data }) => console.log('右键菜单'))

// 边事件
lf.on('edge:click', ({ data }) => console.log('边点击'))
lf.on('edge:dblclick', ({ data }) => console.log('边双击'))
lf.on('edge:contextmenu', ({ data }) => console.log('边右键菜单'))

// 画布事件
lf.on('blank:click', () => console.log('画布点击'))
lf.on('blank:mousedown', () => console.log('画布鼠标按下'))
lf.on('blank:contextmenu', () => console.log('画布右键菜单'))

// 历史记录
lf.on('history:change', () => console.log('历史变更'))

// 图渲染完成
lf.on('graph:rendered', ({ graphModel }) => {
  console.log('图渲染完成', graphModel.flowId)
})

// 连线事件
lf.on('connection:not-allowed', ({ data }) => {
  console.log('不允许连接', data)
})
```

### 4. 自定义节点

```typescript
// 自定义节点模型
class CustomNodeModel extends RectNodeModel {
  initNodeData(data: NodeConfig) {
    super.initNodeData(data)
    this.width = 200
    this.height = 80
  }

  // 自定义锚点
  getDefaultAnchor() {
    const { width, height, x, y } = this
    return [
      { x: x - width / 2, y, id: 'left' },
      { x: x + width / 2, y, id: 'right' },
      { x, y: y - height / 2, id: 'top' },
      { x, y: y + height / 2, id: 'bottom' },
    ]
  }

  // 自定义样式
  getNodeStyle() {
    const style = super.getNodeStyle()
    return {
      ...style,
      fill: '#E8E8E8',
      stroke: '#4E93F5',
    }
  }
}

// 注册节点
lf.register({
  type: 'custom-node',
  view: RectNode,
  model: CustomNodeModel,
})
```

### 5. 插件使用

```typescript
import {
  Control,
  DndPanel,
  Menu,
  MiniMap,
  SelectionSelect,
  Snapshot,
  DynamicGroup,
} from '@logicflow/extension'

const lf = new LogicFlow({
  container: document.querySelector('#container'),
  plugins: [
    Control,        // 控制面板
    DndPanel,       // 拖拽面板
    Menu,           // 右键菜单
    MiniMap,        // 小地图
    SelectionSelect, // 框选
    Snapshot,       // 快照
    DynamicGroup,   // 动态分组
  ],
})

// 配置拖拽面板
lf.setPatternItems([
  {
    type: 'circle',
    label: '圆形',
    text: 'Circle',
    icon: 'https://cdn.jsdelivr.net/gh/Logic-Flow/static@latest/docs/examples/extension/group/circle.png',
  },
  {
    type: 'rect',
    label: '矩形',
    text: 'Rect',
    icon: 'https://cdn.jsdelivr.net/gh/Logic-Flow/static@latest/docs/examples/extension/group/rect.png',
  },
])

// 显示小地图
lf.extension.miniMap?.show()
```

### 6. 数据管理

```typescript
// 渲染数据
lf.render({
  nodes: [
    {
      id: 'node1',
      type: 'rect',
      x: 100,
      y: 100,
      text: '节点1',
      properties: {
        // 自定义属性
        status: 'pending',
      },
    },
  ],
  edges: [
    {
      id: 'edge1',
      type: 'polyline',
      sourceNodeId: 'node1',
      targetNodeId: 'node2',
      text: '连线',
    },
  ],
})

// 获取数据
const graphData = lf.getGraphData()
const rawData = lf.getGraphRawData()

// 设置属性
lf.setProperties('node1', { status: 'completed' })

// 获取选中元素
const { nodes, edges } = lf.getSelectElements()

// 清空选中
lf.clearSelectElements()

// 删除元素
lf.deleteNode('node1')
lf.deleteEdge('edge1')
```

---

## 如何构建自己的流程可视化应用

### 步骤 1: 安装依赖

```bash
# 核心库
npm install @logicflow/core

# 扩展插件（可选）
npm install @logicflow/extension

# React 节点支持（可选）
npm install @logicflow/react-node-registry

# Vue 节点支持（可选）
npm install @logicflow/vue-node-registry

# 自动布局（可选）
npm install @logicflow/layout

# 流程引擎（可选）
npm install @logicflow/engine
```

### 步骤 2: 创建容器

```html
<div id="container" style="width: 100%; height: 500px;"></div>
```

### 步骤 3: 初始化 LogicFlow

```typescript
import LogicFlow from '@logicflow/core'
import '@logicflow/core/es/index.css'

const lf = new LogicFlow({
  container: document.querySelector('#container'),
  width: 1000,
  height: 600,
  background: {
    color: '#f5f5f5',
  },
  grid: true,
})

// 渲染初始数据
lf.render({
  nodes: [
    { id: '1', type: 'rect', x: 100, y: 100, text: '开始' },
    { id: '2', type: 'rect', x: 300, y: 100, text: '结束' },
  ],
  edges: [
    { sourceNodeId: '1', targetNodeId: '2', type: 'polyline' },
  ],
})
```

### 步骤 4: 添加交互功能

```typescript
// 监听节点点击
lf.on('node:click', ({ data }) => {
  console.log('点击了节点:', data)
})

// 添加工具栏
import { Control, Menu } from '@logicflow/extension'
import '@logicflow/extension/es/index.css'

// 重新初始化带插件的实例
const lfWithPlugins = new LogicFlow({
  container: document.querySelector('#container'),
  plugins: [Control, Menu],
})
```

### 步骤 5: 自定义节点（可选）

```typescript
// 方式一：使用 React 组件
import { register } from '@logicflow/react-node-registry'

const MyReactNode = ({ node }) => {
  const data = node.getData()
  return (
    <div className="my-node">
      <h3>{data.text}</h3>
      <p>{data.properties?.description}</p>
    </div>
  )
}

register({ type: 'my-react-node', component: MyReactNode }, lf)

// 方式二：使用 Vue 组件
import { register } from '@logicflow/vue-node-registry'

register({ type: 'my-vue-node', component: MyVueComponent }, lf)
```

### 步骤 6: 导出数据/图片

```typescript
// 导出 JSON 数据
const graphData = lf.getGraphData()
console.log(JSON.stringify(graphData, null, 2))

// 导出图片
import { Snapshot } from '@logicflow/extension'

lf.extension.snapshot?.getSnapshot()
```

### 完整示例

```tsx
import { useEffect, useRef } from 'react'
import LogicFlow from '@logicflow/core'
import { Control, Menu, MiniMap, DndPanel } from '@logicflow/extension'
import '@logicflow/core/es/index.css'
import '@logicflow/extension/es/index.css'

export default function FlowChart() {
  const containerRef = useRef<HTMLDivElement>(null)
  const lfRef = useRef<LogicFlow>()

  useEffect(() => {
    if (!containerRef.current || lfRef.current) return

    const lf = new LogicFlow({
      container: containerRef.current,
      plugins: [Control, Menu, MiniMap, DndPanel],
      grid: true,
      background: { color: '#fff' },
      edgeType: 'polyline',
      keyboard: { enabled: true },
    })

    // 配置拖拽面板
    lf.setPatternItems([
      { type: 'rect', label: '矩形', icon: '...' },
      { type: 'circle', label: '圆形', icon: '...' },
    ])

    // 渲染数据
    lf.render({
      nodes: [
        { id: 'start', type: 'circle', x: 100, y: 100, text: '开始' },
        { id: 'end', type: 'circle', x: 300, y: 100, text: '结束' },
      ],
      edges: [
        { sourceNodeId: 'start', targetNodeId: 'end' },
      ],
    })

    // 显示小地图
    lf.extension.miniMap?.show()

    lfRef.current = lf
  }, [])

  const handleExport = () => {
    const data = lfRef.current?.getGraphData()
    console.log('导出数据:', data)
  }

  return (
    <div>
      <button onClick={handleExport}>导出数据</button>
      <div
        ref={containerRef}
        style={{ width: '100%', height: '600px' }}
      />
    </div>
  )
}
```

---

## 总结

LogicFlow 是一个功能强大、扩展性好的流程可视化框架。通过本分析文档，我们了解到：

1. **核心包** (`@logicflow/core`) 提供了流程图编辑的基础能力
2. **扩展包** (`@logicflow/extension`) 提供了丰富的插件和 BPMN 支持
3. **框架适配包** 支持 React 和 Vue 组件作为自定义节点
4. **示例项目** 覆盖了主流框架和技术栈

选择合适的集成方式：

- **React 项目**: 使用 `@logicflow/react-node-registry`
- **Vue 3 项目**: 使用 `@logicflow/vue-node-registry` + `TeleportContainer`
- **Next.js 项目**: 需要标记 `'use client'` 并在客户端初始化

通过遵循最佳实践，可以快速构建出功能完善的流程可视化应用。
