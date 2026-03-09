import { registerExclusiveGateway, registerInclusiveGateway, registerStartEvent, registerEndEvent } from './lf-element';
import type LogicFlow from '@logicflow/core'

export function registerFlowModel(lf: LogicFlow) {
  // 注册排他网关节点
  registerExclusiveGateway(lf, {
    defaultWidth: 100,
    defaultHeight: 100,
    defaultColor: '#E6A23C',
	  properties: {
		  refY: 70,
	  },
  });

  // 注册包容网关节点
  registerInclusiveGateway(lf, {
    defaultWidth: 100,
    defaultHeight: 100,
    defaultColor: '#E6A23C',
	  properties: {
      refY: 70,
		  style: {
			  fill: '#ffe6cc',
			  stroke: '#d79b00',
		  },
		  textStyle: {
			  textAnchor: 'middle',
			  dominantBaseline: 'middle',
		  },
    },
  });

  // 注册开始事件节点
  registerStartEvent(lf, {
    defaultRadius: 50,
    defaultColor: '#FF6347',
	  defaultRefY: 0
  });

  // 注册结束事件节点
  registerEndEvent(lf, {
    defaultRadius: 50,
    defaultColor: '#FF6347',
	  defaultRefY: 0
  });
}
