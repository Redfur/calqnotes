export type ThemePreference = "system" | "light" | "dark";
export type Theme = "light" | "dark";

/** Ключ старой версии: переносим выбор темы в настройки */
const LEGACY_THEME_KEY = "calqnotes-theme";

const media = () => window.matchMedia("(prefers-color-scheme: dark)");

export function readLegacyTheme(): ThemePreference | null {
	try {
		const stored = localStorage.getItem(LEGACY_THEME_KEY);
		if (stored === "dark" || stored === "light") return stored;
	} catch {
		/* ignore */
	}
	return null;
}

export function resolveTheme(preference: ThemePreference): Theme {
	if (preference !== "system") return preference;
	return media().matches ? "dark" : "light";
}

/** Цвет панели браузера и фона до загрузки стилей — --background темы (см. index.html) */
const THEME_COLOR: Record<Theme, string> = { light: "#FBFAF8", dark: "#161615" };

/** Ставит класс `dark` на <html> и следит за системной темой, пока выбрано «Как в системе» */
export function applyTheme(preference: ThemePreference): () => void {
	const apply = () => {
		const theme = resolveTheme(preference);
		document.documentElement.classList.toggle("dark", theme === "dark");
		// Тема выбрана вручную — панель браузера и строка состояния тоже должны её знать
		for (const meta of document.querySelectorAll('meta[name="theme-color"]')) {
			meta.setAttribute("content", THEME_COLOR[theme]);
		}
	};
	apply();
	if (preference !== "system") return () => {};
	const mq = media();
	mq.addEventListener("change", apply);
	return () => mq.removeEventListener("change", apply);
}
