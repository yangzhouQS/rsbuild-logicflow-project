import { defineComponent, reactive, onMounted, onUnmounted, ref } from 'vue';
import LogicFlow from '@logicflow/core';
import type { NodeData } from '@logicflow/core';
import '@logicflow/core/lib/style/index.css';
import '@logicflow/extension/lib/style/index.css';

import "./styles/flow-design.less"
import { logicFlowConfig, logicFlowCustomTheme } from './common/config.ts';
import { FlowDndPanel } from './flow-dnd-panel.tsx';
import { registerFlowModel } from './common/register-flow-model.ts';
import { getGatewayBranchManager, registerGatewayBranch } from './common/register-gateway-branch';
import { NodeConfigDrawer } from './components/node-config-drawer.tsx';
import { useFlowMenu, useFlowEvents, useFlowLayout } from './common/hooks';

export const FlowDesign = defineComponent({
	name: 'FlowDesign',
	props: {},
	setup() {
		const lfRef = ref<LogicFlow | null>(null);
		const containerRef = ref<HTMLDivElement | null>(null);

		const state = reactive({
			initialized: false,
			drawerVisible: false,
			selectedNode: null as NodeData | null,
		});

		// 初始化 Hooks
		/* const { setupNodeMenu } = useFlowMenu(lfRef.value);
		const { setupNodeClick, clearClickTimer } = useFlowEvents(lfRef.value, {
			onOpenDrawer: (data: NodeData) => {
				state.selectedNode = data;
				state.drawerVisible = true;
			},
		});
		const { autoLayout } = useFlowLayout(lfRef.value); */

		const methods = {
			getFlowData: () => {
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
			// 保存节点配置
			handleSaveConfig: (config: { id: string; name: string; approver?: string }) => {
				const lf = lfRef.value;
				if (!lf || !config.id) return;

				// 更新节点属性
				lf.setProperties(config.id, {
					approver: config.approver || '',
				});

				// 更新节点文本（名称）- 使用 updateText 方法
				lf.updateText(config.id, config.name);

				console.log('保存节点配置:', config);
			},
			// 取消节点配置
			handleCancelConfig: () => {
				console.log('取消节点配置');
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

				// 保存 LogicFlow 实例引用
				lfRef.value = lf;

				// 使用 Hooks 设置功能
				// 注意：需要在 lfRef.value 赋值后重新调用 hooks 以获取正确的 lf 实例
				const { setupNodeMenu: setupMenu } = useFlowMenu(lf);
				const { setupNodeClick: setupClick } = useFlowEvents(lf, {
					onOpenDrawer: (data: NodeData) => {
						state.selectedNode = data;
						state.drawerVisible = true;
					},
				});

				setupMenu();
				setupClick();

				state.initialized = true;
			},
			destroy: () => {
				// 清除点击定时器
				clearClickTimer();
				// 销毁网关分支管理器
				const manager = getGatewayBranchManager();
				if (manager) {
					manager.destroy();
				}
			},
		};

		// 获取自动布局方法（需要在 lfRef 更新后重新获取）
		const { autoLayout: layoutMethod } = useFlowLayout(lfRef.value);

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
						<el-button onClick={() => {
							const { autoLayout: layout } = useFlowLayout(lfRef.value);
							layout();
						}}>自动布局</el-button>
					</el-card>
					<div class={'flow-container'}>
						{/* 左侧拖拽面板 */}
						<FlowDndPanel lf={lfRef.value}/>

						<div ref={ containerRef } id="graph" class="viewport"></div>
					</div>
					
					{/* 节点配置抽屉 */}
					<NodeConfigDrawer
						v-model:visible={state.drawerVisible}
						nodeData={state.selectedNode}
						onSave={methods.handleSaveConfig}
						onCancel={methods.handleCancelConfig}
					/>
				</div>
			);
		};
	},
});
