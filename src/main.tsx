import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { AppProviders } from "@/app/providers";
import { initTheme } from "@/shared/lib/theme";
import App from "./App.tsx";
import "./index.css";
import { initYandexMetrika } from "@/shared/lib/metrika";

initTheme();
initYandexMetrika();

// biome-ignore lint/style/noNonNullAssertion: must be defined
createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<AppProviders>
			<App />
		</AppProviders>
	</StrictMode>,
);
