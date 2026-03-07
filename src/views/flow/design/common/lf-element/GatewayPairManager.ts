/**
 * 网关分支管理器
 * 支持排他网关和包容网关的分支创建和管理
 *
 * 功能：
 * - 排他网关：拖入画布时创建一个排他分支 + 一个默认分支（无聚合节点）
 * - 包容网关：拖入画布时创建一个普通分支 + 一个默认分支 + 聚合网关（成对出现）
 * - 默认分支连线及其后的第一个节点禁止删除
 * - 删除网关时联动删除相关配置
 * - 连线规则：两点之间只能有一条连线，不能自连接
 */
import type LogicFlow from '@logicflow/core';

// 网关类型
export type GatewayType = 'exclusiveGateway' | 'inclusiveGateway';

// 分支信息
export interface BranchInfo {
  taskId: string;
  flowInId: string;
  flowOutId?: string;  // 排他网关的分支可能没有 flowOut
}

// 配对信息（仅包容网关使用）
export interface PairInfo {
  gatewayType: GatewayType;
  forkId: string;
  joinId?: string;  // 聚合网关ID（仅包容网关有）
  branches: BranchInfo[];  // 所有分支
  defaultBranch: BranchInfo;  // 默认分支
  createdAt: string;
}

// 分支配置
export interface BranchConfig {
  isDefault: boolean;
  isDeletable: boolean;
  pairId: PairInfo;
  taskId?: string;  // 默认分支的任务节点ID
}

// 网关分支配置选项
export interface GatewayPairOptions {
  // 分流网关和聚合网关之间的水平距离（仅包容网关）
  offsetX?: number;
  // 分支任务节点类型
  taskNodeType?: string;
  // 连线类型
  edgeType?: string;
  // 分支Y轴偏移
  branchYOffset?: number;
}

// 默认配置
const DEFAULT_OPTIONS: Required<GatewayPairOptions> = {
  offsetX: 400,
  taskNodeType: 'rect',
  edgeType: 'polyline',
  branchYOffset: 300,  // 每个分支之间的垂直间距
};

/**
 * 网关成对管理器类
 */
export class GatewayPairManager {
  private lf: LogicFlow;
  private gatewayPairs: Map<string, PairInfo>;
  private branchConfigs: Map<string, BranchConfig>;
  private options: Required<GatewayPairOptions>;

  // 保存绑定后的事件处理器，用于正确移除监听
  private boundHandleNodeDndAdd: (data: { data: any }) => void;
  private boundHandleNodeDelete: (data: { data: any }) => void;
  private boundHandleEdgeDelete: (data: { data: any }) => void;
  private boundHandleEdgeAdd: (data: { data: any }) => void;

  constructor(lf: LogicFlow, options?: GatewayPairOptions) {
    this.lf = lf;
    this.gatewayPairs = new Map();
    this.branchConfigs = new Map();
    this.options = { ...DEFAULT_OPTIONS, ...options };

    // 绑定事件处理器
    this.boundHandleNodeDndAdd = this.handleNodeDndAdd.bind(this);
    this.boundHandleNodeDelete = this.handleNodeDelete.bind(this);
    this.boundHandleEdgeDelete = this.handleEdgeDelete.bind(this);
    this.boundHandleEdgeAdd = this.handleEdgeAdd.bind(this);

    this.init();
  }

  /**
   * 初始化事件监听
   */
  private init() {
    // 监听节点拖拽添加事件
    this.lf.on('node:dnd-add', this.boundHandleNodeDndAdd);

    // 监听节点删除事件
    this.lf.on('node:delete', this.boundHandleNodeDelete);

    // 监听边删除事件（保护默认分支）
    this.lf.on('edge:delete', this.boundHandleEdgeDelete);

    // 监听边添加事件（验证连线规则）
    this.lf.on('edge:add', this.boundHandleEdgeAdd);
  }

