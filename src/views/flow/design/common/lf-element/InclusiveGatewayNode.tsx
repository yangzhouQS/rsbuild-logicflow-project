/**
 * 包容网关节点视图
 * 基于RectNode扩展，渲染为菱形外观并带有圆形图标
 * 使用 @logicflow/core 的 h 函数进行渲染
 */
import { h, RectNode } from '@logicflow/core';
import type { GraphModel } from '@logicflow/core';
import type InclusiveGatewayModel from './InclusiveGatewayModel';

export type IInclusiveGatewayNodeProps = {
  model: InclusiveGatewayModel;
  graphModel: GraphModel;
};

/**
 * 包容网关节点SVG图标路径
 * 基于原始SVG: 包容网关渲染图标.svg
 * viewBox: 0 0 60 60
 * 中心点: (30, 30)
 */
const INCLUSIVE_GATEWAY_ICON = {
  // 菱形边框路径 - 基于60x60的viewBox，中心在(30,30)
  // 与排他网关使用相同的菱形路径，确保几何形状一致
  diamondPath:
    'M58.585789,28.585789L31.414215,1.4142134L30.000002,0L28.585789,1.4142133L1.4142134,28.585789L0,30.000002L1.4142135,31.414215L28.585789,58.585789L30.000002,60.000004L31.414215,58.585789L58.585789,31.414215L60.000004,30.000002L58.585789,28.585789Z',
  // 内部边框路径
  innerBorderPath:
    'M57.171577,30.000002L30.000002,2.8284268L2.8284268,30.000002L30.000002,57.171577L57.171577,30.000002Z',
  // 圆形图标路径 - 中心在(30,30)，半径约13
  circlePath:
    'M30,17A13,13 0 1,0 30,43A13,13 0 1,0 30,17Z',
};

export class InclusiveGatewayNode<
  P extends IInclusiveGatewayNodeProps = IInclusiveGatewayNodeProps,
> extends RectNode<P> {
  /**
   * 获取节点的形状
   * 渲染菱形边框和内部圆形图标
   */
  getShape() {
    const { model } = this.props;
    const { x, y, width, height } = model;
    const style = model.getNodeStyle();
    const iconColor = model.getIconColor();

    // 计算缩放比例，将60x60的viewBox缩放到实际节点大小
    const scale = Math.min(width, height) / 60;

    return h(
      'g',
      {
        // 将整个组移动到节点的中心位置
        transform: `translate(${x}, ${y})`,
      },
      // 菱形边框 - 不填充背景色
      h('path', {
        d: INCLUSIVE_GATEWAY_ICON.diamondPath,
        fill: 'transparent',
        stroke: style.stroke || iconColor,
        strokeWidth: style.strokeWidth || 2,
        transform: `scale(${scale}) translate(-30, -30)`,
      }),
      // 内部边框（可选，增加立体感）
      h('path', {
        d: INCLUSIVE_GATEWAY_ICON.innerBorderPath,
        fill: 'transparent',
        stroke: iconColor,
        strokeWidth: 1,
        strokeOpacity: 0.3,
        transform: `scale(${scale}) translate(-30, -30)`,
      }),
      // 圆形图标 - 包容网关的特征
      h('path', {
        d: INCLUSIVE_GATEWAY_ICON.circlePath,
        fill: 'transparent',
        stroke: iconColor,
        strokeWidth: 2,
        transform: `scale(${scale}) translate(-30, -30)`,
      }),
    );
  }
}

export default InclusiveGatewayNode;
