import type LogicFlow from '@logicflow/core';
import type { NodeData } from '@logicflow/core';

/**
 * 不需要显示配置抽屉的节点类型
 */
const DRAWER_EXCLUDED_TYPES = ['start', 'end', 'exclusiveGateway', 'inclusiveGateway'];

/**
 * 单击延迟时间（毫秒）- 用于区分单击和双击
 */
const CLICK_DELAY = 200;

/**
 * 节点事件配置选项
 */
export interface UseFlowEventsOptions {
	/** 打开配置抽屉的回调 */
	onOpenDrawer: (data: NodeData) => void;
}

/**
 * 设置节点事件监听的 Hook
 * 处理单击（打开抽屉）和双击（文本编辑）事件
 * @param lf LogicFlow 实例
 * @param options 配置选项
 */
export function useFlowEvents(lf: LogicFlow | null, options: UseFlowEventsOptions) {
	const { onOpenDrawer } = options;
	let clickTimer: ReturnType<typeof setTimeout> | null = null;

	/**
	 * 设置节点点击事件监听
	 * 单击：打开配置抽屉
	 * 双击：进入文本编辑模式
	 */
	const setupNodeClick = () => {
		if (!lf) return;

		// 监听节点单击事件（使用延迟来区分单击和双击）
		lf.on('node:click', ({ data }: { data: NodeData }) => {
			console.log('节点被点击:', data);

			// 如果已有定时器，说明是双击的第二次点击，清除定时器不触发抽屉
			if (clickTimer) {
				clearTimeout(clickTimer);
				clickTimer = null;
				return;
			}

			// 设置延迟，等待可能的双击
			clickTimer = setTimeout(() => {
				clickTimer = null;

				// 检查节点类型是否在排除列表中
				if (DRAWER_EXCLUDED_TYPES.includes(data.type)) {
					console.log('该节点类型不需要配置:', data.type);
					return;
				}

				onOpenDrawer(data);
			}, CLICK_DELAY);
		});

		// 监听节点双击事件 - 进入文本编辑模式
		lf.on('node:dbclick', ({ data }: { data: NodeData }) => {
			console.log('节点被双击，进入文本编辑模式:', data);

			// 清除单击定时器，阻止抽屉打开
			if (clickTimer) {
				clearTimeout(clickTimer);
				clickTimer = null;
			}

			// 使用 LogicFlow 的 editText 方法进入文本编辑模式
			lf.editText(data.id);
		});

		// 监听边双击事件 - 进入文本编辑模式
		lf.on('edge:dbclick', ({ data }: { data: { id: string } }) => {
			console.log('边被双击，进入文本编辑模式:', data);
			lf.editText(data.id);
		});

		console.log('节点事件监听已设置完成');
	};

	/**
	 * 清除点击定时器（组件卸载时调用）
	 */
	const clearClickTimer = () => {
		if (clickTimer) {
			clearTimeout(clickTimer);
			clickTimer = null;
		}
	};

	return {
		setupNodeClick,
		clearClickTimer,
		DRAWER_EXCLUDED_TYPES,
		CLICK_DELAY,
	};
}