  /**
   * 处理节点拖拽添加
   */
  private handleNodeDndAdd({ data }: { data: any }) {
    // 检查是否是网关节点
    if (data.type === 'exclusiveGateway') {
      this.createExclusiveGatewayBranches(data as { x: number; y: number; id?: string });
    } else if (data.type === 'inclusiveGateway') {
      this.createInclusiveGatewayPair(data as { x: number; y: number; id?: string });
    }
  }

  /**
   * 创建排他网关分支（无聚合节点）
   * 结构：[排他网关] ──条件A──> [排他分支]
   *                 └──默认──> [默认分支]
   */
  public createExclusiveGatewayBranches(forkGateway: {
    x: number;
    y: number;
    id?: string;
  }): PairInfo | null {
    const { taskNodeType, edgeType, branchYOffset } = this.options;
    const timestamp = Date.now();

    // 生成分流网关ID
    const forkId = forkGateway.id || `ExclusiveGateway_${timestamp}`;

    try {
      // 1. 更新或创建分流网关
      if (!forkGateway.id) {
        this.lf.addNode({
          id: forkId,
          type: 'exclusiveGateway',
          x: forkGateway.x,
          y: forkGateway.y,
          text: '排他网关',
          properties: {
            gatewayType: 'exclusive',
            gatewayRole: 'split',
          },
        });
      } else {
        // 更新已存在节点的属性
        this.lf.setProperties(forkId, {
          gatewayType: 'exclusive',
          gatewayRole: 'split',
        });
        const forkNode = this.lf.getNodeModelById(forkId);
        if (forkNode && !forkNode.text?.value) {
          forkNode.setText('排他网关');
        }
      }

      // 2. 创建排他分支任务节点（上方）
      const exclusiveTaskId = `Task_Exclusive_${timestamp}`;
      this.lf.addNode({
        id: exclusiveTaskId,
        type: taskNodeType,
        x: forkGateway.x + 150,
        y: forkGateway.y - branchYOffset,
        text: '排他分支',
        properties: {
          branchType: 'exclusive',
          forkGatewayId: forkId,
        },
      });

      // 3. 创建默认分支任务节点（下方）
      const defaultTaskId = `Task_Default_${timestamp}`;
      this.lf.addNode({
        id: defaultTaskId,
        type: taskNodeType,
        x: forkGateway.x + 150,
        y: forkGateway.y + branchYOffset,
        text: '默认分支',
        properties: {
          branchType: 'default',
          isDefault: true,
          forkGatewayId: forkId,
        },
      });

      // 4. 创建排他网关到排他分支的连线
      const exclusiveFlowId = `Flow_Exclusive_${timestamp}`;
      this.lf.addEdge({
        id: exclusiveFlowId,
        type: edgeType,
        sourceNodeId: forkId,
        targetNodeId: exclusiveTaskId,
        text: '条件A',
        properties: {
          condition: '${conditionA === true}',
          branchType: 'exclusive',
          isDefault: false,
        },
      });

      // 5. 创建排他网关到默认分支的连线
      const defaultFlowId = `Flow_Default_${timestamp}`;
      this.lf.addEdge({
        id: defaultFlowId,
        type: edgeType,
        sourceNodeId: forkId,
        targetNodeId: defaultTaskId,
        text: '默认',
        properties: {
          isDefault: true,
          branchType: 'default',
        },
      });

      // 6. 记录配对信息
      const pairInfo: PairInfo = {
        gatewayType: 'exclusiveGateway',
        forkId,
        joinId: undefined,  // 排他网关没有聚合节点
        branches: [
          {
            taskId: exclusiveTaskId,
            flowInId: exclusiveFlowId,
          },
        ],
        defaultBranch: {
          taskId: defaultTaskId,
          flowInId: defaultFlowId,
        },
        createdAt: new Date().toISOString(),
      };

      this.gatewayPairs.set(forkId, pairInfo);

      // 7. 记录分支配置（默认分支连线及其任务节点禁止删除）
      this.branchConfigs.set(defaultFlowId, {
        isDefault: true,
        isDeletable: false,
        pairId: pairInfo,
        taskId: defaultTaskId,  // 记录默认分支的任务节点ID
      });
      // 同时记录任务节点的保护配置
      this.branchConfigs.set(defaultTaskId, {
        isDefault: true,
        isDeletable: false,
        pairId: pairInfo,
        taskId: defaultTaskId,
      });

      console.log('[排他网关] 分支创建完成:', pairInfo);
      return pairInfo;
    } catch (error) {
      console.error('创建排他网关分支失败:', error);
      return null;
    }
  }

