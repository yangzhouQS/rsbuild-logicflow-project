import { EXCLUSIVE_GATEWAY_TYPE, INCLUSIVE_GATEWAY_TYPE } from '@/views/flow/design/common/lf-element';
import { IconExclusive, IconFlowEnd, IconFlowRect, IconFlowStart, IconInclusive } from '@/views/flow/design/icons';
import type LogicFlow from '@logicflow/core';
import {
	AutoLayout,
	BpmnElement,
	BpmnXmlAdapter,
	ContextMenu,
	Control,
	DndPanel,
	ProximityConnect ,
	FlowPath,
	Menu,
	Group,
	MiniMap,
	SelectionSelect,
	Snapshot,
} from '@logicflow/extension'

export const logicFlowConfig: Partial<LogicFlow.Options> = {
	isSilentMode: false, // 仅浏览不可编辑模式，默认不开启。
	stopScrollGraph: true, // 禁止鼠标滚动移动画布。
	stopZoomGraph: false, // 禁止缩放画布。
	style: {
		rect: {
			rx: 5,
			ry: 5,
			strokeWidth: 2,
			// 矩形样式
			radius: 8,
			stroke: "#3CB371",
		},
		circle: {
			fill: '#f5f5f5',
			// stroke: '#666',

			r: 25,
			stroke: "#FF6347",
		},
		ellipse: {
			fill: '#dae8fc',
			stroke: '#6c8ebf',
		},
		polygon: {
			fill: '#d5e8d4',
			stroke: '#82b366',
		},
		diamond: {
			fill: '#ffe6cc',
			stroke: '#d79b00',
		},
		text: {
			color: '#b85450',
			fontSize: 12,
		},
	},
	metaKeyMultipleSelected: true,
	grid: 40,
	keyboard: {
		enabled: true,
	},
	snapline: true, // 是否启用节点辅助对齐线。
	edgeTextDraggable: false, // 允许边文本可以拖拽。
	nodeTextDraggable: false, // 允许节点文本可以拖拽。
	plugins: [
		FlowPath,
		AutoLayout,
		Menu,
		ContextMenu,
		Control,
		Snapshot,
		SelectionSelect,
	],
};


/**
 * 自定义主题
 * @type {{baseNode: {stroke: string}, nodeText: {overflowMode: string, lineHeight: number, fontSize: number}, edgeText: {overflowMode: string, lineHeight: number, fontSize: number, textWidth: number}, polyline: {stroke: string}, rect: {width: number, height: number}, arrow: {offset: number, verticalLength: number}}}
 */
export const logicFlowCustomTheme: Partial<LogicFlow.Theme> = {
	baseNode: {
		stroke: '#4E93F5',
	},
	nodeText: {
		overflowMode: 'ellipsis',
		lineHeight: 1.5,
		fontSize: 13,
	},
	edgeText: {
		overflowMode: 'ellipsis',
		lineHeight: 1.5,
		fontSize: 13,
		textWidth: 100,
		background: {
			fill: "white",
		},
	}, // 确认 textWidth 是否必传
	polyline: {
		// stroke: 'red',
		strokeWidth: 1,
	},
	rect: {
		// 矩形样式
		radius: 8,
		stroke: "#3CB371",
		// width: 200,
		// height: 40,
	},
	arrow: {
		offset: 8, // 箭头长度
		verticalLength: 2, // 箭头垂直于边的距离
	},

	edgeAnimation: {
		stroke: '#e6a23c',  // 动画颜色（红色）
		strokeDasharray: '12,4,6,4',
		strokeDashoffset: '100%',
		animationName: 'lf_animate_dash',
		animationDuration: '20s',
		animationIterationCount: 'infinite',
		animationTimingFunction: 'linear',
		animationDirection: 'normal',
	}
};



export const flowApproveNodes = [
	{
		type: "start",
		label: "开始",
		icon: IconFlowStart,
		style: {
			width: "30px",
			height: "30px",
			borderRadius: "15px",
			border: "2px solid #FF6347",
		},
		properties: {
			// 节点业务属性
		},
	},
	{
		type: "rect",
		label: "普通步骤",
		icon: IconFlowRect,
		style: {
			width: "30px",
			height: "30px",
			borderRadius: "15px",
			border: "2px solid #FF6347",
		},
		properties: {
			// 节点业务属性
		},
	},
	{
		type: EXCLUSIVE_GATEWAY_TYPE,
		label: "排他网关",
		icon: IconExclusive,
		style: {
			width: "30px",
			height: "30px",
			borderRadius: "15px",
			border: "2px solid #FF6347",
		},
		properties: {
			// 节点业务属性
		},
	},
	{
		type: INCLUSIVE_GATEWAY_TYPE,
		label: "并行网关",
		icon: IconInclusive,
		style: {
			width: "30px",
			height: "30px",
			borderRadius: "15px",
			border: "2px solid #FF6347",
		},
		properties: {
			// 节点业务属性
			refY: 66,
		},
	},
	/* {
		type: 'branch',
		label: '条件分支',
		icon: IconFlowBranch,
		style: {
			width: '30px',
			height: '30px',
			borderRadius: '15px',
			border: '2px solid #FF6347'
		},
		properties: { // 节点业务属性
		}
	}, */
	{
		type: "end",
		label: "结束",
		icon: IconFlowEnd,
		style: {
			width: "30px",
			height: "30px",
			borderRadius: "15px",
			border: "2px solid #FF6347",
		},
		properties: {
			// 节点业务属性
		},
	},
];
