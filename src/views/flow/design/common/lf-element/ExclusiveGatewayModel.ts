/**
 * 排他网关节点模型
 * 基于RectNode扩展，渲染为菱形外观
 */
import { cloneDeep, isNil } from 'lodash-es';
import { RectNodeModel } from '@logicflow/core';
import type { GraphModel } from '@logicflow/core';
import type LogicFlow from '@logicflow/core';
import type { IGatewayProperties } from './types';

// 默认配置
const DEFAULT_CONFIG = {
  defaultWidth: 50,
  defaultHeight: 50,
  defaultColor: '#E6A23C',
  defaultIconScale: 0.6,
};

export class ExclusiveGatewayModel<
  P extends IGatewayProperties = IGatewayProperties,
> extends RectNodeModel<P> {
  // 节点类型标识
  static nodeTypeName = 'exclusiveGateway';

  constructor(data: LogicFlow.NodeConfig<P>, graphModel: GraphModel) {
    super(data, graphModel);
    this.initNodeData(data);
    this.setAttributes();
  }

  initNodeData(data: LogicFlow.NodeConfig<P>) {
    super.initNodeData(data);
    // 设置默认尺寸
    if (isNil(this.width)) {
      this.width = DEFAULT_CONFIG.defaultWidth;
    }
    if (isNil(this.height)) {
      this.height = DEFAULT_CONFIG.defaultHeight;
    }
  }

  setAttributes() {
    super.setAttributes();

    const { width, height } = this.properties;

    // 从 properties 中读取自定义属性
    if (!isNil(width)) this.width = width;
    if (!isNil(height)) this.height = height;
  }

  /**
   * 获取节点样式
   */
  getNodeStyle() {
    const style = super.getNodeStyle();
    const { style: customStyle = {} } = this.properties;
    const color = this.properties.color || DEFAULT_CONFIG.defaultColor;

    return {
      ...style,
      fill: 'transparent',
      stroke: color,
      strokeWidth: 2,
      ...cloneDeep(customStyle),
    };
  }

  /**
   * 获取菱形的四个顶点
   * 用于渲染菱形外观
   */
  getDiamondPoints() {
    const { x, y, width, height } = this;
    const halfWidth = width / 2;
    const halfHeight = height / 2;

    return [
      { x: x, y: y - halfHeight }, // 顶部
      { x: x + halfWidth, y: y }, // 右侧
      { x: x, y: y + halfHeight }, // 底部
      { x: x - halfWidth, y: y }, // 左侧
    ];
  }

  /**
   * 获取默认锚点配置
   * 菱形节点通常在四个顶点位置设置锚点
   */
  getDefaultAnchor() {
    const points = this.getDiamondPoints();
    return points.map((point, index) => ({
      x: point.x,
      y: point.y,
      id: `${this.id}_${index}`,
    }));
  }

  /**
   * 获取图标颜色
   */
  getIconColor() {
    return this.properties.color || DEFAULT_CONFIG.defaultColor;
  }

  /**
   * 获取图标缩放比例
   */
  getIconScale() {
    return this.properties.iconScale || DEFAULT_CONFIG.defaultIconScale;
  }
}

export default ExclusiveGatewayModel;