  /**
   * 创建包容网关成对结构（分流 + 聚合）
   * 结构：[分流网关] ──条件A──> [普通分支] ──> [聚合网关]
   *          └──默认───> [默认分支] ────>   ↑
   */
  public createInclusiveGatewayPair(forkGateway: {
    x: number;
    y: number;
    id?: string;
  }): PairInfo | null {
    const { offsetX, taskNodeType, edgeType, branchYOffset } = this.options;
    const timestamp = Date.now();

    // 生成分流网关ID
    const forkId = forkGateway.id || `InclusiveGateway_Fork_${timestamp}`;
    // 生成聚合网关ID
    const joinId = `InclusiveGateway_Join_${timestamp}`;

    try {
      // 1. 更新或创建分流网关
      if (!forkGateway.id) {
        this.lf.addNode({
          id: forkId,
          type: 'inclusiveGateway',
          x: forkGateway.x,
          y: forkGateway.y,
          text: '分流',
          properties: {
            pairId: joinId,
            pairType: 'fork',
            gatewayType: 'inclusive',
            gatewayRole: 'split',
          },
        });
      } else {
        // 更新已存在节点的属性
        this.lf.setProperties(forkId, {
          pairId: joinId,
          pairType: 'fork',
          gatewayType: 'inclusive',
          gatewayRole: 'split',
        });
        const forkNode = this.lf.getNodeModelById(forkId);
        if (forkNode && !forkNode.text?.value) {
          forkNode.setText('分流');
        }
      }

      // 2. 创建聚合网关（包容网关类型）
      this.lf.addNode({
        id: joinId,
        type: 'inclusiveGateway',
        x: forkGateway.x + offsetX,
        y: forkGateway.y,
        text: '聚合',
        properties: {
          pairId: forkId,
          pairType: 'join',
          gatewayType: 'inclusive',
          gatewayRole: 'merge',
        },
      });

      // 3. 创建普通分支任务节点（上方）
      const normalTaskId = `Task_Normal_${timestamp}`;
      this.lf.addNode({
        id: normalTaskId,
        type: taskNodeType,
        x: forkGateway.x + offsetX / 2,
        y: forkGateway.y - branchYOffset,
        text: '普通分支',
        properties: {
          branchType: 'normal',
          forkGatewayId: forkId,
          joinGatewayId: joinId,
        },
      });

      // 4. 创建默认分支任务节点（下方）
      const defaultTaskId = `Task_Default_${timestamp}`;
      this.lf.addNode({
        id: defaultTaskId,
        type: taskNodeType,
        x: forkGateway.x + offsetX / 2,
        y: forkGateway.y + branchYOffset,
        text: '默认分支',
        properties: {
          branchType: 'default',
          isDefault: true,
          forkGatewayId: forkId,
          joinGatewayId: joinId,
        },
      });

      // 5. 创建分流网关到普通分支的连线
      const normalFlowId = `Flow_Normal_${timestamp}`;
      this.lf.addEdge({
        id: normalFlowId,
        type: edgeType,
        sourceNodeId: forkId,
        targetNodeId: normalTaskId,
        text: '条件A',
        properties: {
          condition: '${conditionA === true}',
          branchType: 'normal',
          isDefault: false,
        },
      });

      // 6. 创建分流网关到默认分支的连线
      const defaultFlowId = `Flow_Default_${timestamp}`;
      this.lf.addEdge({
        id: defaultFlowId,
        type: edgeType,
        sourceNodeId: forkId,
        targetNodeId: defaultTaskId,
        text: '默认',
        properties: {
          isDefault: true,
          branchType: 'default',
        },
      });

      // 7. 创建普通分支到聚合网关的连线
      const normalToJoinFlowId = `Flow_NormalToJoin_${timestamp}`;
      this.lf.addEdge({
        id: normalToJoinFlowId,
        type: edgeType,
        sourceNodeId: normalTaskId,
        targetNodeId: joinId,
        properties: {
          branchType: 'normal',
        },
      });

      // 8. 创建默认分支到聚合网关的连线
      const defaultToJoinFlowId = `Flow_DefaultToJoin_${timestamp}`;
      this.lf.addEdge({
        id: defaultToJoinFlowId,
        type: edgeType,
        sourceNodeId: defaultTaskId,
        targetNodeId: joinId,
        properties: {
          branchType: 'default',
          isDefault: true,
        },
      });

      // 9. 记录配对信息
      const pairInfo: PairInfo = {
        gatewayType: 'inclusiveGateway',
        forkId,
        joinId,
        branches: [
          {
            taskId: normalTaskId,
            flowInId: normalFlowId,
            flowOutId: normalToJoinFlowId,
          },
        ],
        defaultBranch: {
          taskId: defaultTaskId,
          flowInId: defaultFlowId,
          flowOutId: defaultToJoinFlowId,
        },
        createdAt: new Date().toISOString(),
      };

      this.gatewayPairs.set(forkId, pairInfo);
      this.gatewayPairs.set(joinId, pairInfo);

      // 10. 记录分支配置（默认分支连线及其任务节点禁止删除）
      this.branchConfigs.set(defaultFlowId, {
        isDefault: true,
        isDeletable: false,
        pairId: pairInfo,
        taskId: defaultTaskId,
      });
      this.branchConfigs.set(defaultToJoinFlowId, {
        isDefault: true,
        isDeletable: false,
        pairId: pairInfo,
        taskId: defaultTaskId,
      });
      // 同时记录任务节点的保护配置
      this.branchConfigs.set(defaultTaskId, {
        isDefault: true,
        isDeletable: false,
        pairId: pairInfo,
        taskId: defaultTaskId,
      });

      console.log('[包容网关] 网关成对创建完成:', pairInfo);
      return pairInfo;
    } catch (error) {
      console.error('创建包容网关成对失败:', error);
      return null;
    }
  }

