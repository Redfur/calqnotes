import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { AppProviders } from "@/app/providers";
import { initYandexMetrika } from "@/shared/lib/metrika";
import { initVisualViewport } from "@/shared/lib/visual-viewport";
import App from "./App.tsx";
import "./index.css";

initYandexMetrika();
initVisualViewport();

// biome-ignore lint/style/noNonNullAssertion: must be defined
createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<AppProviders>
			<App />
		</AppProviders>
	</StrictMode>,
);
