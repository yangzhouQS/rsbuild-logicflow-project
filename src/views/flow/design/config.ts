import type LogicFlow from '@logicflow/core';
import {
	AutoLayout,
	BpmnElement,
	BpmnXmlAdapter,
	ContextMenu,
	Control,
	DndPanel,
	FlowPath,
	Menu,
	Group,
	MiniMap,
	SelectionSelect,
	Snapshot,
} from '@logicflow/extension'
import type { ShapeItem } from '@logicflow/extension'
export const logicFlowConfig: Partial<LogicFlow.Options> = {
	isSilentMode: false,
	stopScrollGraph: false,
	stopZoomGraph: false,
	style: {
		rect: {
			rx: 5,
			ry: 5,
			strokeWidth: 2,
		},
		circle: {
			fill: '#f5f5f5',
			stroke: '#666',
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
	grid: true,
	keyboard: {
		enabled: true,
	},
	snapline: true,
	edgeTextDraggable: true,
	nodeTextDraggable: true,
	plugins: [
		BpmnElement,
		MiniMap,
		FlowPath,
		AutoLayout,
		DndPanel,
		Menu,
		ContextMenu,
		Group,
		Control,
		BpmnXmlAdapter,
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
	}, // 确认 textWidth 是否必传
	polyline: {
		stroke: 'red',
	},
	rect: {
		width: 200,
		height: 40,
	},
	arrow: {
		offset: 4, // 箭头长度
		verticalLength: 2, // 箭头垂直于边的距离
	},
};