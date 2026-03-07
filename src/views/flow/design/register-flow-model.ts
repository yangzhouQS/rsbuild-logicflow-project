import type { LogicFlowType } from '@/views/flow/design/types/types.ts';
import { registerExclusiveGateway, registerInclusiveGateway } from './common/lf-element';

export function registerFlowModel(lf: LogicFlowType) {
  // 注册排他网关节点
  registerExclusiveGateway(lf, {
    defaultWidth: 100,
    defaultHeight: 100,
    defaultColor: '#E6A23C',
  });

  // 注册包容网关节点
  registerInclusiveGateway(lf, {
    defaultWidth: 150,
    defaultHeight: 150,
    defaultColor: '#E6A23C',
  });
}