  /**
   * 处理节点删除
   */
  private handleNodeDelete({ data }: { data: any }) {
    // 检查是否是受保护的默认分支任务节点
    const nodeConfig = this.branchConfigs.get(data.id);
    if (nodeConfig && !nodeConfig.isDeletable && nodeConfig.isDefault) {
      // 阻止删除默认分支的任务节点
      console.warn('默认分支的任务节点不能删除');
      
      // 获取配对信息，用于恢复相关的边
      const pairInfo = nodeConfig.pairId;
      
      // 重新添加被删除的节点和相关边
      setTimeout(() => {
        const nodeData = data;
        // 恢复节点
        this.lf.addNode({
          id: nodeData.id,
          type: nodeData.type,
          x: nodeData.x,
          y: nodeData.y,
          text: nodeData.text,
          properties: nodeData.properties,
        });
        
         // 使用额外的延迟确保节点完全初始化后再恢复边
        setTimeout(() => {
          // 恢复默认分支的边（从分流网关到任务节点）
          const defaultFlowIn = pairInfo.defaultBranch.flowInId;
          const flowInEdge = this.lf.getEdgeModelById(defaultFlowIn);
          if (!flowInEdge) {
            // 边已被删除，需要恢复
            this.lf.addEdge({
              id: defaultFlowIn,
              type: this.options.edgeType,
              sourceNodeId: pairInfo.forkId,
              targetNodeId: nodeData.id,
              text: '默认',
              properties: {
                isDefault: true,
                branchType: 'default',
              },
            });
            console.log('[保护机制] 已恢复默认分支入口边:', defaultFlowIn);
          }
          
          // 如果是包容网关，还需要恢复从任务节点到聚合网关的边
          if (pairInfo.joinId && pairInfo.defaultBranch.flowOutId) {
            const defaultFlowOut = pairInfo.defaultBranch.flowOutId;
            const flowOutEdge = this.lf.getEdgeModelById(defaultFlowOut);
            if (!flowOutEdge) {
              // 边已被删除，需要恢复
              this.lf.addEdge({
                id: defaultFlowOut,
                type: this.options.edgeType,
                sourceNodeId: nodeData.id,
                targetNodeId: pairInfo.joinId,
                properties: {
                  branchType: 'default',
                  isDefault: true,
                },
              });
              console.log('[保护机制] 已恢复默认分支出口边:', defaultFlowOut);
            }
          }
        }, 10);  // 等待节点完全初始化
      }, 0);
      
      return false;
    }

    const pairInfo = this.gatewayPairs.get(data.id);
    if (!pairInfo) return;

    // 排他网关：只删除相关分支
    if (pairInfo.gatewayType === 'exclusiveGateway') {
      this.deleteExclusiveGatewayBranches(pairInfo);
    }
    // 包容网关：删除配对的网关和分支
    else if (pairInfo.gatewayType === 'inclusiveGateway') {
      this.deleteInclusiveGatewayPair(data.id, pairInfo);
    }

    // 清理记录
    this.gatewayPairs.delete(pairInfo.forkId);
    if (pairInfo.joinId) {
      this.gatewayPairs.delete(pairInfo.joinId);
    }
  }

