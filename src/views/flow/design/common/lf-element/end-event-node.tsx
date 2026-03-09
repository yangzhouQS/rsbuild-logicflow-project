/**
 * 结束事件节点视图
 * 使用 @logicflow/core 的 h 函数进行渲染
 * 渲染为圆形外观，中间有实心矩形
 */
import { h, CircleNode } from '@logicflow/core';
import type { GraphModel } from '@logicflow/core';
import type EndEventModel from './end-event-model';

export type IEndEventNodeProps = {
  model: EndEventModel;
  graphModel: GraphModel;
};

export class EndEventNode<
  P extends IEndEventNodeProps = IEndEventNodeProps,
> extends CircleNode<P> {
  /**
   * 获取节点的形状
   * 渲染圆形边框，中间有实心矩形
   */
  getShape() {
    const { model } = this.props;
    const { x, y, r } = model;
    const style = model.getNodeStyle();
    const color = model.getColor();
    
    // 获取内部矩形尺寸
    const innerRectWidth = model.getInnerRectWidth();
    const innerRectHeight = model.getInnerRectHeight();

    return h(
      'g',
      {
        // 将整个组移动到节点的中心位置
        transform: `translate(${x}, ${y})`,
      },
      // 圆形边框（边框更粗）
      h('circle', {
        cx: 0,
        cy: 0,
        r: r,
        fill: style.fill || '#FFFFFF',
        stroke: style.stroke || color,
        strokeWidth: style.strokeWidth || 4,
      }),
      // 内部实心矩形
      h('rect', {
        x: -innerRectWidth / 2,
        y: -innerRectHeight / 2,
        width: innerRectWidth,
        height: innerRectHeight,
        fill: color,
        stroke: 'none',
      }),
    );
  }
}

export default EndEventNode;
