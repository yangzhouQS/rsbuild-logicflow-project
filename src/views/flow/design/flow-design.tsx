import UserTask from '@/views/flow/design/common/user-task.ts';
import { logicFlowConfig, logicFlowCustomTheme } from '@/views/flow/design/config.ts';
import { FlowDndPanel } from '@/views/flow/design/flow-dnd-panel.tsx';
import { setDndPanel } from '@/views/flow/design/set-dnd-panel.ts';
import { defineComponent, reactive, onMounted, ref } from 'vue';
import LogicFlow, { GraphModel, BaseNodeModel, ElementState, LogicFlowUtil } from '@logicflow/core';
import { register, getTeleport } from '@logicflow/vue-node-registry';
import '@logicflow/core/lib/style/index.css';
import '@logicflow/extension/lib/style/index.css';
// import '@logicflow/vue-node-registry/es/index.css';

import "./styles/flow-design.less"

export const FlowDesign = defineComponent({
	name: 'FlowDesign',
	props: {},
	setup(props) {
		const lfRef = ref<LogicFlow | null>(null);
		const containerRef = ref<HTMLDivElement | null>(null);
		const flowId = ref('');
		const TeleportContainer = getTeleport();

		const state = reactive({
			initialized: false,
		});

		const methods = {
			init: () => {
				if (state.initialized) {
					return;
				}
				if (!containerRef.value) {
					return;
				}

				const lf = new LogicFlow({
					...logicFlowConfig,
					container: containerRef.value,
					// height: 400,
					autoExpand: true,
				});

				// 设置自定义主题
				lf.setTheme(logicFlowCustomTheme);

				lf.register(UserTask);

				// 设置dnd 面板
				setDndPanel(lf);


				lf.render({});

				/* lf.render({
					nodes: [
						{
							type: "UserTask",
							x: 200,
							y: 100,
							properties: {
								disabled: true
							}
						}
					]
				}); */

				state.initialized = true;

				lfRef.value = lf;
			},
		};

		onMounted(() => {
			methods.init();
		});

		return () => {
			return (
				<div class="flow-design page-container">
					{/* 左侧拖拽面板 */}
					<FlowDndPanel/>

					<div ref={ containerRef } id="graph" class="viewport"></div>
				</div>
			);
		};
	},
});