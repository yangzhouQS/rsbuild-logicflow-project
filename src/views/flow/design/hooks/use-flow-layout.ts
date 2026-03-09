import type LogicFlow from '@logicflow/core';

/**
 * 默认布局配置
 */
const DEFAULT_LAYOUT_CONFIG = {
	rankdir: 'LR', // 布局方向：从左到右
	align: '',
	ranker: 'tight-tree',
	nodesep: 50, // 节点间距
	ranksep: 80, // 层级间距
	isDefaultAnchor: true,
};

/**
 * 布局配置选项
 */
export interface LayoutConfig {
	rankdir?: 'LR' | 'TB' | 'RL' | 'BT';
	align?: string;
	ranker?: string;
	nodesep?: number;
	ranksep?: number;
	isDefaultAnchor?: boolean;
}

/**
 * 自动布局 Hook
 * 提供流程图自动布局功能
 * @param lf LogicFlow 实例
 */
export function useFlowLayout(lf: LogicFlow | null) {
	/**
	 * 执行自动布局
	 * @param customConfig 自定义布局配置（可选）
	 */
	const autoLayout = (customConfig?: LayoutConfig) => {
		if (!lf) {
			console.warn('LogicFlow 实例不存在，无法执行自动布局');
			return;
		}

		const layoutConfig = {
			...DEFAULT_LAYOUT_CONFIG,
			...customConfig,
		};

		try {
			// 使用 dagre 布局扩展
			lf.extension.dagre?.layout(layoutConfig);
			// 自适应画布
			lf.fitView();
			console.log('自动布局完成，配置:', layoutConfig);
		} catch (error) {
			console.error('自动布局失败:', error);
		}
	};

	/**
	 * 横向布局（从左到右）
	 */
	const layoutLeftToRight = () => {
		autoLayout({ rankdir: 'LR' });
	};

	/**
	 * 纵向布局（从上到下）
	 */
	const layoutTopToBottom = () => {
		autoLayout({ rankdir: 'TB' });
	};

	return {
		autoLayout,
		layoutLeftToRight,
		layoutTopToBottom,
		DEFAULT_LAYOUT_CONFIG,
	};
}
