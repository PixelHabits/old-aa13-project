import { biomePlugin } from '@pbr1111/vite-plugin-biome';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig(() => ({
	plugins: [
		react(),
		// eslint({
		//   lintOnStart: true,
		//   failOnError: mode === "production"
		// }),
		biomePlugin({
			mode: 'check',
			failOnError: true,
			applyFixes: true,
		}),
	],
	server: {
		proxy: {
			'/api': 'http://localhost:8001',
		},
	},
	// To automatically open the app in the browser whenever the server starts,
	// uncomment the following lines:
	// server: {
	//   open: true
	// }
}));
