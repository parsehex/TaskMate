import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { nodePolyfills } from 'vite-plugin-node-polyfills'

export default defineConfig({
	plugins: [react(),
    nodePolyfills({
      include: ['process'],
      globals: { global: true, process: true },
    }),
],
	base: '',
	server: {
		port: 3000,
	},
	build: {
		outDir: '.dist/',
		rollupOptions: {
			input: './frontend/index.html'
		}
	},
	resolve: {
		alias: {
			'@': '/frontend',
			'@shared': '/shared',
		},
	},
});
