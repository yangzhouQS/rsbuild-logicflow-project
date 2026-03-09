import { defineComponent, reactive, onMounted, onUnmounted, ref } from 'vue';
import LogicFlow from '@logicflow/core';
import '@logicflow/core/lib/style/index.css';
import '@logicflow/extension/lib/style/index.css';

import "./styles/flow-design.less"
import { logicFlowConfig, logicFlowCustomTheme } from './common/config.ts';
import { FlowDndPanel } from './flow-dnd-panel.tsx';
import { registerFlowModel } from './common/register-flow-model.ts';
import { getGatewayBranchManager, registerGatewayBranch } from './common/register-gateway-branch';

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
			/**
			 * 设置特定节点类型的菜单配置
			 * 为开始节点和结束节点禁用右键菜单
			 */
			setupNodeMenu: () => {
				const lf = lfRef.value;
				if (!lf) return;
				
				// 为开始节点设置空菜单（禁用右键菜单）
				lf.setMenuByType({
					type: 'start',
					menu: [],
				});
				
				// 为结束节点设置空菜单（禁用右键菜单）
				lf.setMenuByType({
					type: 'end',
					menu: [],
				});
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

				// 设置节点菜单配置（禁用开始/结束节点的右键菜单）
				lfRef.value = lf;
				methods.setupNodeMenu();

				state.initialized = true;
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