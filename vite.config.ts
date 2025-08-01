import eslintPlugin from '@nabla/vite-plugin-eslint';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import reactCompiler from 'babel-plugin-react-compiler';
import path from 'path';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';
import tsconfigPaths from 'vite-tsconfig-paths';

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [
		tsconfigPaths(),
		react({
			babel: {
				plugins: [reactCompiler]
			}
		}),
		tailwindcss(),
		eslintPlugin(),
		VitePWA({
			registerType: 'autoUpdate',
			injectRegister: 'auto',
			selfDestroying: true,

			pwaAssets: {
				disabled: false,
				config: true
			},

			manifest: {
				name: 'Kalakriti',
				short_name: 'Kalakriti',
				description: 'Kalakriti',
				theme_color: '#ffffff'
			},

			workbox: {
				globPatterns: ['**/*.{js,css,html,svg,png,ico}'],
				cleanupOutdatedCaches: true,
				clientsClaim: true,
				skipWaiting: true
			},

			devOptions: {
				enabled: false,
				navigateFallback: 'index.html',
				suppressWarnings: true,
				type: 'module'
			}
		})
	],
	build: {
		chunkSizeWarningLimit: 1600,
		rollupOptions: {
			output: {
				manualChunks: {
					react: ['react', 'react-dom', 'react-router'],
					zero: ['@rocicorp/zero'],
					reactTable: ['@tanstack/react-table', 'zod', 'date-fns'],
					clerk: ['@clerk/clerk-react']
				}
			}
		}
	},
	resolve: {
		alias: {
			'@': path.resolve(__dirname, './src')
		}
	}
});
