/**
 * 排他网关节点视图
 * 使用 @logicflow/core 的 h 函数进行渲染
 * 支持自定义渲染颜色和大小
 */
import { h, RectNode } from '@logicflow/core';
import type { GraphModel } from '@logicflow/core';
import type ExclusiveGatewayModel from './ExclusiveGatewayModel';

export type IExclusiveGatewayNodeProps = {
  model: ExclusiveGatewayModel;
  graphModel: GraphModel;
};

/**
 * 排他网关节点SVG图标路径
 * 基于原始SVG: 平台网关画布渲染图标.svg
 * viewBox: 0 0 60 60
 * 中心点: (30, 30)
 */
const EXCLUSIVE_GATEWAY_ICON = {
  // 菱形边框路径 - 基于60x60的viewBox，中心在(30,30)
  diamondPath:
    'M58.585789,28.585789L31.414215,1.4142134L30.000002,0L28.585789,1.4142133L1.4142134,28.585789L0,30.000002L1.4142135,31.414215L28.585789,58.585789L30.000002,60.000004L31.414215,58.585789L58.585789,31.414215L60.000004,30.000002L58.585789,28.585789Z',
  // 内部边框路径
  innerBorderPath:
    'M57.171577,30.000002L30.000002,2.8284268L2.8284268,30.000002L30.000002,57.171577L57.171577,30.000002Z',
  // X图标路径 - 竖线 (相对于30,30中心)
  xIconVertical:
    'M29.170242,19.684513L30.829813,19.684513L30.829813,40.226351L29.170242,40.226351Z',
  // X图标路径 - 横线 (相对于30,30中心)
  xIconHorizontal:
    'M19.684513,29.170242L40.226351,29.170242L40.226351,30.829813L19.684513,30.829813Z',
};

export class ExclusiveGatewayNode<
  P extends IExclusiveGatewayNodeProps = IExclusiveGatewayNodeProps,
> extends RectNode<P> {
  /**
   * 获取节点的形状
   * 渲染菱形边框和内部X图标
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
        // 将整个组移动到节点中心位置
        transform: `translate(${x}, ${y})`,
      },
      // 菱形边框 - 使用transformOrigin确保从中心缩放
      h('path', {
        d: EXCLUSIVE_GATEWAY_ICON.diamondPath,
        fill: style.fill || 'transparent',
        stroke: style.stroke || iconColor,
        strokeWidth: style.strokeWidth || 2,
        // 先平移到中心(-30,-30)，再缩放
        transform: `translate(-30, -30) scale(${scale})`,
      }),
      // 内部边框（可选，增加立体感）
      h('path', {
        d: EXCLUSIVE_GATEWAY_ICON.innerBorderPath,
        fill: 'transparent',
        stroke: iconColor,
        strokeWidth: 1,
        strokeOpacity: 0.3,
        transform: `translate(-30, -30) scale(${scale})`,
      }),
      // X图标 - 竖线
      h('path', {
        d: EXCLUSIVE_GATEWAY_ICON.xIconVertical,
        fill: iconColor,
        transform: `translate(-30, -30) scale(${scale})`,
      }),
      // X图标 - 横线
      h('path', {
        d: EXCLUSIVE_GATEWAY_ICON.xIconHorizontal,
        fill: iconColor,
        transform: `translate(-30, -30) scale(${scale})`,
      }),
    );
  }
}

export default ExclusiveGatewayNode;
