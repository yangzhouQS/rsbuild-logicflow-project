/**
 * 开始事件节点模型
 * 基于CircleNodeModel扩展，渲染为圆形外观
 */
import { cloneDeep, isNil } from 'lodash-es';
import { CircleNodeModel } from '@logicflow/core';
import type { GraphModel } from '@logicflow/core';
import type LogicFlow from '@logicflow/core';
import type { IEventNodeProperties } from './types';

// 默认配置
const DEFAULT_CONFIG = {
  defaultRadius: 25,
  defaultColor: '#67C23A',
  defaultStrokeWidth: 2,
  // 默认文字偏移
  defaultRefX: 0,
  defaultRefY: 40,
};

export class StartEventModel<
  P extends IEventNodeProperties = IEventNodeProperties,
> extends CircleNodeModel<P> {
  // 节点类型标识
  static nodeTypeName = 'start';

  constructor(data: LogicFlow.NodeConfig<P>, graphModel: GraphModel) {
    super(data, graphModel);
    this.initNodeData(data);
    this.setAttributes();
  }

  initNodeData(data: LogicFlow.NodeConfig<P>) {
    super.initNodeData(data);
    
    // 设置默认半径
    if (isNil(this.r)) {
      this.r = DEFAULT_CONFIG.defaultRadius;
    }

    // 设置节点属性
    Object.assign(this.properties, {
      stepName: '开始',
    });
    
    // 禁用文本编辑
    this.text = {
      ...this.text,
      editable: false,
    };
    
    this.text.value = this.properties.stepName || '开始';
  }

  setAttributes() {
    super.setAttributes();

    const { radius } = this.properties;

    // 从 properties 中读取自定义属性
    if (!isNil(radius)) this.r = radius;
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
      fill: '#FFFFFF',
      stroke: color,
      strokeWidth: DEFAULT_CONFIG.defaultStrokeWidth,
      ...cloneDeep(customStyle),
    };
  }

  /**
   * 获取文本样式
   */
  getTextStyle() {
    const style = super.getTextStyle();
    const { textStyle: customTextStyle = {}, refX, refY } = this.properties;

    // 获取文字偏移配置
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
   * 获取默认锚点配置
   * 开始节点只有一个右侧出口锚点
   */
  getDefaultAnchor() {
    const { x, y, r, id } = this;

    return [
      { x: x + r, y: y, id: `${id}_right` },  // 右侧锚点（出口）
    ];
  }

  /**
   * 是否允许连接（作为目标节点）
   * 开始节点不允许作为连接目标
   */
  isAllowConnect(): boolean {
    return false;
  }
}

export default StartEventModel;
