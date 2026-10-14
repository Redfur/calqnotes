import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "src"),
		},
	},
	define: {
		__BUILD_COMMIT__: JSON.stringify("test"),
		__BUILD_TIME__: JSON.stringify("2026-01-01T00:00:00.000Z"),
	},
	test: {
		include: ["src/**/*.test.ts"],
	},
});
