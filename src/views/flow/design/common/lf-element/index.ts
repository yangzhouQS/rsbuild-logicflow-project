/**
 * 自定义节点模块导出
 * 提供网关节点和事件节点的注册和使用方法
 */
import type LogicFlow from '@logicflow/core';
import type { GraphModel } from '@logicflow/core';
import { FlowNodeTypeEnum } from '../config.ts';
import { ExclusiveGatewayNode } from './exclusive-gateway-node';
import { ExclusiveGatewayModel } from './exclusive-gateway-model';
import { InclusiveGatewayNode } from './inclusive-gateway-node';
import { InclusiveGatewayModel } from './inclusive-gateway-model';
import { StartEventNode } from './start-event-node';
import { StartEventModel } from './start-event-model';
import { EndEventNode } from './end-event-node';
import { EndEventModel } from './end-event-model';
import { GatewayPairManager } from './gateway-pair-manager';
import type {
  IGatewayProperties,
  IGatewayConfig,
  IExclusiveGatewayProperties,
  IExclusiveGatewayConfig,
  IInclusiveGatewayProperties,
  IInclusiveGatewayConfig,
  IEventNodeProperties,
  IEventNodeConfig,
  IStartEventProperties,
  IStartEventConfig,
  IEndEventProperties,
  IEndEventConfig,
} from './types';
import type {
  GatewayType,
  BranchInfo,
  PairInfo,
  BranchConfig,
  GatewayPairOptions,
} from './gateway-pair-manager';

// 导出类型
export type {
  IGatewayProperties,
  IGatewayConfig,
  IExclusiveGatewayProperties,
  IExclusiveGatewayConfig,
  IInclusiveGatewayProperties,
  IInclusiveGatewayConfig,
  IEventNodeProperties,
  IEventNodeConfig,
  IStartEventProperties,
  IStartEventConfig,
  IEndEventProperties,
  IEndEventConfig,
  GatewayType,
  BranchInfo,
  PairInfo,
  BranchConfig,
  GatewayPairOptions,
};

// 导出组件
export {
  ExclusiveGatewayNode,
  ExclusiveGatewayModel,
  InclusiveGatewayNode,
  InclusiveGatewayModel,
  StartEventNode,
  StartEventModel,
  EndEventNode,
  EndEventModel,
  GatewayPairManager,
};

// 节点类型标识（使用 FlowNodeTypeEnum 枚举）
export const EXCLUSIVE_GATEWAY_TYPE = FlowNodeTypeEnum.EXCLUSIVE_GATEWAY;
export const INCLUSIVE_GATEWAY_TYPE = FlowNodeTypeEnum.INCLUSIVE_GATEWAY;
export const START_EVENT_TYPE = FlowNodeTypeEnum.START_NODE;
export const END_EVENT_TYPE = FlowNodeTypeEnum.END_NODE;

/**
 * 默认网关配置
 */
export const DEFAULT_GATEWAY_CONFIG: IGatewayConfig = {
  type: EXCLUSIVE_GATEWAY_TYPE,
  defaultWidth: 50,
  defaultHeight: 50,
  defaultColor: '#E6A23C',
  defaultIconScale: 0.6,
  defaultRefX: 0,
  defaultRefY: 0,
};

/**
 * 默认开始事件配置
 */
export const DEFAULT_START_EVENT_CONFIG: IEventNodeConfig = {
  type: START_EVENT_TYPE,
  defaultRadius: 25,
  defaultColor: '#67C23A',
  defaultRefX: 0,
  defaultRefY: 40,
};

/**
 * 默认结束事件配置
 */
export const DEFAULT_END_EVENT_CONFIG: IEventNodeConfig = {
  type: END_EVENT_TYPE,
  defaultRadius: 25,
  defaultColor: '#F56C6C',
  defaultRefX: 0,
  defaultRefY: 40,
};

/**
 * 从配置中提取默认属性（网关）
 */
