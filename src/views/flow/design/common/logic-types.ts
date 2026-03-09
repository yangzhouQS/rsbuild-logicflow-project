/**
 * dnd拖拽面板模块参数结构
 */
export type PatternItem = {
	type?: string;
	text?: string;
	label?: string;
	icon?: string;
	className?: string;
	properties?: object;
	callback?: () => void;
}

