# 网关分支管理模块

## 概述

本模块提供 LogicFlow 网关的自动分支创建和管理功能，支持**排他网关**和**包容网关**两种类型。

## 功能特性

### 排他网关 (exclusiveGateway)

拖入画布时自动创建：
- **1个排他分支**（条件分支）
- **1个默认分支**
- **无聚合节点**（排他网关不需要成对出现）

```
[排他网关] ──条件A──> [排他分支]
    │
    └──默认──> [默认分支]
```

### 包容网关 (inclusiveGateway)

拖入画布时自动创建：
- **2个普通分支**（条件分支）
- **1个默认分支**
- **聚合网关**（分流和聚合成对出现，有关联关系）

```
[分流网关] ──条件A──> [普通分支1] ──> [聚合网关]
    │──条件B──> [普通分支2] ──>    ↑
    └──默认───> [默认分支] ────>   ↑
```

## 使用方法

### 1. 注册网关分支功能

```typescript
import { registerGatewayBranch } from '@/views/flow/design/register-gateway-branch';

// 在 LogicFlow 初始化后调用
const lf = new LogicFlow({ ... });

// 注册网关分支功能
registerGatewayBranch(lf, {
  offsetX: 300,        // 分流网关和聚合网关之间的水平距离（仅包容网关）
  taskNodeType: 'rect', // 分支任务节点类型
  edgeType: 'polyline', // 连线类型
  branchYOffset: 80,    // 分支Y轴偏移
});
```

### 2. 获取管理器实例

```typescript
import { getGatewayBranchManager } from '@/views/flow/design/register-gateway-branch';

const manager = getGatewayBranchManager();
if (manager) {
  // 获取配对信息
  const pairInfo = manager.getPairInfo(gatewayId);
  
  // 获取所有配对
  const allPairs = manager.getAllPairInfos();
  
  // 检查是否为默认分支
  const isDefault = manager.isDefaultBranch(edgeId);
}
```

### 3. 手动添加分支（仅包容网关）

```typescript
const manager = getGatewayBranchManager();
if (manager) {
  // 为包容网关添加新分支
  const newBranch = manager.addBranch(
    forkGatewayId,    // 分流网关ID
    '新分支名称',
    '${conditionC === true}'  // 条件表达式
  );
}
```

## API 参考

### GatewayPairOptions

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| offsetX | number | 350 | 分流网关和聚合网关之间的水平距离（仅包容网关） |
| taskNodeType | string | 'rect' | 分支任务节点类型 |
| edgeType | string | 'polyline' | 连线类型 |
| branchYOffset | number | 150 | 分支Y轴偏移（每个分支之间的垂直间距） |

### PairInfo

| 属性 | 类型 | 说明 |
|------|------|------|
| gatewayType | GatewayType | 网关类型 |
| forkId | string | 分流网关ID |
| joinId | string \| undefined | 聚合网关ID（排他网关为undefined） |
| branches | BranchInfo[] | 普通分支列表 |
| defaultBranch | BranchInfo | 默认分支 |
| createdAt | string | 创建时间 |

### BranchInfo

| 属性 | 类型 | 说明 |
|------|------|------|
| taskId | string | 任务节点ID |
| flowInId | string | 入边ID |
| flowOutId | string \| undefined | 出边ID（排他网关可能没有） |

## 行为说明

### 默认分支保护

- 默认分支的连线**禁止删除**
- 尝试删除时会自动恢复

### 删除联动

- **排他网关**：删除时联动删除所有分支任务和连线
- **包容网关**：删除时联动删除配对的聚合网关、所有分支任务和连线

### 网关关联（包容网关）

- 分流网关和聚合网关通过 `pairId` 属性关联
- `pairType` 标识是 'fork'（分流）还是 'join'（聚合）
- 删除任一网关会联动删除另一个

## 文件结构

```
register-gateway-branch/
├── index.ts          # 模块入口，导出注册函数和管理器
├── types.ts          # 类型定义
└── README.md         # 本文档

common/lf-element/
├── gateway-pair-manager.ts        # 网关分支管理器核心实现
├── exclusive-gateway-node.tsx     # 排他网关节点视图
├── exclusive-gateway-model.ts     # 排他网关节点模型
├── inclusive-gateway-node.tsx     # 包容网关节点视图
├── inclusive-gateway-model.ts     # 包容网关节点模型
└── index.ts                       # 导出所有组件
```

## 注意事项

1. **排他网关不支持手动添加分支**：排他网关的分支数量是固定的（1个排他分支 + 1个默认分支）
2. **包容网关成对出现**：包容网关的分流和聚合必须成对存在
3. **默认分支不可删除**：这是为了保证流程的完整性
