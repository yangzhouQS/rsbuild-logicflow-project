import { defineConfig } from '@rsbuild/core';
import { pluginBabel } from '@rsbuild/plugin-babel';
import { pluginVue } from '@rsbuild/plugin-vue';
import { pluginVueJsx } from '@rsbuild/plugin-vue-jsx';
import { pluginLess } from '@rsbuild/plugin-less';
import path from 'path';


// Docs: https://rsbuild.rs/config/
export default defineConfig({
	plugins: [
		pluginBabel({
			include: /\.(?:jsx|tsx)$/,
		}),
		pluginVue(),
		pluginVueJsx(),
		pluginLess(),
	],
	dev:{
	},
	server:{
		open: false,
	},
	resolve: {
		alias: {
			'@': path.resolve(__dirname, './src'),
		},
	},
});
