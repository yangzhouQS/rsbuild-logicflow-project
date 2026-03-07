/**
 * 网关节点模块导出
 * 提供排他网关和包容网关的注册和使用方法
 */
import type LogicFlow, { GraphModel } from '@logicflow/core';
import { ExclusiveGatewayNode } from './ExclusiveGatewayNode';
import { ExclusiveGatewayModel } from './ExclusiveGatewayModel';
import { InclusiveGatewayNode } from './InclusiveGatewayNode';
import { InclusiveGatewayModel } from './InclusiveGatewayModel';
import type {
  IGatewayProperties,
  IGatewayConfig,
  IExclusiveGatewayProperties,
  IExclusiveGatewayConfig,
  IInclusiveGatewayProperties,
  IInclusiveGatewayConfig,
} from './types';

// 导出类型
export type {
  IGatewayProperties,
  IGatewayConfig,
  IExclusiveGatewayProperties,
  IExclusiveGatewayConfig,
  IInclusiveGatewayProperties,
  IInclusiveGatewayConfig,
};

// 导出组件
export {
  ExclusiveGatewayNode,
  ExclusiveGatewayModel,
  InclusiveGatewayNode,
  InclusiveGatewayModel,
};

// 节点类型标识
export const EXCLUSIVE_GATEWAY_TYPE = 'exclusiveGateway';
export const INCLUSIVE_GATEWAY_TYPE = 'inclusiveGateway';

/**
 * 默认配置
 */
export const DEFAULT_GATEWAY_CONFIG: IGatewayConfig = {
  type: EXCLUSIVE_GATEWAY_TYPE,
  defaultWidth: 50,
  defaultHeight: 50,
  defaultColor: '#E6A23C',
  defaultIconScale: 0.6,
};

/**
 * 注册排他网关节点到LogicFlow实例
 * @param lf LogicFlow实例
 * @param config 可选的自定义配置
 */
export function registerExclusiveGateway(
  lf: LogicFlow,
  config?: Partial<IGatewayConfig>,
) {
  const finalConfig = { ...DEFAULT_GATEWAY_CONFIG, ...config, type: EXCLUSIVE_GATEWAY_TYPE };

  // 动态创建模型类以支持自定义配置
  class CustomExclusiveGatewayModel extends ExclusiveGatewayModel {
    constructor(data: LogicFlow.NodeConfig<IGatewayProperties>, graphModel: GraphModel) {
      // 注入默认属性
      data.properties = {
        width: finalConfig.defaultWidth,
        height: finalConfig.defaultHeight,
        color: finalConfig.defaultColor,
        iconScale: finalConfig.defaultIconScale,
        ...data.properties,
      };
      super(data, graphModel);
    }
  }

  lf.register({
    type: finalConfig.type,
    view: ExclusiveGatewayNode,
    model: CustomExclusiveGatewayModel,
  });
}

/**
 * 注册包容网关节点到LogicFlow实例
 * @param lf LogicFlow实例
 * @param config 可选的自定义配置
 */
export function registerInclusiveGateway(
  lf: LogicFlow,
  config?: Partial<IGatewayConfig>,
) {
  const finalConfig = { ...DEFAULT_GATEWAY_CONFIG, ...config, type: INCLUSIVE_GATEWAY_TYPE };

  // 动态创建模型类以支持自定义配置
  class CustomInclusiveGatewayModel extends InclusiveGatewayModel {
    constructor(data: LogicFlow.NodeConfig<IGatewayProperties>, graphModel: GraphModel) {
      // 注入默认属性
      data.properties = {
        width: finalConfig.defaultWidth,
        height: finalConfig.defaultHeight,
        color: finalConfig.defaultColor,
        iconScale: finalConfig.defaultIconScale,
        ...data.properties,
      };
      super(data, graphModel);
    }
  }

  lf.register({
    type: finalConfig.type,
    view: InclusiveGatewayNode,
    model: CustomInclusiveGatewayModel,
  });
}

/**
 * 创建排他网关节点配置
 * 用于拖拽面板等场景
 * @param x 节点x坐标
 * @param y 节点y坐标
 * @param properties 自定义属性
 */
export function createExclusiveGatewayNode(
  x: number,
  y: number,
  properties?: Partial<IGatewayProperties>,
) {
  return {
    type: EXCLUSIVE_GATEWAY_TYPE,
    x,
    y,
    properties: {
      width: DEFAULT_GATEWAY_CONFIG.defaultWidth,
      height: DEFAULT_GATEWAY_CONFIG.defaultHeight,
      color: DEFAULT_GATEWAY_CONFIG.defaultColor,
      iconScale: DEFAULT_GATEWAY_CONFIG.defaultIconScale,
      ...properties,
    },
  };
}

/**
 * 创建包容网关节点配置
 * 用于拖拽面板等场景
 * @param x 节点x坐标
 * @param y 节点y坐标
 * @param properties 自定义属性
 */
export function createInclusiveGatewayNode(
  x: number,
  y: number,
  properties?: Partial<IGatewayProperties>,
) {
  return {
    type: INCLUSIVE_GATEWAY_TYPE,
    x,
    y,
    properties: {
      width: DEFAULT_GATEWAY_CONFIG.defaultWidth,
      height: DEFAULT_GATEWAY_CONFIG.defaultHeight,
      color: DEFAULT_GATEWAY_CONFIG.defaultColor,
      iconScale: DEFAULT_GATEWAY_CONFIG.defaultIconScale,
      ...properties,
    },
  };
}

/**
 * 注册所有网关节点
 * @param lf LogicFlow实例
 * @param config 可选的自定义配置
 */
export function registerAllGateways(
  lf: LogicFlow,
  config?: Partial<IGatewayConfig>,
) {
  registerExclusiveGateway(lf, config);
  registerInclusiveGateway(lf, config);
}

export default {
  EXCLUSIVE_GATEWAY_TYPE,
  INCLUSIVE_GATEWAY_TYPE,
  DEFAULT_GATEWAY_CONFIG,
  ExclusiveGatewayNode,
  ExclusiveGatewayModel,
  InclusiveGatewayNode,
  InclusiveGatewayModel,
  registerExclusiveGateway,
  registerInclusiveGateway,
  registerAllGateways,
  createExclusiveGatewayNode,
  createInclusiveGatewayNode,
};
