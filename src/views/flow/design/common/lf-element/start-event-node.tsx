/**
 * 开始事件节点视图
 * 使用 @logicflow/core 的 h 函数进行渲染
 * 渲染为圆形外观
 */
import { h, CircleNode } from '@logicflow/core';
import type { GraphModel } from '@logicflow/core';
import type StartEventModel from './start-event-model';

export type IStartEventNodeProps = {
  model: StartEventModel;
  graphModel: GraphModel;
};

export class StartEventNode<
  P extends IStartEventNodeProps = IStartEventNodeProps,
> extends CircleNode<P> {
  /**
   * 获取节点的形状
   * 渲染圆形边框
   */
  getShape() {
    const { model } = this.props;
    const { x, y, r } = model;
    const style = model.getNodeStyle();

    return h(
      'g',
      {
        // 将整个组移动到节点的中心位置
        transform: `translate(${x}, ${y})`,
      },
      // 圆形边框
      h('circle', {
        cx: 0,
        cy: 0,
        r: r,
        fill: style.fill || '#FFFFFF',
        stroke: style.stroke || '#67C23A',
        strokeWidth: style.strokeWidth || 2,
      }),
    );
  }
}

export default StartEventNode;
