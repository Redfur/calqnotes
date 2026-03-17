const THEME_KEY = "calqnotes-theme";

export type Theme = "light" | "dark";

export function getTheme(): Theme {
	if (typeof document === "undefined") return "light";
	try {
		const stored = localStorage.getItem(THEME_KEY);
		if (stored === "dark" || stored === "light") return stored;
	} catch {
		/* ignore */
	}
	return "light";
}

export function setTheme(theme: Theme): void {
	try {
		localStorage.setItem(THEME_KEY, theme);
	} catch {
		/* ignore */
	}
	document.documentElement.classList.toggle("dark", theme === "dark");
}

export function initTheme(): void {
	setTheme(getTheme());
}
