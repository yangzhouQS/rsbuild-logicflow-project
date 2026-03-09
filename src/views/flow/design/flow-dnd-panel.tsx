import {
	type PropType,
	defineComponent,
	h,
} from 'vue';
import type LogicFlow from '@logicflow/core';
import { flowApproveNodes } from './common/config.ts';

export const FlowDndPanel = defineComponent({
	name: 'FlowDndPanel',
	props: {
		lf: {
			type: Object as PropType<LogicFlow | null>,
		},
	},
	setup(props) {
		const methods = {
			dragNode: (item: any)=>{
				props.lf?.dnd.startDrag({
					type: item.type,
					text: item.label,
				});
			}
		};
		return () => {
			return (
				<div class="flow-dnd-panel">
					{
						flowApproveNodes.map(item => {
							return <div
								class={ [ 'flow-dnd-panel-item', item.type ] }
								key={ item.type }
								onMousedown={ () => {
									methods.dragNode(item);
								} }
							>
								<div class={ 'flow-dnd-panel-item-icon' }>
									{ h(item.icon) }
								</div>
								<div class={ 'flow-dnd-panel-item-text' }>{ item.label }</div>
							</div>;
						})
					}
				</div>
			);
		};
	},
});