# 网关节点自定义组件

本模块提供基于 LogicFlow 的 BPMN 网关节点实现，包括**排他网关（Exclusive Gateway）**和**包容网关（Inclusive Gateway）**。

## 文件结构

```
lf-element/
├── types.ts                    # 类型定义
├── ExclusiveGatewayModel.ts    # 排他网关模型
├── ExclusiveGatewayNode.tsx    # 排他网关视图
├── InclusiveGatewayModel.ts    # 包容网关模型
├── InclusiveGatewayNode.tsx    # 包容网关视图
├── index.ts                    # 模块导出和注册函数
└── README.md                   # 本文档
```

## 快速开始

### 1. 注册网关节点

```typescript
import { LogicFlow } from '@logicflow/core';
import { registerExclusiveGateway, registerInclusiveGateway } from './lf-element';

const lf = new LogicFlow({
  container: document.getElementById('container'),
});

// 注册排他网关
registerExclusiveGateway(lf, {
  defaultColor: '#E6A23C',
  defaultWidth: 50,
  defaultHeight: 50,
});

// 注册包容网关
registerInclusiveGateway(lf, {
  defaultColor: '#E6A23C',
});
```

### 2. 使用网关节点

```typescript
// 添加排他网关节点
lf.addNode({
  type: 'exclusiveGateway',
  x: 200,
  y: 200,
  properties: {
    color: '#FF0000',  // 自定义颜色
    width: 60,         // 自定义宽度
    height: 60,        // 自定义高度
  },
});

// 添加包容网关节点
lf.addNode({
  type: 'inclusiveGateway',
  x: 400,
  y: 200,
});
```

## 自定义配置

### IGatewayProperties 接口

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `width` | `number` | `50` | 节点宽度 |
| `height` | `number` | `50` | 节点高度 |
| `color` | `string` | `#E6A23C` | 节点颜色 |
| `iconScale` | `number` | `0.6` | 图标缩放比例 |
| `style` | `object` | - | 自定义样式 |

### IGatewayConfig 接口

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `type` | `string` | - | 节点类型标识 |
| `defaultWidth` | `number` | `50` | 默认宽度 |
| `defaultHeight` | `number` | `50` | 默认高度 |
| `defaultColor` | `string` | `#E6A23C` | 默认颜色 |
| `defaultIconScale` | `number` | `0.6` | 默认图标缩放比例 |

## 节点外观

### 排他网关（Exclusive Gateway）
- **形状**：菱形
- **图标**：内部 X 形状
- **用途**：条件分支，只选择一条路径执行

### 包容网关（Inclusive Gateway）
- **形状**：菱形
- **图标**：内部圆形
- **用途**：条件分支，可选择多条路径执行

## 技术实现

### Model 层
- 继承 `RectNodeModel`
- 提供菱形锚点配置（四个顶点）
- 支持自定义样式和属性

### View 层
- 继承 `RectNode`
- 使用 `h` 函数从 `@logicflow/core` 进行 SVG 渲染
- 支持动态缩放和颜色配置
- 图标居中渲染

## 示例：拖拽面板配置

```typescript
import { createExclusiveGatewayNode, createInclusiveGatewayNode } from './lf-element';

// 在拖拽面板中使用
const panelItems = [
  {
    type: 'exclusiveGateway',
    text: '排他网关',
    icon: 'data:image/svg+xml,...', // 自定义图标
    className: 'gateway-exclusive',
    properties: createExclusiveGatewayNode(0, 0),
  },
  {
    type: 'inclusiveGateway',
    text: '包容网关',
    icon: 'data:image/svg+xml,...',
    className: 'gateway-inclusive',
    properties: createInclusiveGatewayNode(0, 0),
  },
];
```

## 注意事项

1. **图标居中**：内部图标（X 或圆形）会自动居中于节点中心
2. **缩放支持**：节点放大时，图标会按比例缩放并保持居中
3. **颜色自定义**：通过 `properties.color` 或注册配置自定义颜色
4. **锚点位置**：锚点位于菱形的四个顶点，便于连线

## 更新日志

### v1.1.0
- 修复图标居中问题
- 优化 SVG 渲染逻辑
- 移除未使用的变量

### v1.0.0
- 初始实现
- 支持排他网关和包容网关
- 支持自定义颜色和大小