function extractDefaultProperties(config: IGatewayConfig): IGatewayProperties {
  const { properties = {} } = config;
  return {
    width: properties.width ?? config.defaultWidth,
    height: properties.height ?? config.defaultHeight,
    color: properties.color ?? config.defaultColor,
    iconScale: properties.iconScale ?? config.defaultIconScale,
    refX: properties.refX ?? config.defaultRefX,
    refY: properties.refY ?? config.defaultRefY,
    style: properties.style,
    textStyle: properties.textStyle,
  };
}

/**
 * 从配置中提取默认属性（事件节点）
 */
function extractDefaultEventProperties(config: IEventNodeConfig): IEventNodeProperties {
  const { properties = {} } = config;
  return {
    radius: properties.radius ?? config.defaultRadius,
    color: properties.color ?? config.defaultColor,
    refX: properties.refX ?? config.defaultRefX,
    refY: properties.refY ?? config.defaultRefY,
    style: properties.style,
    textStyle: properties.textStyle,
    innerRectWidth: properties.innerRectWidth,
    innerRectHeight: properties.innerRectHeight,
  };
}

/**
 * 注册排他网关节点
 */
export function registerExclusiveGateway(
  lf: LogicFlow,
  config?: Partial<IGatewayConfig>,
) {
  const finalConfig: IGatewayConfig = {
    ...DEFAULT_GATEWAY_CONFIG,
    ...config,
    type: EXCLUSIVE_GATEWAY_TYPE,
  };
  const defaultProperties = extractDefaultProperties(finalConfig);

  class CustomModel extends ExclusiveGatewayModel {
    constructor(data: LogicFlow.NodeConfig<IGatewayProperties>, graphModel: GraphModel) {
      data.properties = { ...defaultProperties, ...data.properties };
      super(data, graphModel);
    }
  }

  lf.register({ type: finalConfig.type, view: ExclusiveGatewayNode, model: CustomModel });
}

/**
 * 注册包容网关节点
 */
export function registerInclusiveGateway(
  lf: LogicFlow,
  config?: Partial<IGatewayConfig>,
) {
  const finalConfig: IGatewayConfig = {
    ...DEFAULT_GATEWAY_CONFIG,
    ...config,
    type: INCLUSIVE_GATEWAY_TYPE,
  };
  const defaultProperties = extractDefaultProperties(finalConfig);

  class CustomModel extends InclusiveGatewayModel {
    constructor(data: LogicFlow.NodeConfig<IGatewayProperties>, graphModel: GraphModel) {
      data.properties = { ...defaultProperties, ...data.properties };
      super(data, graphModel);
    }
  }

  lf.register({ type: finalConfig.type, view: InclusiveGatewayNode, model: CustomModel });
}

/**
 * 注册开始事件节点
 */
export function registerStartEvent(
  lf: LogicFlow,
  config?: Partial<IEventNodeConfig>,
) {
  const finalConfig: IEventNodeConfig = {
    ...DEFAULT_START_EVENT_CONFIG,
    ...config,
    type: START_EVENT_TYPE,
  };
  const defaultProperties = extractDefaultEventProperties(finalConfig);

  class CustomModel extends StartEventModel {
    constructor(data: LogicFlow.NodeConfig<IEventNodeProperties>, graphModel: GraphModel) {
      data.properties = { ...defaultProperties, ...data.properties };
      super(data, graphModel);
    }
  }

  lf.register({ type: finalConfig.type, view: StartEventNode, model: CustomModel });
}

/**
 * 注册结束事件节点
 */
export function registerEndEvent(
  lf: LogicFlow,
  config?: Partial<IEventNodeConfig>,
) {
  const finalConfig: IEventNodeConfig = {
    ...DEFAULT_END_EVENT_CONFIG,
    ...config,
    type: END_EVENT_TYPE,
  };
  const defaultProperties = extractDefaultEventProperties(finalConfig);

  class CustomModel extends EndEventModel {
    constructor(data: LogicFlow.NodeConfig<IEventNodeProperties>, graphModel: GraphModel) {
      data.properties = { ...defaultProperties, ...data.properties };
      super(data, graphModel);
    }
  }

  lf.register({ type: finalConfig.type, view: EndEventNode, model: CustomModel });
}