  /**
   * 删除排他网关的分支
   */
  private deleteExclusiveGatewayBranches(pairInfo: PairInfo) {
    const elementsToDelete: string[] = [];

    // 收集所有分支任务和连线
    pairInfo.branches.forEach((branch) => {
      elementsToDelete.push(branch.taskId, branch.flowInId);
    });
    elementsToDelete.push(pairInfo.defaultBranch.taskId, pairInfo.defaultBranch.flowInId);

    // 临时移除监听
    this.lf.off('edge:delete', this.boundHandleEdgeDelete);

    elementsToDelete.forEach((id) => {
      const node = this.lf.getNodeModelById(id);
      if (node) {
        this.lf.deleteNode(id);
      }
      const edge = this.lf.getEdgeModelById(id);
      if (edge) {
        this.lf.deleteEdge(id);
      }
    });

    // 恢复监听
    this.lf.on('edge:delete', this.boundHandleEdgeDelete);

    // 清理分支配置记录
    this.branchConfigs.delete(pairInfo.defaultBranch.flowInId);
  }

  /**
   * 删除包容网关成对结构
   */
  private deleteInclusiveGatewayPair(deletedId: string, pairInfo: PairInfo) {
    // 删除配对的网关
    const pairId = deletedId === pairInfo.forkId ? pairInfo.joinId : pairInfo.forkId;
    if (pairId) {
      // 临时移除监听，避免循环删除
      this.lf.off('node:delete', this.boundHandleNodeDelete);
      this.lf.deleteNode(pairId);
      this.lf.on('node:delete', this.boundHandleNodeDelete);
    }

    // 删除相关分支节点和连线
    this.deleteInclusiveGatewayBranches(pairInfo);
  }

