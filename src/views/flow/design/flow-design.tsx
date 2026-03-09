import { defineComponent, reactive, onMounted, onUnmounted, ref } from 'vue';
import LogicFlow from '@logicflow/core';
import '@logicflow/core/lib/style/index.css';
import '@logicflow/extension/lib/style/index.css';

import "./styles/flow-design.less"
import { logicFlowConfig, logicFlowCustomTheme } from './common/config.ts';
import { FlowDndPanel } from './flow-dnd-panel.tsx';
import { registerFlowModel } from './register-flow-model.ts';
import { getGatewayBranchManager, registerGatewayBranch } from './register-gateway-branch';

export const FlowDesign = defineComponent({
	name: 'FlowDesign',
	props: {},
	setup(props) {
		const lfRef = ref<LogicFlow | null>(null);
		const containerRef = ref<HTMLDivElement | null>(null);

		const state = reactive({
			initialized: false,
		});

		const methods = {
			getFlowData: () => {
				// console.log(lfRef.value?.getGraphData());
				console.log(lfRef.value?.getGraphRawData());
			},
			autoLayout: () => {
				const layoutConfig = {
					rankdir: 'LR',
					align: '',
					ranker: 'tight-tree',
					nodesep: 50,
					ranksep: 80,
					isDefaultAnchor: true,
				}
				lfRef.value?.extension.dagre?.layout(layoutConfig);
				// console.log(lfRef.value?.getGraphData());
				lfRef.value?.fitView();
				console.log(lfRef.value?.getGraphRawData());
			},
			// 获取所有网关配对信息
			getGatewayPairInfos: () => {
				const manager = getGatewayBranchManager();
				if (manager) {
					const pairs = manager.getAllPairInfos();
					console.log('网关配对信息:', pairs);
					return pairs;
				}
				return [];
			},
			// 手动创建成对网关
			createGatewayPair: (x: number, y: number, type: 'exclusiveGateway' | 'inclusiveGateway' = 'exclusiveGateway') => {
				const manager = getGatewayBranchManager();
				if (manager) {
					return manager.createGatewayPair(x, y, type);
				}
				return null;
			},
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

				// 注册自定义节点模型
				registerFlowModel(lf);


				// 注册网关分支功能
				// 当拖拽网关节点到画布时，自动创建成对的网关和默认分支
				registerGatewayBranch(lf, {
					debug: true, // 开启调试模式，输出日志
					offsetX: 300, // 分流和聚合网关之间的水平距离
					branchYOffset: 80, // 分支之间的垂直间距
				});

				lf.render({});

				state.initialized = true;

				lfRef.value = lf;
			},
			destroy: () => {
				// 销毁网关分支管理器
				const manager = getGatewayBranchManager();
				if (manager) {
					manager.destroy();
				}
			},
		};

		onMounted(() => {
			methods.init();
		});

		onUnmounted(() => {
			methods.destroy();
		});

		return () => {
			return (
				<div class="flow-design page-container">
					<el-card class={'flow-design-action'}>
						<el-button onClick={methods.getFlowData}>获取数据</el-button>
						<el-button onClick={methods.autoLayout}>自动布局</el-button>
					</el-card>
					<div class={'flow-container'}>
						{/* 左侧拖拽面板 */}
						<FlowDndPanel lf={lfRef.value}/>

						<div ref={ containerRef } id="graph" class="viewport"></div>
					</div>
				</div>
			);
		};
	},
});