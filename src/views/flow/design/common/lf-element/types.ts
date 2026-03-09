/**
 * 网关节点类型定义
 */
import type LogicFlow from '@logicflow/core';

/**
 * 通用网关节点属性
 */
export interface IGatewayProperties {
  /** 节点宽度 */
  width?: number;
  /** 节点高度 */
  height?: number;
  /** 渲染颜色 */
  color?: string;
  /** 图标大小比例 (0-1) */
  iconScale?: number;
  /** 文字X轴偏移量（相对于节点中心） */
  refX?: number;
  /** 文字Y轴偏移量（相对于节点中心） */
  refY?: number;
  /** 自定义样式 */
  style?: LogicFlow.CommonTheme;
  /** 文本样式 */
  textStyle?: LogicFlow.TextNodeTheme;
  /** 是否禁用右键菜单 */
  disableMenu?: boolean;
  /** 是否禁用编辑（移动、删除等） */
  disableEdit?: boolean;
  /** 是否禁用文本编辑 */
  disableTextEdit?: boolean;
  /** 是否禁用删除 */
  disableDelete?: boolean;
  /** 是否禁用移动 */
  disableMove?: boolean;
  /** 是否禁用连接 */
  disableConnect?: boolean;
  /** 其他属性 */
  [key: string]: unknown;
}

/**
 * 排他网关节点属性（兼容旧类型）
 */
export type IExclusiveGatewayProperties = IGatewayProperties;

/**
 * 包容网关节点属性
 */
export type IInclusiveGatewayProperties = IGatewayProperties;

/**
 * 网关节点配置
 */
export interface IGatewayConfig {
  /** 节点类型标识 */
  type: string;
  /** 默认宽度 */
  defaultWidth?: number;
  /** 默认高度 */
  defaultHeight?: number;
  /** 默认颜色 */
  defaultColor?: string;
  /** 默认图标比例 */
  defaultIconScale?: number;
  /** 默认文字X轴偏移 */
  defaultRefX?: number;
  /** 默认文字Y轴偏移 */
  defaultRefY?: number;
  /** 默认属性（会覆盖上面的单独配置） */
  properties?: Partial<IGatewayProperties>;
}

/**
 * 排他网关节点配置（兼容旧类型）
 */
export type IExclusiveGatewayConfig = IGatewayConfig;

/**
 * 包容网关节点配置
 */
export type IInclusiveGatewayConfig = IGatewayConfig;

/**
 * 事件节点属性（开始/结束节点）
 */
export interface IEventNodeProperties {
  /** 节点半径 */
  radius?: number;
  /** 渲染颜色 */
  color?: string;
  /** 文字X轴偏移量（相对于节点中心） */
  refX?: number;
  /** 文字Y轴偏移量（相对于节点中心） */
  refY?: number;
  /** 自定义样式 */
  style?: LogicFlow.CommonTheme;
  /** 文本样式 */
  textStyle?: LogicFlow.TextNodeTheme;
  /** 内部矩形宽度（仅结束节点） */
  innerRectWidth?: number;
  /** 内部矩形高度（仅结束节点） */
  innerRectHeight?: number;
  /** 是否禁用右键菜单 */
  disableMenu?: boolean;
  /** 是否禁用编辑（移动、删除等） */
  disableEdit?: boolean;
  /** 是否禁用文本编辑 */
  disableTextEdit?: boolean;
  /** 是否禁用删除 */
  disableDelete?: boolean;
  /** 是否禁用移动 */
  disableMove?: boolean;
  /** 是否禁用连接 */
  disableConnect?: boolean;
  /** 其他属性 */
  [key: string]: unknown;
}

/**
 * 开始事件节点属性
 */
export type IStartEventProperties = IEventNodeProperties;

/**
 * 结束事件节点属性
 */
export type IEndEventProperties = IEventNodeProperties;

/**
 * 事件节点配置
 */
export interface IEventNodeConfig {
  /** 节点类型标识 */
  type: string;
  /** 默认半径 */
  defaultRadius?: number;
  /** 默认颜色 */
  defaultColor?: string;
  /** 默认文字X轴偏移 */
  defaultRefX?: number;
  /** 默认文字Y轴偏移 */
  defaultRefY?: number;
  /** 默认属性（会覆盖上面的单独配置） */
  properties?: Partial<IEventNodeProperties>;
}

/**
 * 开始事件节点配置
 */
export type IStartEventConfig = IEventNodeConfig;

/**
 * 结束事件节点配置
 */
export type IEndEventConfig = IEventNodeConfig;