  /**
   * 删除包容网关的分支
   */
  private deleteInclusiveGatewayBranches(pairInfo: PairInfo) {
    const elementsToDelete: string[] = [];

    // 收集所有分支任务和连线
    pairInfo.branches.forEach((branch) => {
      elementsToDelete.push(branch.taskId, branch.flowInId);
      if (branch.flowOutId) {
        elementsToDelete.push(branch.flowOutId);
      }
    });
    elementsToDelete.push(pairInfo.defaultBranch.taskId, pairInfo.defaultBranch.flowInId);
    if (pairInfo.defaultBranch.flowOutId) {
      elementsToDelete.push(pairInfo.defaultBranch.flowOutId);
    }

    // 临时移除监听
    this.lf.off('edge:delete', this.boundHandleEdgeDelete);

    elementsToDelete.forEach((id) => {
      const node = this.lf.getNodeModelById(id);
      if (node) {
        this.lf.deleteNode(id);
      }
      const edge = this.lf.getEdgeModelById(id);
      if (edge) {
        this.lf.deleteEdge(id);
      }
    });

    // 恢复监听
    this.lf.on('edge:delete', this.boundHandleEdgeDelete);

    // 清理分支配置记录
    this.branchConfigs.delete(pairInfo.defaultBranch.flowInId);
    if (pairInfo.defaultBranch.flowOutId) {
      this.branchConfigs.delete(pairInfo.defaultBranch.flowOutId);
    }
  }

  /**
   * 处理边删除（保护默认分支）
   */
  private handleEdgeDelete({ data }: { data: any }) {
    const branchConfig = this.branchConfigs.get(data.id);

    if (branchConfig && !branchConfig.isDeletable) {
      // 阻止删除默认分支
      console.warn('默认分支不能删除');

      // 使用较长的延迟，让 handleNodeDelete 有机会先执行
      // 如果节点也被删除，handleNodeDelete 会恢复节点和边
      // 如果只有边被删除，这里会恢复边
      setTimeout(() => {
        // 检查节点是否还存在
        const sourceNode = this.lf.getNodeModelById(data.sourceNodeId);
        const targetNode = this.lf.getNodeModelById(data.targetNodeId);
        
        // 如果两个节点都存在，则恢复边
        if (sourceNode && targetNode) {
          // 检查边是否已经被恢复（可能由 handleNodeDelete 恢复）
          const existingEdge = this.lf.getEdgeModelById(data.id);
          if (!existingEdge) {
            this.lf.addEdge({
              id: data.id,
              type: data.type,
              sourceNodeId: data.sourceNodeId,
              targetNodeId: data.targetNodeId,
              text: data.text,
              properties: data.properties,
            });
            console.log('[保护机制] 已恢复默认分支边:', data.id);
          }
        } else {
          console.log('[保护机制] 节点不存在，边恢复将由 handleNodeDelete 处理');
        }
      }, 10);  // 使用 10ms 延迟

      return false;
    }

    // 清理配置记录
    this.branchConfigs.delete(data.id);
  }

  /**
   * 处理边添加（验证连线规则）
   * 规则：
   * 1. 两个节点之间只能有一条连线
   * 2. 连线的起点和终点不能是同一个节点（禁止自连接）
   */
  private handleEdgeAdd({ data }: { data: any }) {
    const { sourceNodeId, targetNodeId, id } = data;

    // 规则2：禁止自连接
    if (sourceNodeId === targetNodeId) {
      console.warn('连线的起点和终点不能是同一个节点');
      // 删除刚创建的边
      setTimeout(() => {
        this.lf.deleteEdge(id);
      }, 0);
      return false;
    }

    // 规则1：检查是否已存在相同的连线
    const graphData = this.lf.getGraphRawData();
    const existingEdge = graphData.edges.find(
      (edge: any) =>
        edge.id !== id && // 排除当前边
        edge.sourceNodeId === sourceNodeId &&
        edge.targetNodeId === targetNodeId
    );

    if (existingEdge) {
      console.warn('两个节点之间只能有一条连线');
      // 删除刚创建的边
      setTimeout(() => {
        this.lf.deleteEdge(id);
      }, 0);
      return false;
    }

    return true;
  }

