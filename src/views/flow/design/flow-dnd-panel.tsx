import { defineComponent, reactive, onMounted } from 'vue';

export const FlowDndPanel = defineComponent({
	name: 'FlowDndPanel',
	props: {},
	setup(props) {
		const state = reactive({});

		const methods = {};

		onMounted(() => {

		});

		return () => {
			return (
				<div class="flow-dnd-panel">
					component: FlowDndPanel
				</div>
			);
		};
	},
});