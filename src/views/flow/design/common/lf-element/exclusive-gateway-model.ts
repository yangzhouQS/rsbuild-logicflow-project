/**
 * 排他网关节点模型
 * 基于RectNode扩展，渲染为菱形外观
 */
import { cloneDeep, isNil, uniqueId } from 'lodash-es';
import { RectNodeModel } from '@logicflow/core';
import type { GraphModel } from '@logicflow/core';
import type LogicFlow from '@logicflow/core';
import type { IGatewayProperties } from './types';

import { isObject } from 'lodash-es';

export function getModelText(text: string | { value: string }): string {
	return isObject(text) ? text.value : text;
}

// 默认配置
const DEFAULT_CONFIG = {
  defaultWidth: 50,
  defaultHeight: 50,
  defaultColor: '#E6A23C',
  defaultIconScale: 0.6,
  // 默认文字不偏移（居中显示）
  defaultRefX: 0,
  defaultRefY: 0,
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

	  const nodes = this.graphModel.nodes;
	  let text = `排他网关-${nodes.length + 1}`;

	  // 处理重复
	  for (const node of nodes) {
		  const nodeText = getModelText(node.text);
		  if (nodeText === text) {
			  text += uniqueId("_");
		  }
	  }

	  Object.assign(this.properties, {
		  stepName: text
	  });
	  this.text.value = text;
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
   * 获取文本样式
   * 使用 transform 属性实现文字偏移
   */
  getTextStyle() {
    const style = super.getTextStyle();
    const { textStyle: customTextStyle = {}, refX, refY } = this.properties;

    // 获取文字偏移配置，默认为0（居中）
    const textRefX = refX ?? DEFAULT_CONFIG.defaultRefX;
    const textRefY = refY ?? DEFAULT_CONFIG.defaultRefY;

    return {
      ...style,
      // 使用 transform 实现文字偏移
      transform: `matrix(1, 0, 0, 1, ${textRefX}, ${textRefY})`,
      ...cloneDeep(customTextStyle),
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
   * 菱形网关锚点：左侧（入口）、右侧（出口）、顶部、底部
   */
  getDefaultAnchor() {
    const { x, y, width, height, id } = this;
    const halfWidth = width / 2;
    const halfHeight = height / 2;

    return [
      { x: x - halfWidth, y: y, id: `${id}_0` },      // 左侧锚点
      { x: x + halfWidth, y: y, id: `${id}_1` },      // 右侧锚点
      { x: x, y: y - halfHeight, id: `${id}_2` },     // 顶部锚点
      { x: x, y: y + halfHeight, id: `${id}_3` },     // 底部锚点
    ];
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

  /**
   * 获取文字X轴偏移
   */
  getTextRefX() {
    return this.properties.refX ?? DEFAULT_CONFIG.defaultRefX;
  }

  /**
   * 获取文字Y轴偏移
   */
  getTextRefY() {
    return this.properties.refY ?? DEFAULT_CONFIG.defaultRefY;
  }
}

export default ExclusiveGatewayModel;
