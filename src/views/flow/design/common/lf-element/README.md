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

// 方式一：使用单独的配置项
registerExclusiveGateway(lf, {
  defaultColor: '#E6A23C',
  defaultWidth: 50,
  defaultHeight: 50,
  defaultRefY: 40,  // 默认文字向下偏移40像素
});

// 方式二：使用 properties 对象统一配置（推荐）
registerInclusiveGateway(lf, {
  properties: {
    width: 60,
    height: 60,
    color: '#67C23A',
    refY: 45,
    textStyle: {
      fontSize: 14,
      color: '#333333',
    },
  },
});
```

### 2. 使用网关节点

```typescript
// 添加排他网关节点（文字居中显示）
lf.addNode({
  type: 'exclusiveGateway',
  x: 200,
  y: 200,
  properties: {
    color: '#FF0000',
    width: 60,
    height: 60,
  },
});

// 添加包容网关节点（文字偏移到节点下方）
lf.addNode({
  type: 'inclusiveGateway',
  x: 400,
  y: 200,
  text: '包容网关',
  properties: {
    refY: 40,
  },
});
```

## 自定义配置

### IGatewayProperties 接口

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| width | number | 50 | 节点宽度 |
| height | number | 50 | 节点高度 |
| color | string | #E6A23C | 节点颜色 |
| iconScale | number | 0.6 | 图标缩放比例 |
| refX | number | 0 | 文字X轴偏移量 |
| refY | number | 0 | 文字Y轴偏移量 |
| style | CommonTheme | - | 自定义节点样式 |
| textStyle | TextNodeTheme | - | 自定义文本样式 |

### IGatewayConfig 接口

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| type | string | - | 节点类型标识 |
| defaultWidth | number | 50 | 默认宽度 |
| defaultHeight | number | 50 | 默认高度 |
| defaultColor | string | #E6A23C | 默认颜色 |
| defaultIconScale | number | 0.6 | 默认图标缩放比例 |
| defaultRefX | number | 0 | 默认文字X轴偏移 |
| defaultRefY | number | 0 | 默认文字Y轴偏移 |
| properties | Partial\<IGatewayProperties\> | - | 默认属性（优先级高） |

### 配置优先级

properties 中的值优先于单独配置项：

```typescript
registerExclusiveGateway(lf, {
  defaultWidth: 50,       // 会被覆盖
  properties: {
    width: 80,            // 最终使用 80
  },
});
```

## 文字位置配置

### 文字居中（默认）

```typescript
lf.addNode({
  type: 'exclusiveGateway',
  x: 200, y: 200,
  text: '排他网关',
});
```

### 文字偏移到节点下方

```typescript
lf.addNode({
  type: 'exclusiveGateway',
  x: 200, y: 200,
  text: '排他网关',
  properties: { refY: 40 },
});
```

### 文字偏移到节点上方

```typescript
lf.addNode({
  type: 'exclusiveGateway',
  x: 200, y: 200,
  text: '排他网关',
  properties: { refY: -40 },
});
```

### 自定义文字样式

```typescript
lf.addNode({
  type: 'exclusiveGateway',
  x: 200, y: 200,
  text: '排他网关',
  properties: {
    refY: 40,
    textStyle: {
      fontSize: 14,
      color: '#333333',
      fontWeight: 'bold',
    },
  },
});
```

## 节点外观

### 排他网关（Exclusive Gateway）
- 形状：菱形
- 图标：内部 X 形状
- 用途：条件分支，只选择一条路径执行

### 包容网关（Inclusive Gateway）
- 形状：菱形
- 图标：内部圆形
- 用途：条件分支，可选择多条路径执行

## API

### registerExclusiveGateway(lf, config?)

注册排他网关节点。

### registerInclusiveGateway(lf, config?)

注册包容网关节点。

### registerAllGateways(lf, config?)

注册所有网关节点。

### createExclusiveGatewayNode(x, y, properties?)

创建排他网关节点配置。

### createInclusiveGatewayNode(x, y, properties?)

创建包容网关节点配置。

## 更新日志

### v1.2.0
- 新增 refX/refY 属性支持文字偏移
- 新增 textStyle 属性支持自定义文字样式
- IGatewayConfig 新增 properties 参数

### v1.1.0
- 修复图标居中问题
- 优化 SVG 渲染逻辑

### v1.0.0
- 初始实现
- 支持排他网关和包容网关
- 支持自定义颜色和大小
