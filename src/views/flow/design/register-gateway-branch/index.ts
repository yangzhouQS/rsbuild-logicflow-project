/**
 * 网关分支注册模块
 * 
 * 功能：
 * 1. 捕获节点拖拽至画布的结束事件
 * 2. 使用网关管理器自动创建默认分支和成对的网关
 * 3. 提供网关分支的管理和操作接口
 * 
 * @module register-gateway-branch
 */

import type LogicFlow from '@logicflow/core';
import { 
  GatewayPairManager, 
  type GatewayPairOptions,
  type PairInfo,
  type BranchInfo,
} from '../common/lf-element';

// 模块配置选项
export interface GatewayBranchOptions extends GatewayPairOptions {
  // 是否启用自动创建成对网关
  autoCreatePair?: boolean;
  // 是否启用默认分支保护
  protectDefaultBranch?: boolean;
  // 是否在控制台输出调试信息
  debug?: boolean;
}

// 默认模块配置
const DEFAULT_MODULE_OPTIONS: Required<GatewayBranchOptions> = {
  autoCreatePair: true,
  protectDefaultBranch: true,
  debug: false,
  // 继承 GatewayPairManager 的默认配置
  offsetX: 300,
  taskNodeType: 'rect',
  edgeType: 'polyline',
  branchYOffset: 80,
};

/**
 * 网关分支管理器类
 * 封装 GatewayPairManager，提供更高层的 API
 */
export class GatewayBranchManager {
  private lf: LogicFlow;
  private pairManager: GatewayPairManager | null = null;
  private options: Required<GatewayBranchOptions>;
  private initialized: boolean = false;

  constructor(lf: LogicFlow, options?: GatewayBranchOptions) {
    this.lf = lf;
    this.options = { ...DEFAULT_MODULE_OPTIONS, ...options };
  }

  /**
   * 初始化网关分支功能
   */
  public init(): void {
    if (this.initialized) {
      this.log('网关分支功能已经初始化，跳过重复初始化');
      return;
    }

    // 创建网关成对管理器
    this.pairManager = new GatewayPairManager(this.lf, {
      offsetX: this.options.offsetX,
      taskNodeType: this.options.taskNodeType,
      edgeType: this.options.edgeType,
      branchYOffset: this.options.branchYOffset,
    });

    this.initialized = true;
    this.log('网关分支功能初始化完成');
  }

  /**
   * 手动创建成对网关
   * @param x 分流网关 x 坐标
   * @param y 分流网关 y 坐标
   * @param gatewayType 网关类型
   */
  public createGatewayPair(
    x: number,
    y: number,
    gatewayType: 'exclusiveGateway' | 'inclusiveGateway' = 'exclusiveGateway'
  ): PairInfo | null {
    if (!this.pairManager) {
      console.error('网关管理器未初始化');
      return null;
    }

    this.log(`手动创建成对网关: type=${gatewayType}, x=${x}, y=${y}`);
    return this.pairManager.createGatewayPair({
      x,
      y,
      type: gatewayType,
    });
  }

  /**
   * 添加新分支
   * @param forkGatewayId 分流网关 ID
   * @param branchName 分支名称
   * @param condition 分支条件表达式
   */
  public addBranch(
    forkGatewayId: string,
    branchName: string,
    condition: string
  ): BranchInfo | null {
    if (!this.pairManager) {
      console.error('网关管理器未初始化');
      return null;
    }

    this.log(`添加新分支: forkId=${forkGatewayId}, name=${branchName}`);
    return this.pairManager.addBranch(forkGatewayId, branchName, condition);
  }

  /**
   * 获取网关配对信息
   * @param gatewayId 网关 ID
   */
  public getPairInfo(gatewayId: string): PairInfo | undefined {
    return this.pairManager?.getPairInfo(gatewayId);
  }

  /**
   * 获取所有配对信息
   */
  public getAllPairInfos(): PairInfo[] {
    return this.pairManager?.getAllPairInfos() || [];
  }

  /**
   * 检查边是否为默认分支
   * @param edgeId 边 ID
   */
  public isDefaultBranch(edgeId: string): boolean {
    return this.pairManager?.isDefaultBranch(edgeId) || false;
  }

  /**
   * 获取底层的 GatewayPairManager 实例
   */
  public getPairManager(): GatewayPairManager | null {
    return this.pairManager;
  }

  /**
   * 销毁管理器
   */
  public destroy(): void {
    if (this.pairManager) {
      this.pairManager.destroy();
      this.pairManager = null;
    }
    this.initialized = false;
    this.log('网关分支功能已销毁');
  }

  /**
   * 输出调试日志
   */
  private log(message: string, ...args: any[]): void {
    if (this.options.debug) {
      console.log(`[GatewayBranchManager] ${message}`, ...args);
    }
  }
}

// 保存全局实例引用
let globalInstance: GatewayBranchManager | null = null;

/**
 * 注册网关分支功能到 LogicFlow 实例
 * @param lf LogicFlow 实例
 * @param options 配置选项
 * @returns GatewayBranchManager 实例
 */
export function registerGatewayBranch(
  lf: LogicFlow,
  options?: GatewayBranchOptions
): GatewayBranchManager {
  // 如果已存在实例，先销毁
  if (globalInstance) {
    globalInstance.destroy();
  }

  // 创建新实例
  globalInstance = new GatewayBranchManager(lf, options);
  globalInstance.init();

  return globalInstance;
}

/**
 * 获取全局网关分支管理器实例
 */
export function getGatewayBranchManager(): GatewayBranchManager | null {
  return globalInstance;
}

/**
 * 销毁全局网关分支管理器实例
 */
export function destroyGatewayBranchManager(): void {
  if (globalInstance) {
    globalInstance.destroy();
    globalInstance = null;
  }
}

// 导出类型和组件
export { GatewayPairManager } from '../common/lf-element';
export type { PairInfo, BranchInfo, GatewayPairOptions } from '../common/lf-element';

// 默认导出
export default {
  GatewayBranchManager,
  registerGatewayBranch,
  getGatewayBranchManager,
  destroyGatewayBranchManager,
};
