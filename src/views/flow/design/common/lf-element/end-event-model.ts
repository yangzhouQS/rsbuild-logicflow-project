/**
 * 结束事件节点模型
 * 基于CircleNodeModel扩展，渲染为圆形外观，中间有实心矩形
 */
import { cloneDeep, isNil } from 'lodash-es';
import { CircleNodeModel } from '@logicflow/core';
import type { GraphModel } from '@logicflow/core';
import type LogicFlow from '@logicflow/core';
import type { IEventNodeProperties } from './types';

// 默认配置
const DEFAULT_CONFIG = {
  defaultRadius: 25,
  defaultColor: '#F56C6C',
  defaultStrokeWidth: 4,  // 结束节点边框更粗
  // 内部矩形配置
  defaultInnerRectWidth: 35,
  defaultInnerRectHeight: 35,
};

export class EndEventModel<
  P extends IEventNodeProperties = IEventNodeProperties,
> extends CircleNodeModel<P> {
  // 节点类型标识
  static nodeTypeName = 'end';

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
      stepName: '结束',
    });
    
    // 禁用文本编辑
    this.text = {
      ...this.text,
      editable: false,
    };
    
    this.text.value = this.properties.stepName || '结束';
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
   * 默认文字在圆心居中显示
   */
  getTextStyle() {
    const style = super.getTextStyle();
    const { textStyle: customTextStyle = {}, refX, refY } = this.properties;

    // 只有当refX或refY有值时才设置transform
    const textRefX = refX ?? 0;
    const textRefY = refY ?? 0;

    const resultStyle: Record<string, unknown> = {
      ...style,
      // 文字水平居中
      textAnchor: 'middle',
      // 文字垂直居中
      dominantBaseline: 'middle',
      ...cloneDeep(customTextStyle),
    };

    // 如果有偏移则添加transform
    if (textRefX !== 0 || textRefY !== 0) {
      resultStyle.transform = `matrix(1, 0, 0, 1, ${textRefX}, ${textRefY})`;
    }

    return resultStyle;
  }

  /**
   * 获取默认锚点配置
   * 结束节点只有一个左侧入口锚点
   */
  getDefaultAnchor() {
    const { x, y, r, id } = this;

    return [
      { x: x - r, y: y, id: `${id}_left` },  // 左侧锚点（入口）
    ];
  }

  /**
   * 获取节点颜色
   */
  getColor() {
    return this.properties.color || DEFAULT_CONFIG.defaultColor;
  }

  /**
   * 获取内部矩形宽度
   */
  getInnerRectWidth() {
    return this.properties.innerRectWidth ?? DEFAULT_CONFIG.defaultInnerRectWidth;
  }

  /**
   * 获取内部矩形高度
   */
  getInnerRectHeight() {
    return this.properties.innerRectHeight ?? DEFAULT_CONFIG.defaultInnerRectHeight;
  }

  /**
   * 是否允许连接（作为源节点）
   * 结束节点不允许作为连接源
   */
  isAllowConnect(): boolean {
    return false;
  }
}

export default EndEventModel;
