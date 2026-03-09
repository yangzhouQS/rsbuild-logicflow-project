import type LogicFlow from '@logicflow/core';

/**
 * 不需要显示右键菜单的节点类型
 */
export const MENU_EXCLUDED_TYPES = ['start', 'end'];

/**
 * 设置节点菜单配置的 Hook
 * 为特定节点类型禁用右键菜单
 * @param lf LogicFlow 实例
 */
export function useFlowMenu(lf: LogicFlow | null) {
	/**
	 * 设置特定节点类型的菜单配置
	 * 为开始节点和结束节点禁用右键菜单
	 */
	const setupNodeMenu = () => {
		if (!lf) return;

		// 为排除的节点类型设置空菜单（禁用右键菜单）
		MENU_EXCLUDED_TYPES.forEach((type) => {
			lf.setMenuByType({
				type,
				menu: [],
			});
		});

		console.log('节点菜单配置已完成，已禁用的节点类型:', MENU_EXCLUDED_TYPES);
	};

	return {
		setupNodeMenu,
		MENU_EXCLUDED_TYPES,
	};
}
