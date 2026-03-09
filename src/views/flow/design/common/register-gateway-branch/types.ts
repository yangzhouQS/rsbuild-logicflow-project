/**
 * 网关分支模块类型定义
 */

// 网关类型
export type GatewayType = 'exclusiveGateway' | 'inclusiveGateway';

// 分支信息
export interface BranchInfo {
  taskId: string;
  flowInId: string;
  flowOutId: string;
}

// 配对信息
export interface PairInfo {
  gatewayType: GatewayType;
  forkId: string;
  joinId: string;
  normalBranch: BranchInfo;
  defaultBranch: BranchInfo;
  createdAt: string;
}

// 分支配置
export interface BranchConfig {
  isDefault: boolean;
  isDeletable: boolean;
  pairId: PairInfo;
}

// 网关成对配置选项
export interface GatewayPairOptions {
  // 分流和聚合网关之间的水平距离
  offsetX?: number;
  // 分支任务节点类型
  taskNodeType?: string;
  // 连线类型
  edgeType?: string;
  // 默认分支Y轴偏移
  branchYOffset?: number;
}

// 模块配置选项
export interface GatewayBranchOptions extends GatewayPairOptions {
  // 是否启用自动创建成对网关
  autoCreatePair?: boolean;
  // 是否启用默认分支保护
  protectDefaultBranch?: boolean;
  // 是否在控制台输出调试信息
  debug?: boolean;
}

// 网关创建参数
export interface CreateGatewayParams {
  x: number;
  y: number;
  id?: string;
  type: GatewayType;
}

// 分支创建参数
export interface CreateBranchParams {
  forkGatewayId: string;
  branchName: string;
  condition: string;
}

// 网关节点属性
export interface GatewayNodeProperties {
  // 配对网关 ID
  pairId?: string;
  // 配对类型：fork(分流) 或 join(聚合)
  pairType?: 'fork' | 'join';
  // 网关角色：split(分流) 或 merge(聚合)
  gatewayRole?: 'split' | 'merge';
}

// 分支节点属性
export interface BranchNodeProperties {
  // 分支类型：normal(普通) 或 default(默认)
  branchType?: 'normal' | 'default';
  // 是否为默认分支
  isDefault?: boolean;
  // 所属分流网关 ID
  forkGatewayId?: string;
  // 所属聚合网关 ID
  joinGatewayId?: string;
}

// 分支边属性
export interface BranchEdgeProperties {
  // 分支类型
  branchType?: 'normal' | 'default';
  // 是否为默认分支
  isDefault?: boolean;
  // 条件表达式
  condition?: string;
}
