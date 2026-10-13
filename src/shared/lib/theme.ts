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

/** Ставит класс `dark` на <html> и следит за системной темой, пока выбрано «Как в системе» */
export function applyTheme(preference: ThemePreference): () => void {
	const apply = () => document.documentElement.classList.toggle("dark", resolveTheme(preference) === "dark");
	apply();
	if (preference !== "system") return () => {};
	const mq = media();
	mq.addEventListener("change", apply);
	return () => mq.removeEventListener("change", apply);
}