  /**
   * 手动添加新分支（仅包容网关支持）
   */
  public addBranch(
    forkGatewayId: string,
    branchName: string,
    condition: string,
  ): BranchInfo | null {
    const pairInfo = this.gatewayPairs.get(forkGatewayId);
    if (!pairInfo) {
      console.error('未找到网关配对信息');
      return null;
    }

    // 排他网关不支持此方法
    if (pairInfo.gatewayType === 'exclusiveGateway') {
      console.warn('排他网关不支持通过此方法添加分支');
      return null;
    }

    // 包容网关添加分支
    if (!pairInfo.joinId) return null;

    const timestamp = Date.now();
    const { taskNodeType, edgeType, branchYOffset, offsetX } = this.options;
    const forkNode = this.lf.getNodeModelById(forkGatewayId);
    const joinNode = this.lf.getNodeModelById(pairInfo.joinId);

    if (!forkNode || !joinNode) return null;

    // 计算新分支位置（在现有分支下方）
    const existingBranches = this.getExistingBranches(forkGatewayId);
    const yOffset = branchYOffset * (existingBranches.length + 1);

    // 创建新任务节点
    const newTaskId = `Task_${branchName}_${timestamp}`;
    this.lf.addNode({
      id: newTaskId,
      type: taskNodeType,
      x: (forkNode.x + joinNode.x) / 2,
      y: forkNode.y + yOffset,
      text: branchName,
      properties: {
        branchType: 'normal',
        isDefault: false,
        forkGatewayId: forkGatewayId,
        joinGatewayId: pairInfo.joinId,
      },
    });

    // 创建分流网关到新任务的连线
    const flowInId = `Flow_In_${timestamp}`;
    this.lf.addEdge({
      id: flowInId,
      type: edgeType,
      sourceNodeId: forkGatewayId,
      targetNodeId: newTaskId,
      text: branchName,
      properties: {
        condition: condition,
        branchType: 'normal',
        isDefault: false,
      },
    });

    // 创建新任务到聚合网关的连线
    const flowOutId = `Flow_Out_${timestamp}`;
    this.lf.addEdge({
      id: flowOutId,
      type: edgeType,
      sourceNodeId: newTaskId,
      targetNodeId: pairInfo.joinId,
      properties: {
        branchType: 'normal',
      },
    });

    const newBranch: BranchInfo = {
      taskId: newTaskId,
      flowInId,
      flowOutId,
    };

    // 更新配对信息
    pairInfo.branches.push(newBranch);

    return newBranch;
  }

  /**
   * 获取现有分支
   */
  private getExistingBranches(forkGatewayId: string) {
    const edges = this.lf.getGraphRawData().edges;
    return edges.filter(
      (edge) => edge.sourceNodeId === forkGatewayId && edge.type === this.options.edgeType,
    );
  }

  /**
   * 获取配对信息
   */
  public getPairInfo(gatewayId: string): PairInfo | undefined {
    return this.gatewayPairs.get(gatewayId);
  }

  /**
   * 获取所有配对信息
   */
  public getAllPairInfos(): PairInfo[] {
    const seen = new Set<string>();
    const result: PairInfo[] = [];

    this.gatewayPairs.forEach((pairInfo) => {
      if (!seen.has(pairInfo.forkId)) {
        seen.add(pairInfo.forkId);
        result.push(pairInfo);
      }
    });

    return result;
  }

  /**
   * 检查边是否为默认分支（不可删除）
   */
  public isDefaultBranch(edgeId: string): boolean {
    const config = this.branchConfigs.get(edgeId);
    return config?.isDefault ?? false;
  }

  /**
   * 销毁管理器
   */
  public destroy() {
    this.lf.off('node:dnd-add', this.boundHandleNodeDndAdd);
    this.lf.off('node:delete', this.boundHandleNodeDelete);
    this.lf.off('edge:delete', this.boundHandleEdgeDelete);
    this.lf.off('edge:add', this.boundHandleEdgeAdd);
    this.gatewayPairs.clear();
    this.branchConfigs.clear();
  }
}

export default GatewayPairManager;
