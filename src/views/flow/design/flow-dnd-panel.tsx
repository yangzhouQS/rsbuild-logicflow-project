import { flowApproveNodes } from '@/views/flow/design/common/config.ts';
import {
	type PropType,
	defineComponent, reactive, onMounted, h,
} from 'vue';
import type LogicFlow from '@logicflow/core';

export const FlowDndPanel = defineComponent({
	name: 'FlowDndPanel',
	props: {
		lf: {
			type: Object as PropType<LogicFlow | null>,
		},
	},
	setup(props) {
		const state = reactive({});

		const methods = {
			dragNode: (item: any)=>{
				props.lf?.dnd.startDrag({
					type: item.type,
					text: item.label,
				});
			}
		};

		onMounted(() => {

		});

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