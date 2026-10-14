import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import biomePlugin from "vite-plugin-biome";
import { VitePWA } from "vite-plugin-pwa";
import tsconfigPaths from "vite-tsconfig-paths";

// https://vite.dev/config/
// GitHub Pages (project site): задать VITE_BASE_PATH=/repo-name/ в CI; локально — '/'.
const base = process.env.VITE_BASE_PATH?.replace(/\/?$/, "/") ?? "/";

export default defineConfig({
	base,
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "src"),
		},
	},
	plugins: [
		react(),
		biomePlugin(),
		tailwindcss(),
		tsconfigPaths(),
		VitePWA({
			// Обновление — по кнопке в тосте, чтобы не перезагрузить страницу посреди ввода
			registerType: "prompt",
			// Регистрация из React (features/install-app), манифест — свой, из public/
			injectRegister: false,
			manifest: false,
			workbox: {
				globPatterns: ["**/*.{js,css,html,svg,png,ico,woff2,webmanifest}"],
				// math.js в бандле весит больше стандартного лимита в 2 МБ
				maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
				navigateFallback: "index.html",
				cleanupOutdatedCaches: true,
			},
		}),
	],
});