/**
 * 创建排他网关节点配置
 */
export function createExclusiveGatewayNode(x: number, y: number, properties?: Partial<IGatewayProperties>) {
  return {
    type: EXCLUSIVE_GATEWAY_TYPE,
    x,
    y,
    properties: {
      width: DEFAULT_GATEWAY_CONFIG.defaultWidth,
      height: DEFAULT_GATEWAY_CONFIG.defaultHeight,
      color: DEFAULT_GATEWAY_CONFIG.defaultColor,
      ...properties,
    },
  };
}

/**
 * 创建包容网关节点配置
 */
export function createInclusiveGatewayNode(x: number, y: number, properties?: Partial<IGatewayProperties>) {
  return {
    type: INCLUSIVE_GATEWAY_TYPE,
    x,
    y,
    properties: {
      width: DEFAULT_GATEWAY_CONFIG.defaultWidth,
      height: DEFAULT_GATEWAY_CONFIG.defaultHeight,
      color: DEFAULT_GATEWAY_CONFIG.defaultColor,
      ...properties,
    },
  };
}

/**
 * 创建开始事件节点配置
 */
export function createStartEventNode(x: number, y: number, properties?: Partial<IEventNodeProperties>) {
  return {
    type: START_EVENT_TYPE,
    x,
    y,
    properties: {
      radius: DEFAULT_START_EVENT_CONFIG.defaultRadius,
      color: DEFAULT_START_EVENT_CONFIG.defaultColor,
      ...properties,
    },
  };
}

/**
 * 创建结束事件节点配置
 */
export function createEndEventNode(x: number, y: number, properties?: Partial<IEventNodeProperties>) {
  return {
    type: END_EVENT_TYPE,
    x,
    y,
    properties: {
      radius: DEFAULT_END_EVENT_CONFIG.defaultRadius,
      color: DEFAULT_END_EVENT_CONFIG.defaultColor,
      ...properties,
    },
  };
}

/**
 * 注册所有网关节点
 */
export function registerAllGateways(lf: LogicFlow, config?: Partial<IGatewayConfig>) {
  registerExclusiveGateway(lf, config);
  registerInclusiveGateway(lf, config);
}

/**
 * 注册所有事件节点
 */
export function registerAllEventNodes(lf: LogicFlow, config?: Partial<IEventNodeConfig>) {
  registerStartEvent(lf, config);
  registerEndEvent(lf, config);
}

/**
 * 注册所有自定义节点
 */
export function registerAllNodes(lf: LogicFlow, gatewayConfig?: Partial<IGatewayConfig>, eventConfig?: Partial<IEventNodeConfig>) {
  registerAllGateways(lf, gatewayConfig);
  registerAllEventNodes(lf, eventConfig);
}

export default {
  EXCLUSIVE_GATEWAY_TYPE,
  INCLUSIVE_GATEWAY_TYPE,
  START_EVENT_TYPE,
  END_EVENT_TYPE,
  DEFAULT_GATEWAY_CONFIG,
  DEFAULT_START_EVENT_CONFIG,
  DEFAULT_END_EVENT_CONFIG,
  ExclusiveGatewayNode,
  ExclusiveGatewayModel,
  InclusiveGatewayNode,
  InclusiveGatewayModel,
  StartEventNode,
  StartEventModel,
  EndEventNode,
  EndEventModel,
  GatewayPairManager,
  registerExclusiveGateway,
  registerInclusiveGateway,
  registerStartEvent,
  registerEndEvent,
  registerAllGateways,
  registerAllEventNodes,
  registerAllNodes,
  createExclusiveGatewayNode,
  createInclusiveGatewayNode,
  createStartEventNode,
  createEndEventNode,
};
