# 网关节点自定义组件

本模块提供基于 LogicFlow 的 BPMN 网关节点实现，包括**排他网关（Exclusive Gateway）**和**包容网关（Inclusive Gateway）**。

## 功能特性

### 排他网关（Exclusive Gateway）
- 拖入画布时自动创建一个排他分支 + 一个默认分支（无聚合节点）
- 删除网关时联动删除所有分支连线和节点
- 默认分支连线和节点不允许单独删除，仅支持与网关一起删除

### 包容网关（Inclusive Gateway）
- 拖入画布时自动创建一个普通分支 + 一个默认分支 + 聚合网关（成对出现）
- 分流节点和聚合节点共享名称，修改任一节点名称会同步更新
- 点击分流节点时开启所有分支连线的动画效果
- 删除任一网关节点时联动删除配对网关及所有分支
- 默认分支连线和节点不允许单独删除
- 分流节点和聚合节点之间不允许直接连线

### 通用连线规则
- 两个节点之间只能有一条连线
- 禁止自连接（连线的起点和终点不能是同一个节点）

## 文件结构

```
lf-element/
├── types.ts                        # 类型定义
├── exclusive-gateway-model.ts      # 排他网关模型
├── exclusive-gateway-node.tsx      # 排他网关视图
├── inclusive-gateway-model.ts      # 包容网关模型
├── inclusive-gateway-node.tsx      # 包容网关视图
├── gateway-pair-manager.ts         # 网关分支管理器
├── index.ts                        # 模块导出和注册函数
└── README.md                       # 本文档
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

### 2. 使用网关分支管理器

```typescript
import { GatewayPairManager } from './lf-element';

// 创建管理器实例
const gatewayPairManager = new GatewayPairManager(lf, {
  offsetX: 400,           // 分流和聚合网关之间的水平距离
  taskNodeType: 'rect',   // 分支任务节点类型
  edgeType: 'polyline',   // 连线类型
  branchYOffset: 300,     // 分支之间的垂直间距
});

// 获取所有网关配对信息
const pairInfos = gatewayPairManager.getAllPairInfos();

// 获取特定网关的配对信息
const pairInfo = gatewayPairManager.getPairInfo('gateway-id');

// 检查边是否为默认分支
const isDefault = gatewayPairManager.isDefaultBranch('edge-id');

// 销毁管理器
gatewayPairManager.destroy();
```

### 3. 使用网关节点

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
    width: 60,            // 最终使用这个值
  },
});
```

## 网关分支管理器 API

### GatewayPairOptions 接口

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| offsetX | number | 400 | 分流网关和聚合网关之间的水平距离 |
| taskNodeType | string | 'rect' | 分支任务节点类型 |
| edgeType | string | 'polyline' | 连线类型 |
| branchYOffset | number | 300 | 分支之间的垂直间距 |

### GatewayPairManager 方法

| 方法 | 参数 | 返回值 | 说明 |
|------|------|--------|------|
| createExclusiveGatewayBranches | forkGateway: { x, y, id? } | PairInfo \| null | 创建排他网关分支 |
| createInclusiveGatewayPair | forkGateway: { x, y, id? } | PairInfo \| null | 创建包容网关成对结构 |
| addBranch | forkGatewayId, branchName, condition | BranchInfo \| null | 手动添加新分支（仅包容网关） |
| getPairInfo | gatewayId | PairInfo \| undefined | 获取配对信息 |
| getAllPairInfos | - | PairInfo[] | 获取所有配对信息 |
| isDefaultBranch | edgeId | boolean | 检查边是否为默认分支 |
| destroy | - | void | 销毁管理器 |

## 删除行为说明

### 排他网关删除
当删除排他网关节点时，系统会自动：
1. 删除所有排他分支的任务节点和连线
2. 删除默认分支的任务节点和连线
3. 清理所有相关的配置记录

### 包容网关删除
当删除包容网关的任一节点（分流或聚合）时，系统会自动：
1. 删除配对的另一个网关节点
2. 删除所有分支的任务节点和连线
3. 删除默认分支的任务节点和连线
4. 清理所有相关的配置记录

### 删除保护
- 默认分支的连线不允许单独删除
- 默认分支的任务节点不允许单独删除
- 只有在删除整个网关时才会联动删除这些受保护的元素

## ID 生成规则

所有节点和边的 ID 使用 UUID v4 格式生成：

| 元素 | ID 格式 | 示例 |
|------|---------|------|
| 排他网关 | `exclusive-gateway-{uuid}` | `exclusive-gateway-550e8400-e29b-41d4-a716-446655440000` |
| 包容网关（分流） | `inclusive-gateway-fork-{uuid}` | `inclusive-gateway-fork-550e8400-e29b-41d4-a716-446655440000` |
| 包容网关（聚合） | `inclusive-gateway-join-{uuid}` | `inclusive-gateway-join-550e8400-e29b-41d4-a716-446655440000` |
| 任务节点 | `task-{type}-{uuid}` | `task-exclusive-550e8400-e29b-41d4-a716-446655440000` |
| 连线 | `flow-{type}-{uuid}` | `flow-default-550e8400-e29b-41d4-a716-446655440000` |

## 注意事项

1. **注册顺序**：确保在使用网关节点之前先调用注册函数
2. **管理器生命周期**：GatewayPairManager 需要在组件卸载时调用 destroy() 方法清理资源
3. **事件监听**：管理器内部监听了多个 LogicFlow 事件，请避免重复监听导致冲突
4. **锚点配置**：自定义网关节点的锚点已包含 id 属性，确保连线功能正常

## 更新日志

### v1.1.0
- 新增：包容网关分流和聚合节点之间不允许直接连线的限制
- 新增：删除保护机制，默认分支元素不允许单独删除
- 修复：排他网关删除时默认分支节点未正确删除的问题
- 修复：包容网关删除时相关元素未完全清理的问题
- 优化：ID 生成方式从时间戳改为 UUID v4

### v1.0.0
- 初始版本
- 支持排他网关和包容网关的基本功能
- 支持自定义颜色、大小和文字偏移
- 支持网关分支自动创建
